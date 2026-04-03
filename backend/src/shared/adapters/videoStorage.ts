import { google } from 'googleapis';
import { Readable } from 'stream';
import { env } from '@/config/env';

// Handles authentication flow with google to request permission to upload videos
const oauth2Client = new google.auth.OAuth2(
    env.YOUTUBE_CLIENT_ID,
    env.YOUTUBE_CLIENT_SECRET,
    env.YOUTUBE_REDIRECT_URI,
);

// Set credentials using the stored refresh token
oauth2Client.setCredentials({ refresh_token: env.YOUTUBE_REFRESH_TOKEN });

const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

// Upload a video
export const uploadVideo = async (
    fileBuffer: Buffer,
    title: string,
    description = ''
): Promise<string> => {

    // Converts the buffer (bytes) into stream (list of chunks)
    const readable = Readable.from(fileBuffer);

    const response = await youtube.videos.insert({
        part: ['snippet', 'status'], // tells YouTube what we're sending AND what to return
        requestBody: {
            snippet: { title, description, categoryId: '26' },
            status: { privacyStatus: 'unlisted' },
        },
        media: { body: readable }
    });

    const videoId = response.data.id;
    if (!videoId) throw new Error('Youtube upload failed: no video ID returned');
    return videoId;
}
