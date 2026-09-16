export type ShipmentStatus =
  | "CREATED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

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

export interface ShipmentWithDetails extends Shipment {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  is_late?: boolean;
  delay_in_hours?: number;
}

export interface CreateShipmentDto {
  customer_id: number;
  destination_address: string;
  promised_delivery_date: string;
}

export interface UpdateShipmentStatusDto {
  status: ShipmentStatus;
  location?: string;
  description?: string;
}

export interface ShipmentFilterQuery {
  status?: ShipmentStatus;
  customer_id?: number;
  search?: string;
  is_late_only?: boolean;
  page?: number;
  limit?: number;
  sort_by?: "created_at" | "delay";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
