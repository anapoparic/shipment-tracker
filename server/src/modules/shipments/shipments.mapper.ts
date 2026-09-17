import { ShipmentRow, ParsedShipmentFilters } from "./shipments.types";
import { PaginatedResponse } from "../../utils/types";

export function mapShipmentPaginatedResult(
  rows: (ShipmentRow & { total_count?: string | number })[],
  filters: ParsedShipmentFilters = {},
): PaginatedResponse<ShipmentRow> {
  const page = filters.page || 1;
  const limit = filters.limit || 10;

  const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
  const data = rows.map(({ total_count, ...shipment }) => shipment);

  return {
    data,
    meta: { total, page, limit },
  };
}
