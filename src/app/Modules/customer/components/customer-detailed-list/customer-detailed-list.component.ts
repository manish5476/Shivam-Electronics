
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Rating } from 'primeng/rating';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { FieldsetModule } from 'primeng/fieldset';

import { TableRowCollapseEvent, TableRowExpandEvent } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { AccordionModule } from 'primeng/accordion';
import { InvoicePrintComponent } from "../../../billing/components/invoice-print/invoice-print.component";
import { PanelModule } from 'primeng/panel';
import { AvatarModule } from 'primeng/avatar';
import { CustomerService } from '../../../../core/services/customer.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
// import { Tooltip } from 'primeng/tooltip';
@Component({
  selector: 'app-customer-detailed-list',
  imports: [TableModule, TabViewModule, CheckboxModule, FieldsetModule, AvatarModule, AccordionModule, SelectModule, PanelModule, DialogModule, FormsModule, Tag, ToastModule, CardModule, ButtonModule, CommonModule],
  templateUrl: './customer-detailed-list.component.html',
  styleUrl: './customer-detailed-list.component.css'
})
export class CustomerDetailedListComponent {
  isLoading: boolean = true; // Add a loading flag
  customer: any;
  activeTab: 'phone' | 'address' = 'phone'; // Default to 'phone' tab

  customerItems: any[] = [];
  paymentHistory: any[] = [];
  customerId: string = '';
  expandedRows = {};
  isDarkMode: boolean = false;
  display: boolean = false
  customerIDDropdown: any;
  messageService: any;
  Id: any;
  dynamicComponent: any;


  constructor(private CustomerService: CustomerService,
    private autoPopulate: AutopopulateService,
    private cdr: ChangeDetectorRef,
    private loadingService: LoadingService) { }


  ngOnInit(): void {
    // this.getCustomerDetail();
    this.autopopulatedata();
  }

  getInvoice(id: any) {
    this.display = !this.display
    this.Id = id
  }

  expandedItems: { [key: string]: boolean } = {};

  toggleInvoiceAccordion(itemId: string) {
    this.expandedItems[itemId] = !this.expandedItems[itemId];
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }
  expandAll() {
    this.expandedRows = this.customer.reduce((acc: any, p: any) => (acc[p.id] = true) && acc, {});
  }

  collapseAll() {
    this.expandedRows = {};
  }

  openInvoiceDialog(invoiceId: any) {
    this.Id = invoiceId; // Set the Id to the invoice ID
    this.dynamicComponent = InvoicePrintComponent; // Set the dynamic component to InvoicePrintComponent
    this.display = true; // Open the dialog
  }

  getSeverity(status: string) {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warn';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return 'success';
    }
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'PENDING':
        return 'warn';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'danger';
        break
    }
  }

  autopopulatedata() {
    // this.autoPopulate.getModuleData('products').subscribe((data:any) => {
    //   this.productdrop = data;
    // });
    // this.autoPopulate.getModuleData('sellers').subscribe((data:any) => {
    //   this.sellersDrop = data;
    // });
    this.autoPopulate.getModuleData('customers').subscribe((data: any) => {
      this.customerIDDropdown = data;
    });
  }

  getCustomerDetail(): void {
    this.loadingService.show(); // Hide the loader on success

    this.CustomerService.getCustomerDataWithId(this.customerId).subscribe((res: any) => {
      this.customer = res.data;
      this.customerItems = this.customer.cart?.items || [];
      this.paymentHistory = this.customer.paymentHistory || [];
      this.cdr.markForCheck();
      this.loadingService.hide(); // Hide the loader on success
    }, (error) => {
      console.error('Error fetching customer data:', error);
      this.isLoading = false; // Set loading to false on error
    });
  }

  // getCustomerDetail(): void {
  //   this.CustomerService.getCustomerDataWithId(this.customerId).subscribe((res: any) => {
  //     this.customer = res.data;
  //     this.customerItems = this.customer.cart?.items || [];
  //     this.paymentHistory = this.customer.paymentHistory || [];
  //     this.cdr.markForCheck(); // Trigger change detection to update the view
  //   },
  //     (error) => {
  //       console.error('Error fetching customer data:', error);
  //     })
  // }
}