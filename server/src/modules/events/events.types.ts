export interface ShipmentEvent {
  id: number;
  shipment_id: number;
  event_type: string;
  location?: string;
  description?: string;
  timestamp: Date;
  created_at: Date;
}

export interface CreateShipmentEventDto {
  shipment_id: number;
  event_type: string;
  location: string;
  description?: string;
  timestamp?: Date;
}
