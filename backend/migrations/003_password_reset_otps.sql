CREATE TABLE IF NOT EXISTS password_reset_otps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp_hash        VARCHAR(64) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    verified        BOOLEAN NOT NULL DEFAULT false, -- step 2: code confirmed correct
    used            BOOLEAN NOT NULL DEFAULT false, -- step 3: password actually changed with it
    attempts        SMALLINT NOT NULL DEFAULT 0,    -- wrong-guess counter, locks after 5
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_otps_user ON password_reset_otps(user_id);