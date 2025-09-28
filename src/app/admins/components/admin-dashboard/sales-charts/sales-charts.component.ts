import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sales-charts',
  imports: [CommonModule],
  templateUrl: './sales-charts.component.html',
  styleUrl: './sales-charts.component.css'
})
export class SalesChartsComponent {
  @Input() data: any
  @Input() loading: any
}
