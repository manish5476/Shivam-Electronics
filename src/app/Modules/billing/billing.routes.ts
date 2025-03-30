import { Routes } from '@angular/router';
import { InvoiceViewComponent } from './components/invoice-view/invoice-view.component';
import { GstInvoiceComponent } from './components/gst-invoice/gst-invoice.component';
import { InvoiceDetailCardComponent } from './components/invoice-detailsview/invoice-detailsview.component';

export const BILLING_ROUTES: Routes = [
  { path: 'view', component: InvoiceViewComponent },
  { path: 'create', component: GstInvoiceComponent },
  { path: 'details', component: InvoiceDetailCardComponent },
];
