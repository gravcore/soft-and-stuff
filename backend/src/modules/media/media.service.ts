import { AppError } from "@/shared/errors/AppError";
import { uploadImage as uploadImageAdapter, deleteImage as deleteImageAdapter } from "@/shared/adapters/imageStorage";
import { uploadVideo as uploadVideoAdapter } from "@/shared/adapters/videoStorage";
import { UploadImageResult, UploadVideoResult } from "./media.types";
import 'multer';

// Application-level limits
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const mediaService = {

    // Validates the file itself (type, size) before handing it
    async uploadImage(file: Express.Multer.File): Promise<UploadImageResult> {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            throw new AppError('Invalid image type, only JPEG, PNG, and WEBP are allowed', 400, 'INVALID_FILE_TYPE');
        }
        if (file.size > MAX_IMAGE_SIZE) {
            throw new AppError(`Image must be under ${MAX_IMAGE_SIZE / 1024 / 1024}MB`, 400, 'FILE_TOO_LARGE');
        }

        const url = await uploadImageAdapter(file.buffer, file.originalname);
        return { url };
    },

    async uploadVideo(
        file: Express.Multer.File,
        title: string,
        description?: string
    ): Promise<UploadVideoResult> {
        return await uploadVideoAdapter(file.buffer, title, description ?? '');
    },

    async deleteImage(fileId: string): Promise<void> {
        await deleteImageAdapter(fileId);
    },
};