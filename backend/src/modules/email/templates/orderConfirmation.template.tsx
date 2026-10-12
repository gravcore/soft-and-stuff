import { Html, Head, Body, Container, Heading, Text, Section, Row, Column, Hr } from "@react-email/components";

interface OrderConfirmationItem {
    name: string;
    quantity: number;
    totalPrice: number; // cents
}

interface OrderConfirmationEmailProps {
    orderNumber: string;
    trackingId: string;
    total: number;
    items: OrderConfirmationItem[];
}

// Converts cents to a display string
const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export const OrderConfirmationEmail = ({
    orderNumber,
    trackingId,
    total,
    items,
}: OrderConfirmationEmailProps) => (
    <Html>
        <Head />
        <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f6f6f6' }}>
            <Container style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px' }}>
                <Heading as="h1">Order Confirmed</Heading>
                <Text>Your order <strong>{orderNumber}</strong> has been received.</Text>

                <Hr />
                
                <Section>
                    {items.map((item, i) => (
                        <Row key={i}>
                            <Column>{item.name} x {item.quantity}</Column>
                            <Column align="right">{formatMoney(item.totalPrice)}</Column>
                        </Row>
                    ))}
                </Section>

                <Hr />

                <Section>
                    <Row>
                        <Column><strong>Total</strong></Column>
                        <Column align="right"><strong>{formatMoney(total)}</strong></Column>
                    </Row>
                </Section>
                
                <Section style={{ marginTop: '24px' }}>
                    <Text>
                        Track your order anytime using this ID: <strong>{trackingId}</strong>
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

