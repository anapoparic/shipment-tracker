
CREATE TYPE shipment_status AS ENUM (
    'CREATED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
);


CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE shipments (
    id BIGSERIAL PRIMARY KEY,
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    destination_address TEXT NOT NULL,
    promised_delivery_date TIMESTAMPTZ NOT NULL,
    actual_delivery_date TIMESTAMPTZ NULL,
    current_status shipment_status NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shipments_current_status ON shipments(current_status);
CREATE INDEX idx_shipments_promised_date ON shipments(promised_delivery_date);
CREATE INDEX idx_shipments_customer ON shipments(customer_id);


CREATE TABLE shipment_events (
    id BIGSERIAL PRIMARY KEY,
    shipment_id BIGINT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    event_type shipment_status NOT NULL,
    location TEXT NOT NULL,
    description TEXT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_shipment_id ON shipment_events(shipment_id);
CREATE INDEX idx_events_timestamp ON shipment_events(timestamp);


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW IS DISTINCT FROM OLD THEN
        NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shipments_updated_at
BEFORE UPDATE ON shipments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();