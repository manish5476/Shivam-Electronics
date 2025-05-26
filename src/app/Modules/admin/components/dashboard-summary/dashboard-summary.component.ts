
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

@Component({
  selector: 'app-dashboard-summary',
  imports: [CommonModule, CarouselModule, DialogModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, ToastModule, InvoicePrintComponent],
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


  constructor(private dashboardService: DashboardService, public CommonMethodService: CommonMethodService, private messageService: MessageService) { }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes && changes['currenValue']) {
      this.fetchDashboardSummary(this.params)
    }
  }

  hasProducts(): boolean {
    return this.dashboardSummary?.products?.lowStock !== null && Array.isArray(this.dashboardSummary?.products?.lowStock) && this.dashboardSummary?.products?.lowStock.length > 0;
  }


  fetchDashboardSummary(params?: any): void {
    this.isLoadingSummary = true;
    this.dashboardService.getDashboardSummary(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<ConsolidatedSummaryData>>()))
      .subscribe(response => {
        // if (response) {
        if (response) {
          console.log(response.data);
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
