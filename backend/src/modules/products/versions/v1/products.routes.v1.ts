import { Router } from 'express';
import { validateSchema } from '@/shared/middleware/validateSchema.middleware';
import { createProductSchema, updateProductSchema, productFiltersSchema } from '../../products.schema';
import { productsControllerV1 } from './products.controller.v1';
import { authenticate, authorize } from '@/shared/middleware/auth.middleware';

const router = Router();

router.get('/', validateSchema(productFiltersSchema, 'query'), productsControllerV1.list);
router.get('/categories', productsControllerV1.getCategories);
router.get('/:slug', productsControllerV1.getBySlug);

// Admin-only routes
const adminGuard = [authenticate, authorize('admin')];

router.post('/',        ...adminGuard, validateSchema(createProductSchema), productsControllerV1.create);
router.patch('/:id',    ...adminGuard, validateSchema(updateProductSchema), productsControllerV1.update);
router.delete('/:id',   ...adminGuard, productsControllerV1.remove);

export default router;