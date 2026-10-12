import { AppError } from '@/shared/errors/AppError';
import { productsRepository } from '../products/products.repository';
import { cartRepository } from './cart.repository';
import { Cart } from './cart.types';

// Whichever piece of info the current request has available
// a logged-in user's ID, or a guest's session ID
interface CartIdentity {
    userId?: string;
    sessionId?: string;
}

export const cartService = {

    // Resolve cart ownership and ensures a cart always exists before doing anything else
    async resolveCart(identity: CartIdentity): Promise<Cart> {

        // Authenticated user
        if (identity.userId) {
            let cart = await cartRepository.findByUserId(identity.userId);
            if (!cart) cart = await cartRepository.createForUser(identity.userId);

            // Merge: if a guest cart also exists in this same request,
            // fold its items into the user's cart and discard it
            if (identity.sessionId) {
                const guestCart = await cartRepository.findBySessionId(identity.sessionId);

                // Only merge if they're actually two DIFFERENT carts
                if (guestCart && guestCart.id !== cart.id) {
                    await cartRepository.mergeGuestCartIntoUserCart(guestCart.id, cart.id);
                }
            }
            return cart;
        }

        // No authenticated (guest)
        // Guest session cookie should always exist, but if not this error appears
        if (!identity.sessionId) {
            throw new AppError('Missing cart session', 400, 'MISSING_SESSION');
        }

        let cart = await cartRepository.findBySessionId(identity.sessionId);
        if (!cart) cart = await cartRepository.createForGuest(identity.sessionId);
        return cart;
    },

    async getCart(identity: CartIdentity) {
        const cart = await cartService.resolveCart(identity);
        const items = await cartRepository.findItems(cart.id);
        const total = items.reduce((sum, item) => sum + item.price_snapshot * item.quantity, 0);
        return { cartId: cart.id, items, total };
    },

    async addItem(identity: CartIdentity, productId: string, quantity: number) {
        const cart = await cartService.resolveCart(identity);

        // Look up the product to snapshot its current price and validate stock
        const product = await productsRepository.findById(productId);
        if (!product || !product.is_active) {
            throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
        }
        if (product.stock < quantity) {
            throw new AppError('Not enough stock available', 409, 'OUT_OF_STOCK')
        }

        await cartRepository.addItem(cart.id, productId, quantity, product.price_in_cents);
        return cartService.getCart(identity);
    },

    async updateItem(identity: CartIdentity, itemId: string, quantity: number) {
        const cart = await cartService.resolveCart(identity);
        const item = await cartRepository.findItem(itemId);

        // Ownership check
        if (!item || item.cart_id !== cart.id) {
            throw new AppError('Cart item not found', 404, 'ITEM_NOT_FOUND');
        }

        // Stock check
        const product = await productsRepository.findById(item.product_id);
        if (!product || !product.is_active) {
            throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
        }
        if (product.stock < quantity) {
            throw new AppError('Not enough stock available', 409, 'OUT_OF_STOCK');
        }

        await cartRepository.updateItemQuantity(itemId, quantity);
        return cartService.getCart(identity);
    },

    async removeItem(identity: CartIdentity, itemId: string) {
        const cart = await cartService.resolveCart(identity);
        const item = await cartRepository.findItem(itemId);

        if (!item || item.cart_id !== cart.id) {
            throw new AppError('Cart item not found', 404, 'ITEM_NOT_FOUND');
        }

        await cartRepository.removeItem(itemId);
        return cartService.getCart(identity);
    },

    async clearCart(identity: CartIdentity) {
        const cart = await cartService.resolveCart(identity);
        await cartRepository.clearItems(cart.id);
        return { cartId: cart.id, items: [], total: 0 };
    },
};