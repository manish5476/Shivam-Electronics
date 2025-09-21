// admin-dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { switchMap, catchError, finalize, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import our powerful services
import { DashboardService } from '../../../core/services/dashboard.service';

// Import PrimeNG Modules for the advanced UI
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog'; // Added for dialog

// Import our child components (assuming they exist; you can create placeholders if needed)
import { DashboardSummaryComponent } from '../components/dashboard-summary/dashboard-summary.component';
import { DashboardChartComboComponent } from '../components/dashboard-chart-combo/dashboard-chart-combo.component';
import { Select } from 'primeng/select';
import { AnalyticDashboardComponent } from "../components/analytic-dashboard/analytic-dashboard.component";
import { DashboardTopCustomerViewComponent } from "../components/dashboard-top-customer-view/dashboard-top-customer-view.component";

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DatePickerModule, ButtonModule, DropdownModule, SkeletonModule, Select,
    CalendarModule, ToastModule, CardModule, PanelModule, DialogModule,
    DashboardSummaryComponent, DashboardChartComboComponent,
    AnalyticDashboardComponent,
    DashboardTopCustomerViewComponent
],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  providers: [MessageService],
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
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private messageService = inject(MessageService);

  isLoading = true;

  // Observables for each section
  dashboardData$!: Observable<any>;
  productAnalytics$!: Observable<any>;
  customerAnalytics$!: Observable<any>;
  paymentAnalytics$!: Observable<any>;
  salesAnalytics$!: Observable<any>;
  inventoryTurnover$!: Observable<any>;
  salesForecast$!: Observable<any>; // Note: Forecast might not use period/dates, but we can pass if needed

  periodOptions: any[] = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'This Month', value: 'thismonth' },
    { label: 'This Year', value: 'thisyear' },
    { label: 'Custom Range', value: 'custom' }
  ];
  selectedPeriod: string = 'last30days';
  customDateRange: Date[] | undefined;

  startDate: string | undefined;
  endDate: string | undefined;

  private refreshTrigger = new BehaviorSubject<{ period?: string, startDate?: string, endDate?: string }>({ period: this.selectedPeriod });

  // For generic dialog
  showDialog: boolean = false;
  selectedPanelTitle: string = '';
  selectedPanelData: any;

  ngOnInit(): void {
    // Common pipeline for all sections
    const dataPipe = (serviceCall: (period?: string, startDate?: string, endDate?: string) => Observable<any>) =>
      this.refreshTrigger.pipe(
        switchMap(filters => {
          this.isLoading = true;
          return serviceCall(filters.period, filters.startDate, filters.endDate).pipe(
            map(response => response?.data || response), // Extract data if wrapped
            finalize(() => this.isLoading = false),
            catchError(err => {
              this.messageService.add({ severity: 'error', summary: 'Data Error', detail: 'Failed to load data.' });
              console.error('Failed to load data', err);
              return of({}); // Return empty object on error
            })
          );
        })
      );

    this.dashboardData$ = dataPipe((p, s, e) => this.dashboardService.getDashboardOverview(p, s, e));
    this.productAnalytics$ = dataPipe((p, s, e) => this.dashboardService.getProductAnalytics(p, 5, s, e));
    this.customerAnalytics$ = dataPipe((p, s, e) => this.dashboardService.getCustomerAnalytics(p, 5, s, e));
    this.paymentAnalytics$ = dataPipe((p, s, e) => this.dashboardService.getPaymentAnalytics(p, s, e));
    // this.salesAnalytics$ = dataPipe((p, s, e) => this.dashboardService.getSalesAnalytics(undefined, p, s, e)); // Uncommented and assumed params
    this.inventoryTurnover$ = dataPipe((p, s, e) => this.dashboardService.getInventoryTurnover(p, s, e));
    this.salesForecast$ = dataPipe((p, s, e) => this.dashboardService.getSalesForecast()); // No params for forecast
  }

  onFilterChange(): void {
    if (this.selectedPeriod !== 'custom') {
      this.customDateRange = undefined;
      this.startDate = undefined;
      this.endDate = undefined;
      this.refreshTrigger.next({ period: this.selectedPeriod });
    }
  }

  onApplyCustomRange(): void {
    if (this.selectedPeriod === 'custom') {
      if (!this.customDateRange || this.customDateRange.length !== 2 || !this.customDateRange[0] || !this.customDateRange[1]) {
        this.messageService.add({ severity: 'warn', summary: 'Invalid Range', detail: 'Please select a valid start and end date.' });
        return;
      }
      this.startDate = this.formatDate(this.customDateRange[0]);
      this.endDate = this.formatDate(this.customDateRange[1]);
      this.refreshTrigger.next({
        period: 'custom',
        startDate: this.startDate,
        endDate: this.endDate
      });
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  }

  openDialog(title: string, data: any): void {
    this.selectedPanelTitle = title;
    this.selectedPanelData = data;
    this.showDialog = true;
  }
}