import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridstackComponent, GridstackItemComponent } from 'gridstack/dist/angular';
import { GridStack, GridStackOptions, GridStackWidget } from 'gridstack';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { TableModule } from 'primeng/table';
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
    MessageModule,
    ProgressSpinnerModule,
    GridstackComponent,
    GridstackItemComponent,
    Select,
    NgxChartsModule,
    TableModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [style({ opacity: 0 }), animate('0.5s ease', style({ opacity: 1 }))]),
    ]),
    trigger('panelAnimation', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition('void => *', animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))),
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
    resizable: { handles: 'all' },
    column: 12,
    columnOpts: { breakpoints: [{ w: 1024, c: 8 }, { w: 640, c: 4 }] },
    minRow: 1,
    alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  };
  public isGridLocked = false;
  private readonly LAYOUT_KEY = 'dashboardLayout_v3';

  isLoading = true;
  showDialog = false;
  selectedPanelTitle = '';
  selectedPanelData: any;
  showJson = false;
  error: { [key: string]: string | null } = {};

  isKpiLoading = false;
  isChartsLoading = false;
  isProductLoading = false;
  isCustomerLoading = false;
  isPaymentLoading = false;
  isForecastLoading = false;

  periodOptions: any[] = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'This Month', value: 'thismonth' },
    { label: 'This Year', value: 'thisyear' },
    { label: 'Custom Range', value: 'custom' },
  ];
  limitOptions: any[] = [
    { label: 'Top 5', value: 5 },
    { label: 'Top 10', value: 10 },
    { label: 'Top 20', value: 20 },
  ];
  selectedPeriod: string = 'last30days';
  dataLimit: number = 5;
  customDateRange: Date[] | undefined;
  startDate: string | undefined;
  endDate: string | undefined;

  private refreshTrigger = new BehaviorSubject<{
    period: string;
    startDate?: string;
    endDate?: string;
    limit: number;
  }>({ period: this.selectedPeriod, limit: this.dataLimit });

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
// Add these properties to the class:
paymentMethodsData: any[] = [];
collectionTrendsData: any[] = [];
paymentColorScheme: Color = {
  name: 'payment',
  selectable: true,
  group: ScaleType.Ordinal,
  domain: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
};

  revenueTrendData: any[] = [];
  categoryData: any[] = [];
  chartView: [number, number] = [600, 300];
  showXAxis = true;
  showYAxis = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  revenueColorScheme: Color = {
    name: 'revenue',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3b82f6'],
  };
  categoryColorScheme: Color = {
    name: 'category',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  };

  public widgets: GridStackWidget[] = [
    { id: 'kpiSummary', x: 0, y: 0, w: 12, h: 2, minH: 2, maxH: 4, content: 'KPI Summary' },
    { id: 'chartsOverview', x: 0, y: 2, w: 12, h: 4, minH: 3, maxH: 6, content: 'Charts Overview' },
    { id: 'productAnalytics', x: 0, y: 6, w: 6, h: 5, minH: 4, maxH: 8, content: 'Product Analytics' },
    { id: 'customerAnalytics', x: 6, y: 6, w: 6, h: 5, minH: 4, maxH: 8, content: 'Customer Analytics' },
    { id: 'paymentAnalytics', x: 0, y: 11, w: 6, h: 5, minH: 4, maxH: 8, content: 'Payment Analytics' },
    { id: 'salesForecast', x: 6, y: 11, w: 6, h: 5, minH: 4, maxH: 8, content: 'Sales Forecast' },
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
      this.handleError('Dashboard grid could not be initialized.', 'Grid Initialization', 'global');
    }
  }

  // private updateChartData(): void {
  //   if (this.enhancedKpiSummary?.charts?.revenueTrend) {
  //     this.revenueTrendData = [
  //       {
  //         name: 'Revenue',
  //         series: this.enhancedKpiSummary.charts.revenueTrend.map((item: any) => ({
  //           name: item._id,
  //           value: item.dailyRevenue,
  //         })),
  //       },
  //     ];
  //   }
  //   if (this.productAnalytics?.performanceByCategory) {
  //     this.categoryData = this.productAnalytics.performanceByCategory.map((item: any) => ({
  //       name: item._id.split(',')[1] || item._id,
  //       value: item.totalRevenue,
  //     }));
  //   }
  // }

  // Update updateChartData method:
private updateChartData(): void {
  if (this.enhancedKpiSummary?.charts?.revenueTrend) {
    this.revenueTrendData = [
      {
        name: 'Revenue',
        series: this.enhancedKpiSummary.charts.revenueTrend.map((item: any) => ({
          name: item._id,
          value: item.dailyRevenue,
        })),
      },
    ];
  }
  if (this.productAnalytics?.performanceByCategory) {
    this.categoryData = this.productAnalytics.performanceByCategory.map((item: any) => ({
      name: item._id.split(',')[1] || item._id,
      value: item.totalRevenue,
    }));
  }
  // New: Process payment analytics
  if (this.paymentAnalytics?.paymentMethods) {
    this.paymentMethodsData = this.paymentAnalytics.paymentMethods.map((item: any) => ({
      name: item._id.replace('_', ' ').toUpperCase(),
      value: item.totalAmount,
    }));
  }
  if (this.paymentAnalytics?.collectionTrends) {
    this.collectionTrendsData = [
      {
        name: 'Collection',
        series: this.paymentAnalytics.collectionTrends.map((item: any) => ({
          name: item._id,
          value: item.dailyTotal,
        })),
      },
    ];
  }
}

  private loadDashboardData(forceRefresh = false): void {
    this.isLoading = true;
    this.isKpiLoading = true;
    this.isChartsLoading = true;
    this.isProductLoading = true;
    this.isCustomerLoading = true;
    this.isPaymentLoading = true;
    this.isForecastLoading = true;

    forkJoin([
      this.dashboardService
        .getEnhancedKpiSummary(this.selectedPeriod, this.startDate, this.endDate, forceRefresh)
        .pipe(
          tap((res) => (this.enhancedKpiSummary = res?.data || res)),
          catchError((err) => { this.handleError('Enhanced KPI Summary', err, 'kpiSummary'); return of(null); })
        ),
      this.dashboardService
        .getKpiSummary(this.selectedPeriod, this.startDate, this.endDate, forceRefresh)
        .pipe(
          tap((res) => (this.kpiSummary = res?.data || res)),
          catchError((err) => { this.handleError('KPI Summary', err, 'kpiSummary'); return of(null); })
        ),
      this.dashboardService
        .getDashboardOverview(this.selectedPeriod, this.startDate, this.endDate, forceRefresh)
        .pipe(
          tap((res) => (this.overview = res?.data || res)),
          catchError((err) => { this.handleError('Overview', err, 'kpiSummary'); return of(null); })
        ),
      this.dashboardService
        .getProductAnalytics(this.selectedPeriod, this.dataLimit, this.startDate, this.endDate, forceRefresh)
        .pipe(
          tap((res) => (this.productAnalytics = res?.data || res)),
          catchError((err) => { this.handleError('Product Analytics', err, 'productAnalytics'); return of(null); })
        ),
      this.dashboardService
        .getCustomerAnalytics(this.selectedPeriod, this.dataLimit, this.startDate, this.endDate, forceRefresh)
        .pipe(
          tap((res) => (this.customerAnalytics = res?.data || res)),
          catchError((err) => { this.handleError('Customer Analytics', err, 'customerAnalytics'); return of(null); })
        ),
      this.dashboardService
        .getPaymentAnalytics(this.selectedPeriod, this.startDate, this.endDate, forceRefresh)
        .pipe(
          tap((res) => (this.paymentAnalytics = res?.data || res)),
          catchError((err) => { this.handleError('Payment Analytics', err, 'paymentAnalytics'); return of(null); })
        ),
      this.dashboardService
        .getInventoryTurnover(this.selectedPeriod, this.startDate, this.endDate, forceRefresh)
        .pipe(
          tap((res) => (this.inventoryTurnover = res?.data || res)),
          catchError((err) => { this.handleError('Inventory Turnover', err, 'productAnalytics'); return of(null); })
        ),
      this.dashboardService
        .getSalesForecast(this.selectedPeriod, this.startDate, this.endDate, forceRefresh)
        .pipe(
          tap((res) => (this.salesForecast = res?.data || res)),
          catchError((err) => { this.handleError('Sales Forecast', err, 'salesForecast'); return of(null); })
        ),
      this.dashboardService
        .getSalesTrends(this.selectedPeriod, this.startDate, this.endDate, forceRefresh)
        .pipe(
          tap((res) => (this.salesTrends = res?.data || res)),
          catchError((err) => { this.handleError('Sales Trends', err, 'chartsOverview'); return of(null); })
        ),
      this.dashboardService
        .getSalesCharts(this.selectedPeriod, this.startDate, this.endDate, forceRefresh)
        .pipe(
          tap((res) => (this.salesCharts = res?.data || res)),
          catchError((err) => { this.handleError('Sales Charts', err, 'chartsOverview'); return of(null); })
        ),
      this.dashboardService
        .getYearlySales(this.selectedPeriod, forceRefresh)
        .pipe(
          tap((res) => (this.yearlySales = res?.data || res)),
          catchError((err) => { this.handleError('Yearly Sales', err, 'chartsOverview'); return of(null); })
        ),
      this.dashboardService
        .getMonthlySales(this.selectedPeriod, forceRefresh)
        .pipe(
          tap((res) => (this.monthlySales = res?.data || res)),
          catchError((err) => { this.handleError('Monthly Sales', err, 'chartsOverview'); return of(null); })
        ),
      this.dashboardService
        .getWeeklySales(this.selectedPeriod, forceRefresh)
        .pipe(
          tap((res) => (this.weeklySales = res?.data || res)),
          catchError((err) => { this.handleError('Weekly Sales', err, 'chartsOverview'); return of(null); })
        ),
    ])
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.isKpiLoading = false;
          this.isChartsLoading = false;
          this.isProductLoading = false;
          this.isCustomerLoading = false;
          this.isPaymentLoading = false;
          this.isForecastLoading = false;
          this.updateChartData();
          this.messageService.add({ severity: 'success', summary: 'Dashboard', detail: 'Loaded dashboard data.' });
        })
      )
      .subscribe();
  }

  refreshKpiPanel(): void {
    this.isKpiLoading = true;
    this.error['kpiSummary'] = null;
    forkJoin([
      this.dashboardService
        .getEnhancedKpiSummary(this.selectedPeriod, this.startDate, this.endDate, true)
        .pipe(
          tap((res) => (this.enhancedKpiSummary = res?.data || res)),
          catchError((err) => { this.handleError('Refresh Enhanced KPIs', err, 'kpiSummary'); return of(null); })
        ),
      this.dashboardService
        .getKpiSummary(this.selectedPeriod, this.startDate, this.endDate, true)
        .pipe(
          tap((res) => (this.kpiSummary = res?.data || res)),
          catchError((err) => { this.handleError('Refresh KPI Summary', err, 'kpiSummary'); return of(null); })
        ),
      this.dashboardService
        .getDashboardOverview(this.selectedPeriod, this.startDate, this.endDate, true)
        .pipe(
          tap((res) => (this.overview = res?.data || res)),
          catchError((err) => { this.handleError('Refresh Overview', err, 'kpiSummary'); return of(null); })
        ),
    ])
      .pipe(finalize(() => { this.isKpiLoading = false; this.updateChartData(); }))
      .subscribe();
  }

  refreshChartsPanel(): void {
    this.isChartsLoading = true;
    this.error['chartsOverview'] = null;
    forkJoin([
      this.dashboardService
        .getSalesTrends(this.selectedPeriod, this.startDate, this.endDate, true)
        .pipe(
          tap((res) => (this.salesTrends = res?.data || res)),
          catchError((err) => { this.handleError('Refresh Sales Trends', err, 'chartsOverview'); return of(null); })
        ),
      this.dashboardService
        .getSalesCharts(this.selectedPeriod, this.startDate, this.endDate, true)
        .pipe(
          tap((res) => (this.salesCharts = res?.data || res)),
          catchError((err) => { this.handleError('Refresh Sales Charts', err, 'chartsOverview'); return of(null); })
        ),
      this.dashboardService.getYearlySales(this.selectedPeriod, true).pipe(
        tap((res) => (this.yearlySales = res?.data || res)),
        catchError((err) => { this.handleError('Refresh Yearly Sales', err, 'chartsOverview'); return of(null); })
      ),
      this.dashboardService.getMonthlySales(this.selectedPeriod, true).pipe(
        tap((res) => (this.monthlySales = res?.data || res)),
        catchError((err) => { this.handleError('Refresh Monthly Sales', err, 'chartsOverview'); return of(null); })
      ),
      this.dashboardService.getWeeklySales(this.selectedPeriod, true).pipe(
        tap((res) => (this.weeklySales = res?.data || res)),
        catchError((err) => { this.handleError('Refresh Weekly Sales', err, 'chartsOverview'); return of(null); })
      ),
    ])
      .pipe(finalize(() => { this.isChartsLoading = false; this.updateChartData(); }))
      .subscribe();
  }

  refreshProductPanel(): void {
    this.isProductLoading = true;
    this.error['productAnalytics'] = null;
    forkJoin([
      this.dashboardService
        .getProductAnalytics(this.selectedPeriod, this.dataLimit, this.startDate, this.endDate, true)
        .pipe(
          tap((res) => (this.productAnalytics = res?.data || res)),
          catchError((err) => { this.handleError('Refresh Products', err, 'productAnalytics'); return of(null); })
        ),
      this.dashboardService
        .getInventoryTurnover(this.selectedPeriod, this.startDate, this.endDate, true)
        .pipe(
          tap((res) => (this.inventoryTurnover = res?.data || res)),
          catchError((err) => { this.handleError('Refresh Inventory', err, 'productAnalytics'); return of(null); })
        ),
    ])
      .pipe(finalize(() => { this.isProductLoading = false; this.updateChartData(); }))
      .subscribe();
  }

  refreshCustomerPanel(): void {
    this.isCustomerLoading = true;
    this.error['customerAnalytics'] = null;
    this.dashboardService
      .getCustomerAnalytics(this.selectedPeriod, this.dataLimit, this.startDate, this.endDate, true)
      .pipe(
        tap((res) => (this.customerAnalytics = res?.data || res)),
        catchError((err) => { this.handleError('Refresh Customers', err, 'customerAnalytics'); return of(null); }),
        finalize(() => { this.isCustomerLoading = false; })
      )
      .subscribe();
  }

  refreshPaymentPanel(): void {
    this.isPaymentLoading = true;
    this.error['paymentAnalytics'] = null;
    this.dashboardService
      .getPaymentAnalytics(this.selectedPeriod, this.startDate, this.endDate, true)
      .pipe(
        tap((res) => (this.paymentAnalytics = res?.data || res)),
        catchError((err) => { this.handleError('Refresh Payments', err, 'paymentAnalytics'); return of(null); }),
        finalize(() => { this.isPaymentLoading = false; })
      )
      .subscribe();
  }

  refreshForecastPanel(): void {
    this.isForecastLoading = true;
    this.error['salesForecast'] = null;
    this.dashboardService
      .getSalesForecast(this.selectedPeriod, this.startDate, this.endDate, true)
      .pipe(
        tap((res) => (this.salesForecast = res?.data || res)),
        catchError((err) => { this.handleError('Refresh Forecast', err, 'salesForecast'); return of(null); }),
        finalize(() => { this.isForecastLoading = false; })
      )
      .subscribe();
  }

  refreshWidget(widgetId: string): void {
    switch (widgetId) {
      case 'kpiSummary': this.refreshKpiPanel(); break;
      case 'chartsOverview': this.refreshChartsPanel(); break;
      case 'productAnalytics': this.refreshProductPanel(); break;
      case 'customerAnalytics': this.refreshCustomerPanel(); break;
      case 'paymentAnalytics': this.refreshPaymentPanel(); break;
      case 'salesForecast': this.refreshForecastPanel(); break;
    }
  }

  onFilterChange(): void {
    if (this.selectedPeriod !== 'custom') this.customDateRange = undefined;
    this.triggerRefresh();
  }

  onApplyCustomRange(): void {
    if (this.selectedPeriod === 'custom' && this.customDateRange?.[0] && this.customDateRange?.[1]) {
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
    if (this.selectedPeriod === 'custom' && this.customDateRange?.[0] && this.customDateRange?.[1]) {
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

  toggleLockGrid(): void {
    this.isGridLocked = !this.isGridLocked;
    if (this.grid) this.grid.setStatic(this.isGridLocked);
    this.messageService.add({
      severity: 'info',
      summary: 'Grid Status',
      detail: this.isGridLocked ? 'Dashboard is now locked.' : 'Dashboard is now unlocked.',
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
    return w.id ?? `widget-${index}`;
  }

  private formatDate = (date: Date): string => date.toISOString().split('T')[0];

  private handleError(apiName: string, err: any, widgetId: string) {
    this.error[widgetId] = err?.message || 'Unknown error';
    this.messageService.add({
      severity: 'error',
      summary: `${apiName} Failed`,
      // detail: this.error[widgetId],
    });
  }
}

// import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
// import { trigger, state, style, animate, transition } from '@angular/animations';
// import { BehaviorSubject, forkJoin, of } from 'rxjs';
// import { catchError, finalize, tap } from 'rxjs/operators';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { GridstackComponent, GridstackItemComponent } from 'gridstack/dist/angular';
// import { GridStack, GridStackOptions, GridStackWidget } from 'gridstack';
// import { ButtonModule } from 'primeng/button';
// import { DropdownModule } from 'primeng/dropdown';
// import { SkeletonModule } from 'primeng/skeleton';
// import { CalendarModule } from 'primeng/calendar';
// import { MessageService } from 'primeng/api';
// import { ToastModule } from 'primeng/toast';
// import { PanelModule } from 'primeng/panel';
// import { DialogModule } from 'primeng/dialog';
// import { ToolbarModule } from 'primeng/toolbar';
// import { MessageModule } from 'primeng/message';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { Select } from 'primeng/select';
// import { NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
// import { TableModule } from 'primeng/table';
// import { DashboardService } from '../../../core/services/dashboard.service';
// import { Color } from '@swimlane/ngx-charts';


// @Component({
//   selector: 'app-admin-dashboard',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ButtonModule,
//     DropdownModule,
//     SkeletonModule,
//     CalendarModule,
//     ToastModule,
//     PanelModule,
//     DialogModule,
//     ToolbarModule,
//     MessageModule,
//     ProgressSpinnerModule,
//     GridstackComponent,
//     GridstackItemComponent,
//     Select,
//     NgxChartsModule,
//     TableModule,
//   ],
//   templateUrl: './admin-dashboard.component.html',
//   styleUrls: ['./admin-dashboard.component.css'],
//   providers: [MessageService],
//   changeDetection: ChangeDetectionStrategy.OnPush,
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
//   public gridOptions: GridStackOptions = {
//     margin: 10,
//     float: true,
//     cellHeight: '10rem',
//     resizable: { handles: 'all' },
//     column: 12,
//     columnOpts: { breakpoints: [{ w: 1024, c: 8 }, { w: 640, c: 4 }] },
//     minRow: 1,
//     alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
//   };
//   public isGridLocked = false;
//   private readonly LAYOUT_KEY = 'dashboardLayout_v3';

//   isLoading = true;
//   showDialog = false;
//   selectedPanelTitle = '';
//   selectedPanelData: any;
//   showJson = false;
//   error: { [key: string]: string | null } = {};

//   isKpiLoading = false;
//   isChartsLoading = false;
//   isProductLoading = false;
//   isCustomerLoading = false;
//   isPaymentLoading = false;
//   isForecastLoading = false;

//   periodOptions: any[] = [
//     { label: 'Today', value: 'today' },
//     { label: 'Last 7 Days', value: 'last7days' },
//     { label: 'Last 30 Days', value: 'last30days' },
//     { label: 'This Month', value: 'thismonth' },
//     { label: 'This Year', value: 'thisyear' },
//     { label: 'Custom Range', value: 'custom' },
//   ];
//   limitOptions: any[] = [
//     { label: 'Top 5', value: 5 },
//     { label: 'Top 10', value: 10 },
//     { label: 'Top 20', value: 20 },
//   ];
//   selectedPeriod: string = 'last30days';
//   dataLimit: number = 5;
//   customDateRange: Date[] | undefined;
//   startDate: string | undefined;
//   endDate: string | undefined;

//   private refreshTrigger = new BehaviorSubject<{
//     period: string;
//     startDate?: string;
//     endDate?: string;
//     limit: number;
//   }>({ period: this.selectedPeriod, limit: this.dataLimit });


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

//   revenueTrendData: any[] = [];
//   categoryData: any[] = [];
//   chartView: [number, number] = [600, 300];
//   showXAxis = true;
//   showYAxis = true;
//   showXAxisLabel = true;
//   showYAxisLabel = true;
//   revenueColorScheme: Color = {
//     domain: ['#5AA454', '#E44D25', '#CFC0BB'],
//     name: '',
//     selectable: false,
//     group: ScaleType.Time
//   };
//   categoryColorScheme = { domain: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] };

//   public widgets: GridStackWidget[] = [
//     { id: 'kpiSummary', x: 0, y: 0, w: 12, h: 2, minH: 2, maxH: 4, content: 'KPI Summary' },
//     { id: 'chartsOverview', x: 0, y: 2, w: 12, h: 4, minH: 3, maxH: 6, content: 'Charts Overview' },
//     { id: 'productAnalytics', x: 0, y: 6, w: 6, h: 5, minH: 4, maxH: 8, content: 'Product Analytics' },
//     { id: 'customerAnalytics', x: 6, y: 6, w: 6, h: 5, minH: 4, maxH: 8, content: 'Customer Analytics' },
//     { id: 'paymentAnalytics', x: 0, y: 11, w: 6, h: 5, minH: 4, maxH: 8, content: 'Payment Analytics' },
//     { id: 'salesForecast', x: 6, y: 11, w: 6, h: 5, minH: 4, maxH: 8, content: 'Sales Forecast' },
//   ];

//   ngOnInit(): void {
//     this.refreshTrigger.subscribe(() => this.loadDashboardData());
//     this.triggerRefresh();
//   }

//   ngAfterViewInit(): void {
//     if (this.gridstackComponent?.grid) {
//       this.grid = this.gridstackComponent.grid;
//       this.loadLayout();
//     } else {
//       this.handleError('Dashboard grid could not be initialized.', 'Grid Initialization', 'global');
//     }
//   }

//   private updateChartData(): void {
//     if (this.enhancedKpiSummary?.charts?.revenueTrend) {
//       this.revenueTrendData = [
//         {
//           name: 'Revenue',
//           series: this.enhancedKpiSummary.charts.revenueTrend.map((item: any) => ({
//             name: item._id,
//             value: item.dailyRevenue,
//           })),
//         },
//       ];
//     }
//     if (this.productAnalytics?.performanceByCategory) {
//       this.categoryData = this.productAnalytics.performanceByCategory.map((item: any) => ({
//         name: item._id.split(',')[1] || item._id,
//         value: item.totalRevenue,
//       }));
//     }
//   }

//   private loadDashboardData(forceRefresh = false): void {
//     this.isLoading = true;
//     this.isKpiLoading = true;
//     this.isChartsLoading = true;
//     this.isProductLoading = true;
//     this.isCustomerLoading = true;
//     this.isPaymentLoading = true;
//     this.isForecastLoading = true;

//     forkJoin([
//       this.dashboardService
//         .getEnhancedKpiSummary(this.selectedPeriod, this.startDate, this.endDate, forceRefresh)
//         .pipe(
//           tap((res) => (this.enhancedKpiSummary = res?.data || res)),
//           catchError((err) => { this.handleError('Enhanced KPI Summary', err, 'kpiSummary'); return of(null); })
//         ),
//       this.dashboardService
//         .getKpiSummary(this.selectedPeriod, this.startDate, this.endDate, forceRefresh)
//         .pipe(
//           tap((res) => (this.kpiSummary = res?.data || res)),
//           catchError((err) => { this.handleError('KPI Summary', err, 'kpiSummary'); return of(null); })
//         ),
//       this.dashboardService
//         .getDashboardOverview(this.selectedPeriod, this.startDate, this.endDate, forceRefresh)
//         .pipe(
//           tap((res) => (this.overview = res?.data || res)),
//           catchError((err) => { this.handleError('Overview', err, 'kpiSummary'); return of(null); })
//         ),
//       this.dashboardService
//         .getProductAnalytics(this.selectedPeriod, this.dataLimit, this.startDate, this.endDate, forceRefresh)
//         .pipe(
//           tap((res) => (this.productAnalytics = res?.data || res)),
//           catchError((err) => { this.handleError('Product Analytics', err, 'productAnalytics'); return of(null); })
//         ),
//       this.dashboardService
//         .getCustomerAnalytics(this.selectedPeriod, this.dataLimit, this.startDate, this.endDate, forceRefresh)
//         .pipe(
//           tap((res) => (this.customerAnalytics = res?.data || res)),
//           catchError((err) => { this.handleError('Customer Analytics', err, 'customerAnalytics'); return of(null); })
//         ),
//       this.dashboardService
//         .getPaymentAnalytics(this.selectedPeriod, this.startDate, this.endDate, forceRefresh)
//         .pipe(
//           tap((res) => (this.paymentAnalytics = res?.data || res)),
//           catchError((err) => { this.handleError('Payment Analytics', err, 'paymentAnalytics'); return of(null); })
//         ),
//       this.dashboardService
//         .getInventoryTurnover(this.selectedPeriod, this.startDate, this.endDate, forceRefresh)
//         .pipe(
//           tap((res) => (this.inventoryTurnover = res?.data || res)),
//           catchError((err) => { this.handleError('Inventory Turnover', err, 'productAnalytics'); return of(null); })
//         ),
//       this.dashboardService
//         .getSalesForecast(this.selectedPeriod, this.startDate, this.endDate, forceRefresh)
//         .pipe(
//           tap((res) => (this.salesForecast = res?.data || res)),
//           catchError((err) => { this.handleError('Sales Forecast', err, 'salesForecast'); return of(null); })
//         ),
//       this.dashboardService
//         .getSalesTrends(this.selectedPeriod, this.startDate, this.endDate, forceRefresh)
//         .pipe(
//           tap((res) => (this.salesTrends = res?.data || res)),
//           catchError((err) => { this.handleError('Sales Trends', err, 'chartsOverview'); return of(null); })
//         ),
//       this.dashboardService
//         .getSalesCharts(this.selectedPeriod, this.startDate, this.endDate, forceRefresh)
//         .pipe(
//           tap((res) => (this.salesCharts = res?.data || res)),
//           catchError((err) => { this.handleError('Sales Charts', err, 'chartsOverview'); return of(null); })
//         ),
//       this.dashboardService
//         .getYearlySales(this.selectedPeriod, forceRefresh)
//         .pipe(
//           tap((res) => (this.yearlySales = res?.data || res)),
//           catchError((err) => { this.handleError('Yearly Sales', err, 'chartsOverview'); return of(null); })
//         ),
//       this.dashboardService
//         .getMonthlySales(this.selectedPeriod, forceRefresh)
//         .pipe(
//           tap((res) => (this.monthlySales = res?.data || res)),
//           catchError((err) => { this.handleError('Monthly Sales', err, 'chartsOverview'); return of(null); })
//         ),
//       this.dashboardService
//         .getWeeklySales(this.selectedPeriod, forceRefresh)
//         .pipe(
//           tap((res) => (this.weeklySales = res?.data || res)),
//           catchError((err) => { this.handleError('Weekly Sales', err, 'chartsOverview'); return of(null); })
//         ),
//     ])
//       .pipe(
//         finalize(() => {
//           this.isLoading = false;
//           this.isKpiLoading = false;
//           this.isChartsLoading = false;
//           this.isProductLoading = false;
//           this.isCustomerLoading = false;
//           this.isPaymentLoading = false;
//           this.isForecastLoading = false;
//           this.updateChartData();
//           this.messageService.add({ severity: 'success', summary: 'Dashboard', detail: 'Loaded dashboard data.' });
//         })
//       )
//       .subscribe();
//   }

//   refreshKpiPanel(): void {
//     this.isKpiLoading = true;
//     forkJoin([
//       this.dashboardService
//         .getEnhancedKpiSummary(this.selectedPeriod, this.startDate, this.endDate, true)
//         .pipe(
//           tap((res) => (this.enhancedKpiSummary = res?.data || res)),
//           catchError((err) => { this.handleError('Refresh Enhanced KPIs', err, 'kpiSummary'); return of(null); })
//         ),
//       this.dashboardService
//         .getKpiSummary(this.selectedPeriod, this.startDate, this.endDate, true)
//         .pipe(
//           tap((res) => (this.kpiSummary = res?.data || res)),
//           catchError((err) => { this.handleError('Refresh KPI Summary', err, 'kpiSummary'); return of(null); })
//         ),
//       this.dashboardService
//         .getDashboardOverview(this.selectedPeriod, this.startDate, this.endDate, true)
//         .pipe(
//           tap((res) => (this.overview = res?.data || res)),
//           catchError((err) => { this.handleError('Refresh Overview', err, 'kpiSummary'); return of(null); })
//         ),
//     ])
//       .pipe(finalize(() => { this.isKpiLoading = false; this.updateChartData(); }))
//       .subscribe();
//   }

//   refreshChartsPanel(): void {
//     this.isChartsLoading = true;
//     forkJoin([
//       this.dashboardService
//         .getSalesTrends(this.selectedPeriod, this.startDate, this.endDate, true)
//         .pipe(
//           tap((res) => (this.salesTrends = res?.data || res)),
//           catchError((err) => { this.handleError('Refresh Sales Trends', err, 'chartsOverview'); return of(null); })
//         ),
//       this.dashboardService
//         .getSalesCharts(this.selectedPeriod, this.startDate, this.endDate, true)
//         .pipe(
//           tap((res) => (this.salesCharts = res?.data || res)),
//           catchError((err) => { this.handleError('Refresh Sales Charts', err, 'chartsOverview'); return of(null); })
//         ),
//       this.dashboardService.getYearlySales(this.selectedPeriod, true).pipe(
//         tap((res) => (this.yearlySales = res?.data || res)),
//         catchError((err) => { this.handleError('Refresh Yearly Sales', err, 'chartsOverview'); return of(null); })
//       ),
//       this.dashboardService.getMonthlySales(this.selectedPeriod, true).pipe(
//         tap((res) => (this.monthlySales = res?.data || res)),
//         catchError((err) => { this.handleError('Refresh Monthly Sales', err, 'chartsOverview'); return of(null); })
//       ),
//       this.dashboardService.getWeeklySales(this.selectedPeriod, true).pipe(
//         tap((res) => (this.weeklySales = res?.data || res)),
//         catchError((err) => { this.handleError('Refresh Weekly Sales', err, 'chartsOverview'); return of(null); })
//       ),
//     ])
//       .pipe(finalize(() => { this.isChartsLoading = false; this.updateChartData(); }))
//       .subscribe();
//   }

//   refreshProductPanel(): void {
//     this.isProductLoading = true;
//     forkJoin([
//       this.dashboardService
//         .getProductAnalytics(this.selectedPeriod, this.dataLimit, this.startDate, this.endDate, true)
//         .pipe(
//           tap((res) => (this.productAnalytics = res?.data || res)),
//           catchError((err) => { this.handleError('Refresh Products', err, 'productAnalytics'); return of(null); })
//         ),
//       this.dashboardService
//         .getInventoryTurnover(this.selectedPeriod, this.startDate, this.endDate, true)
//         .pipe(
//           tap((res) => (this.inventoryTurnover = res?.data || res)),
//           catchError((err) => { this.handleError('Refresh Inventory', err, 'productAnalytics'); return of(null); })
//         ),
//     ])
//       .pipe(finalize(() => { this.isProductLoading = false; this.updateChartData(); }))
//       .subscribe();
//   }

//   refreshCustomerPanel(): void {
//     this.isCustomerLoading = true;
//     this.dashboardService
//       .getCustomerAnalytics(this.selectedPeriod, this.dataLimit, this.startDate, this.endDate, true)
//       .pipe(
//         tap((res) => (this.customerAnalytics = res?.data || res)),
//         catchError((err) => { this.handleError('Refresh Customers', err, 'customerAnalytics'); return of(null); }),
//         finalize(() => { this.isCustomerLoading = false; })
//       )
//       .subscribe();
//   }

//   refreshPaymentPanel(): void {
//     this.isPaymentLoading = true;
//     this.dashboardService
//       .getPaymentAnalytics(this.selectedPeriod, this.startDate, this.endDate, true)
//       .pipe(
//         tap((res) => (this.paymentAnalytics = res?.data || res)),
//         catchError((err) => { this.handleError('Refresh Payments', err, 'paymentAnalytics'); return of(null); }),
//         finalize(() => { this.isPaymentLoading = false; })
//       )
//       .subscribe();
//   }

//   refreshForecastPanel(): void {
//     this.isForecastLoading = true;
//     this.dashboardService
//       .getSalesForecast(this.selectedPeriod, this.startDate, this.endDate, true)
//       .pipe(
//         tap((res) => (this.salesForecast = res?.data || res)),
//         catchError((err) => { this.handleError('Refresh Forecast', err, 'salesForecast'); return of(null); }),
//         finalize(() => { this.isForecastLoading = false; })
//       )
//       .subscribe();
//   }

//   refreshWidget(widgetId: string): void {
//     this.error[widgetId] = null;
//     switch (widgetId) {
//       case 'kpiSummary': this.refreshKpiPanel(); break;
//       case 'chartsOverview': this.refreshChartsPanel(); break;
//       case 'productAnalytics': this.refreshProductPanel(); break;
//       case 'customerAnalytics': this.refreshCustomerPanel(); break;
//       case 'paymentAnalytics': this.refreshPaymentPanel(); break;
//       case 'salesForecast': this.refreshForecastPanel(); break;
//     }
//   }

//   onFilterChange(): void {
//     if (this.selectedPeriod !== 'custom') this.customDateRange = undefined;
//     this.triggerRefresh();
//   }

//   onApplyCustomRange(): void {
//     if (this.selectedPeriod === 'custom' && this.customDateRange?.[0] && this.customDateRange?.[1]) {
//       this.triggerRefresh();
//     } else {
//       this.messageService.add({
//         severity: 'warn',
//         summary: 'Invalid Range',
//         detail: 'Please select a valid start and end date.',
//       });
//     }
//   }

//   triggerRefresh(): void {
//     this.startDate = undefined;
//     this.endDate = undefined;
//     if (this.selectedPeriod === 'custom' && this.customDateRange?.[0] && this.customDateRange?.[1]) {
//       this.startDate = this.formatDate(this.customDateRange[0]);
//       this.endDate = this.formatDate(this.customDateRange[1]);
//     }
//     this.refreshTrigger.next({
//       period: this.selectedPeriod,
//       startDate: this.startDate,
//       endDate: this.endDate,
//       limit: this.dataLimit,
//     });
//   }

//   toggleLockGrid(): void {
//     this.isGridLocked = !this.isGridLocked;
//     if (this.grid) this.grid.setStatic(this.isGridLocked);
//     this.messageService.add({
//       severity: 'info',
//       summary: 'Grid Status',
//       detail: this.isGridLocked ? 'Dashboard is now locked.' : 'Dashboard is now unlocked.',
//     });
//   }

//   saveLayout(): void {
//     try {
//       const serializedData = this.grid.save();
//       localStorage.setItem(this.LAYOUT_KEY, JSON.stringify(serializedData));
//       this.messageService.add({
//         severity: 'success',
//         summary: 'Success',
//         detail: 'Dashboard layout saved!',
//       });
//     } catch (e) {
//       this.messageService.add({
//         severity: 'error',
//         summary: 'Save Failed',
//         detail: 'Unable to save layout.',
//       });
//     }
//   }

//   private loadLayout(): void {
//     const saved = localStorage.getItem(this.LAYOUT_KEY);
//     if (saved) {
//       try {
//         this.widgets = JSON.parse(saved);
//       } catch (e) {
//         /* ignore */
//       }
//     }
//   }

//   openDialog(title: string, data: any): void {
//     this.selectedPanelTitle = title;
//     this.selectedPanelData = data;
//     this.showDialog = true;
//   }

//   identify(index: number, w: GridStackWidget) {
//     return w.id;
//   }

//   private formatDate = (date: Date): string => date.toISOString().split('T')[0];

//   private handleError(apiName: string, err: any, widgetId: string) {
//     this.error[widgetId] = err?.message || 'Unknown error';
//     this.messageService.add({
//       severity: 'error',
//       summary: `${apiName} Failed`,
//       // detail: this.error[widgetId],
//     });
//   }
// }
