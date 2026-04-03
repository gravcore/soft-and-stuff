import { Resend } from 'resend';
import { env } from '@/config/env';

const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

// Sends a transactional email via Resend
export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
    const { error } = await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
    });

    if (error) throw new Error(`Email send failed ${error.message}`);
};