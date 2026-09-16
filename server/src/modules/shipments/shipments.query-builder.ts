import { ShipmentFilterQuery } from "./shipments.types";

export function buildShipmentQuery(filters: ShipmentFilterQuery = {}) {
  const {
    status,
    customer_id,
    search,
    is_late_only,
    sort_by = "created_at",
    page = 1,
    limit = 10,
  } = filters;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];

  const addCondition = (sqlSnippet: string, val?: unknown) => {
    if (val !== undefined && val !== null) {
      params.push(val);
      conditions.push(sqlSnippet.replace("$?", `$${params.length}`));
    }
  };

  addCondition("s.current_status = $?", status);
  addCondition("s.customer_id = $?", customer_id);

  if (search) {
    params.push(`%${search}%`);
    const idx = params.length;
    conditions.push(
      `(s.tracking_number ILIKE $${idx} OR c.name ILIKE $${idx})`,
    );
  }

  if (is_late_only) {
    conditions.push(
      `s.current_status NOT IN ('DELIVERED', 'CANCELLED') AND NOW() > s.promised_delivery_date`,
    );
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";
  const orderBy =
    sort_by === "delay"
      ? `delay_in_hours DESC NULLS LAST`
      : `s.created_at DESC`;

  params.push(limit, offset);
  const limitIdx = params.length - 1;
  const offsetIdx = params.length;

  const sql = `
    SELECT 
      s.id, s.tracking_number, s.customer_id, s.destination_address, s.current_status, s.promised_delivery_date, s.created_at, s.updated_at,
      c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
      (s.current_status NOT IN ('DELIVERED', 'CANCELLED') AND NOW() > s.promised_delivery_date) AS is_late,
      CASE 
        WHEN NOW() > s.promised_delivery_date THEN ROUND(EXTRACT(EPOCH FROM (NOW() - s.promised_delivery_date)) / 3600)
        ELSE 0 
      END AS delay_in_hours,
      COUNT(*) OVER() AS total_count
    FROM shipments s
    JOIN customers c ON s.customer_id = c.id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT $${limitIdx} OFFSET $${offsetIdx};
  `;

  return { sql, params };
}
