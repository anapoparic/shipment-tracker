import { Request, Response, NextFunction } from "express";
import { ShipmentService } from "./shipments.service";
import {
  shipmentQuerySchema,
  createShipmentSchema,
  updateShipmentStatusSchema,
  ParsedShipmentFilters,
} from "./shipments.types";
import { AppError } from "../../utils/error";
import { CreateShipmentEventDto } from "../events/events.types";

export class ShipmentController {
  static async findMany(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const filters: ParsedShipmentFilters = shipmentQuerySchema.parse(
        req.query,
      );

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
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) {
        throw new AppError("Invalid or missing shipment ID", 400);
      }
      const shipment = await ShipmentService.findById(Number(id));
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
      const dto = createShipmentSchema.parse(req.body);

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
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) {
        throw new AppError("Invalid or missing shipment ID", 400);
      }

      const dto = updateShipmentStatusSchema.parse(req.body);

      const updated = await ShipmentService.updateStatus(Number(id), dto);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) {
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

  static async addEvent(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const shipmentId = Number(req.params.id);
      console.log("PRIMLJEN REQ.BODY:", req.body);
      const dto: CreateShipmentEventDto = {
        shipment_id: shipmentId,
        event_type: req.body.event_type,
        location: req.body.location,
        description: req.body.description,
        timestamp: req.body.timestamp
          ? new Date(req.body.timestamp)
          : new Date(),
      };

      const newEvent = await ShipmentService.addEventToShipment(dto);
      res.status(201).json(newEvent);
    } catch (error) {
      next(error);
    }
  }

  static async getAllowedEvents(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id) {
        throw new AppError("Invalid or missing shipment ID", 400);
      }

      const allowedTypes = await ShipmentService.getAllowedEventTypes(
        Number(id),
      );
      res.status(200).json({
        success: true,
        data: allowedTypes,
      });
    } catch (error) {
      next(error);
    }
  }
}
