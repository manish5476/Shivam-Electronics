import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-paymentanalytics',
  imports: [CommonModule],
  templateUrl: './paymentanalytics.component.html',
  styleUrl: './paymentanalytics.component.css'
})
export class PaymentanalyticsComponent {
  @Input() data: any


// inside PaymentanalyticsComponent
computeMethodShare(method: any): number {
  const total = this.data?.financialHealth?.totalCollected || this.data?.paymentMethods?.reduce((s: number, m: any) => s + (m.totalAmount || 0), 0) || 1;
  // avoid division by zero
  const ratio = (method.totalAmount || 0) / total;
  // clamp between 6% and 100% so tiny values still show
  return Math.max(6, Math.min(100, Math.round(ratio * 100)));
}
}

