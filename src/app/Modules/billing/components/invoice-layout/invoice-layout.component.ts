// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-invoice-layout',
//   imports: [],
//   templateUrl: './invoice-layout.component.html',
//   styleUrl: './invoice-layout.component.css'
// })
// export class InvoiceLayoutComponent {

// }

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Routes } from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { GstInvoiceComponent } from '../gst-invoice/gst-invoice.component';
import { InvoiceViewComponent } from '../invoice-view/invoice-view.component';
@Component({
  selector: 'app-invoice-layout',
  imports: [CommonModule, RouterModule, SelectButtonModule, FormsModule],
  templateUrl: './invoice-layout.component.html',
  styleUrl: './invoice-layout.component.css'
})

export class InvoiceLayoutComponent {

  activeComponent: any = InvoiceViewComponent;
  componentNavItems: any[] = [
    { label: 'get all Invoice', component: InvoiceViewComponent },
    { label: 'Create Invoice', component: GstInvoiceComponent },
    // { label: 'customerDetails', component: CustomerdetailsComponent }
  ];

  navigateToComponent(component: any) {
    this.activeComponent = component;
  }
}



