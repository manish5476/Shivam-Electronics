import { Routes } from '@angular/router';
import { InvoiceViewComponent } from './components/invoice-view/invoice-view.component';
import { GstInvoiceComponent } from './components/gst-invoice/gst-invoice.component';
import { InvoiceDetailCardComponent } from './components/invoice-detailsview/invoice-detailsview.component';
import { InvoiceLayoutComponent } from './components/invoice-layout/invoice-layout.component';

export const BILLING_ROUTES: Routes = [
  { path: '', component: InvoiceLayoutComponent },
  { path: 'view', component: InvoiceViewComponent },
  { path: 'create', component: GstInvoiceComponent },
  { path: 'details', component: InvoiceDetailCardComponent },
];
