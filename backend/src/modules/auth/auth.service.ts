import { AppError } from "@/shared/errors/AppError";
import { authRepository } from "./auth.repository";
import { LoginInput, RegisterInput, TokenPair } from "./auth.types";
import { generateToken, hashPassword, hashToken, verifyPassword } from "@/shared/utils/crypto";
import { sendEmail } from "@/shared/adapters/mailer";
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

export const authService = {

    // Register a new user
    async register(input: RegisterInput) {
        
        // Check if the email is not already registered
        const existing = await authRepository.findByEmail(input.email);
        if (existing) throw new AppError('Email is already registered', 409, 'EMAIL_CONFLICT');

        // Hash the password and save the new user
        const passwordHash = await hashPassword(input.password);
        const user = await authRepository.create({
            email: input.email,
            passwordHash,
            firstName: input.firstName,
            lastName: input.lastName,
        });

        // Send a welcome email
        sendEmail({
            to: user.email,
            subject: 'Welcome to the store',
            html: `<p>Hi ${user.first_name} thanks for joining!</p>`
        }).catch(console.error);

        return user;
    },

    // Login a user
    async login(input: LoginInput, deviceInfo: string): Promise<TokenPair & { userId: string }> {

        // Check if the email exists
        const user = await authRepository.findByEmail(input.email);

        // Pass a dummy hash in case the password is null to prevent timing attacks
        const dummyHash = '$2b$12$dummyhashtopreventtimingattacks0000000000000000000000'; // 60 chars
        const valid = await verifyPassword(input.password, user?.password_hash ?? dummyHash);

        if (!user || !valid) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

        const tokens = await authService._issueTokenPair(user.id, user.user_role, deviceInfo);
        return { ...tokens, userId: user.id }
    },

    // Refresh tokens when access token is expired
    async refresh(refreshToken: string, deviceInfo: string): Promise<TokenPair> {
        // Check for a valid refresh token
        const validToken = await authRepository.findRefreshTokenByToken(refreshToken);
        if (!validToken) throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
        
        // Token rotation, deleting the old refresh token and generating a new access and refresh token
        await authRepository.deleteRefreshToken(validToken.id);
        return authService._issueTokenPair(validToken.userId, validToken.role, deviceInfo);
    },

    // Log out the user by deleting his refresh token
    async logout(userId: string, refreshToken: string) {
        const validToken = await authRepository.findRefreshToken(userId, refreshToken);
        if (validToken) await authRepository.deleteRefreshToken(validToken.id);
    },

    // Get user info
    async getProfile(userId: string) {
        const user = await authRepository.findById(userId);
        if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        return user;
    },

    // Create new access and refresh tokens
    async _issueTokenPair(userId: string, role: string, deviceInfo: string): Promise<TokenPair> {

        // Generate access token
        const accessToken = jwt.sign(
            { sub: userId, role },
            env.JWT_ACCESS_SECRET,
            { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
        );

        // Generate refresh token with crypto sha256 algorithm
        const refreshToken = generateToken(48) // 64 base64url chars
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(env.JWT_REFRESH_EXPIRES_IN));

        // Save refresh token in the db
        await authRepository.saveRefreshToken({
            userId,
            tokenHash: hashToken(refreshToken),
            deviceInfo,
            expiresAt,
        });

        return { accessToken, refreshToken };
    }
}