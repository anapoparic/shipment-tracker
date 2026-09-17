export type ShipmentStatus =
  | 'CREATED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Shipment {
  id: string;
  tracking_number: string;
  customer_id: number;
  destination_address: string;
  current_status: ShipmentStatus;
  promised_delivery_date: string;
  created_at: string;
  updated_at: string;
}

export interface ShipmentRow {
  id: string;
  tracking_number: string;
  customer_name: string;
  current_status: ShipmentStatus;
  promised_delivery_date: string;
  is_late: boolean;
  delay_in_hours?: number;
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
  location: string;
  description?: string;
}

export interface ShipmentFilterQuery {
  status?: ShipmentStatus;
  customer_id?: number;
  search?: string;
  is_late_only?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'delay';
}

export interface PaginatedShipmentsResponse {
  data: ShipmentRow[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
