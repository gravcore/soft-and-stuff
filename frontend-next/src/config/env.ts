import { z } from 'zod';

const schema = z.object({
    BACKEND_URL: z.url().default('http://localhost:3000'),
    REVALIDATE_SECRET: z.string(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
    console.log('Error in environment variables: ', parsed.error.issues);
    process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;