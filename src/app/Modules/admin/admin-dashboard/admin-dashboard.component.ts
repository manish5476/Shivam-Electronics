import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import {
  ConsolidatedSummaryData,
  SalesTrendData,
  ProductInsightData,
  CustomerInsightData,
  ReviewData,
  PaymentMethodData,
  InventoryValueData,
  ApiResponse
} from '../../../core/Models/dashboard-models';
import { DashboardService } from '../../../core/services/dashboard.service';
import { CommonMethodService } from '../../../core/Utils/common-method.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { CustomerListComponent } from '../../customer/components/customer-list/customer-list.component';
import { ProductListComponent } from '../../product/components/product-list/product-list.component';
import { InvoiceViewComponent } from '../../billing/components/invoice-view/invoice-view.component';
import { PaymentListComponent } from '../../payment/components/payment-list/payment-list.component';
import { InvoicePrintComponent } from '../../billing/components/invoice-print/invoice-print.component';
import { DashboardTopCustomerViewComponent } from '../components/dashboard-top-customer-view/dashboard-top-customer-view.component';
import { DashboardSummaryComponent } from '../components/dashboard-summary/dashboard-summary.component';
import { DashboardChartComponentComponent } from '../components/dashboard-chart-component/dashboard-chart-component.component';
import { DashboardChartComboComponent } from '../components/dashboard-chart-combo/dashboard-chart-combo.component';
import { PermissionComponentComponent } from "../components/permission-component/permission-component.component";

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ToastModule,
    CustomerListComponent,
    ProductListComponent,
    InvoiceViewComponent,
    PaymentListComponent,
    InvoicePrintComponent,
    DashboardTopCustomerViewComponent,
    DashboardSummaryComponent,
    DashboardChartComponentComponent,
    DashboardChartComboComponent,
    
],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  providers: [MessageService]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  searchTerm: string = '';
  expandedRows: { [key: string]: boolean } = {};
  expandedProductRows: { [key: string]: boolean } = {};
  getDateParam: any;
  dashboardSummary: ConsolidatedSummaryData | {} = {};
  salesTrends: SalesTrendData[] = [];
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
  selectedPeriod: string = 'month';
  customStartDate: string = '';
  customEndDate: string = '';
  getTotalRevenue: number | null = null;
  SalesCount: any;
  showcustomerGrid: boolean = false;
  showproductGrid: boolean = false;
  showInvoiceGrid: boolean = false;
  showPaymentGrid: boolean = false;
  showpdf: boolean = false;
  dashboard = {
    showpdf: false,
    invoiceId: ''
  };
border: any;
showPermission: any;

  constructor(
    private dashboardService: DashboardService,
    public commonMethodService: CommonMethodService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadAllDashboardData();
  }

  hasProducts(): boolean {
    return this.dashboardSummary && 'products' in this.dashboardSummary && 
           this.dashboardSummary.products?.lowStock !== null && 
           Array.isArray(this.dashboardSummary.products?.lowStock) && 
           this.dashboardSummary.products?.lowStock.length > 0;
  }

  loadAllDashboardData(): void {
    this.errorMessage = null;
    const dateParams = this.getDateParams();
    this.getDateParam = dateParams;
    this.fetchTotalRevenue(dateParams);
    this.fetchSalesTrends({ days: 30 });
    this.fetchTopSellingProducts({ ...dateParams, limit: 5, sortBy: 'revenue' });
    this.fetchLowStockProducts({ threshold: 10, limit: 5 });
    this.fetchOutOfStockProducts({ limit: 5 });
    this.fetchNewCustomersCount(dateParams);
    this.fetchTotalPaymentsReceived(dateParams);
    this.fetchTotalInventoryValue();
  }

  getUniqueInvoices(cartItems: any[]): any[] {
    const uniqueInvoiceMap = new Map<string, any>();
    cartItems.forEach(item => {
      item.invoiceIds.forEach((invoice: any) => {
        uniqueInvoiceMap.set(invoice._id, invoice);
      });
    });
    return Array.from(uniqueInvoiceMap.values());
  }

  getDateParams(): { period?: string, startDate?: string, endDate?: string } {
    if (this.customStartDate && this.customEndDate) {
      return { startDate: this.customStartDate, endDate: this.customEndDate };
    }
    return { period: this.selectedPeriod };
  }

  fetchTotalRevenue(params?: any): void {
    this.isLoadingSummary = true;
    this.dashboardService.getTotalRevenue(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
      .subscribe((response: any) => {
        if (response?.success) {
          this.getTotalRevenue = response.data.totalRevenue;
        }
        this.isLoadingSummary = false;
      });
  }

  fetchSalesTrends(params: { days?: number }): void {
    this.isLoadingSalesTrends = true;
    this.dashboardService.getSalesTrends(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
      .subscribe((response: any) => {
        if (response?.success) {
          this.salesTrends = response.data;
        }
        this.isLoadingSalesTrends = false;
      });
  }

  fetchTopSellingProducts(params: any): void {
    this.dashboardService.getTopSellingProducts(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
      .subscribe((response: any) => {
        if (response?.success) {
          this.topSellingProducts = response.data;
        }
      });
  }

  fetchLowStockProducts(params: any): void {
    this.dashboardService.getLowStockProducts(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
      .subscribe((response: any) => {
        if (response?.success) {
          this.lowStockProducts = response.data;
        }
      });
  }

  fetchOutOfStockProducts(params: any): void {
    this.dashboardService.getOutOfStockProducts(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
      .subscribe((response: any) => {
        if (response?.success) {
          this.outOfStockProducts = response.data;
        }
      });
  }

  fetchNewCustomersCount(params: any): void {
    this.dashboardService.getNewCustomersCount(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
      .subscribe((response: any) => {
        if (response?.success) {
          this.newCustomersCountData = response.data.newCustomersCount;
        }
      });
  }

  fetchTotalPaymentsReceived(params: any): void {
    this.dashboardService.getTotalPaymentsReceived(params)
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
      .subscribe((response: any) => {
        if (response?.success) {
          this.totalPaymentsReceivedData = response.data.totalPaymentsReceived;
        }
      });
  }

  fetchTotalInventoryValue(): void {
    this.dashboardService.getTotalInventoryValue()
      .pipe(takeUntil(this.ngUnsubscribe), catchError(this.commonMethodService.handleError()))
      .subscribe((response: any) => {
        if (response?.success) {
          this.totalInventoryValueData = response.data;
        }
      });
  }

  onPeriodChange(newPeriod: string): void {
    this.selectedPeriod = newPeriod;
    this.customStartDate = '';
    this.customEndDate = '';
    this.loadAllDashboardData();
  }

  applyCustomDateRange(): void {
    if (this.customStartDate && this.customEndDate) {
      if (new Date(this.customEndDate) < new Date(this.customStartDate)) {
        this.messageService.add({ severity: 'error', summary: 'Invalid Date Range', detail: 'End date cannot be before start date.', life: 3000 });
        return;
      }
      this.selectedPeriod = 'custom';
      this.loadAllDashboardData();
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Missing Dates', detail: 'Please select both start and end dates.', life: 3000 });
    }
  }


  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}