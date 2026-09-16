import { AppError } from '@/shared/errors/AppError';
import { withTransaction } from '@/config/database';
import { generateTrackingId } from '@/shared/utils/crypto';
import { parsePagination, buildMeta } from '@/shared/utils/pagination';
import { cartRepository } from '../cart/cart.repository';
import { ordersRepository } from './orders.repository';
import { CheckoutInput, QuoteInput } from './orders.schema';
import { Request } from 'express';
import { emailService } from '../email/email.service';
import { CartItemWithProduct } from '../cart/cart.types';
import { calculateTax } from '../tax/tax.service';
import { getShippingProvider } from '../shipping/getShippingProvider';

type OrderTotalsLineItem = Pick<CartItemWithProduct, 'product_id' | 'quantity' | 'price_snapshot' | 'weight_oz'>;

async function calculateOrderTotals(
    shippingAddress: CheckoutInput['shippingAddress'],
    cartItems: OrderTotalsLineItem[],
    subtotal: number
) {
    const tax = await calculateTax(shippingAddress.country, shippingAddress.state, subtotal);
    const hasPhysicalItems = cartItems.some((i) => i.weight_oz !== null); // return true if at least 1 match the condition otherwise false

    // All-digital cart, nothing to ship
    if (!hasPhysicalItems) {
        return {
            shipping: 0, tax, currency: 'USD', total: subtotal + tax
        };
    }

    const totalWeightOz = cartItems.reduce((sum, i) => sum + (i.weight_oz ?? 0) * i.quantity, 0);
    const provider = getShippingProvider(shippingAddress.country);
    const rates = await provider.getRates(shippingAddress, { weightOz: totalWeightOz });
    const shipping = rates[0]?.price ?? 0;
    const currency = rates[0]?.currency ?? 'USD';

    return {
        shipping,
        tax,
        currency,
        total: subtotal + tax + shipping,
    };
}

export const ordersService = {

    // Real numbers before paying
    async quote(cartId: string, input: QuoteInput) {
        const cartItems = await cartRepository.findItems(cartId);
        if (cartItems.length === 0) throw new AppError('Cart is empty', 400, 'EMPTY_CART');
        
        const subtotal = cartItems.reduce((sum, i) => sum + i.price_snapshot * i.quantity, 0);
        const totals = await calculateOrderTotals(input.shippingAddress, cartItems, subtotal);

        return {
            subtotal,
            items: cartItems.map((i) => ({
                productId: i.product_id,
                name: i.product_name,
                image: i.images_url[0] ?? null,
                quantity: i.quantity,
                unitPrice: i.price_snapshot,
                totalPrice: i.price_snapshot * i.quantity,
            })),
            ...totals,
        };
    },

    // Recalculates tax/shipping/total
    async updateShippingAddress(userId: string | undefined, orderId: string, trackingId: string | undefined, newAddress: CheckoutInput['shippingAddress']) {
        const order = await ordersRepository.findById(orderId);
        if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

        // Ownership split
        if (userId) {
            if (order.user_id !== userId) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        } else {
            if (order.tracking_id !== trackingId) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }

        if (order.payment_status !== 'pending') {
            throw new AppError('This order has already been paid and its address can no longer be changed', 409, 'ORDER_NOT_EDITABLE');
        }

        const lineItems = await ordersRepository.findItemWeightsByOrderId(order.id);

        if (lineItems.length === 0) {
            throw new AppError('Could not load this order\'s items, address was not updated', 500, 'ORDER_ITEMS_MISSING');
        }

        const { tax, shipping, currency, total } = await calculateOrderTotals(newAddress, lineItems, order.subtotal);
        await ordersRepository.updateShippingAddress(order.id, newAddress, { tax, shipping, total });

        return {
            subtotal: order.subtotal,
            tax, 
            shipping,
            total,
            currency,
        };
    },

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
            
            const { tax, shipping, currency, total } = await calculateOrderTotals(input.shippingAddress, cartItems, subtotal);

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
                currency,
                notes: input.notes,
            });

            // 6. Create one order_item per cart item, and decrement stock for each
            for (const item of cartItems) {
                await ordersRepository.createItem(client, {
                    orderId: order.id,
                    productId: item.product_id,
                    productName: item.product_name,
                    productSku: item.product_sku,
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

            return { orderId: order.id, orderNumber, trackingId, total, currency };
        });
    },

    // Public lookup by tracking ID
    async trackOrder(trackingId: string) {
        const order = await ordersRepository.findByTrackingId(trackingId);
        if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

        const items = await ordersRepository.findItemsByOrderId(order.id);
        return {
            orderNumber: order.order_number,
            status: order.order_status,
            total: order.total,
            createdAt: order.created_at,
            items:  items.map((i) => ({ productName: i.product_name, quantity: i.quantity, totalPrice: i.total_price })),
        };
    },

    // Pay with cash-on-delivery
    async payCod(userId: string | undefined, orderId: string, trackingId: string | undefined) {
        const order = await ordersRepository.findById(orderId);
        if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

        const owns = userId ? order.user_id === userId : order.tracking_id === trackingId;
        if (!owns) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

        await ordersRepository.attachPaymenReference(order.id, 'cod', order.tracking_id);
        await ordersRepository.updatePaymentStatus(order.id, 'pending');
        
        return {
            status: 'pending',
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