import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/shared/utils/response';
import { productsService } from '../../products.service';
import { ProductFilters } from '../../products.types';
import { AuthRequest } from '@/shared/types';

export const productsControllerV1 = {

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = {
                categorySlug:   req.query.category as string | undefined,
                featured:       req.query.featured === 'true' ? true : undefined,
                search:         req.query.search as string | undefined,
                minPrice:       req.query.minPrice ? Number(req.query.minPrice) : undefined,
                maxPrice:       req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                sort:           req.query.sort ? String(req.query.sort).split(',') as ProductFilters['sort'] : undefined,
            };
            const { products, meta } = await productsService.listProducts(filters, req);
            sendSuccess(res, { products }, 200, meta);
        } catch (err) { next(err); }
    },

    async getBySlug(req: Request, res: Response, next: NextFunction) {
        try {
            const product = await productsService.getBySlug(req.params.slug as string);
            sendSuccess(res, { product });
        } catch (err) { next(err); };
    },

    async getCategories(_req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await productsService.getCategories();
            sendSuccess(res, { categories });
        } catch (err) { next(err); };
    },

    // -- Admin-only actions below --

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const product = await productsService.create(req.body);
            sendSuccess(res, { product }, 201);
        } catch (err) { next(err); };
    },

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const product = await productsService.update(req.params.id as string, req.body);
            sendSuccess(res, { product });
        } catch (err) { next(err); };
    },

    async remove(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await productsService.delete(req.params.id as string);
            sendSuccess(res, { message: 'Product deleted' });
        } catch (err) { next(err); };
    },
};