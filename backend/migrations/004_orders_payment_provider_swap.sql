ALTER TABLE orders
    DROP COLUMN IF EXISTS stripe_payment_intent_id,
    DROP COLUMN IF EXISTS stripe_payment_status,
    ADD COLUMN payment_provider VARCHAR(50),
    ADD COLUMN payment_reference VARCHAR(255),
    ADD COLUMN payment_status VARCHAR(50);

