
import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import {
  DashboardService,
  ConsolidatedSummaryData,
  SalesTrendData,
  ProductInsightData,
  CustomerInsightData,
  ReviewData,
  PaymentMethodData,
  InventoryValueData,
  ApiResponse // Import ApiResponse
} from '../../../../core/services/dashboard.service'; // Adjust path as needed
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { CarouselModule } from 'primeng/carousel';
import { TableModule, TableRowCollapseEvent, TableRowExpandEvent, } from 'primeng/table';
import { ButtonModule, } from 'primeng/button';
import { InputTextModule, } from 'primeng/inputtext'; // For search input
import { TagModule } from 'primeng/tag';
import { ToastModule, } from 'primeng/toast'; // For toast messages
import { MessageService, } from 'primeng/api';
// import { InvoicePrintComponent } from '../../../billing/components/invoice-print/invoice-print.component';
import { CommonMethodService } from '../../../../core/Utils/common-method.service';
import { InvoicePrintComponent } from "../../../billing/components/invoice-print/invoice-print.component";
@Component({
  selector: 'app-dashboard-top-customer-view',
  imports: [CommonModule, IconFieldModule, InputIconModule, CarouselModule, DialogModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, ToastModule, InvoicePrintComponent],
  templateUrl: './dashboard-top-customer-view.component.html',
  styleUrl: './dashboard-top-customer-view.component.css'
})
export class DashboardTopCustomerViewComponent {
  @Input() params: any
  private ngUnsubscribe = new Subject<void>();
  searchTerm: string = '';
  filteredCustomers: any[] = [];
  expandedRows: { [key: string]: boolean } = {};
  expandedProductRows: { [key: string]: boolean } = {}; // For nested product rows
  getDateParam: any
  topCustomers: any
  scale: any;
  showpdf: any;
  invoiceId: any;
  // 

  constructor(private dashboardService: DashboardService, public CommonMethodService: CommonMethodService, private messageService: MessageService) { }

  ngOnChanges(changes: SimpleChanges): void {

    // if (changes && changes['currenValue']) {
    this.fetchTopCustomersByPurchase(this.params)
    // }
  }

  fetchTopCustomersByPurchase(params: any): void {
    this.dashboardService.getTopCustomersByPurchase(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<CustomerInsightData[]>>()))
      .subscribe(response => {
        if (response) {
          this.topCustomers = response.data
          this.filteredCustomers = response.data
        }
      });
  }



  filterCustomers(): void {
    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
    this.filteredCustomers = this.topCustomers.filter((customer: any) =>
      customer.fullname.toLowerCase().includes(lowerCaseSearchTerm) ||
      customer.email.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }

  viewCustomerDetails(customerId: string): void {
    // Example: this.router.navigate(['/customer', customerId]);
  }


  // --- PrimeNG Table Methods ---
  expandAll(): void {
    this.expandedRows = this.filteredCustomers.reduce((acc, customer) => {
      acc[customer._id] = true;
      return acc;
    }, {});
    this.messageService.add({ severity: 'success', summary: 'All Rows Expanded', life: 3000 });
  }

  collapseAll(): void {
    this.expandedRows = {};
    this.expandedProductRows = {}; // Collapse all nested product rows too
    this.messageService.add({ severity: 'info', summary: 'All Rows Collapsed', life: 3000 });
  }

  onRowExpand(event: TableRowExpandEvent): void {
    this.messageService.add({ severity: 'info', summary: 'Customer Expanded', detail: event.data.fullname, life: 3000 });
  }

  onRowCollapse(event: TableRowCollapseEvent): void {
    this.messageService.add({ severity: 'success', summary: 'Customer Collapsed', detail: event.data.fullname, life: 3000 });
  }

  onProductRowExpand(event: TableRowExpandEvent): void {
    this.messageService.add({ severity: 'info', summary: 'Product Expanded', detail: event.data.productId.title, life: 3000 });
  }

  onProductRowCollapse(event: TableRowCollapseEvent): void {
    this.messageService.add({ severity: 'success', summary: 'Product Collapsed', detail: event.data.productId.title, life: 3000 });
  }


  showInvoicePdf(id: any) {
    this.invoiceId = id
    this.showpdf = true
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}  