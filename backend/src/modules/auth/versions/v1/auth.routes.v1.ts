import { validateSchema } from "@/shared/middleware/validateSchema.middleware";
import { Router } from "express";
import { forgotPasswordSchema, loginSchema, refreshSchema, registerSchema, resetPasswordSchema, verifyOtpSchema } from "../../auth.schema";
import { authControllerV1 } from "./auth.controller.v1";
import { authLimiter, refreshLimiter } from "@/shared/middleware/rateLimit.middleware";
import { authenticate } from "@/shared/middleware/auth.middleware";
import passport from "../../auth.passport";
import { env } from "@/config/env";
import { AppError } from "@/shared/errors/AppError";
import { generateCsrfToken } from "@/shared/middleware/csrf.middleware";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Create a new account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [email, password, firstName], properties: { email: {type: string}, password: {type: string}, firstName: {type: string}, lastName: {type: string} }}
 *     responses:
 *       201: { description: User created }
 *       409: { description: Email already registered }
 *       422: { description: Validation error }
 */
router.post('/register', authLimiter, validateSchema(registerSchema), authControllerV1.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  email: { type: string }
 *                  password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 *       422: { description: Validation error }
 */
router.post('/login', authLimiter, validateSchema(loginSchema), authControllerV1.login);
router.post('/refresh', refreshLimiter, validateSchema(refreshSchema), authControllerV1.refresh);
router.post('/logout', authenticate(), authControllerV1.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get user's profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: []}]
 *     responses:
 *       200:
 *         description: Get current info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: array, items: { type: object }}
 *       401: { description: Missing or invalid token }
 */
router.get('/me', authenticate(), authControllerV1.me);

router.get('/csrf-token', (req, res) => {
    res.json({ token: generateCsrfToken(req, res) });
});

const ALLOWED_PROVIDERS = ['google'] as const; // whitelist
type Provider = typeof ALLOWED_PROVIDERS[number];

router.get('/:provider', (req, res, next) => {
    const provider = req.params.provider;
    
    if (!ALLOWED_PROVIDERS.includes(provider as Provider)) {
        return next(new AppError('Unknown provider', 400, 'INVALID_PROVIDER'));
    }

    passport.authenticate(provider, { session: false, scope: ['profile', 'email'] })(req, res, next);
});

router.get('/:provider/callback', (req, res, next) => {
    const provider = req.params.provider;

    if (!ALLOWED_PROVIDERS.includes(provider as Provider)) {
        return next(new AppError('Unknown provider', 400, 'INVALID_PROVIDER'));
    }

    passport.authenticate(provider, { session: false, failureRedirect: `${env.FRONTEND_URL}/login` })(req, res, next);
}, 
    authControllerV1.oAuthCallback
);

router.post('/google/one-tap', refreshLimiter, authControllerV1.googleOneTap);

router.post('/forgot-password', authLimiter, validateSchema(forgotPasswordSchema), authControllerV1.forgotPassword);

router.post('/verify-otp', authLimiter, validateSchema(verifyOtpSchema), authControllerV1.verifyOtp);

router.post('/reset-password', authLimiter, validateSchema(resetPasswordSchema), authControllerV1.resetPassword);

export default router;