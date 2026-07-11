import { Router } from 'express';
import { validateSchema } from '@/shared/middleware/validateSchema.middleware';
import { authenticate, authorize } from '@/shared/middleware/auth.middleware';
import { attachGuestSession } from '@/shared/middleware/guestSession.middleware';
import { checkoutSchema, updateOrderStatusSchema } from '../../orders.schema';
import { ordersControllerV1 } from './orders.controller.v1';

const router = Router();

// As the cart module, attachGuestSession ensures a cart identity
router.post('/checkout', authenticate(false), attachGuestSession, validateSchema(checkoutSchema), ordersControllerV1.checkout);

// Public orders tracking
router.get('/track/:trackingId', ordersControllerV1.trackOrder);

// Requires a real logged-in account
router.get('/', authenticate(), ordersControllerV1.listMyOrders);
router.get('/:id', authenticate(), ordersControllerV1.getById);

// Admin-only
const adminGuard = [authenticate(), authorize('admin')];
router.get('/all',          ...adminGuard, ordersControllerV1.listAll);
router.patch('/:id/status', ...adminGuard, validateSchema(updateOrderStatusSchema), ordersControllerV1.updateStatus);

export default router;