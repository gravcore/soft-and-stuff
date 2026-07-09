import { validateSchema } from "@/shared/middleware/validateSchema.middleware";
import { Router } from "express";
import { loginSchema, refreshSchema, registerSchema } from "../../auth.schema";
import { authControllerV1 } from "./auth.controller.v1";
import { authLimiter } from "@/shared/middleware/rateLimit.middleware";
import { authenticate } from "@/shared/middleware/auth.middleware";

const router = Router();

router.post('/register', authLimiter, validateSchema(registerSchema), authControllerV1.register);
router.post('/login', authLimiter, validateSchema(loginSchema), authControllerV1.login);
router.post('/refresh', authLimiter, validateSchema(refreshSchema), authControllerV1.refresh);
router.post('/logout', authenticate(), authControllerV1.logout);
router.post('/me', authenticate(), authControllerV1.me);

export default router;