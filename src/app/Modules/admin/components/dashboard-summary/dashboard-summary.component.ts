// 1. Your Original TypeScript Logic - Preserved and Corrected
// File: src/app/Modules/admin/components/dashboard-summary/dashboard-summary.component.ts

import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

// PrimeNG Modules
import { DialogModule } from 'primeng/dialog';
import { CarouselModule } from 'primeng/carousel';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';

// App Components & Services
import { CommonMethodService } from '../../../../core/Utils/common-method.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { ConsolidatedSummaryData, ApiResponse, SalesTrendData } from '../../../../core/Models/dashboard-models';
import { InvoicePrintComponent } from "../../../billing/components/invoice-print/invoice-print.component";
import { CustomerListComponent } from "../../../customer/components/customer-list/customer-list.component";
import { ProductListComponent } from "../../../product/components/product-list/product-list.component";
import { PaymentListComponent } from "../../../payment/components/payment-list/payment-list.component";
import { InvoiceViewComponent } from '../../../billing/components/invoice-view/invoice-view.component';
import { Avatar } from "primeng/avatar";

@Component({
  selector: 'app-dashboard-summary',
  standalone: true,
  imports: [
    CommonModule, CarouselModule, DialogModule, FormsModule, TableModule,
    ButtonModule, InputTextModule, TagModule, ToastModule, SkeletonModule,
    Avatar
],
  templateUrl: './dashboard-summary.component.html',
  styleUrls: ['./dashboard-summary.component.css'],
  providers: [MessageService]
})
export class DashboardSummaryComponent implements  OnDestroy {
  @Input() params: any;

  private ngUnsubscribe = new Subject<void>();
  dashboardSummary: ConsolidatedSummaryData | null = null;
  salesTrends: SalesTrendData[] = [];
  newCustomersCountData: number = 0;
  totalInventoryValueData: any;
  isLoadingSummary = true;
  
  // Your original state for dialogs is preserved
  invoiceId: any;
  showpdf: boolean = false;
  showcustomerGrid: boolean = false;
  showproductGrid: boolean = false;
  showInvoiceGrid: boolean = false;
  showPaymentGrid: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    public commonMethodService: CommonMethodService,
    private messageService: MessageService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['params']) {
      this.fetchAllData(this.params);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  
  fetchAllData(params: any): void {
      this.fetchDashboardSummary(params);
      this.fetchSalesTrends({days: 30});
      this.fetchNewCustomersCount(params);
      this.fetchTotalInventoryValue();
  }

  fetchDashboardSummary(params: any): void {
    this.isLoadingSummary = true;
    this.dashboardService.getDashboardSummary(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError(this.commonMethodService.createApiErrorHandler('getDashboardSummary'))
      )
      .subscribe((response:any) => {
        if (response?.success) {
          this.dashboardSummary = response.data;
        } else {
          this.dashboardSummary = null;
        }
        this.isLoadingSummary = false;
      });
  }
  
  fetchSalesTrends(params: { days?: number }): void {
    this.dashboardService.getSalesTrends(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.createApiErrorHandler('getSalesTrends')))
      .subscribe((response: any) => {
        if (response?.success) {
          this.salesTrends = response.data;
        }
      });
  }
  
  fetchNewCustomersCount(params: any): void {
    this.dashboardService.getNewCustomersCount(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.createApiErrorHandler('getNewCustomersCount')))
      .subscribe((response: any) => {
        if (response?.success) {
          this.newCustomersCountData = response.data.newCustomersCount;
        }
      });
  }

  fetchTotalInventoryValue(): void {
    this.dashboardService.getTotalInventoryValue()
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.createApiErrorHandler('getTotalInventoryValue')))
      .subscribe((response: any) => {
        if (response?.success) {
          this.totalInventoryValueData = response.data;
        }
      });
  }

  // Your original helper functions are preserved
  hasProducts(): boolean {
    return !!this.dashboardSummary?.products?.lowStock?.length;
  }

  getUniqueInvoices(cartItems: any[]): any[] {
    if (!cartItems) return [];
    const uniqueInvoiceMap = new Map<string, any>();
    cartItems.forEach(item => {
      item.invoiceIds?.forEach((invoice: any) => {
        uniqueInvoiceMap.set(invoice._id, invoice);
      });
    });
    return Array.from(uniqueInvoiceMap.values());
  }

  showInvoicePdf(id: any) {
    this.invoiceId = id;
    this.showpdf = true;
  }
}

// import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
// import { Observable, Subject } from 'rxjs';
// import { takeUntil, catchError } from 'rxjs/operators';
// import {
//   ConsolidatedSummaryData, ApiResponse } from '../../../../core/Models/dashboard-models'
// import {  DashboardService,} from '../../../../core/services/dashboard.service'; // Adjust path as needed
// import { HttpErrorResponse } from '@angular/common/http';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { DialogModule } from 'primeng/dialog';

// import { CarouselModule } from 'primeng/carousel';
// import { TableModule, TableRowCollapseEvent, TableRowExpandEvent, } from 'primeng/table';
// import { ButtonModule, } from 'primeng/button';
// import { InputTextModule, } from 'primeng/inputtext'; // For search input
// import { TagModule } from 'primeng/tag';
// import { ToastModule, } from 'primeng/toast'; // For toast messages
// import { MessageService, } from 'primeng/api';
// // import { InvoicePrintComponent } from '../../../billing/components/invoice-print/invoice-print.component';
// import { CommonMethodService } from '../../../../core/Utils/common-method.service';
// import { InvoicePrintComponent } from "../../../billing/components/invoice-print/invoice-print.component";
// import { CustomerListComponent } from "../../../customer/components/customer-list/customer-list.component";
// import { ProductDetailComponent } from "../../../product/components/product-detail/product-detail.component";
// import { PaymentListComponent } from "../../../payment/components/payment-list/payment-list.component";

// @Component({
//   selector: 'app-dashboard-summary',
//   imports: [CommonModule, CarouselModule, DialogModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, ToastModule, InvoicePrintComponent, CustomerListComponent, ProductDetailComponent, PaymentListComponent],
//   templateUrl: './dashboard-summary.component.html',
//   styleUrl: './dashboard-summary.component.css'
// })
// export class DashboardSummaryComponent {
//   @Input() params: any
//   private ngUnsubscribe = new Subject<void>();
//   dashboardSummary: any;
//   isLoadingSummary: boolean = false;
//   invoiceId: any;
//   showpdf: boolean = false;
//   showcustomerGrid: boolean = false;
//   showproductGrid: boolean = false;
//   showInvoiceGrid: boolean = false;
//   showPaymentGrid: boolean = false;


//   constructor(private dashboardService: DashboardService, public CommonMethodService: CommonMethodService, private messageService: MessageService) { }

//   ngOnChanges(changes: SimpleChanges): void {
//     this.fetchDashboardSummary(this.params)
//   }

//   hasProducts(): boolean {
//     return this.dashboardSummary?.products?.lowStock !== null && Array.isArray(this.dashboardSummary?.products?.lowStock) && this.dashboardSummary?.products?.lowStock.length > 0;
//   }


//   fetchDashboardSummary(params: any): void {
//     this.isLoadingSummary = true;
//     this.dashboardService.getDashboardSummary(params)
//       .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<ConsolidatedSummaryData>>()))
//       .subscribe(response => {
//         // if (response) {
//         if (response) {
//           this.dashboardSummary = response.data;
//         }
//         this.isLoadingSummary = false;
//       });
//   }


//   getUniqueInvoices(cartItems: any[]): any[] {
//     const uniqueInvoiceMap = new Map<string, any>();
//     cartItems.forEach(item => {
//       item.invoiceIds.forEach((invoice: any) => {
//         // if (invoice.status === 'unpaid') { 
//         uniqueInvoiceMap.set(invoice._id, invoice);
//         // }
//       });
//     });
//     return Array.from(uniqueInvoiceMap.values());
//   }

//   showInvoicePdf(id: any) {
//     this.invoiceId = id
//     this.showpdf = true
//   }

//   ngOnDestroy(): void {
//     this.ngUnsubscribe.next();
//     this.ngUnsubscribe.complete();
//   }
// }
