import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Routes } from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { GstInvoiceComponent } from '../gst-invoice/gst-invoice.component';
import { InvoiceViewComponent } from '../invoice-view/invoice-view.component';
import { InvoiceDetailCardComponent } from '../invoice-detailsview/invoice-detailsview.component';
import { InvoicePrintComponent } from '../invoice-print/invoice-print.component';
import { Select } from 'primeng/select';
@Component({
  selector: 'app-invoice-layout',
  imports: [CommonModule, RouterModule,Select, SelectButtonModule, FormsModule],
  templateUrl: './invoice-layout.component.html',
  styleUrl: './invoice-layout.component.css'
})

export class InvoiceLayoutComponent {
  activeComponent: any = InvoiceViewComponent;
  componentNavItems: any[] = [
    { label: 'Create Bill', component: GstInvoiceComponent },
    { label: 'Detailed Bill View', component: InvoiceDetailCardComponent },
    { label: 'All Bill Details', component: InvoiceViewComponent },
    { label: 'Print Bill Details', component: InvoicePrintComponent },
    // { label: 'customerDetails', component: CustomerdetailsComponent }
  ];

  navigateToComponent(component: any) {
    this.activeComponent = component;
  }
}



