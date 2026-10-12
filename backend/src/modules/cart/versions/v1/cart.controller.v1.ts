import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/shared/types';
import { sendSuccess } from '@/shared/utils/response';
import { cartService } from '../../cart.service';

// Reads whatever the request has available
// a guest or logged-in user
const buildIdentity = (req: AuthRequest) => ({
    userId: req.user?.sub,
    sessionId: req.guestSessionId,
});

export const cartControllerV1 = {

    async getCart(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const cart = await cartService.getCart(buildIdentity(req));
            sendSuccess(res, cart);
        } catch (err) { next(err); };
    },

    async addItem(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { productId, quantity } = req.body;
            const cart = await cartService.addItem(buildIdentity(req), productId, quantity);
            sendSuccess(res, cart, 201);
        } catch (err) { next(err); };
    },

    async updateItem(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const cart = await cartService.updateItem(
                buildIdentity(req),
                req.params.itemId as string,
                req.body.quantity
            );
            sendSuccess(res, cart);
        } catch (err) { next(err); };
    },

    async removeItem(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const cart = await cartService.removeItem(buildIdentity(req), req.params.itemId as string);
            sendSuccess(res, cart);
        } catch (err) { next(err); };
    },

    async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const cart = await cartService.clearCart(buildIdentity(req));
            sendSuccess(res, cart);
        } catch (err) { next(err); };
    },
};