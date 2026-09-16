import { PoolClient } from "pg";
import { query } from "../../db/db";
import { ShipmentEvent, CreateShipmentEventDto } from "./events.types";

export class ShipmentEventRepository {
  static async create(
    dto: CreateShipmentEventDto,
    client?: PoolClient,
  ): Promise<ShipmentEvent> {
    const sql = `
      INSERT INTO shipment_events (shipment_id, event_type, location, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const params = [
      dto.shipment_id,
      dto.event_type,
      dto.location || null,
      dto.description || null,
    ];

    const db = client || { query };
    const result = await db.query(sql, params);

    return result.rows[0] as ShipmentEvent;
  }

  static async findByShipmentId(
    shipmentId: number | string,
  ): Promise<ShipmentEvent[]> {
    const sql = `
      SELECT id, shipment_id, event_type, location, description, created_at
      FROM shipment_events
      WHERE shipment_id = $1
      ORDER BY created_at ASC;
    `;

    const result = await query(sql, [shipmentId]);
    return result.rows as ShipmentEvent[];
  }
}
