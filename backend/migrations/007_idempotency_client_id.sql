ALTER TABLE idempotency_keys
ADD COLUMN client_id VARCHAR(255) NOT NULL,
DROP CONSTRAINT idempotency_keys_idempotency_key_route_key,
ADD CONSTRAINT idempotency_keys_client_id_idempotency_key_route_key UNIQUE (client_id, idempotency_key, route);