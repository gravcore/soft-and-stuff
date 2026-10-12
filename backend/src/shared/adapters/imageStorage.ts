import ImageKit from 'imagekit';
import { env } from '@/config/env';

const imageKit = new ImageKit({
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
});

// upload an image
export const uploadImage = async (
    fileBuffer: Buffer, // raw binary data
    fileName: string,
    folder: string = '/products'
): Promise<string> => {

    const result = await imageKit.upload({
        file: fileBuffer,
        fileName,
        folder,
        useUniqueFileName: true,
    });
    return result.url;
};

export const deleteImage = async (fileId: string): Promise<void> => {
    await imageKit.deleteFile(fileId);
};