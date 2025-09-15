import { Component, OnInit, inject } from '@angular/core';
// CORRECTED: 'of' is now imported directly from 'rxjs'
import { Observable, forkJoin, of } from 'rxjs';
// CORRECTED: 'of' has been removed from this line
import { map, catchError } from 'rxjs/operators';

// Import our new, powerful services
import { DashboardService } from '../../../core/services/dashboard.service';
import { ChartService, ChartOption } from '../../../core/services/chart.service';

// Import PrimeNG Modules for the UI
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';

// Import our child components
import { DashboardSummaryComponent } from '../components/dashboard-summary/dashboard-summary.component';
import { DashboardChartComboComponent } from '../components/dashboard-chart-combo/dashboard-chart-combo.component';

// Define a single, clean interface for all our dashboard data
export interface DashboardData {
  overview: any;
  productAnalytics: any;
  customerAnalytics: any;
  paymentAnalytics: any;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    SkeletonModule,
    // DashboardSummaryComponent,
    DashboardChartComboComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  // --- Dependency Injection ---
  private dashboardService = inject(DashboardService);

  // --- State Management ---
  isLoading = true;
  dashboardData$!: Observable<DashboardData>;

  // --- Filter Controls ---
  periodOptions: any[] = [
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'Last 90 Days', value: 'last90days' },
    { label: 'This Month', value: 'thismonth' },
    { label: 'This Year', value: 'thisyear' },
  ];
  selectedPeriod: string = 'last30days';

  ngOnInit(): void {
    this.loadAllDashboardData();
  }

  loadAllDashboardData(): void {
    this.isLoading = true;
    const period = this.selectedPeriod;

    this.dashboardData$ = forkJoin({
      overview: this.dashboardService.getDashboardOverview(period),
      productAnalytics: this.dashboardService.getProductAnalytics(period),
      customerAnalytics: this.dashboardService.getCustomerAnalytics(period),
      paymentAnalytics: this.dashboardService.getPaymentAnalytics(period),
    }).pipe(
      map(response => {
        this.isLoading = false;
        return {
          overview: response.overview.data,
          productAnalytics: response.productAnalytics.data,
          customerAnalytics: response.customerAnalytics.data,
          paymentAnalytics: response.paymentAnalytics.data,
        };
      }),
      catchError(err => {
        this.isLoading = false;
        console.error("Failed to load dashboard data", err);
        // The 'of' operator will now work correctly
        return of({ overview: {}, productAnalytics: {}, customerAnalytics: {}, paymentAnalytics: {} });
      })
    );
  }

  onPeriodChange(): void {
    this.loadAllDashboardData();
  }
}
// import { Component, OnInit, inject } from '@angular/core';
// import { Observable, forkJoin } from 'rxjs';
// import { map, catchError, of } from 'rxjs/operators';

// // Import our new, powerful services
// import { DashboardService } from '../../../core/services/dashboard.service';
// import { ChartService, ChartOption } from '../../../core/services/chart.service';

// // Import PrimeNG Modules for the UI
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ButtonModule } from 'primeng/button';
// import { DropdownModule } from 'primeng/dropdown';
// import { SkeletonModule } from 'primeng/skeleton';

// // Import our child components
// import { DashboardSummaryComponent } from '../components/dashboard-summary/dashboard-summary.component';
// import { DashboardChartComboComponent } from '../components/dashboard-chart-combo/dashboard-chart-combo.component';

// // Define a single, clean interface for all our dashboard data
// export interface DashboardData {
//   overview: any;
//   productAnalytics: any;
//   customerAnalytics: any;
//   paymentAnalytics: any;
// }

// @Component({
//   selector: 'app-admin-dashboard',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ButtonModule,
//     DropdownModule,
//     SkeletonModule,
//     DashboardSummaryComponent,
//     DashboardChartComboComponent,
//   ],
//   templateUrl: './admin-dashboard.component.html',
//   styleUrls: ['./admin-dashboard.component.css'],
// })
// export class AdminDashboardComponent implements OnInit {
//   // --- Dependency Injection ---
//   private dashboardService = inject(DashboardService);

//   // --- State Management ---
//   isLoading = true;
//   // A single observable to hold all our dashboard data!
//   dashboardData$!: Observable<DashboardData>;

//   // --- Filter Controls ---
//   periodOptions: any[] = [
//     { label: 'Last 7 Days', value: 'last7days' },
//     { label: 'Last 30 Days', value: 'last30days' },
//     { label: 'Last 90 Days', value: 'last90days' },
//     { label: 'This Month', value: 'thismonth' },
//     { label: 'This Year', value: 'thisyear' },
//   ];
//   selectedPeriod: string = 'last30days'; // Default period

//   ngOnInit(): void {
//     this.loadAllDashboardData();
//   }

//   /**
//    * The single, powerful function to fetch ALL dashboard data in parallel.
//    */
//   loadAllDashboardData(): void {
//     this.isLoading = true;
//     const period = this.selectedPeriod;

//     // Use forkJoin to run all our service calls in parallel for maximum speed
//     this.dashboardData$ = forkJoin({
//       overview: this.dashboardService.getDashboardOverview(period),
//       productAnalytics: this.dashboardService.getProductAnalytics(period),
//       customerAnalytics: this.dashboardService.getCustomerAnalytics(period),
//       paymentAnalytics: this.dashboardService.getPaymentAnalytics(period),
//     }).pipe(
//       map(response => {
//         this.isLoading = false;
//         // The 'data' property is nested in the API response, so we extract it here.
//         return {
//           overview: response.overview.data,
//           productAnalytics: response.productAnalytics.data,
//           customerAnalytics: response.customerAnalytics.data,
//           paymentAnalytics: response.paymentAnalytics.data,
//         };
//       }),
//       catchError(err => {
//         this.isLoading = false;
//         console.error("Failed to load dashboard data", err);
//         // Return an empty structure on error so the UI doesn't break
//         return of({ overview: {}, productAnalytics: {}, customerAnalytics: {}, paymentAnalytics: {} });
//       })
//     );
//   }

//   /**
//    * Called when the user changes the period filter.
//    */
//   onPeriodChange(): void {
//     this.loadAllDashboardData();
//   }
// }

// // import { Component, OnInit, OnDestroy } from '@angular/core';
// // import { Observable, Subject } from 'rxjs';
// // import { takeUntil, catchError } from 'rxjs/operators';
// // import {
// //   ConsolidatedSummaryData,
// //   SalesTrendData,
// //   ProductInsightData,
// //   CustomerInsightData,
// //   ReviewData,
// //   PaymentMethodData,
// //   InventoryValueData,
// //   ApiResponse
// // } from '../../../core/Models/dashboard-models';
// // import { DashboardService } from '../../../core/services/dashboard.service';
// // import { CommonMethodService } from '../../../core/Utils/common-method.service';
// // import { MessageService } from 'primeng/api';
// // import { CommonModule } from '@angular/common';
// // import { FormsModule } from '@angular/forms';
// // import { DialogModule } from 'primeng/dialog';
// // import { ButtonModule } from 'primeng/button';
// // import { InputTextModule } from 'primeng/inputtext';
// // import { TagModule } from 'primeng/tag';
// // import { ToastModule } from 'primeng/toast';
// // import { CustomerListComponent } from '../../customer/components/customer-list/customer-list.component';
// // import { ProductListComponent } from '../../product/components/product-list/product-list.component';
// // import { InvoiceViewComponent } from '../../billing/components/invoice-view/invoice-view.component';
// // import { PaymentListComponent } from '../../payment/components/payment-list/payment-list.component';
// // import { InvoicePrintComponent } from '../../billing/components/invoice-print/invoice-print.component';
// // import { DashboardTopCustomerViewComponent } from '../components/dashboard-top-customer-view/dashboard-top-customer-view.component';
// // import { DashboardSummaryComponent } from '../components/dashboard-summary/dashboard-summary.component';
// // import { DashboardChartComponentComponent } from '../components/dashboard-chart-component/dashboard-chart-component.component';
// // import { DashboardChartComboComponent } from '../components/dashboard-chart-combo/dashboard-chart-combo.component';
// // import { PermissionComponentComponent } from "../components/permission-component/permission-component.component";

// // @Component({
// //   selector: 'app-admin-dashboard',
// //   standalone: true,
// //   imports: [
// //     CommonModule,
// //     FormsModule,
// //     DialogModule,
// //     ButtonModule,
// //     InputTextModule,
// //     TagModule,
// //     ToastModule,
// //     CustomerListComponent,
// //     ProductListComponent,
// //     InvoiceViewComponent,
// //     PaymentListComponent,
// //     InvoicePrintComponent,
// //     DashboardTopCustomerViewComponent,
// //     DashboardSummaryComponent,
// //     DashboardChartComponentComponent,
// //     DashboardChartComboComponent,

// //   ],
// //   templateUrl: './admin-dashboard.component.html',
// //   styleUrls: ['./admin-dashboard.component.css'],
// //   providers: [MessageService]
// // })
// // export class AdminDashboardComponent implements OnInit, OnDestroy {
// //   private ngUnsubscribe = new Subject<void>();
// //   searchTerm: string = '';
// //   expandedRows: { [key: string]: boolean } = {};
// //   expandedProductRows: { [key: string]: boolean } = {};
// //   getDateParam: any;
// //   dashboardSummary: ConsolidatedSummaryData | {} = {};
// //   salesTrends: SalesTrendData[] = [];
// //   topSellingProducts: ProductInsightData[] = [];
// //   lowStockProducts: ProductInsightData[] = [];
// //   outOfStockProducts: ProductInsightData[] = [];
// //   customersWithDues: CustomerInsightData[] = [];
// //   topCustomers: CustomerInsightData[] = [];
// //   newCustomersCountData: number | null = null;
// //   totalPaymentsReceivedData: number | null = null;
// //   paymentsByMethod: PaymentMethodData[] = [];
// //   failedPaymentsCountData: number | null = null;
// //   overallAverageRatingData: { overallAverage: number, totalReviewsConsidered: number } | null = null;
// //   recentReviews: ReviewData[] = [];
// //   totalInventoryValueData: InventoryValueData | null = null;
// //   isLoadingSummary = false;
// //   isLoadingSalesTrends = false;
// //   errorMessage: string | null = null;
// //   selectedPeriod: string = 'month';
// //   customStartDate: string = '';
// //   customEndDate: string = '';
// //   getTotalRevenue: number | null = null;
// //   SalesCount: any;
// //   showcustomerGrid: boolean = false;
// //   showproductGrid: boolean = false;
// //   showInvoiceGrid: boolean = false;
// //   showPaymentGrid: boolean = false;
// //   showpdf: boolean = false;
// //   dashboard = {
// //     showpdf: false,
// //     invoiceId: ''
// //   };
// //   border: any;
// //   showPermission: any;

// //   constructor(
// //     private dashboardService: DashboardService,
// //     public commonMethodService: CommonMethodService,
// //     private messageService: MessageService
// //   ) { }

// //   ngOnInit(): void {
// //     this.loadAllDashboardData();
// //   }

// //   hasProducts(): boolean {
// //     return this.dashboardSummary && 'products' in this.dashboardSummary &&
// //       this.dashboardSummary.products?.lowStock !== null &&
// //       Array.isArray(this.dashboardSummary.products?.lowStock) &&
// //       this.dashboardSummary.products?.lowStock.length > 0;
// //   }

// //   loadAllDashboardData(): void {
// //     this.errorMessage = null;
// //     const dateParams = this.getDateParams();
// //     this.getDateParam = dateParams;
// //     this.fetchDashBoardOverviewData(dateParams);
// //     this.getProductAnalytics({ days: 30 });

// //   }

// //   getUniqueInvoices(cartItems: any[]): any[] {
// //     const uniqueInvoiceMap = new Map<string, any>();
// //     cartItems.forEach(item => {
// //       item.invoiceIds.forEach((invoice: any) => {
// //         uniqueInvoiceMap.set(invoice._id, invoice);
// //       });
// //     });
// //     return Array.from(uniqueInvoiceMap.values());
// //   }

// //   getDateParams(): { period?: string, startDate?: string, endDate?: string } {
// //     if (this.customStartDate && this.customEndDate) {
// //       return { startDate: this.customStartDate, endDate: this.customEndDate };
// //     }
// //     return { period: this.selectedPeriod };
// //   }

// //   fetchDashBoardOverviewData(params?: any): void {
// //     this.isLoadingSummary = true;
// //     this.dashboardService.getDashboardOverview(params)
// //       .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
// //       .subscribe((response: any) => {
// //         if (response?.success) {
// //           this.getTotalRevenue = response.data.totalRevenue;
// //         }
// //         this.isLoadingSummary = false;
// //       });
// //   }


// //   getProductAnalytics(params: any, topItems: any = 10): void {
// //     this.isLoadingSalesTrends = true;
// //     this.dashboardService.getProductAnalytics(params, topItems)
// //       .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
// //       .subscribe((response: any) => {
// //         if (response?.success) {
// //           this.salesTrends = response.data;
// //         }
// //         this.isLoadingSalesTrends = false;
// //       });
// //   }
// //   getCustomerAnalytics(params: any, topItems: any = 10): void {
// //     this.isLoadingSalesTrends = true;
// //     this.dashboardService.getCustomerAnalytics(params, topItems)
// //       .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
// //       .subscribe((response: any) => {
// //         if (response?.success) {
// //           this.salesTrends = response.data;
// //         }
// //         this.isLoadingSalesTrends = false;
// //       });
// //   }

// //   getPaymentAnalytics(params: any, topItems: any = 10): void {
// //     this.isLoadingSalesTrends = true;
// //     this.dashboardService.getPaymentAnalytics(params)
// //       .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
// //       .subscribe((response: any) => {
// //         if (response?.success) {
// //           this.salesTrends = response.data;
// //         }
// //         this.isLoadingSalesTrends = false;
// //       });
// //   }



// //   onPeriodChange(newPeriod: string): void {
// //     this.selectedPeriod = newPeriod;
// //     this.customStartDate = '';
// //     this.customEndDate = '';
// //     this.loadAllDashboardData();
// //   }

// //   applyCustomDateRange(): void {
// //     if (this.customStartDate && this.customEndDate) {
// //       if (new Date(this.customEndDate) < new Date(this.customStartDate)) {
// //         this.messageService.add({ severity: 'error', summary: 'Invalid Date Range', detail: 'End date cannot be before start date.', life: 3000 });
// //         return;
// //       }
// //       this.selectedPeriod = 'custom';
// //       this.loadAllDashboardData();
// //     } else {
// //       this.messageService.add({ severity: 'warn', summary: 'Missing Dates', detail: 'Please select both start and end dates.', life: 3000 });
// //     }
// //   }


// //   ngOnDestroy(): void {
// //     this.ngUnsubscribe.next();
// //     this.ngUnsubscribe.complete();
// //   }
// // }

// // // this.fetchTopSellingProducts({ ...dateParams, limit: 5, sortBy: 'revenue' });
// // // this.fetchLowStockProducts({ threshold: 10, limit: 5 });
// // // this.fetchOutOfStockProducts({ limit: 5 });
// // // this.fetchNewCustomersCount(dateParams);
// // // this.fetchTotalPaymentsReceived(dateParams);
// // // this.fetchTotalInventoryValue();
// // // fetchTopSellingProducts(params: any): void {
// // //   this.dashboardService.getTopSellingProducts(params)
// // //     .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
// // //     .subscribe((response: any) => {
// // //       if (response?.success) {
// // //         this.topSellingProducts = response.data;
// // //       }
// // //     });
// // // }

// // // fetchLowStockProducts(params: any): void {
// // //   this.dashboardService.getLowStockProducts(params)
// // //     .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
// // //     .subscribe((response: any) => {
// // //       if (response?.success) {
// // //         this.lowStockProducts = response.data;
// // //       }
// // //     });
// // // }

// // // fetchOutOfStockProducts(params: any): void {
// // //   this.dashboardService.getOutOfStockProducts(params)
// // //     .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
// // //     .subscribe((response: any) => {
// // //       if (response?.success) {
// // //         this.outOfStockProducts = response.data;
// // //       }
// // //     });
// // // }

// // // fetchNewCustomersCount(params: any): void {
// // //   this.dashboardService.getNewCustomersCount(params)
// // //     .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
// // //     .subscribe((response: any) => {
// // //       if (response?.success) {
// // //         this.newCustomersCountData = response.data.newCustomersCount;
// // //       }
// // //     });
// // // }

// // // fetchTotalPaymentsReceived(params: any): void {
// // //   this.dashboardService.getTotalPaymentsReceived(params)
// // //     .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
// // //     .subscribe((response: any) => {
// // //       if (response?.success) {
// // //         this.totalPaymentsReceivedData = response.data.totalPaymentsReceived;
// // //       }
// // //     });
// // // }

// // // fetchTotalInventoryValue(): void {
// // //   this.dashboardService.getTotalInventoryValue()
// // //     .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
// // //     .subscribe((response: any) => {
// // //       if (response?.success) {
// // //         this.totalInventoryValueData = response.data;
// // //       }
// // //     });
// // // }