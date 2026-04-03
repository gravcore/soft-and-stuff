import { Pool, PoolClient } from 'pg';
import { env } from './env';

// Pool manages connection, reuse and limits automatically
export const db = new Pool({
    connectionString: env.DATABASE_URL,
    min: env.DB_POOL_MIN,
    max: env.DB_POOL_MAX,
    idleTimeoutMillis: 30_000, // close unused connections after 30 seconds
    connectionTimeoutMillis: 5_000, // fail fast if we can't get a connection within 5 seconds
    statement_timeout: 10_000, // kill any query still running after 10 seconds
    
    // enable encription and add the option required by Supabase for self-signed certificate
    ssl: { rejectUnauthorized: false },
});

// on a connection fail
db.on('error', (err) => console.error('Unexpected DB pool error: ', err));

// wraps any set of DB operations in an atoic transaction
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}
