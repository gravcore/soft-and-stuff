import request from 'supertest';
import { createApp } from '../../src/app';
import { resetDb } from '../helpers/db';

const app = createApp();

const VALID_PASSWORD = 'Password123';

describe('Auth - integration', () => {
    
    beforeEach(resetDb);
    // Runs before EVERY "it" inside this describe block (and any nested describe blocks inside it)
    // Does NOT affect sibling describe blocks elsewhere in the file

    describe('POST /api/v1/auth/register', () => {
        it('201 - creates user, response never exposes password_hash', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                email: 'a@a.com',
                password: VALID_PASSWORD,
                firstName: 'Sam',
            });
            expect(res.status).toBe(201);
            expect(res.body.data.user).not.toHaveProperty('password_hash');
        });

        it('422 - missing firstName (required field)', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({ email: 'a@a.com', password: VALID_PASSWORD });
            expect(res.status).toBe(422);
        });

        it('422 - password without uppercase/number fails complexity rules', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({ email: 'a@a.com', password: 'weakpassword', firstName: 'Sam' });
            expect(res.status).toBe(422);
        });

        it('409 - duplicate email', async () => {
            await request(app).post('/api/v1/auth/register').send({ email: 'a@a.com', password: VALID_PASSWORD, firstName: 'Sam' });
            const res = await request(app).post('/api/v1/auth/register').send({ email: 'a@a.com', password: VALID_PASSWORD, firstName: 'Sam' });
            expect(res.status).toBe(409);
            expect(res.body.error.code).toBe('EMAIL_CONFLICT');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/api/v1/auth/register').send({
                email: 'a@a.com', password: VALID_PASSWORD, firstName: 'Sam',
            });
        });

        it('200 - correct credentials, sets refreshToken cookie, returns accessToken', async () => {
            const res = await request(app).post('/api/v1/auth/login').send({ email: 'a@a.com', password: VALID_PASSWORD });
            expect(res.status).toBe(200);
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.body.data).toHaveProperty('accessToken');
        });

        it('401 - wrong password', async () => {
            const res = await request(app).post('/api/v1/auth/login').send({ email: 'a@a.com', password: 'WrongPass1' });
            expect(res.status).toBe(401);
            expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
        });
    });

    describe('GET /api/v1/auth/me', () => {
        it('401 - no token', async () => {
            const res = await request(app).get('/api/v1/auth/me');
            expect(res.status).toBe(401);
        });

        it('200 - valid token, no password_hash leaked', async () => {
            await request(app).post('/api/v1/auth/register').send({ email: 'a@a.com', password: VALID_PASSWORD, firstName: 'Sam' });
            const login = await request(app).post('/api/v1/auth/login').send({ email: 'a@a.com', password: VALID_PASSWORD });
            const res = await request(app).get('/api/v1/auth/me')
                                          .set('Authorization', `Bearer ${login.body.data.accessToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.user).not.toHaveProperty('password_hash');
        });
    });

    describe('POST /api/v1/auth/refresh', () => {
        it('200 - rotates refresh token (old cookie -> new accessToken + new cookie', async () => {
            await request(app).post('/api/v1/auth/register').send({ email: 'a@a.com', password: VALID_PASSWORD, firstName: 'Sam' });
            const login = await request(app).post('/api/v1/auth/login').send({ email: 'a@a.com', password: VALID_PASSWORD });
            const res = await request(app).post('/api/v1/auth/refresh')
                .set('Cookie', login.headers['set-cookie']);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('accessToken');
        });

        it('401 - reusing an already-rotated refresh token is rejected', async () => {
            await request(app).post('/api/v1/auth/register').send({ email: 'a@a.com', password: VALID_PASSWORD, firstName: 'Sam' });
            const login = await request(app).post('/api/v1/auth/login').send({ email: 'a@a.com', password: VALID_PASSWORD });
            await request(app).post('/api/v1/auth/refresh')
                .set('Cookie', login.headers['set-cookie']);
            
            const reused = await request(app).post('/api/v1/auth/refresh')
                .set('Cookie', login.headers['set-cookie']);

            expect(reused.status).toBe(401);
            expect(reused.body.error.code).toBe('INVALID_REFRESH_TOKEN');
        });
    });

    describe('POST /api/v1/auth/logout', () => {
        it('401 - requires auth', async () => {
            const res = await request(app).post('/api/v1/auth/logout');
            expect(res.status).toBe(401);
        });

        it('200 - clears the refreshToken cookie', async () => {
            await request(app).post('/api/v1/auth/register').send({ email: 'a@a.com', password: VALID_PASSWORD, firstName: 'Sam' });
            const login = await request(app).post('/api/v1/auth/login').send({ email: 'a@a.com', password: VALID_PASSWORD });
            const res = await request(app).post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${login.body.data.accessToken}`)
                .set('Cookie', login.headers['set-cookie']);
            expect(res.status).toBe(200);
            expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=;/);
        });
    });    
});