import { createApp } from './app';
import { db } from './config/database';
import { env } from './config/env';

const app = createApp();
const server = app.listen(env.PORT, () => {
    console.log(`API running on port ${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
    console.log(`http://localhost:${env.PORT}/health`)
});

const shutdown = async (signal: string) => {
    console.log(`${signal} received - shutting down gracefully`);

    // Stops the HTTP server
    server.close(async () => {
        await db.end();
        process.exit(0); // terminates the entire Node.js process
    });

    setTimeout(() => process.exit(1), 10_000); // force exit if drain takes too long
};

process.on('SIGTERM', () => shutdown('SIGTERM')) // sent by hosting platforms
process.on('SIGINT', () => shutdown('SIGINT')); // sent when we press Ctrl+C in the terminal
process.on('unhandledRejection', (reason) => { // try-catch missing somewhere
    console.error('Unhandled rejection', reason);
    process.exit(1);
});


