import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/shared/types';
import { sendSuccess } from '@/shared/utils/response';
import { ordersService } from '../../orders.service';
import { cartService } from '@/modules/cart/cart.service';

export const ordersControllerV1 = {

    async quote(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const identity = { userId: req.user?.sub, sessionId: req.guestSessionId };
            const cart = await cartService.resolveCart(identity);
            sendSuccess(res, await ordersService.quote(cart.id, req.body));
        } catch (err) { next(err); }
    },

    // Checkout works for guest and logged-in users
    async checkout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const identity = { userId: req.user?.sub, sessionId: req.guestSessionId };
            const cart = await cartService.resolveCart(identity);
            
            const result = await ordersService.checkout(req.user?.sub, cart.id, req.body);
            sendSuccess(res, result, 201);
        } catch (err) { next(err); }
    },

    async updateShippingAddress(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await ordersService.updateShippingAddress(
                req.user?.sub, req.params.id as string, req.body.trackingId,
                req.body.shippingAddress
            );
            sendSuccess(res, result);
        } catch (err) { next(err); }
    },

    // Tracker
    async trackOrder(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const order = await ordersService.trackOrder(req.params.trackingId as string);
            sendSuccess(res, { order });
        } catch (err) { next(err); }
    },

    async payCod(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            sendSuccess(res, await ordersService.payCod(req.user?.sub, req.params.id as string, req.body.trackingId));
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
            const { orders, meta } = await ordersService.listAll(req, req.query.status as string | undefined, req.query.search as string | undefined);
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