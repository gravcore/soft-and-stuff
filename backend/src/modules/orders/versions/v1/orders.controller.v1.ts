import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/shared/types';
import { sendSuccess } from '@/shared/utils/response';
import { ordersService } from '../../orders.service';
import { cartService } from '@/modules/cart/cart.service';

export const ordersControllerV1 = {

    // Checkout works for guest and logged-in users
    async checkout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const identity = { userId: req.user?.sub, sessionId: req.guestSessionId };
            const cart = await cartService.resolveCart(identity);
            
            const result = await ordersService.checkout(req.user?.sub, cart.id, req.body);
            sendSuccess(res, result, 201);
        } catch (err) { next(err); }
    },

    // Tracker
    async trackOrder(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const order = await ordersService.trackOrder(req.params.trackingId as string);
            sendSuccess(res, { order });
        } catch (err) { next(err); }
    },

    // User's orders, requires auth
    async listMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { orders, meta } = await ordersService.listMyOrders(req.user!.sub, req);
            sendSuccess(res, { orders }, 200, meta);
        } catch (err) { next(err); }
    },

    // Get the order by ID, requires auth
    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const order = await ordersService.getById(req.user!.sub, req.params.id as string);
            sendSuccess(res, { order });
        } catch (err) { next(err); }
    },

    // === Admin-only ===
    
    async listAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { orders, meta } = await ordersService.listAll(req, req.query.status as string | undefined);
            sendSuccess(res, { orders }, 200, meta);
        } catch (err) { next(err); }
    },

    async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const order = await ordersService.updateStatus(req.params.id as string, req.body.status);
            sendSuccess(res, { order });
        } catch (err) { next(err); }
    },
};