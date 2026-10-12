CREATE TABLE IF NOT EXISTS idempotency_keys (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key     VARCHAR(255) NOT NULL,
    route               VARCHAR(255) NOT NULL,
    request_hash        VARCHAR(255) NOT NULL, -- caches request body
    response_status     INTEGER, -- NULL while the original request is still in flight
    response_body       JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(idempotency_key, route)
);