import { PoolClient } from "pg";
import { query, withTransaction } from "../../db/db";
import {
  CreateShipmentDto,
  Shipment,
  ParsedShipmentFilters,
  ShipmentStatus,
  ShipmentRow,
  ShipmentWithDetails,
} from "./shipments.types";
import { buildShipmentQuery } from "./shipments.query-builder";

export class ShipmentRepository {
  static async findMany(
    filters: ParsedShipmentFilters = {},
  ): Promise<ShipmentRow[]> {
    const { sql, params } = buildShipmentQuery(filters);

    const result = await query(sql, params);
    return result.rows as ShipmentRow[];
  }

  static async findById(id: number): Promise<ShipmentWithDetails | null> {
    const sql = `
      SELECT 
        s.id, s.tracking_number, s.customer_id, s.destination_address, s.current_status, s.promised_delivery_date, s.created_at, s.updated_at,
        c.name AS customer_name, c.email AS customer_email, c.phone_number AS customer_phone,
        (s.current_status NOT IN ('DELIVERED', 'CANCELLED') AND NOW() > s.promised_delivery_date) AS is_late,
        CASE 
          WHEN NOW() > s.promised_delivery_date THEN FLOOR(EXTRACT(EPOCH FROM (NOW() - s.promised_delivery_date)) / 60)
          ELSE 0 
        END AS delay_in_hours
      FROM shipments s
      JOIN customers c ON s.customer_id = c.id
      WHERE s.id = $1;
    `;

    const result = await query(sql, [id]);
    return result.rows.length > 0
      ? (result.rows[0] as ShipmentWithDetails)
      : null;
  }

  static async create(
    trackingNumber: string,
    dto: CreateShipmentDto,
    client?: PoolClient,
  ): Promise<Shipment> {
    const sql = `
      INSERT INTO shipments (tracking_number, customer_id, destination_address, current_status, promised_delivery_date)
      VALUES ($1, $2, $3, 'CREATED', $4)
      RETURNING *;
    `;

    const params = [
      trackingNumber,
      dto.customer_id,
      dto.destination_address,
      dto.promised_delivery_date,
    ];

    // Ako nam je prosleđen client iz transakcije, koristimo njega, inače standardni pool query
    const db = client || { query };
    const result = await db.query(sql, params);

    return result.rows[0] as Shipment;
  }

  static async updateStatus(
    id: number | string,
    status: ShipmentStatus,
    client?: PoolClient,
  ): Promise<Shipment | null> {
    const sql = `
      UPDATE shipments 
      SET current_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;

    const db = client || { query };
    const result = await db.query(sql, [status, id]);

    return result.rows.length > 0 ? (result.rows[0] as Shipment) : null;
  }

  static async exists(id: number | string): Promise<boolean> {
    const sql = `SELECT 1 FROM shipments WHERE id = $1 LIMIT 1;`;
    const result = await query(sql, [id]);
    return result.rows.length > 0;
  }
}
