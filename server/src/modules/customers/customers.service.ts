import { CustomerRepository } from "./customers.repo";
import { mapCustomerPaginatedResult } from "./customers.mapper";
import { PaginatedResponse } from "../../utils/types";
import { CustomerDropdownDto, ParsedCustomerFilters } from "./customers.types";

export class CustomerService {
  static async findMany(
    filters: ParsedCustomerFilters = { page: 1, limit: 5 },
  ): Promise<PaginatedResponse<CustomerDropdownDto>> {
    const rows = await CustomerRepository.findMany(filters);
    return mapCustomerPaginatedResult(rows, filters);
  }
}
