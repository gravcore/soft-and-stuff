import { Html, Head, Body, Container, Heading, Text, Section } from '@react-email/components';

interface PasswordResetOtpEmailProps { otp: string, ttlMinutes: number; }

export const PasswordResetOtpEmail = ({ otp, ttlMinutes }: PasswordResetOtpEmailProps) => (
    <Html>
        <Head />
        <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f6f6f6', padding: '40px 0' }}>
            <Container style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', maxWidth: '440px' }}>

                {/* Brand header */}
                <Section style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed', padding: '32px 24px', textAlign: 'center' }}>
                    <Section style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        lineHeight: '56px',
                        textAlign: 'center',
                        fontSize: '28px', margin: '0 auto 12px',
                    }}>
                        🛍️
                    </Section>
                    <Heading as='h1' style={{ color: '#ffffff', fontSize: '20px', margin: 0 }}>
                        Soft&Stuff
                    </Heading>
                </Section>

                {/* Body */}
                <Section style={{ padding: '32px 24px', textAlign: 'center' }}>
                    <Heading as='h2' style={{ fontSize: '20px', margin: '0 0 8px' }}>Reset your password</Heading>

                    <Text style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px' }}>
                        Use this code to continue. It expires in {ttlMinutes} minutes.
                    </Text>

                    {/* OTP, spaced-out digits, easy to read/type */}
                    <Section style={{
                        backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe',
                        borderRadius: '10px',
                        padding: '16px', margin: '0 0 24px', fontSize: '32px',
                        fontWeight: 700,
                        letterSpacing: '10px', color: '#4f46e5', fontFamily: 'monospace',
                        textAlign: 'center',
                    }}>
                        {otp}
                    </Section>

                    <Text style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                        Didn't request this? You can safely ignore this email.
                    </Text>
                </Section>

            </Container>
        </Body>
    </Html>
);