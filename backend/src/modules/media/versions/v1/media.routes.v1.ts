import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '@/shared/middleware/auth.middleware';
import { validateSchema } from '@/shared/middleware/validateSchema.middleware';
import { uploadVideoSchema } from '../../media.schema';
import { mediaControllerV1 } from './media.controller.v1';

// Multer file handler instance
const upload = multer({
    storage: multer.memoryStorage(), // Keeps the file in memory as a Buffer
    limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
});

const router = Router();

const adminGuard = [authenticate(), authorize('admin')];

router.post('/images', ...adminGuard, upload.single('file'), mediaControllerV1.uploadImage);
router.post('/videos', ...adminGuard, upload.single('file'), validateSchema(uploadVideoSchema), mediaControllerV1.uploadVideo);

// === One-time flow per environment ===
router.get('/youtube/auth', mediaControllerV1.youtubeAuth);
router.get('/youtube/callback', mediaControllerV1.youtubeCallback);

export default router;