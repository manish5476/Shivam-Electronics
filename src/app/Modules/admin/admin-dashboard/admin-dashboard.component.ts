
import { Component, OnInit, OnDestroy } from '@angular/core';
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
} from '../../../core/services/dashboard.service'; // Adjust path as needed
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CustomerListComponent } from "../../customer/components/customer-list/customer-list.component";
import { ProductListComponent } from "../../product/components/product-list/product-list.component";
import { InvoiceViewComponent } from "../../billing/components/invoice-view/invoice-view.component";
import { PaymentListComponent } from "../../payment/components/payment-list/payment-list.component";
import { ProductDetailComponent } from "../../product/components/product-detail/product-detail.component";
import { CarouselModule } from 'primeng/carousel';
import { CommonMethodService } from '../../../core/Utils/common-method.service';
import { InvoicePrintComponent } from "../../billing/components/invoice-print/invoice-print.component";
// For charts, you might install and import a library like ng2-charts
// import { ChartConfiguration, ChartType } from 'chart.js';
// import DataLabelsPlugin from 'chartjs-plugin-datalabels';

import { TableModule, TableRowCollapseEvent, TableRowExpandEvent, } from 'primeng/table';
import { ButtonModule, } from 'primeng/button';
import { InputTextModule, } from 'primeng/inputtext'; // For search input
import { TagModule } from 'primeng/tag';
import { ToastModule, } from 'primeng/toast'; // For toast messages
import { MessageService, } from 'primeng/api';
import { DashboardTopCustomerViewComponent } from "../components/dashboard-top-customer-view/dashboard-top-customer-view.component";
import { MainDashboardComponent } from "../../../layouts/main-dashboard/main-dashboard.component";
import { DashboardSummaryComponent } from "../components/dashboard-summary/dashboard-summary.component"; // For toast messages
type Severity = "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined;
interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  status: string;
  sellerDetails: any;
  buyerDetails: any;
  itemDetails: any[];
  id: string;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  finalPrice: number | null;
  id: string;
}

interface CartItem {
  productId: Product;
  invoiceIds: Invoice[];
}

interface CustomerData {
  cart: {
    items: CartItem[];
  };
  _id: string;
  email: string;
  fullname: string;
  mobileNumber: string;
  remainingAmount: number;
  paymentHistory: any[];
  avatarUrl?: string; // Optional: Add a URL for customer avatar
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CarouselModule, DialogModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, ToastModule, DashboardTopCustomerViewComponent, DashboardSummaryComponent,],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  searchTerm: string = '';
  filteredCustomers: any[] = [];
  expandedRows: { [key: string]: boolean } = {};
  expandedProductRows: { [key: string]: boolean } = {}; // For nested product rows
  getDateParam: any
  // 
  // Data properties
  dashboardSummary: any;
  // dashboardSummary: ConsolidatedSummaryData | {} = {};
  salesTrends: any
  topSellingProducts: ProductInsightData[] = [];
  lowStockProducts: ProductInsightData[] = [];
  outOfStockProducts: ProductInsightData[] = [];
  customersWithDues: CustomerInsightData[] = [];
  topCustomers: CustomerInsightData[] = [];
  newCustomersCountData: number | null = null;
  totalPaymentsReceivedData: number | null = null;
  paymentsByMethod: PaymentMethodData[] = [];
  failedPaymentsCountData: number | null = null;
  overallAverageRatingData: { overallAverage: number, totalReviewsConsidered: number } | null = null;
  recentReviews: ReviewData[] = [];
  totalInventoryValueData: InventoryValueData | null = null;
  isLoadingSummary = false;
  isLoadingSalesTrends = false;
  errorMessage: string | null = null;

  // Filter
  selectedPeriod: string = ''; // Default period
  customStartDate: string = ''; // YYYY-MM-DD format from date input
  customEndDate: string = '';   // YYYY-MM-DD format from date input
  getTotalRevenue: any
  SalesCount: any
  showcustomerGrid: boolean = false
  showproductGrid: boolean = false
  showInvoiceGrid: boolean = false
  showPaymentGrid: boolean = false
  showpdf: any;

  // Example Chart Configuration (if using ng2-charts)
  // public salesTrendsChartType: ChartType = 'line';
  // public salesTrendsChartData: ChartConfiguration['data'] = {
  //   labels: [],
  //   datasets: [
  //     { data: [], label: 'Daily Revenue', yAxisID: 'yRevenue' },
  //     { data: [], label: 'Daily Sales Count', yAxisID: 'ySalesCount' }
  //   ]
  // };
  // public salesTrendsChartOptions: ChartConfiguration['options'] = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   scales: {
  //     x: {},
  //     yRevenue: { position: 'left', grid: { drawOnChartArea: false } },
  //     ySalesCount: { position: 'right', grid: { drawOnChartArea: true } }
  //   },
  //   plugins: {
  //    // datalabels: { anchor: 'end', align: 'end' }, // Example for chartjs-plugin-datalabels
  //     legend: { display: true }
  //   }
  // };
  constructor(private dashboardService: DashboardService, public CommonMethodService: CommonMethodService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.loadAllDashboardData();

  }


  // Helper function to check if products array is valid and not empty
  hasProducts(): boolean {
    return this.dashboardSummary?.products?.lowStock !== null && Array.isArray(this.dashboardSummary?.products?.lowStock) && this.dashboardSummary?.products?.lowStock.length > 0;
  }

  loadAllDashboardData(): void {
    this.errorMessage = null; // Clear previous errors
    const dateParams = this.getDateParams();
    this.getDateParam = dateParams
    this.fetchTotalRevenue()
    // this.fetchDashboardSummary(dateParams);
    this.fetchSalesTrends({ days: 30 }); // Default to 30 days, or use dateParams for period-based
    this.fetchTopSellingProducts({ ...dateParams, limit: 5, sortBy: 'revenue' });
    this.fetchLowStockProducts({ threshold: 10, limit: 5 });
    this.fetchOutOfStockProducts({ limit: 5 });
    // this.fetchCustomersWithDues({ limit: 5 });
    // this.fetchTopCustomersByPurchase({ ...dateParams, limit: 5 });
    this.fetchNewCustomersCount(dateParams);
    this.fetchTotalPaymentsReceived(dateParams);
    // this.fetchPaymentsByMethod(dateParams);
    // this.fetchFailedPaymentsCount(dateParams);
    // this.fetchOverallAverageRating();
    // this.fetchRecentReviews({ limit: 5 });
    this.fetchTotalInventoryValue();
  }

  getUniqueInvoices(cartItems: any[]): Invoice[] {
    const uniqueInvoiceMap = new Map<string, Invoice>();
    cartItems.forEach(item => {
      item.invoiceIds.forEach((invoice: any) => {
        // if (invoice.status === 'unpaid') { 
        uniqueInvoiceMap.set(invoice._id, invoice);
        // }
      });
    });
    return Array.from(uniqueInvoiceMap.values());
  }

  public getDateParams(): { period?: string, startDate?: string, endDate?: string } {
    if (this.customStartDate && this.customEndDate) {
      return { startDate: this.customStartDate, endDate: this.customEndDate };
    }
    return { period: this.selectedPeriod };
  }

  // --- Fetch Methods ---
  fetchDashboardSummary(params?: any): void {
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

  fetchTotalRevenue(params?: any): void {
    this.isLoadingSummary = true;
    this.dashboardService.getTotalRevenue(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError()))
      .subscribe((response: any) => {
        if (response) {
          this.getTotalRevenue = response.data.totalRevenue;
        }
        this.isLoadingSummary = false;
      });
  }

  fetchSalesTrends(params: { days?: number }): void {
    this.isLoadingSalesTrends = true;
    this.dashboardService.getSalesTrends(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<SalesTrendData[]>>()))
      .subscribe(response => {
        // if (response) {
        if (response) {
          this.salesTrends = response.data;
          // this.updateSalesTrendsChart();
        }
        this.isLoadingSalesTrends = false;
      });
  }

  // updateSalesTrendsChart(): void {
  //   if (!this.salesTrendsChartData.labels || !this.salesTrendsChartData.datasets) return;
  //   this.salesTrendsChartData.labels = this.salesTrends.map(t => t._id);
  //   this.salesTrendsChartData.datasets[0].data = this.salesTrends.map(t => t.dailyRevenue);
  //   this.salesTrendsChartData.datasets[1].data = this.salesTrends.map(t => t.dailySalesCount);
  //   // If using ng2-charts, you might need to trigger an update if the chart object itself doesn't change
  //   // this.salesTrendsChartData = { ...this.salesTrendsChartData };
  // }

  fetchTopSellingProducts(params: any): void {
    this.dashboardService.getTopSellingProducts(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<ProductInsightData[]>>()))
      .subscribe(response => {
        if (response) this.topSellingProducts = response.data;
      });
  }

  fetchgetSalesCount(params: any): void {
    this.dashboardService.getSalesCount(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<ProductInsightData[]>>()))
      .subscribe(response => {
        if (response) this.SalesCount = response.data;
      });
  }


  fetchLowStockProducts(params: any): void {
    this.dashboardService.getLowStockProducts(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<ProductInsightData[]>>()))
      .subscribe(response => {
        if (response) this.lowStockProducts = response.data;
      });
  }

  fetchOutOfStockProducts(params: any): void {
    this.dashboardService.getOutOfStockProducts(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<ProductInsightData[]>>()))
      .subscribe(response => {
        if (response) this.outOfStockProducts = response.data;
      });
  }

  fetchCustomersWithDues(params: any): void {
    this.dashboardService.getCustomersWithOutstandingPayments(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<CustomerInsightData[]>>()))
      .subscribe(response => {
        if (response) this.customersWithDues = response.data;
      });
  }

  fetchTopCustomersByPurchase(params: any): void {
    this.dashboardService.getTopCustomersByPurchase(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<CustomerInsightData[]>>()))
      .subscribe(response => {
        if (response) {
          this.topCustomers = response.data;
          this.filteredCustomers = response.data
        }
      });
  }

  fetchNewCustomersCount(params: any): void {
    this.dashboardService.getNewCustomersCount(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<{ newCustomersCount: number }>>()))
      .subscribe(response => {
        if (response) this.newCustomersCountData = response.data.newCustomersCount;
      });
  }

  fetchTotalPaymentsReceived(params: any): void {
    this.dashboardService.getTotalPaymentsReceived(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<{ totalPaymentsReceived: number }>>()))
      .subscribe(response => {
        if (response) this.totalPaymentsReceivedData = response.data.totalPaymentsReceived;
      });
  }

  fetchPaymentsByMethod(params: any): void {
    this.dashboardService.getPaymentsByMethod(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<PaymentMethodData[]>>()))
      .subscribe(response => {
        if (response) this.paymentsByMethod = response.data;
      });
  }

  fetchFailedPaymentsCount(params: any): void {
    this.dashboardService.getFailedPaymentsCount(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<{ failedPaymentsCount: number }>>()))
      .subscribe(response => {
        if (response) this.failedPaymentsCountData = response.data.failedPaymentsCount;
      });
  }

  fetchOverallAverageRating(): void {
    this.dashboardService.getOverallAverageRating()
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<{ overallAverage: number, totalReviewsConsidered: number }>>()))
      .subscribe(response => {
        if (response) this.overallAverageRatingData = response.data;
      });
  }

  fetchRecentReviews(params: any): void {
    this.dashboardService.getRecentReviews(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<ReviewData[]>>()))
      .subscribe(response => {
        if (response) this.recentReviews = response.data;
      });
  }

  fetchTotalInventoryValue(): void {
    this.dashboardService.getTotalInventoryValue()
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<InventoryValueData>>()))
      .subscribe(response => {
        if (response) this.totalInventoryValueData = response.data;
      });
  }


  // --- Event Handlers ---
  onPeriodChange(newPeriod: string): void {
    this.selectedPeriod = newPeriod;
    this.customStartDate = ''; // Clear custom dates if predefined period is selected
    this.customEndDate = '';
    this.loadAllDashboardData();
  }

  applyCustomDateRange(): void {
    if (this.customStartDate && this.customEndDate) {
      // Basic validation: endDate should not be before startDate
      if (new Date(this.customEndDate) < new Date(this.customStartDate)) {
        this.errorMessage = "End date cannot be before start date.";
        return;
      }
      this.selectedPeriod = 'custom'; // Indicate custom range is active
      this.loadAllDashboardData();
    } else {
      this.errorMessage = "Please select both start and end dates for a custom range.";
    }
  }

  // --- Utility ---
  // private handleError<T>() {
  //   return (error: HttpErrorResponse): Observable<T | undefined> => {
  //     console.error('API Error:', error);
  //     this.errorMessage = `Error fetching data: ${error.error?.message || error.message || 'Server error'}`;
  //     // Optionally, return an empty/default observable of the expected type, or rethrow
  //     // return of(undefined as T); // This will make the subscriber complete without emitting data
  //     throw error; // Or rethrow to be handled by a global error handler if you have one
  //   };
  // }

  // -----------------------------------Invoice pdf ------------------------------------//
  dashboard = {
    showpdf: false,
    invoiceId: '',
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

  // onRowExpand(event: TableRowExpandEvent): void {
  //   this.messageService.add({ severity: 'info', summary: 'Customer Expanded', detail: event.data.fullname, life: 3000 });
  // }

  // onRowCollapse(event: TableRowCollapseEvent): void {
  //   this.messageService.add({ severity: 'success', summary: 'Customer Collapsed', detail: event.data.fullname, life: 3000 });
  // }

  // onProductRowExpand(event: TableRowExpandEvent): void {
  //   this.messageService.add({ severity: 'info', summary: 'Product Expanded', detail: event.data.productId.title, life: 3000 });
  // }

  // onProductRowCollapse(event: TableRowCollapseEvent): void {
  //   this.messageService.add({ severity: 'success', summary: 'Product Collapsed', detail: event.data.productId.title, life: 3000 });
  // }


  // showInvoicePdf(id: any) {
  //   this.dashboard.invoiceId = id
  //   this.dashboard.showpdf = true
  // }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}  