# shipment-tracker# Shipment Tracker

## Overview

A full-stack web application designed for operations teams to monitor customer orders, track shipment lifecycles across transport phases, and proactively identify and prioritize delayed shipments.

---

## Tech Stack

- **Frontend:** Angular (Standalone Components, Reactive Forms, SCSS)
- **Backend:** Node.js, Express, TypeScript (Modular Architecture, Repository/Service pattern)
- **Database:** PostgreSQL (Optimized relational schema with indexing)
- **Containerization:** Docker & Docker Compose (Multi-container orchestration with internal DNS)

---

## Getting Started & Running the Application

1. Ensure you have **Docker** and **Docker Compose** installed on your machine.
2. Clone the repository and navigate to the project root directory.
3. Start the entire system using Docker Compose:
   ```bash
   docker compose up --build
   ```
4. Access the applications:
   - Client App (Frontend): `http://localhost:4200`
   - Backend API: `http://localhost:3000`

---

## Architectural Decisions & Core Engineering Solutions

### 1. Modular Backend Architecture (Repository / Service / Controller Pattern)

- **Structure:** The backend is organized into isolated domain modules (`shipments`, `events`, `customers`). Each module strictly separates concerns across layers: routes, controllers, services (business logic), repositories (database access), and mappers.
- **Why:** This ensures high maintainability, clear boundaries, and clean separation between HTTP handling, business validation, and data persistence.

### 2. Shipment Lifecycle

- We decided to adopt a strict 5-status core lifecycle combined with a chronological event log (shipment_events) for operational updates.
- **Core Lifecycle States (Enum):**
  -The ShipmentStatus enum is strictly limited to five macroscopic states:
  - CREATED: Order has been registered in the system.
  - IN_TRANSIT: Package is moving between sorting centers or hubs.
  - OUT_FOR_DELIVERY: Package is with the local courier for final drop-off.
  - DELIVERED: Package successfully handed over to the customer.
  - CANCELLED: Shipment aborted or cancelled prior to delivery.

- No EXCEPTION status in the core enum: Operational disruptions (delays, weather holds, damages) do not alter the primary status. Instead, they are recorded as descriptive entries in the shipment_events table, while the shipment remains in its current valid state (e.g., IN_TRANSIT).

### 2. Strict State Machine & Server-Side Enforcement

- **Enforcement:** Operational lifecycles (e.g., `CREATED` → `IN_TRANSIT` → `OUT_FOR_DELIVERY` → `DELIVERED`) are strictly validated on the server side.
- **Why:** Even if the client sends unexpected or out-of-order transitions, the backend rejects illegal state regressions with a `400 Bad Request`, protecting data integrity.

### 3. Dynamic Calculation of "Late" Shipments

- **Approach:** Instead of storing a static status column that requires continuous background updates, delay status is computed dynamically via database queries and indexing based on the `promised_delivery_date` timestamp vs. current system time.
- **Why:** Eliminates the need for cron jobs or redundant scheduled database writes while guaranteeing real-time accuracy for operations floor staff.

### 4. Development Proxy Configuration

- **Approach:** Angular's built-in development proxy (`proxy.conf.json`) is configured in the client root to intercept `/api` requests and forward them to the backend service.
- **Why:** Eliminates hardcoded absolute URLs and CORS issues during local and containerized development, allowing the use of clean relative paths (`/api/shipments`) that transition seamlessly to production environments (e.g., via Nginx).

### 5. Dockerized Networking & Service Isolation

- **Approach:** Services (`postgres_db`, `server`, `client`) communicate internally via Docker bridge network DNS names (e.g., targeting `http://server:3000` instead of `localhost`) and use volume mapping for hot-reloading.
- **Why:** Guarantees environment parity and allows anyone to boot up the complete, database-backed stack with a single command without manual local setup.

---

## Assumptions and Known Limitations

This project is intentionally designed as a focused MVP for operations visibility, and several business assumptions were simplified in order to keep the scope realistic.

- **Late shipments are computed dynamically** from the promised delivery date and the current system time. A shipment is treated as late when it is still active and the current time exceeds the promised date. This is a practical operational rule, but it does not yet model nuanced exceptions such as weather delays, customs holds, re-attempts, or customer rescheduling.

- **The transport event model is intentionally minimal.** The system stores a chronological event history, but the core process is still driven by a limited lifecycle enum (`CREATED`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`). That makes the model easier to reason about, but it does not yet capture a richer operational taxonomy of reasons and exceptions.

- **The database schema already includes `actual_delivery_date`, but the live workflow still treats delivery confirmation as a simplified lifecycle event.** In a production-strength version, that field would be used as a more explicit operational record of delivery completion and as an additional input to analytics and late-shipments reporting.

- **Customer records are preloaded rather than managed through the UI.** This keeps the operational workflow focused on active shipments instead of broadening the scope into admin features.

- **The server enforces state transitions**, but the current model assumes a relatively clean and consistent chain of events. It does not yet model contradictory or out-of-sequence operational notes as first-class business rules.

---

## Deliberately Left Out (Trade-offs)

- **User Authentication & Roles:** Excluded as specified in the assignment constraints ("Login, registration... Not needed"), keeping the primary focus strictly on operational clarity and robust data management.
- **Customer Management Screens:** Customers are preloaded via database seed scripts, omitting redundant CRUD UI elements since the core operational workflow revolves entirely around tracking active cargo.
- **Rich Exception Handling:** Operational disruptions such as weather delays, customs inspections, or failed delivery attempts are represented only at a simplified level, because the assignment focuses on the operations overview rather than full shipment exception management.

---

## What Would Be Done Differently Given 2 More Days

With two more days, I would focus on tightening the domain model and the operational realism of the system rather than adding more UI chrome.

- Introduce a clearer split between lifecycle states and operational events. `ShipmentStatus` would remain the core lifecycle enum, while a separate `ShipmentEventType` would capture operational facts such as `PICKED_UP`, `ARRIVED_AT_HUB`, `DELAYED`, `CUSTOMS_HOLD`, or `FAILED_ATTEMPT`. This would make the transport history richer without bloating the main status model.

- Populate `actual_delivery_date` on every shipment that reaches `DELIVERED`, and use it as a second source of truth when evaluating delivery performance and late shipments. The current version computes lateness from the promised date only, which is a valid MVP assumption but not the full operational picture.

- Separate status transitions from event creation in the server flow. Right now, the event log is tightly coupled to status changes; the next iteration would make these actions explicit and allow operational exceptions to exist without forcing the main shipment status to change.

- Add more precise validation around timing and business rules: reject impossible backtracking, validate event timestamps, and define what happens when a recorded event contradicts the current shipment state.

- Add end-to-end regression tests around the critical flows: create shipment, advance lifecycle, record operational event, filter late shipments, and confirm the business rules hold under realistic data.

- Extend the dashboard with operational metrics beyond a simple list view, such as on-time rate, average time in transit, and a top-late-shipments panel.

This would not change the product’s core intent, but it would move the solution from a clean MVP into a more realistic warehouse operations system.
