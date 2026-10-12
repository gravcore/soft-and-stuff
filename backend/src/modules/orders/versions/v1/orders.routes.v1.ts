import { Router } from 'express';
import { validateSchema } from '@/shared/middleware/validateSchema.middleware';
import { authenticate, authorize } from '@/shared/middleware/auth.middleware';
import { attachGuestSession } from '@/shared/middleware/guestSession.middleware';
import { checkoutSchema, quoteSchema, updateOrderStatusSchema, updateShippingAddressSchema } from '../../orders.schema';
import { ordersControllerV1 } from './orders.controller.v1';
import { idempotent } from '@/shared/middleware/idempotency.middleware';

const router = Router();

router.post('/quote', authenticate(false), attachGuestSession, validateSchema(quoteSchema), ordersControllerV1.quote);

// As the cart module, attachGuestSession ensures a cart identity
router.post('/checkout', authenticate(false), attachGuestSession, idempotent('POST /orders/checkout'), validateSchema(checkoutSchema), ordersControllerV1.checkout);

// Edit the shipping address, recalculates the cost
router.patch('/:id/shipping-address', authenticate(false), attachGuestSession, idempotent('PATCH /orders/:id/shipping-address'), validateSchema(updateShippingAddressSchema), ordersControllerV1.updateShippingAddress);

// Pay cash-on-delivery
router.post('/:id/pay/cod', authenticate(false), attachGuestSession, ordersControllerV1.payCod);

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