import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ShipmentWithDetails,
  ShipmentFilterQuery,
  CreateShipmentDto,
  UpdateShipmentStatusDto,
} from '../models/shipment.model';
import { CreateShipmentEventDto, ShipmentEvent } from '../models/event.model';
import { PaginatedResponse } from '../models/utils.model';

@Injectable({
  providedIn: 'root',
})
export class ShipmentService {
  private apiUrl = 'http://localhost:3000/api/shipments';

  constructor(private http: HttpClient) {}

  getShipments(
    query?: ShipmentFilterQuery,
  ): Observable<PaginatedResponse<ShipmentWithDetails>> {
    let params = new HttpParams();

    if (query) {
      if (query.status) params = params.set('status', query.status);
      if (query.customer_id)
        params = params.set('customerId', query.customer_id.toString());
      if (query.is_late_only)
        params = params.set('is_late_only', query.is_late_only.toString());
      if (query.search) params = params.set('search', query.search);
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
    }

    return this.http.get<PaginatedResponse<ShipmentWithDetails>>(this.apiUrl, {
      params,
    });
  }

  getShipmentById(id: string): Observable<ShipmentWithDetails> {
    return this.http.get<ShipmentWithDetails>(`${this.apiUrl}/${id}`);
  }

  createShipment(dto: CreateShipmentDto): Observable<ShipmentWithDetails> {
    return this.http.post<ShipmentWithDetails>(this.apiUrl, dto);
  }

  updateShipmentStatus(
    id: string,
    dto: UpdateShipmentStatusDto,
  ): Observable<ShipmentWithDetails> {
    return this.http.patch<ShipmentWithDetails>(
      `${this.apiUrl}/${id}/status`,
      dto,
    );
  }

  getShipmentEvents(
    id: string,
  ): Observable<{ success: boolean; data: ShipmentEvent[] }> {
    return this.http.get<{ success: boolean; data: ShipmentEvent[] }>(
      `${this.apiUrl}/${id}/events`,
    );
  }

  getAllowedEvents(
    id: number | string,
  ): Observable<{ success: boolean; data: string[] }> {
    return this.http.get<{ success: boolean; data: string[] }>(
      `${this.apiUrl}/${id}/allowed-events`,
    );
  }

  createShipmentEvent(
    id: number | string,
    dto: CreateShipmentEventDto,
  ): Observable<ShipmentEvent> {
    return this.http.post<ShipmentEvent>(`${this.apiUrl}/${id}/events`, dto);
  }
}
