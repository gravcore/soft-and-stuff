export interface RegisterInput {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface OAuthProfile {
    provider: string;
    providerId: string;
    email: string;
    firstName: string;
    lastName?: string; 
    avatarUrl: string | null;
}