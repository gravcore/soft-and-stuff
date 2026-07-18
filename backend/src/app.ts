import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { initErrorTracker } from './shared/adapters/errorTracker';
import { requestLogger } from './shared/middleware/logger.middleware';
import { apiLimiter } from './shared/middleware/rateLimit.middleware';
import { errorHandler } from './shared/middleware/error.middleware';
import authRoutesV1 from './modules/auth/versions/v1/auth.routes.v1';
import productsRoutesV1 from './modules/products/versions/v1/products.routes.v1';
import ordersRoutesV1 from './modules/orders/versions/v1/orders.routes.v1';
import paymentsRoutesV1 from './modules/payments/versions/v1/payments.routes.v1';
import mediaRoutesV1 from './modules/media/versions/v1/media.routes.v1';
import cartRoutesV1 from './modules/cart/versions/v1/cart.routes.v1';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@/config/swagger';

export const createApp = () => {
    // Initialize Sentry to capture startup errors too
    initErrorTracker();

    const app = express();

    // Add security-related HTTP headers
    app.use(helmet());
    app.disable('x-powered-by'); // don't advertise that this is Express

    const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

    app.use(cors({
        origin: (origin, cb) => {
            if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
            cb(new Error(`CORS: ${origin} not allowed`));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    }));

    // Stripe needs receive the raw body for signature
    // So express.raw put the stream (that comes in application/json type) untouched into req.body
    app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));
    
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true })); // For compatibility with submissions as application/x-www-form-urlencoded
    app.use(cookieParser());
    app.use(compression() as express.RequestHandler); // Compress the body response
    app.use(requestLogger);
    app.use('/api/', apiLimiter);

    app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
    
    const V1 = '/api/v1';

    app.use(`${V1}/auth`,       authRoutesV1);
    app.use(`${V1}/products`,   productsRoutesV1);
    app.use(`${V1}/orders`,     ordersRoutesV1);
    app.use(`${V1}/payments`,   paymentsRoutesV1);
    app.use(`${V1}/media`,      mediaRoutesV1);
    app.use(`${V1}/cart`,       cartRoutesV1);

    // Only for no production
    if (env.NODE_ENV !== 'production') {
        app.use(`${V1}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    }

    app.use((_req, res) => res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' }}));
    app.use(errorHandler);

    return app;
};
