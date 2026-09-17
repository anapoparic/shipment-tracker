import { ALLOWED_TRANSITIONS, isValidTransition } from "./shipments.constants";
import {
  Shipment,
  ShipmentRow,
  ShipmentWithDetails,
  CreateShipmentDto,
  UpdateShipmentStatusDto,
  ParsedShipmentFilters,
  ShipmentStatus,
} from "./shipments.types";
import { randomBytes } from "crypto";
import { ShipmentRepository } from "./shipments.repo";
import { mapShipmentPaginatedResult } from "./shipments.mapper";
import { withTransaction } from "../../db/db";
import { PoolClient } from "pg";
import { ShipmentEventRepository } from "../events/events.repo";
import { CreateShipmentEventDto, ShipmentEvent } from "../events/events.types";
import { PaginatedResponse } from "../../utils/types";

export class ShipmentService {
  private static generateTrackingNumber(): string {
    const randomHex = randomBytes(4).toString("hex").toUpperCase();
    return `SHP-${randomHex}`;
  }

  static async findMany(
    filters: ParsedShipmentFilters = {},
  ): Promise<PaginatedResponse<ShipmentRow>> {
    const rows = await ShipmentRepository.findMany(filters);
    return mapShipmentPaginatedResult(rows, filters);
  }

  static async findById(id: number): Promise<ShipmentWithDetails> {
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

      await ShipmentEventRepository.create(
        {
          shipment_id: Number(shipment.id),
          event_type: "CREATED",
          location: dto.destination_address,
          description: "Shipment order created",
        },
        client,
      );

      return shipment;
    });
  }

  static async updateStatus(
    id: number,
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

      await ShipmentEventRepository.create(
        {
          shipment_id: id,
          event_type: dto.status,
          location: dto.location,
          description: dto.description || `Status changed to ${dto.status}`,
        },
        client,
      );

      return updatedShipment;
    });
  }

  static async getShipmentEvents(
    shipmentId: number | string,
  ): Promise<ShipmentEvent[]> {
    const exists = await ShipmentRepository.exists(shipmentId);
    if (!exists) {
      throw new Error(`Shipment with ID ${shipmentId} not found.`);
    }

    return await ShipmentEventRepository.findByShipmentId(shipmentId);
  }
  static async addEventToShipment(
    dto: CreateShipmentEventDto,
  ): Promise<ShipmentEvent> {
    const shipment = await ShipmentRepository.findById(dto.shipment_id);
    if (!shipment) {
      throw new Error("Pošiljka nije pronađena.");
    }

    if (!isValidTransition(shipment.current_status, dto.event_type)) {
      throw new Error(
        `Prelaz iz stanja ${shipment.current_status} u ${dto.event_type} nije dozvoljen.`,
      );
    }

    const event = await ShipmentEventRepository.create(dto);

    await ShipmentRepository.updateStatus(
      Number(dto.shipment_id),
      dto.event_type as ShipmentStatus,
    );

    return event;
  }

  static async getAllowedEventTypes(shipmentId: number): Promise<string[]> {
    const shipment = await ShipmentRepository.findById(shipmentId);
    if (!shipment) {
      throw new Error("Pošiljka nije pronađena");
    }

    const currentState = shipment.current_status;
    return ALLOWED_TRANSITIONS[currentState] || [];
  }
}
