import { isValidTransition } from "./shipments.constants";
import {
  Shipment,
  ShipmentWithDetails,
  CreateShipmentDto,
  UpdateShipmentStatusDto,
  ShipmentFilterQuery,
  PaginatedResponse,
} from "./shipments.types";
import { randomBytes } from "crypto";
import { ShipmentRepository } from "./shipments.repo";
import { mapShipmentPaginatedResult } from "./shipments.mapper";
import { withTransaction } from "../../db/db";
import { PoolClient } from "pg";

export class ShipmentService {
  private static generateTrackingNumber(): string {
    const randomHex = randomBytes(4).toString("hex").toUpperCase();
    return `SHP-${randomHex}`;
  }

  static async findMany(
    filters: ShipmentFilterQuery = {},
  ): Promise<PaginatedResponse<ShipmentWithDetails>> {
    const rows = await ShipmentRepository.findMany(filters);
    return mapShipmentPaginatedResult(rows, filters);
  }

  static async findById(id: number | string): Promise<ShipmentWithDetails> {
    const shipment = await ShipmentRepository.findById(id);
    if (!shipment) {
      throw new Error(`Shipment with ID ${id} not found.`);
    }
    return shipment;
  }

  static async createShipment(dto: CreateShipmentDto): Promise<Shipment> {
    const trackingNumber = this.generateTrackingNumber();

    return await withTransaction(async (client: PoolClient) => {
      const shipment = await ShipmentRepository.create(
        trackingNumber,
        dto,
        client,
      );

      //   await ShipmentEventRepository.create(
      //     {
      //       shipment_id: shipment.id,
      //       event_type: "CREATED",
      //       location: dto.destination_address,
      //       description: "Shipment order created",
      //     },
      //     client,
      //   );

      return shipment;
    });
  }

  static async updateStatus(
    id: number | string,
    dto: UpdateShipmentStatusDto,
  ): Promise<Shipment> {
    const shipment = await ShipmentRepository.findById(id);
    if (!shipment) {
      throw new Error(`Shipment with ID ${id} not found.`);
    }

    if (!isValidTransition(shipment.current_status, dto.status)) {
      throw new Error(
        `Invalid status transition from ${shipment.current_status} to ${dto.status}`,
      );
    }

    return await withTransaction(async (client) => {
      const updatedShipment = await ShipmentRepository.updateStatus(
        id,
        dto.status,
        client,
      );
      if (!updatedShipment) {
        throw new Error(`Failed to update shipment status.`);
      }

      //   await ShipmentEventRepository.create(
      //     {
      //       shipment_id: Number(id),
      //       event_type: dto.status,
      //       location: dto.location,
      //       description: dto.description || `Status changed to ${dto.status}`,
      //     },
      //     client
      //   );

      return updatedShipment;
    });
  }
}
