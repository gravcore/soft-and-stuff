import { validateSchema } from "@/shared/middleware/validateSchema.middleware";
import { Router } from "express";
import { loginSchema, refreshSchema, registerSchema } from "../../auth.schema";
import { authControllerV1 } from "./auth.controller.v1";
import { authLimiter } from "@/shared/middleware/rateLimit.middleware";
import { authenticate } from "@/shared/middleware/auth.middleware";

const router = Router();

router.post('/register', authLimiter, validateSchema(registerSchema), authControllerV1.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
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
router.post('/refresh', authLimiter, validateSchema(refreshSchema), authControllerV1.refresh);
router.post('/logout', authenticate(), authControllerV1.logout);
router.get('/me', authenticate(), authControllerV1.me);

export default router;