import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metric-card',
  imports: [CommonModule],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.scss',
})
export class MetricCardComponent {
  @Input() title: string = '';
  @Input() value: number | string = 0;
  @Input() icon?: string;
  @Input() themeClass: 'default' | 'danger' | 'success' = 'default';
}
