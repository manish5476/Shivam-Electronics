// dashboard-chart-combo.component.ts remains unchanged
import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Subject, Observable, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ChartModule } from 'primeng/chart';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog'; // Added for dialog

// App Services
import { AppMessageService } from '../../../../core/services/message.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { ChartService, ChartOption } from '../../../../core/services/chart.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

// --- NEW: Define a specific type for PrimeNG charts ---
type PrimeNgChartType = 'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'polarArea' | 'radar';

interface DisplayChart {
  title: string;
  type: PrimeNgChartType;
  data: any;
  options: any;
  isLoading: boolean;
  error?: string;
}

@Component({
  selector: 'app-dashboard-chart-combo',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ChartModule, MultiSelectModule, DropdownModule, ButtonModule, 
    SkeletonModule, CardModule, DialogModule // Added DialogModule
  ],
  templateUrl: './dashboard-chart-combo.component.html',
  styleUrls: ['./dashboard-chart-combo.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [style({ opacity: 0 }), animate('0.5s ease', style({ opacity: 1 }))]),
    ]),
    trigger('panelAnimation', [
      state('void', style({ opacity: 0, transform: 'scale(0.95)' })),
      transition('void => *', animate('0.3s ease-out', style({ opacity: 1, transform: 'scale(1)' }))),
    ]),
  ],
})
export class DashboardChartComboComponent implements OnInit, OnDestroy, OnChanges {
  // --- State Management ---
  isGlobalLoading = false; // For initial load or full refresh
  displayCharts: DisplayChart[] = []; // Array to hold multiple charts

  // Dialog State
  showDialog = false;
  selectedChartForDialog: DisplayChart | null = null;

  // --- Filter Controls ---
  chartOptions$: Observable<ChartOption[]> | undefined;
  selectedCharts: string[] = ['revenueAndProfitTrend']; // Default to one chart; array for multiselect

  @Input() selectedPeriod: string = 'last30days';
  @Input() startDate?: string;
  @Input() endDate?: string;

  private destroy$ = new Subject<void>();

  // --- Dependency Injection ---
  private platformId = inject(PLATFORM_ID);
  private chartService = inject(ChartService);
  private messageService = inject(AppMessageService);
  private themeService = inject(ThemeService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit() {
    this.chartOptions$ = this.chartService.getChartOptions();
    this.fetchAllChartsData();
    this.themeService.settings$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.displayCharts.forEach(chart => {
        if (chart.data) {
          chart.options = this.getCommonChartOptions();
        }
      });
      if (this.selectedChartForDialog?.data) {
        this.selectedChartForDialog.options = this.getCommonChartOptions(true); // Larger options if needed
      }
      this.cd.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedPeriod'] || changes['startDate'] || changes['endDate']) {
      this.fetchAllChartsData();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onChartSelectionChange(): void {
    // Trigger fetch when selection changes
    this.fetchAllChartsData();
  }

  openChartDialog(chart: DisplayChart): void {
    this.selectedChartForDialog = { ...chart, options: this.getCommonChartOptions(true) }; // Enlarge options
    this.showDialog = true;
    this.cd.markForCheck();
  }

  fetchAllChartsData(): void {
    if (this.selectedCharts.length === 0) {
      this.displayCharts = [];
      this.cd.markForCheck();
      return;
    }

    this.isGlobalLoading = true;
    // Initialize displayCharts with loading state for each selected chart
    this.displayCharts = this.selectedCharts.map(chartValue => ({
      title: 'Loading...',
      type: 'bar', // Placeholder
      data: null,
      options: null,
      isLoading: true
    }));

    // Fetch data for all selected charts in parallel using forkJoin
    const chartRequests = this.selectedCharts.map(chartValue =>
      this.chartService.getChartData(chartValue, this.selectedPeriod, this.startDate, this.endDate).pipe(  // Updated to pass dates if service supports
        map(response => ({ chartValue, response })),
        catchError(err => of({ chartValue, error: err }))
      )
    );

    forkJoin(chartRequests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          results.forEach((result, index) => {
            if ('error' in result) {
              this.displayCharts[index] = {
                ...this.displayCharts[index],
                title: `Error loading ${result.chartValue}`,
                isLoading: false,
                error: 'Failed to fetch data'
              };
              this.messageService.showError('Error', `Failed to fetch data for ${result.chartValue}.`);
            } else {
              const apiData = result.response;
              if (apiData && apiData.data?.length > 0) {
                this.displayCharts[index] = {
                  title: apiData.title,
                  type: this.getPrimeNgChartType(apiData.type),
                  data: this.prepareChartData(apiData),
                  options: this.getCommonChartOptions(),
                  isLoading: false
                };
              } else {
                this.displayCharts[index] = {
                  ...this.displayCharts[index],
                  title: apiData.title || 'No Data',
                  isLoading: false,
                  error: 'No data available'
                };
                this.messageService.showWarn('No Data', `No data found for ${result.chartValue}.`);
              }
            }
          });
          this.isGlobalLoading = false;
          this.cd.markForCheck();
        },
        error: () => {
          this.isGlobalLoading = false;
          this.messageService.showError('Error', 'Failed to fetch chart data.');
          this.cd.markForCheck();
        }
      });
  }

  private prepareChartData(apiData: any): any {
    if (!isPlatformBrowser(this.platformId)) return null;

    const documentStyle = getComputedStyle(document.documentElement);
    const accentColor = documentStyle.getPropertyValue('--theme-accent-primary').trim();
    const secondaryColor = documentStyle.getPropertyValue('--theme-warning-primary').trim();
    const colors = [accentColor, secondaryColor, '#FFCE56', '#36A2EB', '#4BC0C0']; // Example palette; expand as needed

    let chartData: any;

    switch (apiData.type) {
      case 'line':
        // Assuming data has multiple series (e.g., revenue and profit)
        const labels = apiData.data.map((d: any) => d.date);
        const datasets = [
          { label: 'Revenue', data: apiData.data.map((d: any) => d.revenue), borderColor: colors[0], fill: false, tension: 0.4 },
          { label: 'Profit', data: apiData.data.map((d: any) => d.profit), borderColor: colors[1], fill: false, tension: 0.4 }
        ];
        chartData = { labels, datasets };
        break;
      case 'bar':
      case 'horizontalBar':
        chartData = {
          labels: apiData.data.map((d: any) => d.brand || d.label || d.product || d.bucket || d.country || d.customer),
          datasets: [{ label: 'Value', data: apiData.data.map((d: any) => d.value || d.revenue || d.count), backgroundColor: colors[0] }]
        };
        break;
      case 'pie':
      case 'donut':
      case 'doughnut':
        chartData = {
          labels: apiData.data.map((d: any) => d.label || d.category || d.channel || d.country),
          datasets: [{
            data: apiData.data.map((d: any) => d.value || d.stock || d.count),
            backgroundColor: colors
          }]
        };
        break;
      case 'stackedBar':
        // Assuming data is pivoted by customerType
        const uniqueDates = [...new Set(apiData.data.map((d: any) => d.date))];
        const newCustomers = apiData.data.filter((d: any) => d.customerType === 'New').map((d: any) => d.revenue);
        const returningCustomers = apiData.data.filter((d: any) => d.customerType === 'Returning').map((d: any) => d.revenue);
        chartData = {
          labels: uniqueDates,
          datasets: [
            { label: 'New', data: newCustomers, backgroundColor: colors[0] },
            { label: 'Returning', data: returningCustomers, backgroundColor: colors[1] }
          ]
        };
        break;
      default:
        chartData = { labels: [], datasets: [] };
    }
    return chartData;
  }

  // --- CORRECTED: The return type now uses our specific PrimeNgChartType ---
  private getPrimeNgChartType(backendType: string): PrimeNgChartType {
    const typeMap: { [key: string]: PrimeNgChartType } = {
      line: 'line',
      bar: 'bar',
      horizontalBar: 'bar', // PrimeNG supports horizontal via options
      pie: 'pie',
      donut: 'doughnut',
      doughnut: 'doughnut',
      stackedBar: 'bar' // Handle stacked in datasets
    };
    return typeMap[backendType] || 'bar';
  }

  private getCommonChartOptions(isDialog: boolean = false): any {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
      maintainAspectRatio: false,
      aspectRatio: isDialog ? 0.8 : 0.6, // Adjust aspect for dialog
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    };
  }
}