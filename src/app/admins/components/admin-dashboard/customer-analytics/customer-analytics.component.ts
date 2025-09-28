import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-customer-analytics',
  imports: [],
  templateUrl: './customer-analytics.component.html',
  styleUrl: './customer-analytics.component.css'
})
export class CustomerAnalyticsComponent {
  @Input() data: any
  @Input() loading: any
}
