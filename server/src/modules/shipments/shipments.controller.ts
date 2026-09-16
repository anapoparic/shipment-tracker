import { Request, Response, NextFunction } from "express";
import { ShipmentService } from "./shipments.service";
import {
  ShipmentFilterQuery,
  CreateShipmentDto,
  UpdateShipmentStatusDto,
  ShipmentStatus,
} from "./shipments.types";
import { AppError } from "../../utils/error";

export class ShipmentController {
  static async findMany(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const filters: ShipmentFilterQuery = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };

      if (req.query.status) {
        filters.status = req.query.status as ShipmentStatus;
      }

      if (req.query.customerId) {
        filters.customer_id = Number(req.query.customerId);
      }

      if (req.query.search) {
        filters.search = req.query.search as string;
      }

      const result = await ShipmentService.findMany(filters);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async findById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = req.params.id;
      if (!id || typeof id !== "string") {
        throw new AppError("Invalid or missing shipment ID", 400);
      }
      const shipment = await ShipmentService.findById(id);
      res.status(200).json(shipment);
    } catch (error) {
      next(error);
    }
  }

  static async createShipment(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto: CreateShipmentDto = req.body;
      const shipment = await ShipmentService.createShipment(dto);
      res.status(201).json(shipment);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || typeof id !== "string") {
        throw new AppError("Invalid or missing shipment ID", 400);
      }
      const dto: UpdateShipmentStatusDto = req.body;
      const updated = await ShipmentService.updateStatus(id, dto);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id || typeof id !== "string") {
        throw new AppError("Invalid or missing shipment ID", 400);
      }
      const events = await ShipmentService.getShipmentEvents(id);
      return res.status(200).json({
        success: true,
        data: events,
      });
    } catch (error) {
      next(error);
    }
  }
}
