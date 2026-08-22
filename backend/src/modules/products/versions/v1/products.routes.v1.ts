import { Router } from 'express';
import { validateSchema } from '@/shared/middleware/validateSchema.middleware';
import { createProductSchema, updateProductSchema, productFiltersSchema, createCategorySchema } from '../../products.schema';
import { productsControllerV1 } from './products.controller.v1';
import { authenticate, authorize } from '@/shared/middleware/auth.middleware';

const router = Router();

router.get('/', validateSchema(productFiltersSchema, 'query'), productsControllerV1.list);
router.get('/categories', productsControllerV1.getCategories);
router.get('/:slug', productsControllerV1.getBySlug);
router.get('/categories/search', productsControllerV1.searchCategories);

// Admin-only routes
const adminGuard = [authenticate(), authorize('admin')];

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product detail }
 *       401: { description: Missing or invalid token }
 *       403: { description: Insufficient permissions }
 *       404: { description: Not found }
 */
router.get('/:id', ...adminGuard, productsControllerV1.getById);
router.post('/',        ...adminGuard, validateSchema(createProductSchema), productsControllerV1.create);
router.patch('/:id',    ...adminGuard, validateSchema(updateProductSchema), productsControllerV1.update);
router.delete('/:id',   ...adminGuard, productsControllerV1.remove);
router.post('/categories', ...adminGuard, validateSchema(createCategorySchema), productsControllerV1.getOrCreateCategory);

export default router;