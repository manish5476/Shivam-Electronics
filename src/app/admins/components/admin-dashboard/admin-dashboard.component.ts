import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { switchMap, catchError, tap, finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations'; // Import animations

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { Select } from 'primeng/select';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { TableModule } from 'primeng/table';

// Application Components
import { DashboardService } from '../../../core/services/dashboard.service';
import { EnhancedKpiSummaryComponent } from './enhanced-kpi-summary/enhanced-kpi-summary.component';
import { KpiSummaryComponent } from './kpi-summary/kpi-summary.component';
import { DashboardOverviewComponent } from './dashboard-overview/dashboard-overview.component';
import { ProductAnalyticsComponent } from './product-analytics/product-analytics.component';
import { SalesChartsComponent } from './sales-charts/sales-charts.component';
import { SalesTrendsComponent } from './sales-trends/sales-trends.component';
import { YearlySalesComponent } from './yearly-sales/yearly-sales.component';
import { MonthlySalesComponent } from './monthly-sales/monthly-sales.component';
import { PaymentAnalyticsComponent } from './payment-analytics/payment-analytics.component';
import { CustomerAnalyticsComponent } from './customer-analytics/customer-analytics.component';
import { SalesForecastComponent } from './sales-forecast/sales-forecast.component';
import { InventoryTurnoverComponent } from './inventory-turnover/inventory-turnover.component';

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
    DialogModule,
    ToolbarModule,
    MessageModule,
    ProgressSpinnerModule,
    Select,
    NgxChartsModule,
    TableModule,
    EnhancedKpiSummaryComponent,
    KpiSummaryComponent,
    DashboardOverviewComponent,
    ProductAnalyticsComponent,
    SalesChartsComponent,
    SalesTrendsComponent,
    YearlySalesComponent,
    MonthlySalesComponent,
    PaymentAnalyticsComponent,
    CustomerAnalyticsComponent,
    SalesForecastComponent,
    InventoryTurnoverComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // FIX 1: Added animations array for the fadeIn trigger used in the template.
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  // --- UI state ---
  showDialog = false;
  selectedTitle = '';
  selectedData: any;
  customDateRange: Date[] | undefined;
  selectedPeriod = 'last30days';
  dataLimit = 5;

  startDate?: string;
  endDate?: string;

  // --- Chart data ---
  revenueTrendData: any[] = [];
  categoryData: any[] = [];
  paymentMethodsData: any[] = [];
  collectionTrendsData: any[] = [];

  chartView: [number, number] = [600, 300];
  revenueColorScheme: Color = { name: 'revenue', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6'] };
  categoryColorScheme: Color = { name: 'category', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] };
  paymentColorScheme: Color = { name: 'payment', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] };

  // --- Refresh trigger ---
  private refreshTrigger = new BehaviorSubject<{ period: string; startDate?: string; endDate?: string; limit: number }>({
    period: this.selectedPeriod,
    limit: this.dataLimit,
  });

  // --- Loading state ---
  private loadingSubject = new BehaviorSubject<boolean>(true);
  isLoading$: Observable<boolean> = this.loadingSubject.asObservable();

  // --- Observables for widgets ---
  enhancedKpiSummary$: Observable<any> = of(null);
  kpiSummary$: Observable<any> = of(null);
  overview$: Observable<any> = of(null);
  productAnalytics$: Observable<any> = of(null);
  customerAnalytics$: Observable<any> = of(null);
  paymentAnalytics$: Observable<any> = of(null);
  inventoryTurnover$: Observable<any> = of(null);
  salesForecast$: Observable<any> = of(null);
  salesTrends$: Observable<any> = of(null);
  salesCharts$: Observable<any> = of(null);
  yearlySales$: Observable<any> = of(null);
  monthlySales$: Observable<any> = of(null);
  weeklySales$: Observable<any> = of(null);

  // --- Period & limit options ---
  periodOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'This Month', value: 'thismonth' },
    { label: 'This Year', value: 'thisyear' },
    { label: 'Custom Range', value: 'custom' },
  ];
  limitOptions = [
    { label: 'Top 5', value: 5 },
    { label: 'Top 10', value: 10 },
    { label: 'Top 20', value: 20 },
  ];

  ngOnInit() {
    // --- Trigger all widget observables ---
    const refresh$ = this.refreshTrigger.pipe(
      tap(() => this.loadingSubject.next(true))
    );

    const createDataStream = <T>(
        fetchFn: (params: { period: string; startDate?: string; endDate?: string; limit: number }) => Observable<T>,
        apiName: string,
        onSuccess?: (data: T) => void
      ): Observable<T | null> => {
        return refresh$.pipe(
          switchMap(params =>
            fetchFn(params).pipe(
              tap(data => {
                  if (onSuccess) {
                      onSuccess(data);
                  }
              }),
              catchError(err => {
                this.showError(apiName, err);
                return of(null);
              })
            )
          )
        );
    };
    

    this.enhancedKpiSummary$ = createDataStream(
        ({ period, startDate, endDate }) => this.dashboardService.getEnhancedKpiSummary(period, startDate, endDate),
        'Enhanced KPI Summary',
        data => this.updateRevenueChart(data?.charts?.revenueTrend || [])
    );
    
    this.kpiSummary$ = createDataStream(
        ({ period, startDate, endDate }) => this.dashboardService.getKpiSummary(period, startDate, endDate),
        'KPI Summary'
    );
    
    this.overview$ = createDataStream(
        ({ period, startDate, endDate }) => this.dashboardService.getDashboardOverview(period, startDate, endDate),
        'Dashboard Overview'
    );
    
    this.productAnalytics$ = createDataStream(
        ({ period, startDate, endDate, limit }) => this.dashboardService.getProductAnalytics(period, limit, startDate, endDate),
        'Product Analytics',
        data => this.updateCategoryChart(data?.performanceByCategory || [])
    );
    
    this.customerAnalytics$ = createDataStream(
        ({ period, startDate, endDate, limit }) => this.dashboardService.getCustomerAnalytics(period, limit, startDate, endDate),
        'Customer Analytics'
    );
    
    this.paymentAnalytics$ = createDataStream(
        ({ period, startDate, endDate }) => this.dashboardService.getPaymentAnalytics(period, startDate, endDate),
        'Payment Analytics',
        data => this.updatePaymentCharts(data)
    );
    
    this.inventoryTurnover$ = createDataStream(
        ({ period, startDate, endDate }) => this.dashboardService.getInventoryTurnover(period, startDate, endDate),
        'Inventory Turnover'
    );
    
    this.salesForecast$ = createDataStream(
        ({ period, startDate, endDate }) => this.dashboardService.getSalesForecast(period, startDate, endDate),
        'Sales Forecast'
    );
    
    this.salesTrends$ = createDataStream(
        ({ period, startDate, endDate }) => this.dashboardService.getSalesTrends(period, startDate, endDate),
        'Sales Trends'
    );
    
    this.salesCharts$ = createDataStream(
        ({ period, startDate, endDate }) => this.dashboardService.getSalesCharts(period, startDate, endDate),
        'Sales Charts'
    );
    
    this.yearlySales$ = createDataStream(
        ({ period, startDate, endDate }) => this.dashboardService.getYearlySales(period, startDate, endDate),
        'Yearly Sales'
    );
    
    // FIX 2: Correctly passing the 'period' parameter instead of 'startDate'.
    // The service method 'getMonthlySales' expects a period string.
    this.monthlySales$ = createDataStream(
        ({ period }) => this.dashboardService.getMonthlySales(period),
        'Monthly Sales'
    );

    // FIX 3: Correctly passing the 'period' parameter instead of 'startDate'.
    // The service method 'getWeeklySales' expects a period string.
    this.weeklySales$ = createDataStream(
        ({ period }) => this.dashboardService.getWeeklySales(period),
        'Weekly Sales'
    );


    // --- Set loading to false when all observables have emitted ---
    combineLatest([
      this.enhancedKpiSummary$,
      this.kpiSummary$,
      this.overview$,
      this.productAnalytics$,
      this.customerAnalytics$,
      this.paymentAnalytics$,
      this.inventoryTurnover$,
      this.salesForecast$,
      this.salesTrends$,
      this.salesCharts$,
      this.yearlySales$,
      this.monthlySales$,
      this.weeklySales$,
    ]).pipe(
      // Using finalize to ensure loading is set to false even on error/completion.
      finalize(() => {
        this.loadingSubject.next(false);
        this.cdr.markForCheck();
      })
    ).subscribe();

    this.triggerRefresh(); // initial load
  }

  // --- Chart update helpers ---
  private updateRevenueChart(data: any[]) {
    this.revenueTrendData = [{ name: 'Revenue', series: data.map((item) => ({ name: item._id, value: item.dailyRevenue })) }];
    this.cdr.markForCheck();
  }

  private updateCategoryChart(data: any[]) {
    this.categoryData = data.map((item) => ({ name: item._id.split(',')[1] || item._id, value: item.totalRevenue }));
    this.cdr.markForCheck();
  }

  private updatePaymentCharts(data: any) {
    if (!data) return;
    this.paymentMethodsData = data.paymentMethods?.map((item: { _id: string; totalAmount: any; }) => ({ name: this.formatPaymentMethod(item._id), value: item.totalAmount })) || [];
    this.collectionTrendsData = [
      { name: 'Collections', series: data.collectionTrends?.map((trend: { _id: any; dailyTotal: any; }) => ({ name: trend._id, value: trend.dailyTotal })) || [] },
    ];
    this.cdr.markForCheck();
  }

  private formatPaymentMethod(methodId: string): string {
    const map: { [key: string]: string } = {
      credit_card: 'Credit Card',
      upi: 'UPI',
      bank_transfer: 'Bank Transfer',
      cash: 'Cash',
      wallet: 'Digital Wallet',
    };
    return map[methodId] || methodId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // --- Refresh & filter handling ---
  triggerRefresh() {
    if (this.selectedPeriod === 'custom' && this.customDateRange?.[0] && this.customDateRange?.[1]) {
      this.startDate = this.formatDate(this.customDateRange[0]);
      this.endDate = this.formatDate(this.customDateRange[1]);
    } else {
      this.startDate = undefined;
      this.endDate = undefined;
    }

    this.refreshTrigger.next({
      period: this.selectedPeriod,
      startDate: this.startDate,
      endDate: this.endDate,
      limit: this.dataLimit,
    });
  }

  onFilterChange() {
    if (this.selectedPeriod !== 'custom') {
        this.customDateRange = undefined;
    }
    this.triggerRefresh();
  }

  onApplyCustomRange() {
    if (this.customDateRange?.[0] && this.customDateRange?.[1]) {
        this.triggerRefresh();
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Range',
        detail: 'Please select a valid start and end date.',
      });
    }
  }

  // --- Dialog handling ---
  openDialog(title: string, data: any) {
    this.selectedTitle = title;
    this.selectedData = data;
    this.showDialog = true;
  }

  // --- Utility ---
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private showError(api: string, err: any) {
    console.error(`${api} error →`, err);
    this.messageService.add({ severity: 'error', summary: `${api} Failed`, detail: 'Failed to load data.' });
  }
}


// import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
// import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
// import { switchMap, catchError, tap, map } from 'rxjs/operators'; // Add map
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ButtonModule } from 'primeng/button';
// import { DropdownModule } from 'primeng/dropdown';
// import { SkeletonModule } from 'primeng/skeleton';
// import { CalendarModule } from 'primeng/calendar';
// import { ToastModule } from 'primeng/toast';
// import { DialogModule } from 'primeng/dialog';
// import { ToolbarModule } from 'primeng/toolbar';
// import { MessageModule } from 'primeng/message';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { MessageService } from 'primeng/api';
// import { Select } from 'primeng/select';
// import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
// import { TableModule } from 'primeng/table';

// import { DashboardService } from '../../../core/services/dashboard.service';
// import { EnhancedKpiSummaryComponent } from './enhanced-kpi-summary/enhanced-kpi-summary.component';
// import { KpiSummaryComponent } from './kpi-summary/kpi-summary.component';
// import { DashboardOverviewComponent } from './dashboard-overview/dashboard-overview.component';
// import { ProductAnalyticsComponent } from './product-analytics/product-analytics.component';
// import { SalesChartsComponent } from './sales-charts/sales-charts.component';
// import { SalesTrendsComponent } from './sales-trends/sales-trends.component';
// import { YearlySalesComponent } from './yearly-sales/yearly-sales.component';
// import { MonthlySalesComponent } from './monthly-sales/monthly-sales.component';
// import { PaymentAnalyticsComponent } from './payment-analytics/payment-analytics.component';
// import { CustomerAnalyticsComponent } from './customer-analytics/customer-analytics.component';
// import { SalesForecastComponent } from './sales-forecast/sales-forecast.component';
// import { InventoryTurnoverComponent } from './inventory-turnover/inventory-turnover.component';

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
//     DialogModule,
//     ToolbarModule,
//     MessageModule,
//     ProgressSpinnerModule,
//     Select,
//     NgxChartsModule,
//     TableModule,
//     EnhancedKpiSummaryComponent,
//     KpiSummaryComponent,
//     DashboardOverviewComponent,
//     ProductAnalyticsComponent,
//     SalesChartsComponent,
//     SalesTrendsComponent,
//     YearlySalesComponent,
//     MonthlySalesComponent,
//     PaymentAnalyticsComponent,
//     CustomerAnalyticsComponent,
//     SalesForecastComponent,
//     InventoryTurnoverComponent,
//   ],
//   templateUrl: './admin-dashboard.component.html',
//   styleUrls: ['./admin-dashboard.component.css'],
//   providers: [MessageService],
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class AdminDashboardComponent implements OnInit {
//   private dashboardService = inject(DashboardService);
//   private messageService = inject(MessageService);
//   private cdr = inject(ChangeDetectorRef);

//   // --- UI state ---
//   showDialog = false;
//   selectedTitle = '';
//   selectedData: any;
//   customDateRange: Date[] | undefined;
//   selectedPeriod = 'last30days';
//   dataLimit = 5;

//   startDate?: string;
//   endDate?: string;

//   // --- Chart data ---
//   revenueTrendData: any[] = [];
//   categoryData: any[] = [];
//   paymentMethodsData: any[] = [];
//   collectionTrendsData: any[] = [];

//   chartView: [number, number] = [600, 300];
//   revenueColorScheme: Color = { name: 'revenue', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6'] };
//   categoryColorScheme: Color = { name: 'category', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] };
//   paymentColorScheme: Color = { name: 'payment', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] };

//   // --- Refresh trigger ---
//   private refreshTrigger = new BehaviorSubject<{ period: string; startDate?: string; endDate?: string; limit: number }>({
//     period: this.selectedPeriod,
//     limit: this.dataLimit,
//   });

//   // --- Loading state ---
//   private loadingSubject = new BehaviorSubject<boolean>(true);
//   isLoading$: Observable<boolean> = this.loadingSubject.asObservable().pipe(
//     map(value => value ?? false) // Ensure null is mapped to false
//   );

//   // --- Observables for widgets ---
//   enhancedKpiSummary$: Observable<any> = of(null);
//   kpiSummary$: Observable<any> = of(null);
//   overview$: Observable<any> = of(null);
//   productAnalytics$: Observable<any> = of(null);
//   customerAnalytics$: Observable<any> = of(null);
//   paymentAnalytics$: Observable<any> = of(null);
//   inventoryTurnover$: Observable<any> = of(null);
//   salesForecast$: Observable<any> = of(null);
//   salesTrends$: Observable<any> = of(null);
//   salesCharts$: Observable<any> = of(null);
//   yearlySales$: Observable<any> = of(null);
//   monthlySales$: Observable<any> = of(null);
//   weeklySales$: Observable<any> = of(null);

//   // --- Period & limit options ---
//   periodOptions = [
//     { label: 'Today', value: 'today' },
//     { label: 'Last 7 Days', value: 'last7days' },
//     { label: 'Last 30 Days', value: 'last30days' },
//     { label: 'This Month', value: 'thismonth' },
//     { label: 'This Year', value: 'thisyear' },
//     { label: 'Custom Range', value: 'custom' },
//   ];
//   limitOptions = [
//     { label: 'Top 5', value: 5 },
//     { label: 'Top 10', value: 10 },
//     { label: 'Top 20', value: 20 },
//   ];

//   ngOnInit() {
//     // --- Trigger all widget observables ---
//     const refresh$ = this.refreshTrigger.pipe(
//       tap(() => this.loadingSubject.next(true))
//     );

//     this.enhancedKpiSummary$ = refresh$.pipe(
//       switchMap(({ period, startDate, endDate }) =>
//         this.dashboardService.getEnhancedKpiSummary(period, startDate, endDate).pipe(
//           catchError((err) => {
//             this.showError('Enhanced KPI Summary', err);
//             return of(null);
//           }),
//           tap((data) => {
//             this.updateRevenueChart(data?.charts?.revenueTrend || []);
//           })
//         )
//       )
//     );

//     this.kpiSummary$ = refresh$.pipe(
//       switchMap(({ period, startDate, endDate }) =>
//         this.dashboardService.getKpiSummary(period, startDate, endDate).pipe(
//           catchError((err) => {
//             this.showError('KPI Summary', err);
//             return of(null);
//           })
//         )
//       )
//     );

//     this.overview$ = refresh$.pipe(
//       switchMap(({ period, startDate, endDate }) =>
//         this.dashboardService.getDashboardOverview(period, startDate, endDate).pipe(
//           catchError((err) => {
//             this.showError('Dashboard Overview', err);
//             return of(null);
//           })
//         )
//       )
//     );

//     this.productAnalytics$ = refresh$.pipe(
//       switchMap(({ period, startDate, endDate, limit }) =>
//         this.dashboardService.getProductAnalytics(period, limit, startDate, endDate).pipe(
//           catchError((err) => {
//             this.showError('Product Analytics', err);
//             return of(null);
//           }),
//           tap((data) => this.updateCategoryChart(data?.performanceByCategory || []))
//         )
//       )
//     );

//     this.customerAnalytics$ = refresh$.pipe(
//       switchMap(({ period, startDate, endDate, limit }) =>
//         this.dashboardService.getCustomerAnalytics(period, limit, startDate, endDate).pipe(
//           catchError((err) => {
//             this.showError('Customer Analytics', err);
//             return of(null);
//           })
//         )
//       )
//     );

//     this.paymentAnalytics$ = refresh$.pipe(
//       switchMap(({ period, startDate, endDate }) =>
//         this.dashboardService.getPaymentAnalytics(period, startDate, endDate).pipe(
//           catchError((err) => {
//             this.showError('Payment Analytics', err);
//             return of(null);
//           }),
//           tap((data) => this.updatePaymentCharts(data))
//         )
//       )
//     );

//     this.inventoryTurnover$ = refresh$.pipe(
//       switchMap(({ period, startDate, endDate }) =>
//         this.dashboardService.getInventoryTurnover(period, startDate, endDate).pipe(
//           catchError((err) => {
//             this.showError('Inventory Turnover', err);
//             return of(null);
//           })
//         )
//       )
//     );

//     this.salesForecast$ = refresh$.pipe(
//       switchMap(({ period, startDate, endDate }) =>
//         this.dashboardService.getSalesForecast(period, startDate, endDate).pipe(
//           catchError((err) => {
//             this.showError('Sales Forecast', err);
//             return of(null);
//           })
//         )
//       )
//     );

//     this.salesTrends$ = refresh$.pipe(
//       switchMap(({ period, startDate, endDate }) =>
//         this.dashboardService.getSalesTrends(period, startDate, endDate).pipe(
//           catchError((err) => {
//             this.showError('Sales Trends', err);
//             return of(null);
//           })
//         )
//       )
//     );

//     this.salesCharts$ = refresh$.pipe(
//       switchMap(({ period, startDate, endDate }) =>
//         this.dashboardService.getSalesCharts(period, startDate, endDate).pipe(
//           catchError((err) => {
//             this.showError('Sales Charts', err);
//             return of(null);
//           })
//         )
//       )
//     );

//     this.yearlySales$ = refresh$.pipe(
//       switchMap(({ period, startDate, endDate }) =>
//         this.dashboardService.getYearlySales(period, startDate, endDate).pipe(
//           catchError((err) => {
//             this.showError('Yearly Sales', err);
//             return of(null);
//           })
//         )
//       )
//     );

//     this.monthlySales$ = refresh$.pipe(
//       switchMap(({ period, startDate, endDate }) =>
//         this.dashboardService.getMonthlySales(startDate).pipe(
//           catchError((err) => {
//             this.showError('Monthly Sales', err);
//             return of(null);
//           })
//         )
//       )
//     );

//     this.weeklySales$ = refresh$.pipe(
//       switchMap(({ period, startDate, endDate }) =>
//         this.dashboardService.getWeeklySales(startDate).pipe(
//           catchError((err) => {
//             this.showError('Weekly Sales', err);
//             return of(null);
//           })
//         )
//       )
//     );

//     // --- Set loading to false when all observables have emitted ---
//     combineLatest([
//       this.enhancedKpiSummary$,
//       this.kpiSummary$,
//       this.overview$,
//       this.productAnalytics$,
//       this.customerAnalytics$,
//       this.paymentAnalytics$,
//       this.inventoryTurnover$,
//       this.salesForecast$,
//       this.salesTrends$,
//       this.salesCharts$,
//       this.yearlySales$,
//       this.monthlySales$,
//       this.weeklySales$,
//     ]).subscribe(() => {
//       this.loadingSubject.next(false);
//       this.cdr.markForCheck();
//     });

//     this.triggerRefresh(); // initial load
//   }

//   // --- Chart update helpers ---
//   private updateRevenueChart(data: any[]) {
//     this.revenueTrendData = [{ name: 'Revenue', series: data.map((item) => ({ name: item._id, value: item.dailyRevenue })) }];
//     this.chartView[1] = data.length * 50 || 200;
//     this.cdr.markForCheck();
//   }

//   private updateCategoryChart(data: any[]) {
//     this.categoryData = data.map((item) => ({ name: item._id.split(',')[1] || item._id, value: item.totalRevenue }));
//     this.cdr.markForCheck();
//   }

//   private updatePaymentCharts(data: any) {
//     if (!data) return;
//     this.paymentMethodsData = data.paymentMethods?.map((item: { _id: string; totalAmount: any; }) => ({ name: this.formatPaymentMethod(item._id), value: item.totalAmount })) || [];
//     this.collectionTrendsData = [
//       { name: 'Collections', series: data.collectionTrends?.map((trend: { _id: any; dailyTotal: any; }) => ({ name: trend._id, value: trend.dailyTotal })) || [] },
//     ];
//     this.cdr.markForCheck();
//   }

//   private formatPaymentMethod(methodId: string) {
//     const map: { [key: string]: string } = {
//       credit_card: 'Credit Card',
//       upi: 'UPI',
//       bank_transfer: 'Bank Transfer',
//       cash: 'Cash',
//       wallet: 'Digital Wallet',
//     };
//     return map[methodId] || methodId.toUpperCase();
//   }

//   // --- Refresh & filter handling ---
//   triggerRefresh() {
//     if (this.selectedPeriod === 'custom' && this.customDateRange?.[0] && this.customDateRange?.[1]) {
//       this.startDate = this.formatDate(this.customDateRange[0]);
//       this.endDate = this.formatDate(this.customDateRange[1]);
//     } else {
//       this.startDate = undefined;
//       this.endDate = undefined;
//     }

//     this.refreshTrigger.next({
//       period: this.selectedPeriod,
//       startDate: this.startDate,
//       endDate: this.endDate,
//       limit: this.dataLimit,
//     });
//   }

//   onFilterChange() {
//     if (this.selectedPeriod !== 'custom') this.customDateRange = undefined;
//     this.triggerRefresh();
//   }

//   onApplyCustomRange() {
//     if (this.customDateRange?.[0] && this.customDateRange?.[1]) this.triggerRefresh();
//     else
//       this.messageService.add({
//         severity: 'warn',
//         summary: 'Invalid Range',
//         detail: 'Please select a valid start and end date.',
//       });
//   }

//   // --- Dialog handling ---
//   openDialog(title: string, data: any) {
//     this.selectedTitle = title;
//     this.selectedData = data;
//     this.showDialog = true;
//   }

//   // --- Utility ---
//   private formatDate(date: Date) {
//     return date.toISOString().split('T')[0];
//   }

//   private showError(api: string, err: any) {
//     console.error(`${api} error →`, err);
//     this.messageService.add({ severity: 'error', summary: `${api} Failed` });
//   }
// }

// // import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
// // import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
// // import { switchMap, catchError, tap } from 'rxjs/operators';
// // import { CommonModule } from '@angular/common';
// // import { FormsModule } from '@angular/forms';
// // import { ButtonModule } from 'primeng/button';
// // import { DropdownModule } from 'primeng/dropdown';
// // import { SkeletonModule } from 'primeng/skeleton';
// // import { CalendarModule } from 'primeng/calendar';
// // import { ToastModule } from 'primeng/toast';
// // import { DialogModule } from 'primeng/dialog';
// // import { ToolbarModule } from 'primeng/toolbar';
// // import { MessageModule } from 'primeng/message';
// // import { ProgressSpinnerModule } from 'primeng/progressspinner';
// // import { MessageService } from 'primeng/api';
// // import { Select } from 'primeng/select';
// // import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
// // import { TableModule } from 'primeng/table';

// // import { DashboardService } from '../../../core/services/dashboard.service';
// // import { EnhancedKpiSummaryComponent } from './enhanced-kpi-summary/enhanced-kpi-summary.component';
// // import { KpiSummaryComponent } from './kpi-summary/kpi-summary.component';
// // import { DashboardOverviewComponent } from './dashboard-overview/dashboard-overview.component';
// // import { ProductAnalyticsComponent } from './product-analytics/product-analytics.component';
// // import { SalesChartsComponent } from './sales-charts/sales-charts.component';
// // import { SalesTrendsComponent } from './sales-trends/sales-trends.component';
// // import { YearlySalesComponent } from './yearly-sales/yearly-sales.component';
// // import { MonthlySalesComponent } from './monthly-sales/monthly-sales.component';
// // import { PaymentAnalyticsComponent } from './payment-analytics/payment-analytics.component';
// // import { CustomerAnalyticsComponent } from './customer-analytics/customer-analytics.component';
// // import { SalesForecastComponent } from './sales-forecast/sales-forecast.component';
// // import { InventoryTurnoverComponent } from './inventory-turnover/inventory-turnover.component';

// // @Component({
// //   selector: 'app-admin-dashboard',
// //   standalone: true,
// //   imports: [
// //     CommonModule,
// //     FormsModule,
// //     ButtonModule,
// //     DropdownModule,
// //     SkeletonModule,
// //     CalendarModule,
// //     ToastModule,
// //     DialogModule,
// //     ToolbarModule,
// //     MessageModule,
// //     ProgressSpinnerModule,
// //     Select,
// //     NgxChartsModule,
// //     TableModule,
// //     EnhancedKpiSummaryComponent,
// //     KpiSummaryComponent,
// //     DashboardOverviewComponent,
// //     ProductAnalyticsComponent,
// //     SalesChartsComponent,
// //     SalesTrendsComponent,
// //     YearlySalesComponent,
// //     MonthlySalesComponent,
// //     PaymentAnalyticsComponent,
// //     CustomerAnalyticsComponent,
// //     SalesForecastComponent,
// //     InventoryTurnoverComponent,
// //   ],
// //   templateUrl: './admin-dashboard.component.html',
// //   styleUrls: ['./admin-dashboard.component.css'],
// //   providers: [MessageService],
// //   changeDetection: ChangeDetectionStrategy.OnPush,
// // })
// // export class AdminDashboardComponent implements OnInit {
// //   private dashboardService = inject(DashboardService);
// //   private messageService = inject(MessageService);
// //   private cdr = inject(ChangeDetectorRef);

// //   // --- UI state ---
// //   showDialog = false;
// //   selectedTitle = '';
// //   selectedData: any;
// //   customDateRange: Date[] | undefined;
// //   selectedPeriod = 'last30days';
// //   dataLimit = 5;

// //   startDate?: string;
// //   endDate?: string;

// //   // --- Chart data ---
// //   revenueTrendData: any[] = [];
// //   categoryData: any[] = [];
// //   paymentMethodsData: any[] = [];
// //   collectionTrendsData: any[] = [];

// //   chartView: [number, number] = [600, 300];
// //   revenueColorScheme: Color = { name: 'revenue', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6'] };
// //   categoryColorScheme: Color = { name: 'category', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] };
// //   paymentColorScheme: Color = { name: 'payment', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] };

// //   // --- Refresh trigger ---
// //   private refreshTrigger = new BehaviorSubject<{ period: string; startDate?: string; endDate?: string; limit: number }>({
// //     period: this.selectedPeriod,
// //     limit: this.dataLimit,
// //   });

// //   // --- Loading state ---
// //   private loadingSubject = new BehaviorSubject<boolean>(true);
// //   isLoading$: Observable<boolean> = this.loadingSubject.asObservable();

// //   // --- Observables for widgets ---
// //   enhancedKpiSummary$: Observable<any> = of(null);
// //   kpiSummary$: Observable<any> = of(null);
// //   overview$: Observable<any> = of(null);
// //   productAnalytics$: Observable<any> = of(null);
// //   customerAnalytics$: Observable<any> = of(null);
// //   paymentAnalytics$: Observable<any> = of(null);
// //   inventoryTurnover$: Observable<any> = of(null);
// //   salesForecast$: Observable<any> = of(null);
// //   salesTrends$: Observable<any> = of(null);
// //   salesCharts$: Observable<any> = of(null);
// //   yearlySales$: Observable<any> = of(null);
// //   monthlySales$: Observable<any> = of(null);
// //   weeklySales$: Observable<any> = of(null);

// //   // --- Period & limit options ---
// //   periodOptions = [
// //     { label: 'Today', value: 'today' },
// //     { label: 'Last 7 Days', value: 'last7days' },
// //     { label: 'Last 30 Days', value: 'last30days' },
// //     { label: 'This Month', value: 'thismonth' },
// //     { label: 'This Year', value: 'thisyear' },
// //     { label: 'Custom Range', value: 'custom' },
// //   ];
// //   limitOptions = [
// //     { label: 'Top 5', value: 5 },
// //     { label: 'Top 10', value: 10 },
// //     { label: 'Top 20', value: 20 },
// //   ];

// //   ngOnInit() {
// //     // --- Trigger all widget observables ---
// //     const refresh$ = this.refreshTrigger.pipe(
// //       tap(() => this.loadingSubject.next(true))
// //     );

// //     this.enhancedKpiSummary$ = refresh$.pipe(
// //       switchMap(({ period, startDate, endDate }) =>
// //         this.dashboardService.getEnhancedKpiSummary(period, startDate, endDate).pipe(
// //           catchError((err) => {
// //             this.showError('Enhanced KPI Summary', err);
// //             return of(null);
// //           }),
// //           tap((data) => {
// //             this.updateRevenueChart(data?.charts?.revenueTrend || []);
// //           })
// //         )
// //       )
// //     );

// //     this.kpiSummary$ = refresh$.pipe(
// //       switchMap(({ period, startDate, endDate }) =>
// //         this.dashboardService.getKpiSummary(period, startDate, endDate).pipe(
// //           catchError((err) => {
// //             this.showError('KPI Summary', err);
// //             return of(null);
// //           })
// //         )
// //       )
// //     );

// //     this.overview$ = refresh$.pipe(
// //       switchMap(({ period, startDate, endDate }) =>
// //         this.dashboardService.getDashboardOverview(period, startDate, endDate).pipe(
// //           catchError((err) => {
// //             this.showError('Dashboard Overview', err);
// //             return of(null);
// //           })
// //         )
// //       )
// //     );

// //     this.productAnalytics$ = refresh$.pipe(
// //       switchMap(({ period, startDate, endDate, limit }) =>
// //         this.dashboardService.getProductAnalytics(period, limit, startDate, endDate).pipe(
// //           catchError((err) => {
// //             this.showError('Product Analytics', err);
// //             return of(null);
// //           }),
// //           tap((data) => this.updateCategoryChart(data?.performanceByCategory || []))
// //         )
// //       )
// //     );

// //     this.customerAnalytics$ = refresh$.pipe(
// //       switchMap(({ period, startDate, endDate, limit }) =>
// //         this.dashboardService.getCustomerAnalytics(period, limit, startDate, endDate).pipe(
// //           catchError((err) => {
// //             this.showError('Customer Analytics', err);
// //             return of(null);
// //           })
// //         )
// //       )
// //     );

// //     this.paymentAnalytics$ = refresh$.pipe(
// //       switchMap(({ period, startDate, endDate }) =>
// //         this.dashboardService.getPaymentAnalytics(period, startDate, endDate).pipe(
// //           catchError((err) => {
// //             this.showError('Payment Analytics', err);
// //             return of(null);
// //           }),
// //           tap((data) => this.updatePaymentCharts(data))
// //         )
// //       )
// //     );

// //     this.inventoryTurnover$ = refresh$.pipe(
// //       switchMap(({ period, startDate, endDate }) =>
// //         this.dashboardService.getInventoryTurnover(period, startDate, endDate).pipe(
// //           catchError((err) => {
// //             this.showError('Inventory Turnover', err);
// //             return of(null);
// //           })
// //         )
// //       )
// //     );

// //     this.salesForecast$ = refresh$.pipe(
// //       switchMap(({ period, startDate, endDate }) =>
// //         this.dashboardService.getSalesForecast(period, startDate, endDate).pipe(
// //           catchError((err) => {
// //             this.showError('Sales Forecast', err);
// //             return of(null);
// //           })
// //         )
// //       )
// //     );

// //     this.salesTrends$ = refresh$.pipe(
// //       switchMap(({ period, startDate, endDate }) =>
// //         this.dashboardService.getSalesTrends(period, startDate, endDate).pipe(
// //           catchError((err) => {
// //             this.showError('Sales Trends', err);
// //             return of(null);
// //           })
// //         )
// //       )
// //     );

// //     this.salesCharts$ = refresh$.pipe(
// //       switchMap(({ period, startDate, endDate }) =>
// //         this.dashboardService.getSalesCharts(period, startDate, endDate).pipe(
// //           catchError((err) => {
// //             this.showError('Sales Charts', err);
// //             return of(null);
// //           })
// //         )
// //       )
// //     );

// //     this.yearlySales$ = refresh$.pipe(
// //       switchMap(({ period, startDate, endDate }) =>
// //         this.dashboardService.getYearlySales(period, startDate, endDate).pipe(
// //           catchError((err) => {
// //             this.showError('Yearly Sales', err);
// //             return of(null);
// //           })
// //         )
// //       )
// //     );

// //     this.monthlySales$ = refresh$.pipe(
// //       switchMap(({ period, startDate, endDate }) =>
// //         this.dashboardService.getMonthlySales(startDate, false).pipe(
// //           catchError((err) => {
// //             this.showError('Monthly Sales', err);
// //             return of(null);
// //           })
// //         )
// //       )
// //     );

// //     this.weeklySales$ = refresh$.pipe(
// //       switchMap(({ period, startDate, endDate }) =>
// //         this.dashboardService.getWeeklySales(startDate, false).pipe(
// //           catchError((err) => {
// //             this.showError('Weekly Sales', err);
// //             return of(null);
// //           })
// //         )
// //       )
// //     );

// //     // --- Set loading to false when all observables have emitted ---
// //     combineLatest([
// //       this.enhancedKpiSummary$,
// //       this.kpiSummary$,
// //       this.overview$,
// //       this.productAnalytics$,
// //       this.customerAnalytics$,
// //       this.paymentAnalytics$,
// //       this.inventoryTurnover$,
// //       this.salesForecast$,
// //       this.salesTrends$,
// //       this.salesCharts$,
// //       this.yearlySales$,
// //       this.monthlySales$,
// //       this.weeklySales$,
// //     ]).subscribe(() => {
// //       this.loadingSubject.next(false);
// //       this.cdr.markForCheck();
// //     });

// //     this.triggerRefresh(); // initial load
// //   }

// //   // --- Chart update helpers ---
// //   private updateRevenueChart(data: any[]) {
// //     this.revenueTrendData = [{ name: 'Revenue', series: data.map((item) => ({ name: item._id, value: item.dailyRevenue })) }];
// //     this.chartView[1] = data.length * 50 || 200;
// //     this.cdr.markForCheck();
// //   }

// //   private updateCategoryChart(data: any[]) {
// //     this.categoryData = data.map((item) => ({ name: item._id.split(',')[1] || item._id, value: item.totalRevenue }));
// //     this.cdr.markForCheck();
// //   }

// //   private updatePaymentCharts(data: any) {
// //     if (!data) return;
// //     this.paymentMethodsData = data.paymentMethods?.map((item: { _id: string; totalAmount: any; }) => ({ name: this.formatPaymentMethod(item._id), value: item.totalAmount })) || [];
// //     this.collectionTrendsData = [
// //       { name: 'Collections', series: data.collectionTrends?.map((trend: { _id: any; dailyTotal: any; }) => ({ name: trend._id, value: trend.dailyTotal })) || [] },
// //     ];
// //     this.cdr.markForCheck();
// //   }

// //   private formatPaymentMethod(methodId: string) {
// //     const map: { [key: string]: string } = {
// //       credit_card: 'Credit Card',
// //       upi: 'UPI',
// //       bank_transfer: 'Bank Transfer',
// //       cash: 'Cash',
// //       wallet: 'Digital Wallet',
// //     };
// //     return map[methodId] || methodId.toUpperCase();
// //   }

// //   // --- Refresh & filter handling ---
// //   triggerRefresh() {
// //     if (this.selectedPeriod === 'custom' && this.customDateRange?.[0] && this.customDateRange?.[1]) {
// //       this.startDate = this.formatDate(this.customDateRange[0]);
// //       this.endDate = this.formatDate(this.customDateRange[1]);
// //     } else {
// //       this.startDate = undefined;
// //       this.endDate = undefined;
// //     }

// //     this.refreshTrigger.next({
// //       period: this.selectedPeriod,
// //       startDate: this.startDate,
// //       endDate: this.endDate,
// //       limit: this.dataLimit,
// //     });
// //   }

// //   onFilterChange() {
// //     if (this.selectedPeriod !== 'custom') this.customDateRange = undefined;
// //     this.triggerRefresh();
// //   }

// //   onApplyCustomRange() {
// //     if (this.customDateRange?.[0] && this.customDateRange?.[1]) this.triggerRefresh();
// //     else
// //       this.messageService.add({
// //         severity: 'warn',
// //         summary: 'Invalid Range',
// //         detail: 'Please select a valid start and end date.',
// //       });
// //   }

// //   // --- Dialog handling ---
// //   openDialog(title: string, data: any) {
// //     this.selectedTitle = title;
// //     this.selectedData = data;
// //     this.showDialog = true;
// //   }

// //   // --- Utility ---
// //   private formatDate(date: Date) {
// //     return date.toISOString().split('T')[0];
// //   }

// //   private showError(api: string, err: any) {
// //     console.error(`${api} error →`, err);
// //     this.messageService.add({ severity: 'error', summary: `${api} Failed` });
// //   }
// // }

// // // import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
// // // import { BehaviorSubject, combineLatest, Observable, of, Subscribable, timer } from 'rxjs';
// // // import { switchMap, catchError, tap, startWith } from 'rxjs/operators';
// // // import { CommonModule } from '@angular/common';
// // // import { FormsModule } from '@angular/forms';
// // // import { ButtonModule } from 'primeng/button';
// // // import { DropdownModule } from 'primeng/dropdown';
// // // import { SkeletonModule } from 'primeng/skeleton';
// // // import { CalendarModule } from 'primeng/calendar';
// // // import { ToastModule } from 'primeng/toast';
// // // import { DialogModule } from 'primeng/dialog';
// // // import { ToolbarModule } from 'primeng/toolbar';
// // // import { MessageModule } from 'primeng/message';
// // // import { ProgressSpinnerModule } from 'primeng/progressspinner';
// // // import { MessageService } from 'primeng/api';
// // // import { Select } from 'primeng/select';
// // // import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
// // // import { TableModule } from 'primeng/table';

// // // import { DashboardService } from '../../../core/services/dashboard.service';
// // // import { EnhancedKpiSummaryComponent } from './enhanced-kpi-summary/enhanced-kpi-summary.component';
// // // import { KpiSummaryComponent } from './kpi-summary/kpi-summary.component';
// // // import { DashboardOverviewComponent } from './dashboard-overview/dashboard-overview.component';
// // // import { ProductAnalyticsComponent } from './product-analytics/product-analytics.component';
// // // import { SalesChartsComponent } from './sales-charts/sales-charts.component';
// // // import { SalesTrendsComponent } from './sales-trends/sales-trends.component';
// // // import { YearlySalesComponent } from './yearly-sales/yearly-sales.component';
// // // import { MonthlySalesComponent } from './monthly-sales/monthly-sales.component';
// // // import { PaymentAnalyticsComponent } from './payment-analytics/payment-analytics.component';
// // // import { CustomerAnalyticsComponent } from './customer-analytics/customer-analytics.component';
// // // import { SalesForecastComponent } from './sales-forecast/sales-forecast.component';
// // // import { InventoryTurnoverComponent } from './inventory-turnover/inventory-turnover.component';

// // // @Component({
// // //   selector: 'app-admin-dashboard',
// // //   standalone: true,
// // //   imports: [
// // //     CommonModule,
// // //     FormsModule,
// // //     ButtonModule,
// // //     DropdownModule,
// // //     SkeletonModule,
// // //     CalendarModule,
// // //     ToastModule,
// // //     DialogModule,
// // //     ToolbarModule,
// // //     MessageModule,
// // //     ProgressSpinnerModule,
// // //     Select,
// // //     NgxChartsModule,
// // //     TableModule,
// // //     EnhancedKpiSummaryComponent,
// // //     KpiSummaryComponent,
// // //     DashboardOverviewComponent,
// // //     ProductAnalyticsComponent,
// // //     SalesChartsComponent,
// // //     SalesTrendsComponent,
// // //     YearlySalesComponent,
// // //     MonthlySalesComponent,
// // //     PaymentAnalyticsComponent,
// // //     CustomerAnalyticsComponent,
// // //     SalesForecastComponent,
// // //     InventoryTurnoverComponent,
// // //   ],
// // //   templateUrl: './admin-dashboard.component.html',
// // //   styleUrls: ['./admin-dashboard.component.css'],
// // //   providers: [MessageService],
// // //   changeDetection: ChangeDetectionStrategy.OnPush,
// // // })
// // // export class AdminDashboardComponent implements OnInit {
// // //   private dashboardService = inject(DashboardService);
// // //   private messageService = inject(MessageService);
// // //   private cdr = inject(ChangeDetectorRef);

// // //   // --- UI state ---
// // //   showDialog = false;
// // //   selectedTitle = '';
// // //   selectedData: any;
// // //   customDateRange: Date[] | undefined;
// // //   selectedPeriod = 'last30days';
// // //   dataLimit = 5;

// // //   startDate?: string;
// // //   endDate?: string;

// // //   // --- Chart data ---
// // //   revenueTrendData: any[] = [];
// // //   categoryData: any[] = [];
// // //   paymentMethodsData: any[] = [];
// // //   collectionTrendsData: any[] = [];

// // //   chartView: [number, number] = [600, 300];
// // //   revenueColorScheme: Color = { name: 'revenue', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6'] };
// // //   categoryColorScheme: Color = { name: 'category', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] };
// // //   paymentColorScheme: Color = { name: 'payment', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] };

// // //   // --- Refresh trigger ---
// // //   private refreshTrigger = new BehaviorSubject<{ period: string; startDate?: string; endDate?: string; limit: number }>({
// // //     period: this.selectedPeriod,
// // //     limit: this.dataLimit,
// // //   });

// // //   // --- Observables for widgets ---
// // //   enhancedKpiSummary$ = of(null);
// // //   kpiSummary$ = of(null);
// // //   overview$ = of(null);
// // //   productAnalytics$ = of(null);
// // //   customerAnalytics$ = of(null);
// // //   paymentAnalytics$ = of(null);
// // //   inventoryTurnover$ = of(null);
// // //   salesForecast$ = of(null);
// // //   salesTrends$ = of(null);
// // //   salesCharts$ = of(null);
// // //   yearlySales$ = of(null);
// // //   monthlySales$ = of(null);
// // //   weeklySales$ = of(null);

// // //   // --- Period & limit options ---
// // //   periodOptions = [
// // //     { label: 'Today', value: 'today' },
// // //     { label: 'Last 7 Days', value: 'last7days' },
// // //     { label: 'Last 30 Days', value: 'last30days' },
// // //     { label: 'This Month', value: 'thismonth' },
// // //     { label: 'This Year', value: 'thisyear' },
// // //     { label: 'Custom Range', value: 'custom' },
// // //   ];
// // //   limitOptions = [
// // //     { label: 'Top 5', value: 5 },
// // //     { label: 'Top 10', value: 10 },
// // //     { label: 'Top 20', value: 20 },
// // //   ];
// // // isLoading$: Observable<any> | Promise<any> | Subscribable<any> | undefined;

// // //   ngOnInit() {
// // //     // --- Trigger all widget observables ---
// // //     const refresh$ = this.refreshTrigger.asObservable();

// // //     this.enhancedKpiSummary$ = refresh$.pipe(
// // //       switchMap(({ period, startDate, endDate }) =>
// // //         this.dashboardService.getEnhancedKpiSummary(period, startDate, endDate).pipe(
// // //           catchError((err) => {
// // //             this.showError('Enhanced KPI Summary', err);
// // //             return of(null);
// // //           }),
// // //           tap((data) => {
// // //             this.updateRevenueChart(data?.charts?.revenueTrend || []);
// // //           })
// // //         )
// // //       )
// // //     );

// // //     this.productAnalytics$ = refresh$.pipe(
// // //       switchMap(({ period, startDate, endDate, limit }) =>
// // //         this.dashboardService.getProductAnalytics(period, limit, startDate, endDate).pipe(
// // //           catchError((err) => { this.showError('Product Analytics', err); return of(null); }),
// // //           tap((data) => this.updateCategoryChart(data?.performanceByCategory || []))
// // //         )
// // //       )
// // //     );

// // //     this.paymentAnalytics$ = refresh$.pipe(
// // //       switchMap(({ period, startDate, endDate }) =>
// // //         this.dashboardService.getPaymentAnalytics(period, startDate, endDate).pipe(
// // //           catchError((err) => { this.showError('Payment Analytics', err); return of(null); }),
// // //           tap((data) => this.updatePaymentCharts(data))
// // //         )
// // //       )
// // //     );

// // //     // --- Similarly add other widgets ---
// // //     this.kpiSummary$ = refresh$.pipe(
// // //       switchMap(({ period, startDate, endDate }) =>
// // //         this.dashboardService.getKpiSummary(period, startDate, endDate).pipe(catchError(() => of(null)))
// // //       )
// // //     );
// // //     this.overview$ = refresh$.pipe(
// // //       switchMap(({ period, startDate, endDate }) =>
// // //         this.dashboardService.getDashboardOverview(period, startDate, endDate).pipe(catchError(() => of(null)))
// // //       )
// // //     );

// // //     this.triggerRefresh(); // initial load
// // //   }

// // //   // --- Chart update helpers ---
// // //   private updateRevenueChart(data: any[]) {
// // //     this.revenueTrendData = [{ name: 'Revenue', series: data.map((item) => ({ name: item._id, value: item.dailyRevenue })) }];
// // //     this.chartView[1] = data.length * 50 || 200;
// // //     this.cdr.markForCheck();
// // //   }

// // //   private updateCategoryChart(data: any[]) {
// // //     this.categoryData = data.map((item) => ({ name: item._id.split(',')[1] || item._id, value: item.totalRevenue }));
// // //     this.cdr.markForCheck();
// // //   }

// // //   private updatePaymentCharts(data: any) {
// // //     if (!data) return;
// // //     this.paymentMethodsData = data.paymentMethods?.map((item: { _id: string; totalAmount: any; }) => ({ name: this.formatPaymentMethod(item._id), value: item.totalAmount })) || [];
// // //     this.collectionTrendsData = [
// // //       { name: 'Collections', series: data.collectionTrends?.map((trend: { _id: any; dailyTotal: any; }) => ({ name: trend._id, value: trend.dailyTotal })) || [] },
// // //     ];
// // //     this.cdr.markForCheck();
// // //   }

// // //   private formatPaymentMethod(methodId: string) {
// // //     const map: { [key: string]: string } = {
// // //       credit_card: 'Credit Card',
// // //       upi: 'UPI',
// // //       bank_transfer: 'Bank Transfer',
// // //       cash: 'Cash',
// // //       wallet: 'Digital Wallet',
// // //     };
// // //     return map[methodId] || methodId.toUpperCase();
// // //   }

// // //   // --- Refresh & filter handling ---
// // //   triggerRefresh() {
// // //     if (this.selectedPeriod === 'custom' && this.customDateRange?.[0] && this.customDateRange?.[1]) {
// // //       this.startDate = this.formatDate(this.customDateRange[0]);
// // //       this.endDate = this.formatDate(this.customDateRange[1]);
// // //     } else {
// // //       this.startDate = undefined;
// // //       this.endDate = undefined;
// // //     }

// // //     this.refreshTrigger.next({
// // //       period: this.selectedPeriod,
// // //       startDate: this.startDate,
// // //       endDate: this.endDate,
// // //       limit: this.dataLimit,
// // //     });
// // //   }

// // //   onFilterChange() {
// // //     if (this.selectedPeriod !== 'custom') this.customDateRange = undefined;
// // //     this.triggerRefresh();
// // //   }

// // //   onApplyCustomRange() {
// // //     if (this.customDateRange?.[0] && this.customDateRange?.[1]) this.triggerRefresh();
// // //     else
// // //       this.messageService.add({
// // //         severity: 'warn',
// // //         summary: 'Invalid Range',
// // //         detail: 'Please select a valid start and end date.',
// // //       });
// // //   }

// // //   // --- Dialog handling ---
// // //   openDialog(title: string, data: any) {
// // //     this.selectedTitle = title;
// // //     this.selectedData = data;
// // //     this.showDialog = true;
// // //   }

// // //   // --- Utility ---
// // //   private formatDate(date: Date) {
// // //     return date.toISOString().split('T')[0];
// // //   }

// // //   private showError(api: string, err: any) {
// // //     console.error(`${api} error →`, err);
// // //     this.messageService.add({ severity: 'error', summary: `${api} Failed` });
// // //   }
// // // }
