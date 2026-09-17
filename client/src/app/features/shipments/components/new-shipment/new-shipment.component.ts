import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { CustomerDropdownDto } from '../../../../core/models/customer.model';
import { Subject } from 'rxjs/internal/Subject';
import { CustomerService } from '../../../../core/services/customers.service';
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs';
import { ShipmentService } from '../../../../core/services/shipment.service';

@Component({
  selector: 'app-new-shipment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './new-shipment.component.html',
  styleUrls: ['./new-shipment.component.scss'],
})
export class NewShipmentComponent {
  @Output() close = new EventEmitter<void>();
  @Output() shipmentCreated = new EventEmitter<any>();

  shipmentForm: FormGroup;
  searchControl = new FormControl('');

  customers: CustomerDropdownDto[] = [];
  isDropdownOpen = false;
  private destroy$ = new Subject<void>();

  statuses = ['Created'];

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private shipmentService: ShipmentService,
    private elementRef: ElementRef,
  ) {
    this.shipmentForm = this.fb.group({
      customer_id: ['', Validators.required],
      destination_address: ['', Validators.required],
      current_status: ['Created', Validators.required],
      promised_delivery_date: ['', Validators.required],
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm) =>
          this.customerService.getCustomers(searchTerm || undefined),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response) => {
          this.customers = response.data;
        },
        error: (err) => console.error('Greška pri dohvatanju klijenata:', err),
      });
  }

  selectCustomer(customer: CustomerDropdownDto): void {
    this.shipmentForm.patchValue({ customer_id: customer.id });
    this.searchControl.setValue(customer.name, { emitEvent: false });
    this.isDropdownOpen = false;
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.shipmentForm.valid) {
      const formValue = this.shipmentForm.value;

      const payload = {
        ...formValue,
        promised_delivery_date: new Date(
          formValue.promised_delivery_date,
        ).toISOString(),
      };

      this.shipmentService.createShipment(payload).subscribe({
        next: (createdShipment) => {
          this.shipmentCreated.emit(createdShipment);
          this.onClose();
        },
        error: (err) => {
          console.error('Greška pri kreiranju pošiljke:', err);
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
