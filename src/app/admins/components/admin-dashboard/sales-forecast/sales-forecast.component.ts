import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sales-forecast',
  imports: [CommonModule],
  templateUrl: './sales-forecast.component.html',
  styleUrl: './sales-forecast.component.css'
})
export class SalesForecastComponent {
  @Input() data: any
  @Input() loading: any
}
