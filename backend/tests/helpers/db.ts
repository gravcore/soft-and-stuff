import { db } from '../../src/config/database';

export async function resetDb() {
    await db.query(`
        TRUNCATE TABLE
            users, refresh_tokens, categories, products,
            carts, cart_items, orders, order_items, user_addresses
        RESTART IDENTITY CASCADE
    `);
}