import 'jest';
import { authService } from "./auth.service";
import { authRepository } from "./auth.repository";

// Replaces the real repository with a fake version
jest.mock('./auth.repository');

describe('authService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('throws INVALID_CREDENTIALS when user is not found', async () => {
        (authRepository.findByEmail as jest.Mock).mockResolvedValue(null);

        await expect(
            authService.login({ email: 'missin@a.com', password: 'x' }, 'test-device')
        ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    });

    it('throws INVALID_CREDENTIALS when password does not match', async () => {
        (authRepository.findByEmail as jest.Mock).mockResolvedValue({
            id: 1, email: 'a@a.com', password_hash: '$2b$12$fakehash',
        });

        await expect(
            authService.login({ email: 'a@a.com', password: 'WrongPass1' }, 'test-device')
        ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS'});
    });

    it('throws EMAIL_CONFLICT when registering an existing email', async () => {
        (authRepository.findByEmail as jest.Mock).mockResolvedValue({ id: '1', email: 'a@a.com' });

        await expect(
            authService.register({ email: 'a@a.com', password: 'Password123!', firstName: 'Sam' })
        ).rejects.toMatchObject({ code: 'EMAIL_CONFLICT' });
    });

    it('throws INVALID_REFRESH_TOKEN when the token is not found/expired', async () => {
        (authRepository.findRefreshTokenByToken as jest.Mock).mockResolvedValue(null);

        await expect(
            authService.refresh('some-token', 'test-device')
        ).rejects.toMatchObject({ code: 'INVALID_REFRESH_TOKEN' });
    });

    it('throws USER_NOT_FOUND when getting profile for a deleted/mising user', async () => {
        (authRepository.findById as jest.Mock).mockResolvedValue(null);

        await expect(
            authService.getProfile('missing-id')
        ).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
    });
});