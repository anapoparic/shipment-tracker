import { z } from "zod";

export const shipmentStatusSchema = z.enum([
  "CREATED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);
export type ShipmentStatus = z.infer<typeof shipmentStatusSchema>;

export const shipmentQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 1))
    .default("1" as any),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 10))
    .default("10" as any),
  status: shipmentStatusSchema.optional(),
  customer_id: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  is_late_only: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  search: z.string().optional(),
  sort_by: z.enum(["created_at", "delay"]).optional(),
});

export type ShipmentFilterQuery = z.infer<typeof shipmentQuerySchema>;

export interface ParsedShipmentFilters {
  page?: number;
  limit?: number;
  status?: ShipmentStatus | undefined;
  customer_id?: number | undefined;
  is_late_only?: boolean | undefined;
  search?: string | undefined;
  sort_by?: "created_at" | "delay" | undefined;
}

export const createShipmentSchema = z.object({
  customer_id: z.number(),
  destination_address: z.string().min(1, "Destination address is required"),
  promised_delivery_date: z.string(), // Možeš dodati i .datetime() ako stiže ISO format
});
export type CreateShipmentDto = z.infer<typeof createShipmentSchema>;

export const updateShipmentStatusSchema = z.object({
  status: shipmentStatusSchema,
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
});
export type UpdateShipmentStatusDto = z.infer<
  typeof updateShipmentStatusSchema
>;

export interface Shipment {
  id: string;
  tracking_number: string;
  customer_id: number;
  destination_address: string;
  current_status: ShipmentStatus;
  promised_delivery_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ShipmentRow {
  id: string;
  tracking_number: string;
  customer_name: string;
  current_status: ShipmentStatus;
  promised_delivery_date: Date;
  is_late: boolean;
  delay_in_hours: number;
}

export interface ShipmentWithDetails extends Shipment {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  is_late?: boolean;
  delay_in_hours?: number;
}
