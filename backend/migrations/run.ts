import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { db, withTransaction } from '../src/config/database';

const MIGRATIONS_DIR = join(__dirname);

async function run() {

    // Create table of migrations already applied
    await db.query(`
        CREATE TABLE IF NOT EXISTS _migrations (
            id          SERIAL PRIMARY KEY,
            filename    VARCHAR(255) UNIQUE NOT NULL, 
            applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);

    // Extract the sql file names, and order ascendent
    const files = readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort()

    // Iterate files
    for (const file of files) {

        // Check if the migration file was already applied
        const { rows } = await db.query(
            'SELECT id FROM _migrations WHERE filename = $1',
            [file]
        );

        if (rows.length > 0) {
            console.log(`   Skip: ${file}`);
            continue; // skips the rest of the current loop iteration and jumps straight to the next one
        }

        // Extract file content
        const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');

        // Execute the sql in a transaction
        try {
            await withTransaction(async (client) => {
                await client.query(sql);
                await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
            });
            console.log(`Migration applied: ${file}`);
        } catch (err) {
            console.log(`X - Fail in migration: ${file}`, err);
            process.exit(1);
        }
    }

    await db.end();
    console.log('Migrations applied successfully');
}

run().catch((err) => {
    console.log('Error executing migrations: ', err);
    process.exit(1);
});