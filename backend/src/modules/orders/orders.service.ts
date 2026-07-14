import { AppError } from '@/shared/errors/AppError';
import { withTransaction } from '@/config/database';
import { generateTrackingId } from '@/shared/utils/crypto';
import { parsePagination, buildMeta } from '@/shared/utils/pagination';
import { cartRepository } from '../cart/cart.repository';
import { ordersRepository } from './orders.repository';
import { CheckoutInput } from './orders.schema';
import { Request } from 'express';
import { emailService } from '../email/email.service';

export const ordersService = {

    // Place an order flow
    async checkout(userId: string | undefined, cartId: string, input: CheckoutInput) {

        return withTransaction(async (client) => {
            // 1. Pull the cart's current items
            const cartItems = await cartRepository.findItems(cartId);
            if (cartItems.length === 0) {
                throw new AppError('Cart is empty', 400, 'EMPTY_CART')
            }

            // 2. Validate stock for every item before creating anything
            for (const item of cartItems) {
                const locked =await ordersRepository.lockProductStock(client, item.product_id);
                if (!locked || locked.stock < item.quantity) {
                    throw new AppError(`Insufficient stock for "${item.product_name}"`,
                        409, 'OUT_OF_STOCK'
                    );
                }
            }

            // 3. Calculate totals server-side
            const subtotal = cartItems.reduce((sum, i) => sum + i.price_snapshot * i.quantity, 0);
            const tax = Math.round(subtotal * 0.12); // 12% tax rate
            const shipping = subtotal > 5000 ? 0 : 500; // free shipping over $50
            const total = subtotal + tax + shipping;

            // 4. Generate identifiers: trackingId and orderNumber
            const trackingId = generateTrackingId();
            const orderNumber = await ordersRepository.generateOrderNumber(client);

            // 5. Create the order row itself
            const order = await ordersRepository.create(client, {
                userId,
                orderNumber,
                trackingId,
                shippingAddress: input.shippingAddress,
                guestEmail: input.shippingAddress.email,
                subtotal,
                tax,
                shipping,
                total,
                currency: 'USD',
            });

            // 6. Create one order_item per cart item, and decrement stock for each
            for (const item of cartItems) {
                await ordersRepository.createItem(client, {
                    orderId: order.id,
                    productId: item.product_id,
                    productName: item.product_name,
                    productSku: null,
                    quantity: item.quantity,
                    unitPrice: item.price_snapshot,
                    totalPrice: item.price_snapshot * item.quantity,
                });
                await ordersRepository.decrementStock(client, item.product_id, item.quantity);
            }

            // 7. Empty the cart now that its items became a real order
            await cartRepository.clearItems(cartId);

            // 8. Send confirmation email
            emailService.sendOrderConfirmationEmail({
                to: input.shippingAddress.email,
                orderNumber,
                trackingId,
                total,
                items: cartItems.map((i) => ({
                    name: i.product_name,
                    quantity: i.quantity,
                    totalPrice: i.price_snapshot * i.quantity,
                })),
            }).catch(console.error);

            return { orderId: order.id, orderNumber, trackingId, total };
        });
    },

    // Public lookup by tracking ID
    async trackOrder(trackingId: string) {
        const order = await ordersRepository.findByTrackingId(trackingId);
        if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

        const items = await ordersRepository.findItemsByOrderId(order.id);
        return {
            status: order.order_status,
            total: order.total,
            createdAt: order.created_at,
            items:  items.map((i) => ({ productName: i.product_name, quantity: i.quantity, totalPrice: i.total_price })),
        };
    },

    // Full order detail (used by a logged-in user)
    async getById(userId: string, orderId: string) {
        const order = await ordersRepository.findById(orderId);
        if (!order || order.user_id !== userId) {
            throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }
        const items = await ordersRepository.findItemsByOrderId(order.id);
        return { ...order, items };
    },

    // Paginated order history for the logged-in user's account page
    async listMyOrders(userId: string, req: Request) {
        const pagination = parsePagination(req);
        const { rows, total } = await ordersRepository.findByUserId(userId, pagination);
        return { orders: rows, meta: buildMeta(total, pagination) };
    },

    // === Admin-only methods ===

    async listAll(req: Request, statusFilter?: string) {
        const pagination = parsePagination(req);
        const { rows, total } = await ordersRepository.findAll(pagination, statusFilter);
        return { orders: rows, meta: buildMeta(total, pagination) };
    },

    async updateStatus(orderId: string, status: string) {
        const order = await ordersRepository.updateStatus(orderId, status);
        if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        return order;
    },
};