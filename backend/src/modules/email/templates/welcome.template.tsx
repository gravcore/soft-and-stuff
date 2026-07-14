import { Html, Head, Body, Container, Heading, Text, Section } from '@react-email/components';

// Data this template needs to render
interface WelcomeEmailProps {
    firstName: string;
}

export const WelcomeEmail = ({ firstName }: WelcomeEmailProps ) => (
    <Html>
        <Head />
        <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f6f6f6' }}>
            <Container style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px' }}>
                <Heading as="h1">Welcome, {firstName}!</Heading>
                <Section>
                    <Text>Thanks for creating an account with us. We're excited to have you.</Text>
                    <Text>Browse our latest products and start shopping whenever you're ready.</Text>
                </Section>
            </Container>
        </Body>
    </Html>
);