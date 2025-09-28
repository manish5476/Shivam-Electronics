import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Example import

@Component({
  selector: 'app-product-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-analytics.component.html',
  styleUrls: ['./product-analytics.component.css']
})
export class ProductAnalyticsComponent {
  @Input() data: any[] | null = null;
  @Input() loading: boolean = false;
}
