import { Component } from '@angular/core';
import { ShipmentListComponent } from './features/shipments/components/shipment-list/shipment-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ShipmentListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'client';
}
