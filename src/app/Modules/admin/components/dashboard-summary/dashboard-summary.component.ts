import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-dashboard-summary',
  standalone: true,
  imports: [CommonModule, SkeletonModule],
  templateUrl: './dashboard-summary.component.html',
  styleUrls: ['./dashboard-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Optimized for performance
})
export class DashboardSummaryComponent {
  @Input() summaryData: any;
  @Input() isLoading: boolean = true;
}

// // 1. Your Original TypeScript Logic - Preserved and Corrected
// // File: src/app/Modules/admin/components/dashboard-summary/dashboard-summary.component.ts

// import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Subject } from 'rxjs';
// import { takeUntil, catchError } from 'rxjs/operators';

// // PrimeNG Modules
// import { DialogModule } from 'primeng/dialog';
// import { CarouselModule } from 'primeng/carousel';
// import { TableModule } from 'primeng/table';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { TagModule } from 'primeng/tag';
// import { ToastModule } from 'primeng/toast';
// import { MessageService } from 'primeng/api';
// import { SkeletonModule } from 'primeng/skeleton';

// // App Components & Services
// import { CommonMethodService } from '../../../../core/Utils/common-method.service';
// import { DashboardService } from '../../../../core/services/dashboard.service';
// import { ConsolidatedSummaryData, ApiResponse, SalesTrendData } from '../../../../core/Models/dashboard-models';
// import { InvoicePrintComponent } from "../../../billing/components/invoice-print/invoice-print.component";
// import { CustomerListComponent } from "../../../customer/components/customer-list/customer-list.component";
// import { ProductListComponent } from "../../../product/components/product-list/product-list.component";
// import { PaymentListComponent } from "../../../payment/components/payment-list/payment-list.component";
// import { InvoiceViewComponent } from '../../../billing/components/invoice-view/invoice-view.component';
// import { Avatar } from "primeng/avatar";

// @Component({
//   selector: 'app-dashboard-summary',
//   standalone: true,
//   imports: [
//     CommonModule, CarouselModule, DialogModule, FormsModule, TableModule,
//     ButtonModule, InputTextModule, TagModule, ToastModule, SkeletonModule,
//     Avatar
// ],
//   templateUrl: './dashboard-summary.component.html',
//   styleUrls: ['./dashboard-summary.component.css'],
//   providers: [MessageService]
// })
// export class DashboardSummaryComponent implements  OnDestroy {
//   @Input() params: any;

//   private ngUnsubscribe = new Subject<void>();
//   dashboardSummary: ConsolidatedSummaryData | null = null;
//   salesTrends: SalesTrendData[] = [];
//   newCustomersCountData: number = 0;
//   totalInventoryValueData: any;
//   isLoadingSummary = true;
  
//   // Your original state for dialogs is preserved
//   invoiceId: any;

//   constructor(
//     private dashboardService: DashboardService,
//     public commonMethodService: CommonMethodService,
//     private messageService: MessageService
//   ) {}

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['params']) {
//       this.fetchAllData(this.params);
//     }
//   }

//   ngOnDestroy(): void {
//     this.ngUnsubscribe.next();
//     this.ngUnsubscribe.complete();
//   }
  
//   fetchAllData(params: any): void {
//       this.fetchDashboardSummary(params);
//       // this.fetchSalesTrends({days: 30});
//       // this.fetchNewCustomersCount(params);
//       // this.fetchTotalInventoryValue();
//   }

//   fetchDashboardSummary(params: any): void {
//     this.isLoadingSummary = true;
//     this.dashboardService.getDashboardOverview(params).pipe(
//         takeUntil(this.ngUnsubscribe),
//         catchError(this.commonMethodService.createApiErrorHandler('getDashboardSummary'))
//       )
//       .subscribe((response:any) => {
//         if (response?.success) {
//           this.dashboardSummary = response.data;
//         } else {
//           this.dashboardSummary = null;
//         }
//         this.isLoadingSummary = false;
//       });
//   }
// hasProducts(): boolean {
//     return !!this.dashboardSummary?.products?.lowStock?.length;
//   }


//   showInvoicePdf(id: any) {
//     this.invoiceId = id;
//     // this.showpdf = true;
//   }
// }

//   // fetchDashboardSummary(params: any): void {
//   //   this.isLoadingSummary = true;
//   //   this.dashboardService.getDashboardSummary(params)
//   //     .pipe(
//   //       takeUntil(this.ngUnsubscribe),
//   //       catchError(this.commonMethodService.createApiErrorHandler('getDashboardSummary'))
//   //     )
//   //     .subscribe((response:any) => {
//   //       if (response?.success) {
//   //         this.dashboardSummary = response.data;
//   //       } else {
//   //         this.dashboardSummary = null;
//   //       }
//   //       this.isLoadingSummary = false;
//   //     });
//   // }
  
//   // fetchSalesTrends(params: { days?: number }): void {
//   //   this.dashboardService.getSalesTrends(params)
//   //     .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.createApiErrorHandler('getSalesTrends')))
//   //     .subscribe((response: any) => {
//   //       if (response?.success) {
//   //         this.salesTrends = response.data;
//   //       }
//   //     });
//   // }
  
//   // fetchNewCustomersCount(params: any): void {
//   //   this.dashboardService.getNewCustomersCount(params)
//   //     .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.createApiErrorHandler('getNewCustomersCount')))
//   //     .subscribe((response: any) => {
//   //       if (response?.success) {
//   //         this.newCustomersCountData = response.data.newCustomersCount;
//   //       }
//   //     });
//   // }

//   // fetchTotalInventoryValue(): void {
//   //   this.dashboardService.getTotalInventoryValue()
//   //     .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.createApiErrorHandler('getTotalInventoryValue')))
//   //     .subscribe((response: any) => {
//   //       if (response?.success) {
//   //         this.totalInventoryValueData = response.data;
//   //       }
//   //     });
//   // }

//   // Your original helper functions are preserved
  