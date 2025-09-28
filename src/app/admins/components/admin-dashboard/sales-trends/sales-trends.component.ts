import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sales-trends',
  imports: [CommonModule],
  templateUrl: './sales-trends.component.html',
  styleUrl: './sales-trends.component.css'
})
export class SalesTrendsComponent {
  @Input() data: any
  @Input() loading: any
}
