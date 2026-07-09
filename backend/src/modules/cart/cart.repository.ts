import { db } from '@/config/database';
import { Cart, CartItemWithProduct } from './cart.types';

export const cartRepository = {
    
    // Look up a cart belonging to a logged-in user
    async findByUserId(userId: string): Promise<Cart | null> {
        const { rows } = await db.query<Cart>(
            `SELECT * FROM carts WHERE user_id = $1 LIMIT 1`,
            [userId],
        );
        return rows[0] ?? null;
    },

    // Look up a guest cart by the session_id stored in a cookie
    async findBySessionId(sessionId: string): Promise<Cart | null> {
        const { rows } = await db.query<Cart>(
            `SELECT * FROM carts WHERE session_id = $1 LIMIT 1`,
            [sessionId],
        );
        return rows[0] ?? null;
    },

    // Creates a new empty cart linked to a registered user
    async createForUser(userId: string): Promise<Cart> {
        const { rows } = await db.query<Cart>(
            `INSERT INTO carts (user_id) VALUES ($1) RETURNING *`,
            [userId],
        );
        return rows[0];
    },

    // Creates a new empty cart linked to a guest session ID
    async createForGuest(sessionId: string): Promise<Cart> {
        const { rows } = await db.query<Cart>(
            `INSERT INTO carts (session_id) VALUES ($1) RETURNING *`,
            [sessionId],
        );
        return rows[0];
    },

    // Returns every item in a cart, joined with product details
    async findItems(cartId: string): Promise<CartItemWithProduct[]> {
        const { rows } = await db.query<CartItemWithProduct>(
            `SELECT
                ci.id, ci.cart_id, ci.product_id, ci.quantity, ci.price_snapshot, ci.created_at,
                p.product_name, p.slug, p.images_url, p.stock
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.cart_id = $1
            ORDER BY ci.created_at ASC`,
            [cartId]
        );
        return rows;
    },

    // Single cart_item lookup, used to check ownership before update/delete
    async findItem(itemId: string): Promise<{ id: string; cart_id: string; product_id: string } | null> {
        const { rows } = await db.query<{ id: string; cart_id: string; product_id: string }>(
            `SELECT id, cart_id, product_id FROM cart_items WHERE id = $1 LIMIT 1`,
            [itemId],
        );
        return rows[0] ?? null;
    },

    // Inserts a new cart item, or increments quantity if the product is already in the cart
    // For the case: product page with a quantity selector, then "Add to Cart"
    async addItem(
        cartId: string, 
        productId: string,
        quantity: number,
        priceSnapshot: number
    ): Promise<void> {
        await db.query(
            `INSERT INTO cart_items (cart_id, product_id, quantity, price_snapshot)
             VALUES ($1,$2,$3,$4)
             ON CONFLICT (cart_id, product_id)
             DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
             // EXCLUDED = row that WOULD have been inserted (the new values)
            [cartId, productId, quantity, priceSnapshot],
        );
    },

    // Overwrites the quantity for one specific cart item
    async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
        await db.query(
            `UPDATE cart_items SET quantity = $2 WHERE id = $1`,
            [itemId, quantity],
        );
    },

    // Deletes a single cart item by its own ID
    async removeItem(itemId: string): Promise<void> {
        await db.query(`DELETE FROM cart_items WHERE id = $1`, [itemId]);
    },

    // Removes every item from a cart (checkout completed, or "empty cart" button)
    async clearItems(cartId: string): Promise<void> {
        await db.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);
    },

    // Merge guest cart into user cart, called right after login/register when the
    // person already had a guest cart going, moves every guest item into the user's
    // cart, then deletes the now-empty guest cart
    async mergeGuestCartIntoUserCart(guestCartId: string, userCartId: string): Promise<void> {
        await db.query(
            `INSERT INTO cart_items (cart_id, product_id, quantity, price_snapshot)
             SELECT $2, product_id, quantity, price_snapshot
             FROM cart_items
             WHERE cart_id = $1
             ON CONFLICT (cart_id, product_id)
             DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
             [guestCartId, userCartId],
        );

        // Delete guest cart entirely
        // (ON DELETE CASCADE on cart_items automatically removes any leftover rows too)
        await db.query(`DELETE FROM carts WHERE id = $1`, [guestCartId]);
    },
};