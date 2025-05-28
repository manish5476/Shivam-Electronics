
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
import { CustomerListComponent } from "../../../customer/components/customer-list/customer-list.component";
import { ProductDetailComponent } from "../../../product/components/product-detail/product-detail.component";
import { PaymentListComponent } from "../../../payment/components/payment-list/payment-list.component";

@Component({
  selector: 'app-dashboard-summary',
  imports: [CommonModule, CarouselModule, DialogModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, ToastModule, InvoicePrintComponent, CustomerListComponent, ProductDetailComponent, PaymentListComponent],
  templateUrl: './dashboard-summary.component.html',
  styleUrl: './dashboard-summary.component.css'
})
export class DashboardSummaryComponent {
  @Input() params: any
  private ngUnsubscribe = new Subject<void>();
  dashboardSummary: any;
  isLoadingSummary: boolean = false;
  invoiceId: any;
  showpdf: boolean = false;
  showcustomerGrid: boolean = false;
  showproductGrid: boolean = false;
  showInvoiceGrid: boolean = false;
  showPaymentGrid: boolean = false;


  constructor(private dashboardService: DashboardService, public CommonMethodService: CommonMethodService, private messageService: MessageService) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.fetchDashboardSummary(this.params)
  }

  hasProducts(): boolean {
    return this.dashboardSummary?.products?.lowStock !== null && Array.isArray(this.dashboardSummary?.products?.lowStock) && this.dashboardSummary?.products?.lowStock.length > 0;
  }


  fetchDashboardSummary(params: any): void {
    this.isLoadingSummary = true;
    this.dashboardService.getDashboardSummary(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<ConsolidatedSummaryData>>()))
      .subscribe(response => {
        // if (response) {
        if (response) {
          this.dashboardSummary = response.data;
        }
        this.isLoadingSummary = false;
      });
  }


  getUniqueInvoices(cartItems: any[]): any[] {
    const uniqueInvoiceMap = new Map<string, any>();
    cartItems.forEach(item => {
      item.invoiceIds.forEach((invoice: any) => {
        // if (invoice.status === 'unpaid') { 
        uniqueInvoiceMap.set(invoice._id, invoice);
        // }
      });
    });
    return Array.from(uniqueInvoiceMap.values());
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
