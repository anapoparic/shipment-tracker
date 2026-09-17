// src/features/customers/customers.mapper.ts
import { PaginatedResponse } from "../../utils/types";
import { CustomerDropdownDto, ParsedCustomerFilters } from "./customers.types";

export function mapCustomerPaginatedResult(
  rows: (CustomerDropdownDto & { total_count?: string | number })[],
  filters: ParsedCustomerFilters,
): PaginatedResponse<CustomerDropdownDto> {
  const page = filters.page;
  const limit = filters.limit;

  const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;

  const data: CustomerDropdownDto[] = rows.map(
    ({ total_count, ...customer }) => customer,
  );

  return {
    data,
    meta: {
      total,
      page,
      limit,
    },
  };
}
