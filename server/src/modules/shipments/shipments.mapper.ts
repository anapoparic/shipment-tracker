import {
  ShipmentWithDetails,
  PaginatedResponse,
  ShipmentFilterQuery,
} from "./shipments.types";

export function mapShipmentPaginatedResult(
  rows: (ShipmentWithDetails & { total_count?: string | number })[],
  filters: ShipmentFilterQuery = {},
): PaginatedResponse<ShipmentWithDetails> {
  const page = filters.page || 1;
  const limit = filters.limit || 10;

  const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
  const data = rows.map(({ total_count, ...shipment }) => shipment);

  return {
    data,
    meta: { total, page, limit },
  };
}
