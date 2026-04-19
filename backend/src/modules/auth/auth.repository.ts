import { db } from "@/config/database";
import { hashToken } from "@/shared/utils/crypto";

interface UserRow {
    id: string;
    email: string;
    password_hash: string | null;
    first_name: string | null;
    last_name: string | null;
    user_role: 'customer' | 'admin',
    is_verified: boolean,
    created_at: Date
}

interface CreateUserInput {
    email: string;
    passwordHash: string | null;
    firstName: string;
    lastName?: string;
}

interface SaveRefreshTokenInput {
    userId: string;
    tokenHash: string;
    deviceInfo: string;
    expiresAt: Date;
}

interface RefreshTokenRow {
    id: string;
    userId: string;
    role: 'customer' | 'admin';
}

export const authRepository = {

    // Looks up a user by email
    // Used in login to verify credentials and in register to check for duplicates
    async findByEmail(email: string): Promise<UserRow | null> {
        const { rows } = await db.query<UserRow>(
            `
                SELECT id, email, password_hash, first_name, last_name, user_role, is_verified, created_at 
                FROM users 
                WHERE email = $1
                LIMIT 1
            `,
            [email]
        );
        return rows[0] ?? null;
    },

    // Looks up a user by primary key
    async findById(id: string): Promise<Omit<UserRow, 'password_hash'> | null> {
        const { rows } = await db.query<Omit<UserRow, 'password_hash'>>(
            `
                SELECT id, email, first_name, last_name, user_role, is_verified, created_at
                FROM users
                WHERE id = $1 
                LIMIT 1
            `,
            [id]
        );
        return rows[0] ?? null;
    },

    // Inserts a new user and returns the created row
    async create(input: CreateUserInput): Promise<Omit<UserRow, 'password_hash'>> {
        const { rows } = await db.query<Omit<UserRow, 'password_hash'>>(
            `
                INSERT INTO users (email, password_hash, first_name, last_name)
                VALUES ($1, $2, $3, $4)
                RETURNING id, email, first_name, last_name, user_role, is_verified, created_at
            `,
            [input.email, input.passwordHash, input.firstName, input.lastName ?? null]
        );
        return rows[0];
    },

    // Stores a hashed refresh token linked to a user
    async saveRefreshToken(input: SaveRefreshTokenInput): Promise<void> {
        await db.query(
            `
                INSERT INTO refresh_tokens (user_id, token_hash, device_info, expires_at)
                VALUES ($1, $2, $3, $4)
            `,
            [input.userId, input.tokenHash, input.deviceInfo, input.expiresAt]
        );
    },

    // Looks up a token row by user id and raw token
    async findRefreshToken(
        userId: string,
        plainToken: string
    ): Promise<{ id: string} | null> {
        const { rows } = await db.query<{ id: string}>(
            `
                SELECT id 
                FROM refresh_tokens 
                WHERE user_id = $1
                  AND token_hash = $2
                  AND expires_at > NOW()
            `,
            [userId, hashToken(plainToken)]
        )
        return rows[0] ?? null;
    },

    // Looks up a refresh token by token and return the user info
    // This is for refresh token, we don't want the client provide his userId
    async findRefreshTokenByToken(
        plainToken: string
    ): Promise<RefreshTokenRow> {
        const { rows } = await db.query<RefreshTokenRow>(
            `
                SELECT rt.id AS id, rt.userId AS userId, u.user_role AS role
                FROM refresh_token rt
                JOIN users u ON u.id = rt.user_id
                WHERE rt.token_hash = $1
                  AND rt.expires_at > NOW() 
            `,
            [hashToken(plainToken)]
        )
        return rows[0] ?? null;
    },


    // Remove a single token by its primary key
    async deleteRefreshToken(tokenId: string): Promise<void> {
        await db.query(
            'DELETE FROM refresh_tokens WHERE id = $1',
            [tokenId]
        );
    },

    // Removes every token for a user
    // Used to logout from all devices or after a password change
    async deleteAllUserTokens(userId: string): Promise<void> {
        await db.query(
            'DELETE FROM refresh_tokens WHERE user_id = $1',
            [userId]
        );
    },
};