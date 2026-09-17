import { Request, Response, NextFunction } from "express";
import { CustomerService } from "./customers.service";
import { customerQuerySchema, ParsedCustomerFilters } from "./customers.types";

export class CustomerController {
  static async findMany(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const filters: ParsedCustomerFilters = customerQuerySchema.parse(
        req.query,
      );
      const result = await CustomerService.findMany(filters);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
