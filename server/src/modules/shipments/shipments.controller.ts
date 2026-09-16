import { Request, Response } from "express";
import { ShipmentService } from "./shipments.service";
import {
  ShipmentFilterQuery,
  CreateShipmentDto,
  UpdateShipmentStatusDto,
  ShipmentStatus,
} from "./shipments.types";

export class ShipmentController {
  static async findMany(req: Request, res: Response): Promise<void> {
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
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id || typeof id !== "string") {
        res.status(400).json({ error: "Invalid or missing shipment ID" });
        return;
      }
      const shipment = await ShipmentService.findById(id);
      res.status(200).json(shipment);
    } catch (error: any) {
      res.status(404).json({ error: error.message || "Shipment not found" });
    }
  }

  static async createShipment(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateShipmentDto = req.body;
      const shipment = await ShipmentService.createShipment(dto);
      res.status(201).json(shipment);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid request data" });
    }
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || typeof id !== "string") {
        res.status(400).json({ error: "Invalid or missing shipment ID" });
        return;
      }
      const dto: UpdateShipmentStatusDto = req.body;
      const updated = await ShipmentService.updateStatus(id, dto);
      res.status(200).json(updated);
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message || "Failed to update status" });
    }
  }
}
