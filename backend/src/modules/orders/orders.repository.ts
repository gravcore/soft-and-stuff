import { PoolClient } from 'pg';
import { db } from '@/config/database';
import { Order, OrderItem, ShippingAddress } from './orders.types';
import { PaginationParams } from '@/shared/types';

interface CreateOrderParams {
    userId?: string;
    orderNumber: string,
    trackingId: string;
    shippingAddress: ShippingAddress;
    guestEmail: string;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    currency: string;
    notes?: string; 
}

interface CreateOrderItemParams {
    orderId: string;
    productId: string | null,
    productName: string;
    productSku: string | null,
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export const ordersRepository = {

    // Inserts the order row itself, runs inside a transaction started
    async create(client: PoolClient, input: CreateOrderParams): Promise<Order> {
        const { rows } = await client.query<Order>(
            `INSERT INTO orders
                (user_id, order_number, tracking_id, shipping_address, guest_email, subtotal, tax, shipping, total, currency, notes)
            VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING *`,
            [
                input.userId ?? null,
                input.orderNumber,
                input.trackingId,
                JSON.stringify(input.shippingAddress),
                input.guestEmail,
                input.subtotal,
                input.tax,
                input.shipping,
                input.total,
                input.currency,
                input.notes ?? null,
            ]
        );
        return rows[0];
    },

    // Inserts one order_item row, called once per cart item during checkout
    async createItem(client: PoolClient, input: CreateOrderItemParams): Promise<void> {
        await client.query(
            `INSERT INTO order_items
                (order_id, product_id, product_name, product_sku, quantity, price_snapshot, total)
            VALUES
                ($1,$2,$3,$4,$5,$6,$7)`,
            [
                input.orderId,
                input.productId,
                input.productName,
                input.productSku,
                input.quantity,
                input.unitPrice,
                input.totalPrice,
            ]
        );
    },

    // Reduces a product's stock during checkout
    async decrementStock(client: PoolClient, productId: string, quantity: number): Promise<void> {
        await client.query(
            `UPDATE products SET stock = stock - $1 WHERE id = $2`,
            [quantity, productId]
        );
    },

    // Reads a product's current stock with a row lock 
    // (FOR UPDATE: blocks other transactions from reading this row until this one finishes)
    async lockProductStock(client: PoolClient, productId: string): Promise<{ stock: number } | null> {
        const { rows } = await client.query<{ stock: number }>(
            `SELECT stock FROM products WHERE id = $1 FOR UPDATE`,
            [productId]
        );
        return rows[0] ?? null;
    },

    // Public lookup used by guests to check their order status
    async findByTrackingId(trackingId: string): Promise<Order | null> {
        const { rows } = await db.query<Order>(
            `SELECT * FROM orders WHERE tracking_id = $1 LIMIT 1`,
            [trackingId.toUpperCase()]
        );
        return rows[0] ?? null;
    },

    // Internal lookup, e.g. for payment webhook processing or admin views
    async findById(id: string): Promise<Order | null> {
        const { rows } = await db.query<Order>(
            `SELECT * FROM orders WHERE id = $1 LIMIT 1`,
            [id]
        );
        return rows[0] ?? null;
    },

    // Returns every line item belonging to one order
    async findItemsByOrderId(orderId: string): Promise<OrderItem[]> {
        const { rows } = await db.query<OrderItem>(
            `SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC`,
            [orderId]
        );
        return rows;
    },

    // Paginated order history for a logged-in user's account page
    async findByUserId(
        userId: string, 
        pagination: PaginationParams
    ): Promise<{ rows: Order[]; total: number }> {
        const [{ rows }, { rows: countRows }] = await Promise.all([
            db.query<Order>(
                `SELECT * FROM orders
                 WHERE user_id = $1
                 ORDER BY created_at DESC
                 LIMIT $2 OFFSET $3`,
                [userId, pagination.limit, pagination.offset]
            ),
            db.query<{ count: string }>(
                `SELECT COUNT(*) AS count FROM orders WHERE user_id = $1`,
                [userId]
            ),
        ]);
        return { rows, total: parseInt(countRows[0].count) };
    },

    // Admin-only paginated list of every order
    async findAll(
        pagination: PaginationParams,
        statusFilter?: string,
        search?: string
    ): Promise<{ rows: Order[]; total: number }> {
        
        const conditions: string[] = [];
        const values: unknown[] = [];

        if (statusFilter) {
            values.push(statusFilter);
            conditions.push(`o.order_status = $${values.length}`);
        }

        if (search) {
            values.push(`%${search}%`);
            conditions.push(`(o.order_number ILIKE $${values.length} OR o.guest_email ILIKE $${values.length} OR u.email ILIKE $${values.length})`);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const [{ rows }, { rows: countRows }] = await Promise.all([
            db.query<Order>(
                `SELECT o.*, u.email AS user_email 
                 FROM orders o
                 LEFT JOIN users u ON u.id = o.user_id
                 ${where}
                 ORDER BY o.created_at DESC
                 LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
                 [...values, pagination.limit, pagination.offset]
            ),
            db.query<{ count: string }>(
                `SELECT COUNT(*) AS count FROM orders o
                LEFT JOIN users u ON u.id = o.user_id ${where}`,
                values
            ),
        ]);
        return { rows, total: parseInt(countRows[0].count) };
    },

    // Admin-only advances an order through its lifecycle
    async updateStatus(id: string, status: string): Promise<Order | null> {
        const { rows } = await db.query<Order>(
            `UPDATE orders SET order_status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
            [id, status]
        );
        return rows[0] ?? null;
    },

    // Called by the Stripe webhook after payment succeeds/fails
    async updatePaymentStatus(id: string, status: string): Promise<void> {
        await db.query(
            `UPDATE orders SET payment_status = $2, updated_at = NOW()
             WHERE id = $1`,
             [id, status]
        );
    },

    // Stores the Stripe PaymentIntent ID right after it's created
    async attachPaymenReference(id: string, provider: string, reference: string): Promise<void> {
        await db.query(
            `UPDATE orders SET payment_provider = $2 payment_reference = $3, updated_at = NOW()
             WHERE id = $1`,
            [id, provider, reference]
        );
    },

    // Builds a sequential, human-friendly order number
    async generateOrderNumber(client: PoolClient): Promise<string> {
        const year = new Date().getFullYear();
        const { rows } = await client.query<{ count: string }>(
            `SELECT COUNT(*) AS count FROM orders WHERE order_number LIKE $1`,
            [`ORD-${year}-%`]
        );
        const nextNumber = parseInt(rows[0].count) + 1;
        return `ORD-${year}-${String(nextNumber).padStart(5, '0')}`;
    },

    async updateShippingAddress(id: string, address: ShippingAddress, totals: { tax: number; shipping: number; total: number }) {
        return db.query(
            `UPDATE orders 
                SET shipping_address = $2, tax = $3, shipping = $4, total = $5, updated_at = NOW()
            WHERE id = $1`,
            [id, JSON.stringify(address), totals.tax, totals.shipping, totals.total]
        );
    },

    async findItemWeightsByOrderId(orderId: string) {
        const { rows } = await db.query<{ product_id: string; quantity: number; price_snapshot: number; weight_oz: number | null }>(
            `SELECT oi.product_id, oi.quantity, oi.price_snapshot AS price_snapshot, p.weight_oz
            FROM order_items oi
            LEFT JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = $1`,
            [orderId],
        );
        return rows;
    },
};