import { render } from '@react-email/render';
import { sendEmail } from '@/shared/adapters/mailer';
import { WelcomeEmail } from './templates/welcome.template';
import { OrderConfirmationEmail } from './templates/orderConfirmation.template';
import { WelcomeEmailData, OrderConfirmationEmailData, PasswordResetOtpEmailData } from './email.types';
import { PasswordResetOtpEmail } from './templates/passwordResetOtp.template';

export const emailService = {

    // Called right after a new user registers
    async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {

        // Converts the React component into a final HTML string
        const html = await render(WelcomeEmail({ firstName: data.firstName }));

        await sendEmail({
            to: data.to,
            subject: 'Welcome to the store',
            html,
        });
    },

    // Called right after a checkout succeeds
    async sendOrderConfirmationEmail(data: OrderConfirmationEmailData): Promise<void> {
        const html = await render(OrderConfirmationEmail({
            orderNumber: data.orderNumber,
            trackingId: data.trackingId,
            total: data.total,
            items: data.items,
        }));

        await sendEmail({
            to: data.to,
            subject: `Order confirmed - ${data.orderNumber}`,
            html,
        });
    },

    async sendPasswordResetOtp(data: PasswordResetOtpEmailData): Promise<void> {
        const html = await render(PasswordResetOtpEmail({ otp: data.otp, ttlMinutes: data.ttlMinutes }));
        await sendEmail({ to: data.to, subject: 'Reset your password', html });
    },
};