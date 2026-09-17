import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ShipmentWithDetails,
  ShipmentStatus,
} from '../../../../core/models/shipment.model';
import { ShipmentEvent } from '../../../../core/models/event.model';
import { ShipmentService } from '../../../../core/services/shipment.service';
import {
  formatDelay,
  formatDelayDuration,
  formatStatusText,
} from '../../../../core/utils/formatters';
import { NewEventComponent } from '../../../events/components/new-event/new-event.component';

@Component({
  selector: 'app-shipment-details',
  standalone: true,
  imports: [CommonModule, NewEventComponent],
  templateUrl: './shipment-details.component.html',
  styleUrls: ['./shipment-details.component.scss'],
})
export class ShipmentDetailsComponent {
  formatStatus = formatStatusText;
  formatDelay = formatDelay;
  formatDelayDuration = formatDelayDuration;
  @Input() shipmentId!: number | string;
  @Input() shipment!: ShipmentWithDetails;
  @Output() closeDrawer = new EventEmitter<void>();

  activeTab: 'details' | 'timeline' = 'details';
  sortedEvents: ShipmentEvent[] = [];
  isLoadingEvents = false;
  isLoadingDetails = false;
  isAddEventModalOpen = false;

  constructor(private shipmentService: ShipmentService) {}

  // Kada se promeni pošiljka sa desne/leve strane, povuci sve detalje sa servera
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shipment'] && this.shipment?.id) {
      this.loadFullDetails(this.shipment.id);
    }
  }

  loadFullDetails(id: number | string): void {
    this.isLoadingDetails = true;
    this.shipmentService.getShipmentById(String(id)).subscribe({
      next: (fullData) => {
        this.shipment = fullData; // Sada imamo sve podatke (adresu, kupca, datume...)
        this.isLoadingDetails = false;
      },
      error: (err) => {
        console.error('Greška pri učitavanju detalja pošiljke:', err);
        this.isLoadingDetails = false;
      },
    });
  }

  switchTab(tab: 'details' | 'timeline'): void {
    this.activeTab = tab;

    if (tab === 'timeline' && this.sortedEvents.length === 0) {
      this.loadEvents();
    }
  }

  loadEvents(): void {
    this.isLoadingEvents = true;
    this.shipmentService.getShipmentEvents(this.shipment.id).subscribe({
      next: (response: any) => {
        const eventsList = response.data || response;
        this.sortAndSetEvents(eventsList);
        this.isLoadingEvents = false;
      },
      error: (err) => {
        console.error('Greška pri učitavanju događaja:', err);
        this.isLoadingEvents = false;
      },
    });
  }

  private sortAndSetEvents(events: ShipmentEvent[]): void {
    this.sortedEvents = [...events].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  openAddEventModal(): void {
    this.isAddEventModalOpen = true;
  }

  handleEventCreated(eventData: any) {
    console.log('Novi event:', eventData);
    this.isAddEventModalOpen = false;
    this.loadEvents();
  }

  get numericShipmentId(): number {
    if (this.shipmentId) {
      return Number(this.shipmentId);
    }
    if (this.shipment && this.shipment.id) {
      return Number(this.shipment.id);
    }
    return 0;
  }

  close(): void {
    this.closeDrawer.emit();
  }
}
