import { db } from "@/config/database";

afterAll(async () => {
    await db.end();
});

jest.mock('@/modules/email/email.service', () => ({
  emailService: {
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    sendOrderConfirmationEmail: jest.fn().mockResolvedValue(undefined),
  },
}));