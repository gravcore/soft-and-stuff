import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/shared/errors/AppError';
import { sendSuccess } from '@/shared/utils/response';
import { mediaService } from '../../media.service';
import { env } from '@/config/env';

export const mediaControllerV1 = {

    async uploadImage(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) throw new AppError('No file uploaded', 400, 'NO_FILE');
            const result = await mediaService.uploadImage(req.file);
            sendSuccess(res, result, 201);
        } catch (err) { next(err); }
    },

    async uploadVideo(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) throw new AppError('No file uploaded', 400, 'NO_FILE');
            const { title, description } = req.body;
            const result = await mediaService.uploadVideo(req.file, title, description);
            sendSuccess(res, result, 201);
        } catch (err) { next(err); }
    },

    // One-part setup endpoints, used once per environment to obtain YOUTUBE_REFRESH_TOKEN
    async youtubeAuth(_req: Request, res: Response) {
        const { google } = await import('googleapis');
        const oauth2Client = new google.auth.OAuth2(
            env.YOUTUBE_CLIENT_ID,
            env.YOUTUBE_CLIENT_SECRET,
            env.YOUTUBE_REDIRECT_URI,
        );
        
        // Offline to receive a refresh_token
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/youtube.upload'],
        });
        res.redirect(url);
    },

    async youtubeCallback(req: Request, res: Response) {
        const { google } = await import('googleapis');
        const oauth2Client = new google.auth.OAuth2(
            env.YOUTUBE_CLIENT_ID,
            env.YOUTUBE_CLIENT_SECRET,
            env.YOUTUBE_REDIRECT_URI,
        );

        // Exchange the code provided by google for real tokens (access and refresh tokens)
        const { tokens } = await oauth2Client.getToken(req.query.code as string);

        // Loggin to console to get manually the tokens, one-time run
        console.log('Youtube refresh token: ', tokens.refresh_token);
        res.send('OAuth complete. Copy the refresh token from the server logs to .env');
    },
};