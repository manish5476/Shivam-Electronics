import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-payment-analytics',
  imports: [],
  templateUrl: './payment-analytics.component.html',
  styleUrl: './payment-analytics.component.css'
})
export class PaymentAnalyticsComponent {
  @Input() data: any
  @Input() loading: any
}
