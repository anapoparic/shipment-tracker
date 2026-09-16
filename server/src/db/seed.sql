-- CLEAR EXISTING DATA FOR RESTART
TRUNCATE TABLE shipment_events, shipments, customers RESTART IDENTITY CASCADE;

-- 1. CUSTOMERS ENTRY
INSERT INTO customers (name, email, phone_number, address) VALUES
('Marko Petrović', 'marko.petrovic@email.com', '+381641234567', 'Bulevar Oslobođenja 45, Novi Sad'),
('Jelena Jovanović', 'jelena.j@email.com', '+381639876543', 'Knez Mihailova 12, Beograd'),
('Nikola Milanković', 'nikola.m@email.com', '+381655554433', 'Cara Dušana 88, Niš');

-- 2. SHIPMENTS ENTRY
INSERT INTO shipments (
    id,
    tracking_number, 
    customer_id, 
    destination_address, 
    promised_delivery_date, 
    actual_delivery_date, 
    current_status, 
    created_at
) VALUES
-- 1. Successfully delivered ON TIME
(1, 'SHP-2026-001', 1, 'Bulevar Oslobođenja 45, Novi Sad', '2026-09-12 18:00:00+02', '2026-09-12 14:30:00+02', 'DELIVERED', '2026-09-10 09:00:00+02'),

-- 2. In transit (Standard flow)
(2, 'SHP-2026-002', 2, 'Knez Mihailova 12, Beograd', '2026-09-18 18:00:00+02', NULL, 'IN_TRANSIT', '2026-09-14 10:00:00+02'),

-- 3. ADDRESS CHANGED IN-FLIGHT (Scenario 2: destination_address contains the new address, event log stores the change)
(3, 'SHP-2026-003', 1, 'Bulevar Cara Lazara 10, Novi Sad', '2026-09-16 18:00:00+02', NULL, 'OUT_FOR_DELIVERY', '2026-09-13 11:30:00+02'),

-- 4. CURRENTLY DELAYED / OUTSTANDING (Ambiguity 1: Promised date passed on Sep 15th, today is Sep 16th, not yet delivered)
(4, 'SHP-2026-004', 3, 'Cara Dušana 88, Niš', '2026-09-15 12:00:00+02', NULL, 'IN_TRANSIT', '2026-09-12 15:00:00+02'),

-- 5. DELIVERED LATE (Ambiguity 1: Promised on Sep 13th, actual_delivery_date was Sep 14th)
(5, 'SHP-2026-005', 2, 'Knez Mihailova 12, Beograd', '2026-09-13 18:00:00+02', '2026-09-14 11:00:00+02', 'DELIVERED', '2026-09-11 08:00:00+02'),

-- 6. RETURNED TO HUB / FAILED DELIVERY (Scenario 1: Recipient unavailable at destination)
(6, 'SHP-2026-006', 3, 'Cara Dušana 88, Niš', '2026-09-16 18:00:00+02', NULL, 'IN_TRANSIT', '2026-09-14 08:00:00+02'),

-- 7. LOST IN TRANSIT / CANCELLED (Scenario 1: Lost shipment lifecycle)
(7, 'SHP-2026-007', 2, 'Knez Mihailova 12, Beograd', '2026-09-10 18:00:00+02', NULL, 'CANCELLED', '2026-09-08 08:00:00+02');

-- Reset the primary key sequence for shipments table after manual ID insertions
SELECT setval('shipments_id_seq', (SELECT MAX(id) FROM shipments));

-- 3. SHIPMENT EVENTS ENTRY
INSERT INTO shipment_events (
    shipment_id, event_type, location, description, timestamp, created_at
) VALUES
-- Shipment 1: Delivered on time
(1, 'CREATED', 'Main Warehouse, Belgrade', 'Shipment order created', '2026-09-10 09:00:00+02', '2026-09-10 09:00:00+02'),
(1, 'DELIVERED', 'Bulevar Oslobođenja 45, Novi Sad', 'Package successfully delivered to recipient', '2026-09-12 14:30:00+02', '2026-09-12 14:30:00+02'),

-- Shipment 3: IN-FLIGHT ADDRESS CHANGE
(3, 'CREATED', 'Main Warehouse, Belgrade', 'Shipment order created', '2026-09-13 11:30:00+02', '2026-09-13 11:30:00+02'),
(3, 'IN_TRANSIT', 'Novi Sad Hub', 'Customer requested address update from "Bulevar Oslobođenja 45" to "Bulevar Cara Lazara 10"', '2026-09-14 16:00:00+02', '2026-09-14 16:05:00+02'),
(3, 'OUT_FOR_DELIVERY', 'Novi Sad Hub', 'Courier assigned package for delivery to updated address', '2026-09-16 08:00:00+02', '2026-09-16 08:00:00+02'),

-- Shipment 4: OUT-OF-ORDER EVENT ENTRY
-- Example: Event occurred offline on Sep 14 at 10:00 AM, but was synced to the DB later on Sep 15 at 06:00 PM (system created_at)
(4, 'CREATED', 'Main Warehouse, Nis', 'Shipment order created', '2026-09-12 15:00:00+02', '2026-09-12 15:00:00+02'),
(4, 'IN_TRANSIT', 'Sorting Center Kragujevac', 'Recorded offline on field Sep 14 10:00 AM, synced retroactively', '2026-09-14 10:00:00+02', '2026-09-15 18:00:00+02'),

-- Shipment 6: FAILED DELIVERY ATTEMPT (Returned to Hub)
(6, 'CREATED', 'Main Warehouse, Nis', 'Shipment order created', '2026-09-14 08:00:00+02', '2026-09-14 08:00:00+02'),
(6, 'OUT_FOR_DELIVERY', 'Nis', 'Courier out for delivery', '2026-09-15 09:00:00+02', '2026-09-15 09:00:00+02'),
(6, 'IN_TRANSIT', 'Nis Hub - Shelf B-12', 'Delivery failed (customer absent). Package returned to Hub, awaiting pickup or reschedule', '2026-09-15 17:00:00+02', '2026-09-15 17:00:00+02'),

-- Shipment 7: LOST IN TRANSIT / CANCELLED
(7, 'CREATED', 'Main Warehouse, Belgrade', 'Shipment order created', '2026-09-08 08:00:00+02', '2026-09-08 08:00:00+02'),
(7, 'CANCELLED', 'Sorting Center Belgrade', 'Shipment declared lost in transit. Refund claim initiated.', '2026-09-10 12:00:00+02', '2026-09-10 12:00:00+02');