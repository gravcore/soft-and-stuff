// We return this after a successful upload
export interface UploadImageResult {
    url: string;
}

// We return this after a successful video upload
export interface UploadVideoResult {
    videoId: string;
    embedUrl: string;
}