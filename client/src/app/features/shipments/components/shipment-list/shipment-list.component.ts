import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetricCardComponent } from '../../../../shared/components/metric-card/metric-card.component';
import { ShipmentWithDetails } from '../../../../core/models/shipment.model';
import { ShipmentService } from '../../../../core/services/shipment.service';
import { ShipmentDetailsComponent } from '../shipment-details/shipment-details.component';
import {
  formatDelay,
  formatStatusText,
} from '../../../../core/utils/formatters';
import { NewShipmentComponent } from '../new-shipment/new-shipment.component';

@Component({
  selector: 'app-shipment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MetricCardComponent,
    ShipmentDetailsComponent,
    NewShipmentComponent,
  ],
  templateUrl: './shipment-list.component.html',
  styleUrls: ['./shipment-list.component.scss'],
})
export class ShipmentListComponent implements OnInit {
  formatStatus = formatStatusText;
  formatDelay = formatDelay;
  searchTerm: string = '';
  selectedFilter: string = 'all';

  shipments: ShipmentWithDetails[] = [];

  currentPage: number = 1;
  pageSize: number = 5;
  totalItems: number = 0;
  totalPages: number = 1;

  // Metrics
  activeShipmentsCount: number = 0;
  lateCount: number = 0;
  deliveredTodayCount: number = 0;
  selectedShipment: ShipmentWithDetails | null = null;
  isNewShipmentModalOpen = false;

  constructor(private shipmentService: ShipmentService) {}

  ngOnInit(): void {
    this.loadShipments();
  }

  loadShipments(): void {
    const query: any = {
      page: this.currentPage,
      limit: this.pageSize,
    };

    if (this.searchTerm) {
      query.search = this.searchTerm;
    }

    if (this.selectedFilter === 'late') {
      query.is_late_only = true;
    } else if (this.selectedFilter !== 'all') {
      query.status = this.selectedFilter;
    }

    this.shipmentService.getShipments(query).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.shipments = response;
          this.totalItems = response.length;
          this.totalPages = 1;
        } else {
          this.shipments = response.data || [];
          this.totalItems = response.meta?.total || this.shipments.length;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
        }
        this.updateMetrics(this.shipments);
      },
      error: (err) => {
        console.error('Greška prilikom dohvatanja pošiljaka sa servera:', err);
      },
    });
  }

  updateMetrics(data: ShipmentWithDetails[]): void {
    this.activeShipmentsCount = data.filter(
      (s) =>
        s.current_status !== 'DELIVERED' && s.current_status !== 'CANCELLED',
    ).length;

    this.lateCount = data.filter((s) => s.is_late).length;

    const today = new Date().toISOString().split('T')[0];

    this.deliveredTodayCount = data.filter((s) => {
      if (s.current_status !== 'DELIVERED' || !s.updated_at) return false;
      const shipmentDate = new Date(s.updated_at).toISOString().split('T')[0];
      return shipmentDate === today;
    }).length;
  }

  handleShipmentCreated(formData: any) {
    this.isNewShipmentModalOpen = false;
    this.currentPage = 1;
    this.loadShipments();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadShipments();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadShipments();
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.loadShipments();
    }
  }

  openDetails(shipment: ShipmentWithDetails): void {
    this.selectedShipment = shipment;
  }

  closeDetails(): void {
    this.selectedShipment = null;
  }
}
