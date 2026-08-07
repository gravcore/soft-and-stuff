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

export interface GoogleProfile {
    id: string;
    emails?: { value: string }[];
    name?: { givenName?: string; familyName?: string; }
    photos?: { value: string }[];
}