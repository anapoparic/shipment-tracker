import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ShipmentService } from '../../../../core/services/shipment.service';
import { formatStatusText } from '../../../../core/utils/formatters';

@Component({
  selector: 'app-new-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './new-event.component.html',
  styleUrls: ['./new-event.component.scss'],
})
export class NewEventComponent {
  formatStatusText = formatStatusText;
  @Input() shipmentId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() eventCreated = new EventEmitter<any>();

  eventForm: FormGroup;

  eventTypes: string[] = [];

  constructor(
    private fb: FormBuilder,
    private shipmentService: ShipmentService,
  ) {
    this.eventForm = this.fb.group({
      event_type: ['', Validators.required],
      location: ['', Validators.required],
      timestamp: ['', Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    if (this.shipmentId) {
      this.shipmentService.getAllowedEvents(this.shipmentId).subscribe({
        next: (response) => {
          this.eventTypes = response.data;
        },
        error: (err) => {
          console.error('Greška pri dohvatanju dozvoljenih stanja:', err);
        },
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.eventForm.valid && this.shipmentId) {
      const payload = {
        ...this.eventForm.value,
        timestamp: this.eventForm.value.timestamp
          ? new Date(this.eventForm.value.timestamp).toISOString()
          : new Date().toISOString(),
      };
      this.shipmentService
        .createShipmentEvent(this.shipmentId, payload)
        .subscribe({
          next: (newEvent) => {
            this.eventCreated.emit(newEvent);
            this.onClose();
          },
          error: (err) => {
            console.error('Greška pri kreiranju događaja:', err);
          },
        });
    }
  }
}
