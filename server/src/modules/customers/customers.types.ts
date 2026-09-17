// src/features/customers/customers.types.ts
import { z } from "zod";

export interface CustomerDropdownDto {
  id: number;
  name: string;
}

export const customerQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(5),
});

export type ParsedCustomerFilters = z.infer<typeof customerQuerySchema>;
