export interface ShipmentEvent {
  id: string;
  shipment_id: string;
  location: string;
  description: string;
  event_type: string;
  timestamp: string;
  created_at: string;
}

export interface CreateShipmentEventDto {
  shipment_id?: number | string;
  event_type: string;
  location: string;
  description?: string;
  timestamp?: Date | string;
}
