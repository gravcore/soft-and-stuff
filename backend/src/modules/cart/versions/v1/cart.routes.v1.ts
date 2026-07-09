import { Router } from 'express';
import { validateSchema } from '@/shared/middleware/validateSchema.middleware';
import { attachGuestSession } from '@/shared/middleware/guestSession.middleware';
import { authenticate } from '@/shared/middleware/auth.middleware';
import { addItemSchema, updateItemSchema } from '../../cart.schema';
import { cartControllerV1 } from './cart.controller.v1';

const router = Router();

router.use(authenticate(false), attachGuestSession);

router.get('/',                 cartControllerV1.getCart);
router.post('/items',           validateSchema(addItemSchema),      cartControllerV1.addItem);
router.patch('/items/:itemId',  validateSchema(updateItemSchema),   cartControllerV1.updateItem);
router.delete('/items/:itemId', cartControllerV1.removeItem);
router.delete('/',              cartControllerV1.clearCart);

export default router;

