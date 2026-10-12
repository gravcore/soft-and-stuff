import request from 'supertest';
import { createApp } from '../../src/app';
import { db } from '../../src/config/database';

const app = createApp();

export async function createUserAndLogin(email = 'user@test.com', password = 'Password123!') {
    await request(app).post('/api/v1/auth/register').send({ email, password });
    const res = await request(app).post('/api/v1/auth/login').send({ email, password });
    return {
        accessToken: res.body.data.accessToken as string,
        cookie: res.headers['set-cookie'],
    }
}

export async function createAdminAndLogin() {
    const email = 'admin@test.com';
    const password = 'AdminPass123!';
    await request(app).post('/api/v1/auth/register').send({ email, password });
    await db.query(`UPDATE users SET user_role = 'admin' WHERE email = $1`, [email]);
    const res = await request(app).post('/api/v1/auth/login').send({ email, password });
    return { accessToken: res.body.data.accessToken as string };
}