import {
  Component,
  OnInit,
  inject,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Gridstack
import {
  GridstackComponent,
  GridstackItemComponent,
} from 'gridstack/dist/angular';
import { GridStack, GridStackOptions, GridStackWidget } from 'gridstack';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';

// Child components
import { DashboardSummaryComponent } from '../components/dashboard-summary/dashboard-summary.component';
import { DashboardChartComboComponent } from '../components/dashboard-chart-combo/dashboard-chart-combo.component';
import { AnalyticDashboardComponent } from '../components/analytic-dashboard/analytic-dashboard.component';
import { DashboardTopCustomerViewComponent } from '../components/dashboard-top-customer-view/dashboard-top-customer-view.component';
import { PaymentanalyticsComponent } from '../components/paymentanalytics/paymentanalytics.component';
import { SalesPerformanceComponent } from '../components/sales-performace/sales-performace.component';
import { Select } from 'primeng/select';

// Dashboard Service & Interfaces
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    SkeletonModule,
    CalendarModule,
    ToastModule,
    PanelModule,
    DialogModule,
    ToolbarModule,
    GridstackComponent,
    GridstackItemComponent,
    Select,
    DashboardSummaryComponent,
    DashboardChartComboComponent,
    AnalyticDashboardComponent,
    DashboardTopCustomerViewComponent,
    PaymentanalyticsComponent,
    SalesPerformanceComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  providers: [MessageService],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease', style({ opacity: 1 })),
      ]),
    ]),
    trigger('panelAnimation', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(
        'void => *',
        animate(
          '0.3s ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ),
    ]),
  ],
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  private dashboardService = inject(DashboardService);
  private messageService = inject(MessageService);

  @ViewChild(GridstackComponent) gridstackComponent!: GridstackComponent;
  private grid!: GridStack;
  public gridOptions: GridStackOptions = {
    margin: 10,
    float: true,
    cellHeight: '10rem',
    resizable: { handles: 'all' }, // Better resizing
    disableOneColumnMode: false, // Responsive for mobile
    minRow: 1, // Prevent collapse
    alwaysShowResizeHandle:
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ),
  };
  public isGridLocked = false;
  private readonly LAYOUT_KEY = 'dashboardLayout_v3';

  // UI state
  isLoading = true;
  showDialog = false;
  selectedPanelTitle = '';
  selectedPanelData: any;
  showJson = false;

  // Per-panel loading states
  isKpiLoading = false;
  isChartsLoading = false;
  isProductLoading = false;
  isCustomerLoading = false;
  isPaymentLoading = false;
  isForecastLoading = false;

  // Filters
  public periodOptions: any[] = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'This Month', value: 'thismonth' },
    { label: 'This Year', value: 'thisyear' },
    { label: 'Custom Range', value: 'custom' },
  ];
  public limitOptions: any[] = [
    { label: 'Top 5', value: 5 },
    { label: 'Top 10', value: 10 },
    { label: 'Top 20', value: 20 },
  ];
  public selectedPeriod: string = 'last30days';
  public dataLimit: number = 5;
  public customDateRange: Date[] | undefined;
  public startDate: string | undefined;
  public endDate: string | undefined;

  private refreshTrigger = new BehaviorSubject<{
    period: string;
    startDate?: string;
    endDate?: string;
    limit: number;
  }>({
    period: this.selectedPeriod,
    limit: this.dataLimit,
  });

  // Data holders
  enhancedKpiSummary: any;
  kpiSummary: any;
  overview: any;
  productAnalytics: any;
  customerAnalytics: any;
  paymentAnalytics: any;
  inventoryTurnover: any;
  salesForecast: any;
  salesTrends: any;
  salesCharts: any;
  yearlySales: any;
  monthlySales: any;
  weeklySales: any;

  // Grid widgets (added minH/maxH for better control)
  public widgets: GridStackWidget[] = [
    {
      id: 'kpiSummary',
      x: 0,
      y: 0,
      w: 12,
      h: 2,
      minH: 2,
      maxH: 4,
      content: 'KPI Summary',
    },
    {
      id: 'chartsOverview',
      x: 0,
      y: 2,
      w: 12,
      h: 4,
      minH: 3,
      maxH: 6,
      content: 'Charts Overview',
    },
    {
      id: 'productAnalytics',
      x: 0,
      y: 6,
      w: 6,
      h: 5,
      minH: 4,
      maxH: 8,
      content: 'Product Analytics',
    },
    {
      id: 'customerAnalytics',
      x: 6,
      y: 6,
      w: 6,
      h: 5,
      minH: 4,
      maxH: 8,
      content: 'Customer Analytics',
    },
    {
      id: 'paymentAnalytics',
      x: 0,
      y: 11,
      w: 6,
      h: 5,
      minH: 4,
      maxH: 8,
      content: 'Payment Analytics',
    },
    {
      id: 'salesForecast',
      x: 6,
      y: 11,
      w: 6,
      h: 5,
      minH: 4,
      maxH: 8,
      content: 'Sales Forecast',
    },
  ];

  ngOnInit(): void {
    this.refreshTrigger.subscribe(() => this.loadDashboardData());
    this.triggerRefresh();
  }

  ngAfterViewInit(): void {
    if (this.gridstackComponent?.grid) {
      this.grid = this.gridstackComponent.grid;
      this.loadLayout();
    } else {
      console.error('Dashboard grid could not be initialized.');
      this.messageService.add({
        severity: 'error',
        summary: 'Fatal Error',
        detail: 'Dashboard layout component failed to load.',
      });
    }
  }

  private loadDashboardData(forceRefresh = false): void {
    this.isLoading = true;

    // Parallel load all APIs with forkJoin
    forkJoin([
      this.dashboardService
        .getEnhancedKpiSummary(
          this.selectedPeriod,
          this.startDate,
          this.endDate,
          forceRefresh,
        )
        .pipe(
          tap((res) => (this.enhancedKpiSummary = res?.data || res)),
          catchError((err) => {
            this.handleError('Enhanced KPI Summary', err);
            return of(null);
          }),
        ),
      this.dashboardService
        .getKpiSummary(
          this.selectedPeriod,
          this.startDate,
          this.endDate,
          forceRefresh,
        )
        .pipe(
          tap((res) => (this.kpiSummary = res?.data || res)),
          catchError((err) => {
            this.handleError('KPI Summary', err);
            return of(null);
          }),
        ),
      this.dashboardService
        .getDashboardOverview(
          this.selectedPeriod,
          this.startDate,
          this.endDate,
          forceRefresh,
        )
        .pipe(
          tap((res) => (this.overview = res?.data || res)),
          catchError((err) => {
            this.handleError('Overview', err);
            return of(null);
          }),
        ),
      this.dashboardService
        .getProductAnalytics(
          this.selectedPeriod,
          this.dataLimit,
          this.startDate,
          this.endDate,
          forceRefresh,
        )
        .pipe(
          tap((res) => (this.productAnalytics = res?.data || res)),
          catchError((err) => {
            this.handleError('Product Analytics', err);
            return of(null);
          }),
        ),
      this.dashboardService
        .getCustomerAnalytics(
          this.selectedPeriod,
          this.dataLimit,
          this.startDate,
          this.endDate,
          forceRefresh,
        )
        .pipe(
          tap((res) => (this.customerAnalytics = res?.data || res)),
          catchError((err) => {
            this.handleError('Customer Analytics', err);
            return of(null);
          }),
        ),
      this.dashboardService
        .getPaymentAnalytics(
          this.selectedPeriod,
          this.startDate,
          this.endDate,
          forceRefresh,
        )
        .pipe(
          tap((res) => (this.paymentAnalytics = res?.data || res)),
          catchError((err) => {
            this.handleError('Payment Analytics', err);
            return of(null);
          }),
        ),
      this.dashboardService
        .getInventoryTurnover(
          this.selectedPeriod,
          this.startDate,
          this.endDate,
          forceRefresh,
        )
        .pipe(
          tap((res) => (this.inventoryTurnover = res?.data || res)),
          catchError((err) => {
            this.handleError('Inventory Turnover', err);
            return of(null);
          }),
        ),
      this.dashboardService
        .getSalesForecast(
          this.selectedPeriod,
          this.startDate,
          this.endDate,
          forceRefresh,
        )
        .pipe(
          tap((res) => (this.salesForecast = res?.data || res)),
          catchError((err) => {
            this.handleError('Sales Forecast', err);
            return of(null);
          }),
        ),
      this.dashboardService
        .getSalesTrends(
          this.selectedPeriod,
          this.startDate,
          this.endDate,
          forceRefresh,
        )
        .pipe(
          tap((res) => (this.salesTrends = res?.data || res)),
          catchError((err) => {
            this.handleError('Sales Trends', err);
            return of(null);
          }),
        ),
      this.dashboardService
        .getSalesCharts(
          this.selectedPeriod,
          this.startDate,
          this.endDate,
          forceRefresh,
        )
        .pipe(
          tap((res) => (this.salesCharts = res?.data || res)),
          catchError((err) => {
            this.handleError('Sales Charts', err);
            return of(null);
          }),
        ),
      this.dashboardService
        .getYearlySales(this.selectedPeriod, forceRefresh)
        .pipe(
          tap((res) => (this.yearlySales = res?.data || res)),
          catchError((err) => {
            this.handleError('Yearly Sales', err);
            return of(null);
          }),
        ),
      this.dashboardService
        .getMonthlySales(this.selectedPeriod, forceRefresh)
        .pipe(
          tap((res) => (this.monthlySales = res?.data || res)),
          catchError((err) => {
            this.handleError('Monthly Sales', err);
            return of(null);
          }),
        ),
      this.dashboardService
        .getWeeklySales(this.selectedPeriod, forceRefresh)
        .pipe(
          tap((res) => (this.weeklySales = res?.data || res)),
          catchError((err) => {
            this.handleError('Weekly Sales', err);
            return of(null);
          }),
        ),
    ])
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Dashboard',
            detail: 'Loaded dashboard data.',
          });
        }),
      )
      .subscribe();
  }

  // --- Per-panel refresh methods (parallel where possible) ---
  refreshKpiPanel(): void {
    this.isKpiLoading = true;
    forkJoin([
      this.dashboardService
        .getEnhancedKpiSummary(
          this.selectedPeriod,
          this.startDate,
          this.endDate,
          true,
        )
        .pipe(
          tap((res) => (this.enhancedKpiSummary = res?.data || res)),
          catchError((err) => {
            this.handleError('Refresh Enhanced KPIs', err);
            return of(null);
          }),
        ),
      this.dashboardService
        .getKpiSummary(this.selectedPeriod, this.startDate, this.endDate, true)
        .pipe(
          tap((res) => (this.kpiSummary = res?.data || res)),
          catchError((err) => {
            this.handleError('Refresh KPI Summary', err);
            return of(null);
          }),
        ),
      this.dashboardService
        .getDashboardOverview(
          this.selectedPeriod,
          this.startDate,
          this.endDate,
          true,
        )
        .pipe(
          tap((res) => (this.overview = res?.data || res)),
          catchError((err) => {
            this.handleError('Refresh Overview', err);
            return of(null);
          }),
        ),
    ])
      .pipe(finalize(() => (this.isKpiLoading = false)))
      .subscribe();
  }

  refreshChartsPanel(): void {
    this.isChartsLoading = true;
    forkJoin([
      this.dashboardService
        .getSalesTrends(this.selectedPeriod, this.startDate, this.endDate, true)
        .pipe(
          tap((res) => (this.salesTrends = res?.data || res)),
          catchError((err) => {
            this.handleError('Refresh Sales Trends', err);
            return of(null);
          }),
        ),
      this.dashboardService
        .getSalesCharts(this.selectedPeriod, this.startDate, this.endDate, true)
        .pipe(
          tap((res) => (this.salesCharts = res?.data || res)),
          catchError((err) => {
            this.handleError('Refresh Sales Charts', err);
            return of(null);
          }),
        ),
      this.dashboardService.getYearlySales(this.selectedPeriod, true).pipe(
        tap((res) => (this.yearlySales = res?.data || res)),
        catchError((err) => {
          this.handleError('Refresh Yearly Sales', err);
          return of(null);
        }),
      ),
      this.dashboardService.getMonthlySales(this.selectedPeriod, true).pipe(
        tap((res) => (this.monthlySales = res?.data || res)),
        catchError((err) => {
          this.handleError('Refresh Monthly Sales', err);
          return of(null);
        }),
      ),
      this.dashboardService.getWeeklySales(this.selectedPeriod, true).pipe(
        tap((res) => (this.weeklySales = res?.data || res)),
        catchError((err) => {
          this.handleError('Refresh Weekly Sales', err);
          return of(null);
        }),
      ),
    ])
      .pipe(finalize(() => (this.isChartsLoading = false)))
      .subscribe();
  }

  refreshProductPanel(): void {
    this.isProductLoading = true;
    forkJoin([
      this.dashboardService
        .getProductAnalytics(
          this.selectedPeriod,
          this.dataLimit,
          this.startDate,
          this.endDate,
          true,
        )
        .pipe(
          tap((res) => (this.productAnalytics = res?.data || res)),
          catchError((err) => {
            this.handleError('Refresh Products', err);
            return of(null);
          }),
        ),
      this.dashboardService
        .getInventoryTurnover(
          this.selectedPeriod,
          this.startDate,
          this.endDate,
          true,
        )
        .pipe(
          tap((res) => (this.inventoryTurnover = res?.data || res)),
          catchError((err) => {
            this.handleError('Refresh Inventory', err);
            return of(null);
          }),
        ),
    ])
      .pipe(finalize(() => (this.isProductLoading = false)))
      .subscribe();
  }

  refreshCustomerPanel(): void {
    this.isCustomerLoading = true;
    this.dashboardService
      .getCustomerAnalytics(
        this.selectedPeriod,
        this.dataLimit,
        this.startDate,
        this.endDate,
        true,
      )
      .pipe(
        tap((res) => (this.customerAnalytics = res?.data || res)),
        catchError((err) => {
          this.handleError('Refresh Customers', err);
          return of(null);
        }),
        finalize(() => (this.isCustomerLoading = false)),
      )
      .subscribe();
  }

  refreshPaymentPanel(): void {
    this.isPaymentLoading = true;
    this.dashboardService
      .getPaymentAnalytics(
        this.selectedPeriod,
        this.startDate,
        this.endDate,
        true,
      )
      .pipe(
        tap((res) => (this.paymentAnalytics = res?.data || res)),
        catchError((err) => {
          this.handleError('Refresh Payments', err);
          return of(null);
        }),
        finalize(() => (this.isPaymentLoading = false)),
      )
      .subscribe();
  }

  refreshForecastPanel(): void {
    this.isForecastLoading = true;
    this.dashboardService
      .getSalesForecast(this.selectedPeriod, this.startDate, this.endDate, true)
      .pipe(
        tap((res) => (this.salesForecast = res?.data || res)),
        catchError((err) => {
          this.handleError('Refresh Forecast', err);
          return of(null);
        }),
        finalize(() => (this.isForecastLoading = false)),
      )
      .subscribe();
  }

  // --- Filter handlers ---
  onFilterChange(): void {
    if (this.selectedPeriod !== 'custom') this.customDateRange = undefined;
    this.triggerRefresh();
  }

  onApplyCustomRange(): void {
    if (
      this.selectedPeriod === 'custom' &&
      this.customDateRange?.[0] &&
      this.customDateRange?.[1]
    ) {
      this.triggerRefresh();
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Range',
        detail: 'Please select a valid start and end date.',
      });
    }
  }

  triggerRefresh(): void {
    this.startDate = undefined;
    this.endDate = undefined;
    if (
      this.selectedPeriod === 'custom' &&
      this.customDateRange?.[0] &&
      this.customDateRange?.[1]
    ) {
      this.startDate = this.formatDate(this.customDateRange[0]);
      this.endDate = this.formatDate(this.customDateRange[1]);
    }
    this.refreshTrigger.next({
      period: this.selectedPeriod,
      startDate: this.startDate,
      endDate: this.endDate,
      limit: this.dataLimit,
    });
  }

  // Grid methods
  toggleLockGrid(): void {
    this.isGridLocked = !this.isGridLocked;
    if (this.grid) this.grid.setStatic(this.isGridLocked);
    this.messageService.add({
      severity: 'info',
      summary: 'Grid Status',
      detail: this.isGridLocked
        ? 'Dashboard is now locked.'
        : 'Dashboard is now unlocked.',
    });
  }

  saveLayout(): void {
    try {
      const serializedData = this.grid.save();
      localStorage.setItem(this.LAYOUT_KEY, JSON.stringify(serializedData));
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Dashboard layout saved!',
      });
    } catch (e) {
      this.messageService.add({
        severity: 'error',
        summary: 'Save Failed',
        detail: 'Unable to save layout.',
      });
    }
  }

  private loadLayout(): void {
    const saved = localStorage.getItem(this.LAYOUT_KEY);
    if (saved) {
      try {
        this.widgets = JSON.parse(saved);
      } catch (e) {
        /* ignore */
      }
    }
  }

  openDialog(title: string, data: any): void {
    this.selectedPanelTitle = title;
    this.selectedPanelData = data;
    this.showDialog = true;
  }

  identify(index: number, w: GridStackWidget) {
    return w.id;
  }
  private formatDate = (date: Date): string => date.toISOString().split('T')[0];

  private handleError(apiName: string, err: any) {
    console.error(apiName, err);
    this.messageService.add({
      severity: 'error',
      summary: `${apiName} Failed`,
      detail: err?.message || 'Unknown error',
    });
  }
}
// // src/app/features/dashboard/admin-dashboard.component.ts
// import { Component, OnInit, inject, ViewChild, AfterViewInit } from '@angular/core';
// import { trigger, state, style, animate, transition } from '@angular/animations';
// import { BehaviorSubject, concat, of } from 'rxjs';
// import { switchMap, catchError, finalize, map, tap } from 'rxjs/operators';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// // Gridstack
// import { GridstackComponent, GridstackItemComponent } from 'gridstack/dist/angular';
// import { GridStack, GridStackOptions, GridStackWidget } from 'gridstack';

// // PrimeNG Modules
// import { ButtonModule } from 'primeng/button';
// import { DropdownModule } from 'primeng/dropdown';
// import { SkeletonModule } from 'primeng/skeleton';
// import { CalendarModule } from 'primeng/calendar';
// import { MessageService } from 'primeng/api';
// import { ToastModule } from 'primeng/toast';
// import { PanelModule } from 'primeng/panel';
// import { DialogModule } from 'primeng/dialog';
// import { ToolbarModule } from 'primeng/toolbar';

// // Child components
// import { DashboardSummaryComponent } from '../components/dashboard-summary/dashboard-summary.component';
// import { DashboardChartComboComponent } from '../components/dashboard-chart-combo/dashboard-chart-combo.component';
// import { AnalyticDashboardComponent } from "../components/analytic-dashboard/analytic-dashboard.component";
// import { DashboardTopCustomerViewComponent } from "../components/dashboard-top-customer-view/dashboard-top-customer-view.component";
// import { PaymentanalyticsComponent } from "../components/paymentanalytics/paymentanalytics.component";
// import { SalesPerformanceComponent } from "../components/sales-performace/sales-performace.component";
// import { Select } from 'primeng/select';

// // Dashboard Service & Interfaces
// import { DashboardService } from '../../../core/services/dashboard.service';

// @Component({
//   selector: 'app-admin-dashboard',
//   standalone: true,
//   imports: [
//     CommonModule, FormsModule, ButtonModule, DropdownModule, SkeletonModule,
//     CalendarModule, ToastModule, PanelModule, DialogModule, ToolbarModule,
//     GridstackComponent, GridstackItemComponent, Select,
//     DashboardSummaryComponent, DashboardChartComboComponent, AnalyticDashboardComponent,
//     DashboardTopCustomerViewComponent, PaymentanalyticsComponent, SalesPerformanceComponent
//   ],
//   templateUrl: './admin-dashboard.component.html',
//   styleUrls: ['./admin-dashboard.component.css'],
//   providers: [MessageService],
//   animations: [
//     trigger('fadeIn', [
//       transition(':enter', [style({ opacity: 0 }), animate('0.5s ease', style({ opacity: 1 }))]),
//     ]),
//     trigger('panelAnimation', [
//       state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
//       transition('void => *', animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))),
//     ]),
//   ],
// })
// export class AdminDashboardComponent implements OnInit, AfterViewInit {
//   private dashboardService = inject(DashboardService);
//   private messageService = inject(MessageService);

//   @ViewChild(GridstackComponent) gridstackComponent!: GridstackComponent;
//   private grid!: GridStack;
//   public gridOptions: GridStackOptions = { margin: 10, float: true, cellHeight: '10rem' };
//   public isGridLocked = false;
//   private readonly LAYOUT_KEY = 'dashboardLayout_v3';

//   // UI state
//   isLoading = true;
//   showDialog = false;
//   selectedPanelTitle = '';
//   selectedPanelData: any;
//   showJson = false;

//   // Per-panel loading states (advanced feature)
//   isKpiLoading = false;
//   isChartsLoading = false;
//   isProductLoading = false;
//   isCustomerLoading = false;
//   isPaymentLoading = false;
//   isForecastLoading = false;

//   // Filters
//   public periodOptions: any[] = [
//     { label: 'Today', value: 'today' }, { label: 'Last 7 Days', value: 'last7days' },
//     { label: 'Last 30 Days', value: 'last30days' }, { label: 'This Month', value: 'thismonth' },
//     { label: 'This Year', value: 'thisyear' }, { label: 'Custom Range', value: 'custom' }
//   ];
//   public limitOptions: any[] = [
//     { label: 'Top 5', value: 5 }, { label: 'Top 10', value: 10 }, { label: 'Top 20', value: 20 }
//   ];
//   public selectedPeriod: string = 'last30days';
//   public dataLimit: number = 5;
//   public customDateRange: Date[] | undefined;
//   public startDate: string | undefined;
//   public endDate: string | undefined;

//   private refreshTrigger = new BehaviorSubject<{ period: string, startDate?: string, endDate?: string, limit: number }>({
//     period: this.selectedPeriod,
//     limit: this.dataLimit
//   });

//   // Data holders (populated sequentially)
//   enhancedKpiSummary: any;
//   kpiSummary: any;
//   overview: any;
//   productAnalytics: any;
//   customerAnalytics: any;
//   paymentAnalytics: any;
//   inventoryTurnover: any;
//   salesForecast: any;
//   salesTrends: any;
//   salesCharts: any;
//   yearlySales: any;
//   monthlySales: any;
//   weeklySales: any;

//   // Grid widgets (added more for completeness)
//   public widgets: GridStackWidget[] = [
//     { id: 'kpiSummary', x: 0, y: 0, w: 12, h: 2, content: 'KPI Summary' },
//     { id: 'chartsOverview', x: 0, y: 2, w: 12, h: 4, content: 'Charts Overview' },
//     { id: 'productAnalytics', x: 0, y: 6, w: 6, h: 5, content: 'Product Analytics' },
//     { id: 'customerAnalytics', x: 6, y: 6, w: 6, h: 5, content: 'Customer Analytics' },
//     { id: 'paymentAnalytics', x: 0, y: 11, w: 6, h: 5, content: 'Payment Analytics' },
//     { id: 'salesForecast', x: 6, y: 11, w: 6, h: 5, content: 'Sales Forecast' },
//   ];

//   ngOnInit(): void {
//     // on filter change / initial trigger -> start full sequential load
//     this.refreshTrigger.subscribe(() => this.loadDashboardSequential());
//     // initial trigger
//     this.triggerRefresh();
//   }

//   ngAfterViewInit(): void {
//     if (this.gridstackComponent?.grid) {
//       this.grid = this.gridstackComponent.grid;
//       this.loadLayout();
//     } else {
//       console.error('Dashboard grid could not be initialized.');
//       this.messageService.add({ severity: 'error', summary: 'Fatal Error', detail: 'Dashboard layout component failed to load.' });
//     }
//   }

//   private loadDashboardSequential(): void {
//     this.isLoading = true;

//     // Create the concat sequence of all API calls (each call uses cached value by default)
//     concat(
//       this.dashboardService.getEnhancedKpiSummary(this.selectedPeriod, this.startDate, this.endDate).pipe(
//         tap(res => (this.enhancedKpiSummary = (res && res.data) ? res.data : res)),
//         catchError(err => {
//           this.handleError('Enhanced KPI Summary', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getKpiSummary(this.selectedPeriod, this.startDate, this.endDate).pipe(
//         tap(res => (this.kpiSummary = (res && res.data) ? res.data : res)),
//         catchError(err => {
//           this.handleError('KPI Summary', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getDashboardOverview(this.selectedPeriod, this.startDate, this.endDate).pipe(
//         tap(res => (this.overview = (res && res.data) ? res.data : res)),
//         catchError(err => {
//           this.handleError('Overview', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getProductAnalytics(this.selectedPeriod, this.dataLimit, this.startDate, this.endDate).pipe(
//         tap(res => (this.productAnalytics = (res && res.data) ? res.data : res)),
//         catchError(err => {
//           this.handleError('Product Analytics', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getCustomerAnalytics(this.selectedPeriod, this.dataLimit, this.startDate, this.endDate).pipe(
//         tap(res => (this.customerAnalytics = (res && res.data) ? res.data : res)),
//         catchError(err => {
//           this.handleError('Customer Analytics', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getPaymentAnalytics(this.selectedPeriod, this.startDate, this.endDate).pipe(
//         tap(res => (this.paymentAnalytics = (res && res.data) ? res.data : res)),
//         catchError(err => {
//           this.handleError('Payment Analytics', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getInventoryTurnover(this.selectedPeriod, this.startDate, this.endDate).pipe(
//         tap(res => (this.inventoryTurnover = (res && res.data) ? res.data : res)),
//         catchError(err => {
//           this.handleError('Inventory Turnover', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getSalesForecast(this.selectedPeriod, this.startDate, this.endDate).pipe(
//         tap(res => (this.salesForecast = (res && res.data) ? res.data : res)),
//         catchError(err => {
//           this.handleError('Sales Forecast', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getSalesTrends(this.selectedPeriod, this.startDate, this.endDate).pipe(
//         tap(res => (this.salesTrends = (res && res.data) ? res.data : res)),
//         catchError(err => {
//           this.handleError('Sales Trends', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getSalesCharts(this.selectedPeriod, this.startDate, this.endDate).pipe(
//         tap(res => (this.salesCharts = (res && res.data) ? res.data : res)),
//         catchError(err => {
//           this.handleError('Sales Charts', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getYearlySales(this.selectedPeriod).pipe(
//         tap(res => (this.yearlySales = (res && res.data) ? res.data : res)),
//         catchError(err => {
//           this.handleError('Yearly Sales', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getMonthlySales(this.selectedPeriod).pipe(
//         tap(res => (this.monthlySales = (res && res.data) ? res.data : res)),
//         catchError(err => {
//           this.handleError('Monthly Sales', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getWeeklySales(this.selectedPeriod).pipe(
//         tap(res => (this.weeklySales = (res && res.data) ? res.data : res)),
//         catchError(err => {
//           this.handleError('Weekly Sales', err);
//           return of(null);
//         })
//       )
//     ).pipe(
//       finalize(() => {
//         this.isLoading = false;
//         this.messageService.add({ severity: 'success', summary: 'Dashboard', detail: 'Loaded dashboard data.' });
//       })
//     ).subscribe();
//   }

//   // --- Per-panel refresh methods (forceRefresh = true, with per-panel loading) ---
//   refreshKpiPanel(): void {
//     this.isKpiLoading = true;
//     concat(
//       this.dashboardService.getEnhancedKpiSummary(this.selectedPeriod, this.startDate, this.endDate, true).pipe(
//         tap(res => this.enhancedKpiSummary = (res && res.data) ? res.data : res),
//         catchError(err => {
//           this.handleError('Refresh Enhanced KPIs', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getKpiSummary(this.selectedPeriod, this.startDate, this.endDate, true).pipe(
//         tap(res => this.kpiSummary = (res && res.data) ? res.data : res),
//         catchError(err => {
//           this.handleError('Refresh KPI Summary', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getDashboardOverview(this.selectedPeriod, this.startDate, this.endDate, true).pipe(
//         tap(res => this.overview = (res && res.data) ? res.data : res),
//         catchError(err => {
//           this.handleError('Refresh Overview', err);
//           return of(null);
//         })
//       )
//     ).pipe(
//       finalize(() => this.isKpiLoading = false)
//     ).subscribe();
//   }

//   refreshChartsPanel(): void {
//     this.isChartsLoading = true;
//     concat(
//       this.dashboardService.getSalesTrends(this.selectedPeriod, this.startDate, this.endDate, true).pipe(
//         tap(res => this.salesTrends = (res && res.data) ? res.data : res),
//         catchError(err => {
//           this.handleError('Refresh Sales Trends', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getSalesCharts(this.selectedPeriod, this.startDate, this.endDate, true).pipe(
//         tap(res => this.salesCharts = (res && res.data) ? res.data : res),
//         catchError(err => {
//           this.handleError('Refresh Sales Charts', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getYearlySales(this.selectedPeriod, true).pipe(
//         tap(res => this.yearlySales = (res && res.data) ? res.data : res),
//         catchError(err => {
//           this.handleError('Refresh Yearly Sales', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getMonthlySales(this.selectedPeriod, true).pipe(
//         tap(res => this.monthlySales = (res && res.data) ? res.data : res),
//         catchError(err => {
//           this.handleError('Refresh Monthly Sales', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getWeeklySales(this.selectedPeriod, true).pipe(
//         tap(res => this.weeklySales = (res && res.data) ? res.data : res),
//         catchError(err => {
//           this.handleError('Refresh Weekly Sales', err);
//           return of(null);
//         })
//       )
//     ).pipe(
//       finalize(() => this.isChartsLoading = false)
//     ).subscribe();
//   }

//   refreshProductPanel(): void {
//     this.isProductLoading = true;
//     concat(
//       this.dashboardService.getProductAnalytics(this.selectedPeriod, this.dataLimit, this.startDate, this.endDate, true).pipe(
//         tap(res => this.productAnalytics = (res && res.data) ? res.data : res),
//         catchError(err => {
//           this.handleError('Refresh Products', err);
//           return of(null);
//         })
//       ),
//       this.dashboardService.getInventoryTurnover(this.selectedPeriod, this.startDate, this.endDate, true).pipe(
//         tap(res => this.inventoryTurnover = (res && res.data) ? res.data : res),
//         catchError(err => {
//           this.handleError('Refresh Inventory', err);
//           return of(null);
//         })
//       )
//     ).pipe(
//       finalize(() => this.isProductLoading = false)
//     ).subscribe();
//   }

//   refreshCustomerPanel(): void {
//     this.isCustomerLoading = true;
//     this.dashboardService.getCustomerAnalytics(this.selectedPeriod, this.dataLimit, this.startDate, this.endDate, true).pipe(
//       tap(res => this.customerAnalytics = (res && res.data) ? res.data : res),
//       catchError(err => {
//         this.handleError('Refresh Customers', err);
//         return of(null);
//       }),
//       finalize(() => this.isCustomerLoading = false)
//     ).subscribe();
//   }

//   refreshPaymentPanel(): void {
//     this.isPaymentLoading = true;
//     this.dashboardService.getPaymentAnalytics(this.selectedPeriod, this.startDate, this.endDate, true).pipe(
//       tap(res => this.paymentAnalytics = (res && res.data) ? res.data : res),
//       catchError(err => {
//         this.handleError('Refresh Payments', err);
//         return of(null);
//       }),
//       finalize(() => this.isPaymentLoading = false)
//     ).subscribe();
//   }

//   refreshForecastPanel(): void {
//     this.isForecastLoading = true;
//     this.dashboardService.getSalesForecast(this.selectedPeriod, this.startDate, this.endDate, true).pipe(
//       tap(res => this.salesForecast = (res && res.data) ? res.data : res),
//       catchError(err => {
//         this.handleError('Refresh Forecast', err);
//         return of(null);
//       }),
//       finalize(() => this.isForecastLoading = false)
//     ).subscribe();
//   }

//   // --- Filter handlers ---
//   onFilterChange(): void {
//     if (this.selectedPeriod !== 'custom') this.customDateRange = undefined;
//     this.triggerRefresh();
//   }

//   onApplyCustomRange(): void {
//     if (this.selectedPeriod === 'custom' && this.customDateRange?.[0] && this.customDateRange?.[1]) {
//       this.triggerRefresh();
//     } else {
//       this.messageService.add({ severity: 'warn', summary: 'Invalid Range', detail: 'Please select a valid start and end date.' });
//     }
//   }

//    triggerRefresh(): void {
//     this.startDate = undefined;
//     this.endDate = undefined;
//     if (this.selectedPeriod === 'custom' && this.customDateRange?.[0] && this.customDateRange?.[1]) {
//       this.startDate = this.formatDate(this.customDateRange[0]);
//       this.endDate = this.formatDate(this.customDateRange[1]);
//     }
//     this.refreshTrigger.next({ period: this.selectedPeriod, startDate: this.startDate, endDate: this.endDate, limit: this.dataLimit });
//   }

//   // Grid methods
//   toggleLockGrid(): void {
//     this.isGridLocked = !this.isGridLocked;
//     if (this.grid) this.grid.setStatic(this.isGridLocked);
//     this.messageService.add({ severity: 'info', summary: 'Grid Status', detail: this.isGridLocked ? 'Dashboard is now locked.' : 'Dashboard is now unlocked.' });
//   }

//   saveLayout(): void {
//     try {
//       const serializedData = this.grid.save();
//       localStorage.setItem(this.LAYOUT_KEY, JSON.stringify(serializedData));
//       this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Dashboard layout saved!' });
//     } catch (e) {
//       this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: 'Unable to save layout.' });
//     }
//   }

//   private loadLayout(): void {
//     const saved = localStorage.getItem(this.LAYOUT_KEY);
//     if (saved) {
//       try { this.widgets = JSON.parse(saved); } catch (e) { /* ignore */ }
//     }
//   }

//   openDialog(title: string, data: any): void {
//     this.selectedPanelTitle = title;
//     this.selectedPanelData = data;
//     this.showDialog = true;
//   }

//   identify(index: number, w: GridStackWidget) { return w.id; }
//   private formatDate = (date: Date): string => date.toISOString().split('T')[0];

//   private handleError(apiName: string, err: any) {
//     console.error(apiName, err);
//     this.messageService.add({ severity: 'error', summary: `${apiName} Failed`, detail: err?.message || 'Unknown error' });
//   }
// }

// // // src/app/features/dashboard/admin-dashboard.component.ts
// // import { Component, OnInit, inject, ViewChild, AfterViewInit } from '@angular/core';
// // import { trigger, state, style, animate, transition } from '@angular/animations';
// // import { BehaviorSubject, concat, of } from 'rxjs';
// // import { switchMap, catchError, finalize, map, tap } from 'rxjs/operators';
// // import { CommonModule } from '@angular/common';
// // import { FormsModule } from '@angular/forms';

// // // Gridstack
// // import { GridstackComponent, GridstackItemComponent } from 'gridstack/dist/angular';
// // import { GridStack, GridStackOptions, GridStackWidget } from 'gridstack';

// // // PrimeNG Modules
// // import { ButtonModule } from 'primeng/button';
// // import { DropdownModule } from 'primeng/dropdown';
// // import { SkeletonModule } from 'primeng/skeleton';
// // import { CalendarModule } from 'primeng/calendar';
// // import { MessageService } from 'primeng/api';
// // import { ToastModule } from 'primeng/toast';
// // import { PanelModule } from 'primeng/panel';
// // import { DialogModule } from 'primeng/dialog';
// // import { ToolbarModule } from 'primeng/toolbar';

// // // Child components
// // import { DashboardSummaryComponent } from '../components/dashboard-summary/dashboard-summary.component';
// // import { DashboardChartComboComponent } from '../components/dashboard-chart-combo/dashboard-chart-combo.component';
// // import { AnalyticDashboardComponent } from "../components/analytic-dashboard/analytic-dashboard.component";
// // import { DashboardTopCustomerViewComponent } from "../components/dashboard-top-customer-view/dashboard-top-customer-view.component";
// // import { PaymentanalyticsComponent } from "../components/paymentanalytics/paymentanalytics.component";
// // import { SalesPerformanceComponent } from "../components/sales-performace/sales-performace.component";
// // import { Select } from 'primeng/select';

// // // Dashboard Service & Interfaces
// // import { DashboardService } from '../../../core/services/dashboard.service';

// // @Component({
// //   selector: 'app-admin-dashboard',
// //   standalone: true,
// //   imports: [
// //     CommonModule, FormsModule, ButtonModule, DropdownModule, SkeletonModule,
// //     CalendarModule, ToastModule, PanelModule, DialogModule, ToolbarModule,
// //     GridstackComponent, GridstackItemComponent, Select,
// //     DashboardSummaryComponent, DashboardChartComboComponent, AnalyticDashboardComponent,
// //     DashboardTopCustomerViewComponent, PaymentanalyticsComponent, SalesPerformanceComponent
// //   ],
// //   templateUrl: './admin-dashboard.component.html',
// //   styleUrls: ['./admin-dashboard.component.css'],
// //   providers: [MessageService],
// //   animations: [
// //     trigger('fadeIn', [
// //       transition(':enter', [style({ opacity: 0 }), animate('0.5s ease', style({ opacity: 1 }))]),
// //     ]),
// //     trigger('panelAnimation', [
// //       state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
// //       transition('void => *', animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))),
// //     ]),
// //   ],
// // })
// // export class AdminDashboardComponent implements OnInit, AfterViewInit {
// //   private dashboardService = inject(DashboardService);
// //   private messageService = inject(MessageService);

// //   @ViewChild(GridstackComponent) gridstackComponent!: GridstackComponent;
// //   private grid!: GridStack;
// //   public gridOptions: GridStackOptions = { margin: 10, float: true, cellHeight: '10rem' };
// //   public isGridLocked = false;
// //   private readonly LAYOUT_KEY = 'dashboardLayout_v3';

// //   // UI state
// //   isLoading = true;
// //   showDialog = false;
// //   selectedPanelTitle = '';
// //   selectedPanelData: any;

// //   // Filters
// //   public periodOptions: any[] = [
// //     { label: 'Today', value: 'today' }, { label: 'Last 7 Days', value: 'last7days' },
// //     { label: 'Last 30 Days', value: 'last30days' }, { label: 'This Month', value: 'thismonth' },
// //     { label: 'This Year', value: 'thisyear' }, { label: 'Custom Range', value: 'custom' }
// //   ];
// //   public limitOptions: any[] = [
// //     { label: 'Top 5', value: 5 }, { label: 'Top 10', value: 10 }, { label: 'Top 20', value: 20 }
// //   ];
// //   public selectedPeriod: string = 'last30days';
// //   public dataLimit: number = 5;
// //   public customDateRange: Date[] | undefined;
// //   public startDate: string | undefined;
// //   public endDate: string | undefined;

// //   private refreshTrigger = new BehaviorSubject<{ period: string, startDate?: string, endDate?: string, limit: number }>({
// //     period: this.selectedPeriod,
// //     limit: this.dataLimit
// //   });

// //   // Data holders (populated sequentially)
// //   enhancedKpiSummary: any;
// //   kpiSummary: any;
// //   overview: any;
// //   productAnalytics: any;
// //   customerAnalytics: any;
// //   paymentAnalytics: any;
// //   inventoryTurnover: any;
// //   salesForecast: any;
// //   salesTrends: any;
// //   salesCharts: any;
// //   yearlySales: any;
// //   monthlySales: any;
// //   weeklySales: any;

// //   // Grid widgets
// //   public widgets: GridStackWidget[] = [
// //     { id: 'kpiSummary', x: 0, y: 0, w: 12, h: 2, content: 'KPI Summary' },
// //     { id: 'chartsOverview', x: 0, y: 2, w: 12, h: 4, content: 'Charts Overview' },
// //     { id: 'productAnalytics', x: 0, y: 6, w: 6, h: 5, content: 'Product Analytics' },
// //     { id: 'customerAnalytics', x: 6, y: 6, w: 6, h: 5, content: 'Customer Analytics' },
// //   ];

// //   ngOnInit(): void {
// //     // on filter change / initial trigger -> start full sequential load
// //     this.refreshTrigger.subscribe(() => this.loadDashboardSequential());
// //     // initial trigger
// //     this.triggerRefresh();
// //   }

// //   ngAfterViewInit(): void {
// //     if (this.gridstackComponent?.grid) {
// //       this.grid = this.gridstackComponent.grid;
// //       this.loadLayout();
// //     } else {
// //       console.error('Dashboard grid could not be initialized.');
// //       this.messageService.add({ severity: 'error', summary: 'Fatal Error', detail: 'Dashboard layout component failed to load.' });
// //     }
// //   }

// //   private loadDashboardSequential(): void {
// //     this.isLoading = true;

// //     // Create the concat sequence of all API calls (each call uses cached value by default)
// //     concat(
// //       this.dashboardService.getEnhancedKpiSummary(this.selectedPeriod, this.startDate, this.endDate).pipe(
// //         tap(res => (this.enhancedKpiSummary = (res && res.data) ? res.data : res)),
// //         catchError(err => {
// //           this.handleError('Enhanced KPI Summary', err);
// //           return of(null);
// //         })
// //       ),
// //       this.dashboardService.getKpiSummary(this.selectedPeriod, this.startDate, this.endDate).pipe(
// //         tap(res => (this.kpiSummary = (res && res.data) ? res.data : res)),
// //         catchError(err => {
// //           this.handleError('KPI Summary', err);
// //           return of(null);
// //         })
// //       ),
// //       this.dashboardService.getDashboardOverview(this.selectedPeriod, this.startDate, this.endDate).pipe(
// //         tap(res => (this.overview = (res && res.data) ? res.data : res)),
// //         catchError(err => {
// //           this.handleError('Overview', err);
// //           return of(null);
// //         })
// //       ),
// //       this.dashboardService.getProductAnalytics(this.selectedPeriod, this.dataLimit, this.startDate, this.endDate).pipe(
// //         tap(res => (this.productAnalytics = (res && res.data) ? res.data : res)),
// //         catchError(err => {
// //           this.handleError('Product Analytics', err);
// //           return of(null);
// //         })
// //       ),
// //       this.dashboardService.getCustomerAnalytics(this.selectedPeriod, this.dataLimit, this.startDate, this.endDate).pipe(
// //         tap(res => (this.customerAnalytics = (res && res.data) ? res.data : res)),
// //         catchError(err => {
// //           this.handleError('Customer Analytics', err);
// //           return of(null);
// //         })
// //       ),
// //       this.dashboardService.getPaymentAnalytics(this.selectedPeriod, this.startDate, this.endDate).pipe(
// //         tap(res => (this.paymentAnalytics = (res && res.data) ? res.data : res)),
// //         catchError(err => {
// //           this.handleError('Payment Analytics', err);
// //           return of(null);
// //         })
// //       ),
// //       this.dashboardService.getInventoryTurnover(this.selectedPeriod, this.startDate, this.endDate).pipe(
// //         tap(res => (this.inventoryTurnover = (res && res.data) ? res.data : res)),
// //         catchError(err => {
// //           this.handleError('Inventory Turnover', err);
// //           return of(null);
// //         })
// //       ),
// //       this.dashboardService.getSalesForecast(this.selectedPeriod, this.startDate, this.endDate).pipe(
// //         tap(res => (this.salesForecast = (res && res.data) ? res.data : res)),
// //         catchError(err => {
// //           this.handleError('Sales Forecast', err);
// //           return of(null);
// //         })
// //       ),
// //       this.dashboardService.getSalesTrends(this.selectedPeriod, this.startDate, this.endDate).pipe(
// //         tap(res => (this.salesTrends = (res && res.data) ? res.data : res)),
// //         catchError(err => {
// //           this.handleError('Sales Trends', err);
// //           return of(null);
// //         })
// //       ),
// //       this.dashboardService.getSalesCharts(this.selectedPeriod, this.startDate, this.endDate).pipe(
// //         tap(res => (this.salesCharts = (res && res.data) ? res.data : res)),
// //         catchError(err => {
// //           this.handleError('Sales Charts', err);
// //           return of(null);
// //         })
// //       ),
// //       this.dashboardService.getYearlySales(this.selectedPeriod).pipe(
// //         tap(res => (this.yearlySales = (res && res.data) ? res.data : res)),
// //         catchError(err => {
// //           this.handleError('Yearly Sales', err);
// //           return of(null);
// //         })
// //       ),
// //       this.dashboardService.getMonthlySales(this.selectedPeriod).pipe(
// //         tap(res => (this.monthlySales = (res && res.data) ? res.data : res)),
// //         catchError(err => {
// //           this.handleError('Monthly Sales', err);
// //           return of(null);
// //         })
// //       ),
// //       this.dashboardService.getWeeklySales(this.selectedPeriod).pipe(
// //         tap(res => (this.weeklySales = (res && res.data) ? res.data : res)),
// //         catchError(err => {
// //           this.handleError('Weekly Sales', err);
// //           return of(null);
// //         })
// //       )
// //     ).pipe(
// //       finalize(() => {
// //         this.isLoading = false;
// //         this.messageService.add({ severity: 'success', summary: 'Dashboard', detail: 'Loaded dashboard data.' });
// //       })
// //     ).subscribe();
// //   }

// //   // --- Per-panel refresh methods (forceRefresh = true) ---
// //   refreshKpi(): void {
// //     this.isLoading = true;
// //     this.dashboardService.getEnhancedKpiSummary(this.selectedPeriod, this.startDate, this.endDate, true).pipe(
// //       tap(res => this.enhancedKpiSummary = (res && res.data) ? res.data : res),
// //       finalize(() => this.isLoading = false),
// //       catchError(err => {
// //         this.handleError('Refresh KPIs', err);
// //         return of(null);
// //       })
// //     ).subscribe();
// //   }

// //   refreshProductAnalytics(): void {
// //     this.dashboardService.getProductAnalytics(this.selectedPeriod, this.dataLimit, this.startDate, this.endDate, true).pipe(
// //       tap(res => this.productAnalytics = (res && res.data) ? res.data : res),
// //       catchError(err => {
// //         this.handleError('Refresh Products', err);
// //         return of(null);
// //       })
// //     ).subscribe();
// //   }

// //   refreshCustomerAnalytics(): void {
// //     this.dashboardService.getCustomerAnalytics(this.selectedPeriod, this.dataLimit, this.startDate, this.endDate, true).pipe(
// //       tap(res => this.customerAnalytics = (res && res.data) ? res.data : res),
// //       catchError(err => {
// //         this.handleError('Refresh Customers', err);
// //         return of(null);
// //       })
// //     ).subscribe();
// //   }

// //   refreshPaymentAnalytics(): void {
// //     this.dashboardService.getPaymentAnalytics(this.selectedPeriod, this.startDate, this.endDate, true).pipe(
// //       tap(res => this.paymentAnalytics = (res && res.data) ? res.data : res),
// //       catchError(err => {
// //         this.handleError('Refresh Payments', err);
// //         return of(null);
// //       })
// //     ).subscribe();
// //   }

// //   refreshInventoryTurnover(): void {
// //     this.dashboardService.getInventoryTurnover(this.selectedPeriod, this.startDate, this.endDate, true).pipe(
// //       tap(res => this.inventoryTurnover = (res && res.data) ? res.data : res),
// //       catchError(err => {
// //         this.handleError('Refresh Inventory', err);
// //         return of(null);
// //       })
// //     ).subscribe();
// //   }

// //   refreshSalesForecast(): void {
// //     this.dashboardService.getSalesForecast(this.selectedPeriod, this.startDate, this.endDate, true).pipe(
// //       tap(res => this.salesForecast = (res && res.data) ? res.data : res),
// //       catchError(err => {
// //         this.handleError('Refresh Forecast', err);
// //         return of(null);
// //       })
// //     ).subscribe();
// //   }

// //   refreshSalesTrends(): void {
// //     this.dashboardService.getSalesTrends(this.selectedPeriod, this.startDate, this.endDate, true).pipe(
// //       tap(res => this.salesTrends = (res && res.data) ? res.data : res),
// //       catchError(err => {
// //         this.handleError('Refresh Sales Trends', err);
// //         return of(null);
// //       })
// //     ).subscribe();
// //   }

// //   // --- Filter handlers ---
// //   onFilterChange(): void {
// //     if (this.selectedPeriod !== 'custom') this.customDateRange = undefined;
// //     this.triggerRefresh();
// //   }

// //   onApplyCustomRange(): void {
// //     if (this.selectedPeriod === 'custom' && this.customDateRange?.[0] && this.customDateRange?.[1]) {
// //       this.triggerRefresh();
// //     } else {
// //       this.messageService.add({ severity: 'warn', summary: 'Invalid Range', detail: 'Please select a valid start and end date.' });
// //     }
// //   }

// //   private triggerRefresh(): void {
// //     this.startDate = undefined;
// //     this.endDate = undefined;
// //     if (this.selectedPeriod === 'custom' && this.customDateRange?.[0] && this.customDateRange?.[1]) {
// //       this.startDate = this.formatDate(this.customDateRange[0]);
// //       this.endDate = this.formatDate(this.customDateRange[1]);
// //     }
// //     this.refreshTrigger.next({ period: this.selectedPeriod, startDate: this.startDate, endDate: this.endDate, limit: this.dataLimit });
// //   }

// //   // Grid methods
// //   toggleLockGrid(): void {
// //     this.isGridLocked = !this.isGridLocked;
// //     if (this.grid) this.grid.setStatic(this.isGridLocked);
// //     this.messageService.add({ severity: 'info', summary: 'Grid Status', detail: this.isGridLocked ? 'Dashboard is now locked.' : 'Dashboard is now unlocked.' });
// //   }

// //   saveLayout(): void {
// //     try {
// //       const serializedData = this.grid.save();
// //       localStorage.setItem(this.LAYOUT_KEY, JSON.stringify(serializedData));
// //       this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Dashboard layout saved!' });
// //     } catch (e) {
// //       this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: 'Unable to save layout.' });
// //     }
// //   }

// //   private loadLayout(): void {
// //     const saved = localStorage.getItem(this.LAYOUT_KEY);
// //     if (saved) {
// //       try { this.widgets = JSON.parse(saved); } catch (e) { /* ignore */ }
// //     }
// //   }

// //   openDialog(title: string, data: any): void {
// //     this.selectedPanelTitle = title;
// //     this.selectedPanelData = data;
// //     this.showDialog = true;
// //   }

// //   identify(index: number, w: GridStackWidget) { return w.id; }
// //   private formatDate = (date: Date): string => date.toISOString().split('T')[0];

// //   private handleError(apiName: string, err: any) {
// //     console.error(apiName, err);
// //     this.messageService.add({ severity: 'error', summary: `${apiName} Failed`, detail: err?.message || 'Unknown error' });
// //   }
// // }
