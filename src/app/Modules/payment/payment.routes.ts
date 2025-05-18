import { Routes } from '@angular/router';
import { PaymentComponent } from './components/payment/payment.component';
import { PaymentListComponent } from './components/payment-list/payment-list.component';
import { ViewPaymentComponent } from './components/view-payment/view-payment.component';

export const PAYMENT_ROUTES: Routes = [
  { path: 'payment', component: PaymentComponent },
  { path: 'paymentView', component:ViewPaymentComponent  },
  { path: 'paymentList', component: PaymentListComponent },
];
