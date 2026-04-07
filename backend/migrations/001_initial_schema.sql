CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(100),
    first_name      VARCHAR(255),
    last_name       VARCHAR(255),
    roles           VARCHAR(20) DEFAULT 'customer', -- can be "customer" | "admin"
    avatar_url      VARCHAR(500),
    is_verified     BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(64), -- SHA-256 hex: 64 characteres
    device_info     TEXT,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name   VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL, -- url-friendly name: running-shoes
    image_url       VARCHAR(500),
    parent_id UUID  REFERENCES categories(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id             UUID REFERENCES categories(id),
    product_name            VARCHAR(255) NOT NULL,
    product_description     TEXT,
    slug                    VARCHAR(255) UNIQUE NOT NULL, -- url-friendly name
    sku                     VARCHAR(50) UNIQUE NOT NULL, -- sku: stock kiping unit, code to find products. e.g. "NK-RED-M-001"
    stock                   INTEGER DEFAULT 0 CHECK(stock >= 0),
    is_active               BOOLEAN DEFAULT true,
    is_featured             BOOLEAN DEFAULT false,
    price_in_cents          INTEGER NOT NULL CHECK(price_in_cents >= 0), -- integer price in cents to avoid decimal or floats rounds
    compare_price           INTEGER CHECK(compare_price >= 0),
    images_url              JSONB DEFAULT '[]',
    videos_url               JSONB DEFAULT '[]',
    metadata                JSONB DEFAULT '{}',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    session_id  VARCHAR(255) UNIQUE, -- for guest carts
    expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id         UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    price_snapshot  INTEGER NOT NULL, -- price at the time the product was added
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number                VARCHAR(20) UNIQUE NOT NULL, -- e.g. ORD-2026-04-51569578
    tracking_id                 VARCHAR(12) UNIQUE NOT NULL, -- e.g. ORD-5B9E5236
    order_status                VARCHAR(25) NOT NULL DEFAULT 'pending', -- e.g. 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'canceled'
    subtotal                    INTEGER NOT NULL,
    tax                         INTEGER NOT NULL DEFAULT 0,
    shipping                    INTEGER NOT NULL DEFAULT 0,
    total                       INTEGER NOT NULL,
    currency                    CHAR(3) NOT NULL DEFAULT 'USD',
    shipping_address            JSONB DEFAULT '{}',
    guest_email                 VARCHAR(255),
    stripe_payment_intent_id    VARCHAR(255),
    stripe_payment_status       VARCHAR(50),
    notes                       TEXT,
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()    
);

CREATE TABLE IF NOT EXISTS order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    -- snapshot of the product
    product_name    VARCHAR(255) NOT NULL,
    product_sku     VARCHAR(100),
    quantity        INTEGER NOT NULL,
    price_snapshot  INTEGER NOT NULL,
    total           INTEGER NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()   
);

CREATE TABLE IF NOT EXISTS user_addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_name    VARCHAR(255) NOT NULL,
    line1           VARCHAR(255) NOT NULL,
    line2           VARCHAR(255),
    address_state   VARCHAR(100),
    city            VARCHAR(100) NOT NULL,
    country         CHAR(2) NOT NULL DEFAULT 'US',
    zip             VARCHAR(20),
    address_notes   TEXT,
    is_default      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()                       
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token_user ON refresh_tokens(user_id);
