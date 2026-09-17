// src/features/customers/customers.repository.ts
import { query } from "../../db/db";
import { CustomerDropdownDto, ParsedCustomerFilters } from "./customers.types";

export class CustomerRepository {
  static async findMany(
    filters: ParsedCustomerFilters = { page: 1, limit: 5 },
  ): Promise<(CustomerDropdownDto & { total_count?: string | number })[]> {
    const { search, page, limit } = filters;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`name ILIKE $${params.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    params.push(limit, offset);
    const limitIdx = params.length - 1;
    const offsetIdx = params.length;

    const sql = `
      SELECT 
        id, 
        name,
        COUNT(*) OVER() AS total_count
      FROM customers
      ${whereClause}
      ORDER BY name ASC
      LIMIT $${limitIdx} OFFSET $${offsetIdx};
    `;

    const result = await query(sql, params);
    return result.rows as (CustomerDropdownDto & {
      total_count?: string | number;
    })[];
  }
}
