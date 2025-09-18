import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
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
  styleUrls: ['./dashboard-chart-combo.component.css']
})
export class DashboardChartComboComponent implements OnInit, OnDestroy {
  // --- State Management ---
  isGlobalLoading = false; // For initial load or full refresh
  displayCharts: DisplayChart[] = []; // Array to hold multiple charts

  // Dialog State
  showDialog = false;
  selectedChartForDialog: DisplayChart | null = null;

  // --- Filter Controls ---
  chartOptions$: Observable<ChartOption[]> | undefined;
  selectedCharts: string[] = ['revenueAndProfitTrend']; // Default to one chart; array for multiselect

  periodOptions: any[] = [
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'Last 90 Days', value: 'last90days' },
    { label: 'This Month', value: 'thismonth' },
    { label: 'This Year', value: 'thisyear' },
  ];
  selectedPeriod: string = 'last30days';

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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onChartSelectionChange(): void {
    // Trigger fetch when selection changes
    this.fetchAllChartsData();
  }

  onPeriodChange(): void {
    // Trigger fetch when period changes
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
      this.chartService.getChartData(chartValue, this.selectedPeriod).pipe(
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
// import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
// import { isPlatformBrowser, CommonModule } from '@angular/common';
// import { Subject, Observable, forkJoin, of } from 'rxjs';
// import { takeUntil, catchError, map } from 'rxjs/operators';
// import { FormsModule } from '@angular/forms';

// // PrimeNG Modules
// import { ChartModule } from 'primeng/chart';
// import { MultiSelectModule } from 'primeng/multiselect'; // Updated to MultiSelect
// import { DropdownModule } from 'primeng/dropdown';
// import { ButtonModule } from 'primeng/button';
// import { SkeletonModule } from 'primeng/skeleton';
// import { CardModule } from 'primeng/card';

// // App Services
// import { AppMessageService } from '../../../../core/services/message.service';
// import { ThemeService } from '../../../../core/services/theme.service';
// import { ChartService, ChartOption } from '../../../../core/services/chart.service';

// // --- NEW: Define a specific type for PrimeNG charts ---
// type PrimeNgChartType = 'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'polarArea' | 'radar';

// interface DisplayChart {
//   title: string;
//   type: PrimeNgChartType;
//   data: any;
//   options: any;
//   isLoading: boolean;
//   error?: string;
// }

// @Component({
//   selector: 'app-dashboard-chart-combo',
//   standalone: true,
//   imports: [
//     CommonModule, FormsModule, ChartModule, MultiSelectModule, DropdownModule, ButtonModule, SkeletonModule, CardModule
//   ],
//   templateUrl: './dashboard-chart-combo.component.html',
//   styleUrls: ['./dashboard-chart-combo.component.css']
// })
// export class DashboardChartComboComponent implements OnInit, OnDestroy {
//   // --- State Management ---
//   isGlobalLoading = false; // For initial load or full refresh
//   displayCharts: DisplayChart[] = []; // Array to hold multiple charts

//   // --- Filter Controls ---
//   chartOptions$: Observable<ChartOption[]> | undefined;
//   selectedCharts: string[] = ['revenueAndProfitTrend']; // Default to one chart; array for multiselect

//   periodOptions: any[] = [
//     { label: 'Last 7 Days', value: 'last7days' },
//     { label: 'Last 30 Days', value: 'last30days' },
//     { label: 'Last 90 Days', value: 'last90days' },
//     { label: 'This Month', value: 'thismonth' },
//     { label: 'This Year', value: 'thisyear' },
//   ];
//   selectedPeriod: string = 'last30days';

//   private destroy$ = new Subject<void>();

//   // --- Dependency Injection ---
//   private platformId = inject(PLATFORM_ID);
//   private chartService = inject(ChartService);
//   private messageService = inject(AppMessageService);
//   private themeService = inject(ThemeService);
//   private cd = inject(ChangeDetectorRef);

//   ngOnInit() {
//     this.chartOptions$ = this.chartService.getChartOptions();
//     this.fetchAllChartsData();
//     this.themeService.settings$.pipe(takeUntil(this.destroy$)).subscribe(() => {
//       this.displayCharts.forEach(chart => {
//         if (chart.data) {
//           chart.options = this.getCommonChartOptions();
//         }
//       });
//       this.cd.markForCheck();
//     });
//   }

//   ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   onChartSelectionChange(): void {
//     // Trigger fetch when selection changes
//     this.fetchAllChartsData();
//   }

//   onPeriodChange(): void {
//     // Trigger fetch when period changes
//     this.fetchAllChartsData();
//   }

//   fetchAllChartsData(): void {
//     if (this.selectedCharts.length === 0) {
//       this.displayCharts = [];
//       this.cd.markForCheck();
//       return;
//     }

//     this.isGlobalLoading = true;
//     // Initialize displayCharts with loading state for each selected chart
//     this.displayCharts = this.selectedCharts.map(chartValue => ({
//       title: 'Loading...',
//       type: 'bar', // Placeholder
//       data: null,
//       options: null,
//       isLoading: true
//     }));

//     // Fetch data for all selected charts in parallel using forkJoin
//     const chartRequests = this.selectedCharts.map(chartValue =>
//       this.chartService.getChartData(chartValue, this.selectedPeriod).pipe(
//         map(response => ({ chartValue, response })),
//         catchError(err => of({ chartValue, error: err }))
//       )
//     );

//     forkJoin(chartRequests)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (results) => {
//           results.forEach((result, index) => {
//             if ('error' in result) {
//               this.displayCharts[index] = {
//                 ...this.displayCharts[index],
//                 title: `Error loading ${result.chartValue}`,
//                 isLoading: false,
//                 error: 'Failed to fetch data'
//               };
//               this.messageService.showError('Error', `Failed to fetch data for ${result.chartValue}.`);
//             } else {
//               const apiData = result.response;
//               if (apiData && apiData.data?.length > 0) {
//                 this.displayCharts[index] = {
//                   title: apiData.title,
//                   type: this.getPrimeNgChartType(apiData.type),
//                   data: this.prepareChartData(apiData),
//                   options: this.getCommonChartOptions(),
//                   isLoading: false
//                 };
//               } else {
//                 this.displayCharts[index] = {
//                   ...this.displayCharts[index],
//                   title: apiData.title || 'No Data',
//                   isLoading: false,
//                   error: 'No data available'
//                 };
//                 this.messageService.showWarn('No Data', `No data found for ${result.chartValue}.`);
//               }
//             }
//           });
//           this.isGlobalLoading = false;
//           this.cd.markForCheck();
//         },
//         error: () => {
//           this.isGlobalLoading = false;
//           this.messageService.showError('Error', 'Failed to fetch chart data.');
//           this.cd.markForCheck();
//         }
//       });
//   }

//   private prepareChartData(apiData: any): any {
//     if (!isPlatformBrowser(this.platformId)) return null;

//     const documentStyle = getComputedStyle(document.documentElement);
//     const accentColor = documentStyle.getPropertyValue('--theme-accent-primary').trim();
//     const secondaryColor = documentStyle.getPropertyValue('--theme-warning-primary').trim();
//     const colors = [accentColor, secondaryColor, '#FFCE56', '#36A2EB', '#4BC0C0']; // Example palette; expand as needed

//     let chartData: any;

//     switch (apiData.type) {
//       case 'line':
//         // Assuming data has multiple series (e.g., revenue and profit)
//         const labels = apiData.data.map((d: any) => d.date);
//         const datasets = [
//           { label: 'Revenue', data: apiData.data.map((d: any) => d.revenue), borderColor: colors[0], fill: false, tension: 0.4 },
//           { label: 'Profit', data: apiData.data.map((d: any) => d.profit), borderColor: colors[1], fill: false, tension: 0.4 }
//         ];
//         chartData = { labels, datasets };
//         break;
//       case 'bar':
//       case 'horizontalBar':
//         chartData = {
//           labels: apiData.data.map((d: any) => d.brand || d.label || d.product || d.bucket || d.country || d.customer),
//           datasets: [{ label: 'Value', data: apiData.data.map((d: any) => d.value || d.revenue || d.count), backgroundColor: colors[0] }]
//         };
//         break;
//       case 'pie':
//       case 'donut':
//       case 'doughnut':
//         chartData = {
//           labels: apiData.data.map((d: any) => d.label || d.category || d.channel || d.country),
//           datasets: [{
//             data: apiData.data.map((d: any) => d.value || d.stock || d.count),
//             backgroundColor: colors
//           }]
//         };
//         break;
//       case 'stackedBar':
//         // Assuming data is pivoted by customerType
//         const uniqueDates = [...new Set(apiData.data.map((d: any) => d.date))];
//         const newCustomers = apiData.data.filter((d: any) => d.customerType === 'New').map((d: any) => d.revenue);
//         const returningCustomers = apiData.data.filter((d: any) => d.customerType === 'Returning').map((d: any) => d.revenue);
//         chartData = {
//           labels: uniqueDates,
//           datasets: [
//             { label: 'New', data: newCustomers, backgroundColor: colors[0] },
//             { label: 'Returning', data: returningCustomers, backgroundColor: colors[1] }
//           ]
//         };
//         break;
//       default:
//         chartData = { labels: [], datasets: [] };
//     }
//     return chartData;
//   }

//   // --- CORRECTED: The return type now uses our specific PrimeNgChartType ---
//   private getPrimeNgChartType(backendType: string): PrimeNgChartType {
//     const typeMap: { [key: string]: PrimeNgChartType } = {
//       line: 'line',
//       bar: 'bar',
//       horizontalBar: 'bar', // PrimeNG supports horizontal via options
//       pie: 'pie',
//       donut: 'doughnut',
//       doughnut: 'doughnut',
//       stackedBar: 'bar' // Handle stacked in datasets
//     };
//     return typeMap[backendType] || 'bar';
//   }

//   private getCommonChartOptions(): any {
//     const documentStyle = getComputedStyle(document.documentElement);
//     const textColor = documentStyle.getPropertyValue('--text-color');
//     const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
//     const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

//     return {
//       maintainAspectRatio: false,
//       aspectRatio: 0.6,
//       plugins: {
//         legend: {
//           labels: {
//             color: textColor
//           }
//         }
//       },
//       scales: {
//         x: {
//           ticks: {
//             color: textColorSecondary
//           },
//           grid: {
//             color: surfaceBorder
//           }
//         },
//         y: {
//           ticks: {
//             color: textColorSecondary
//           },
//           grid: {
//             color: surfaceBorder
//           }
//         }
//       }
//     };
//   }
// }

// // import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
// // import { isPlatformBrowser, CommonModule } from '@angular/common';
// // import { Subject, Observable } from 'rxjs';
// // import { takeUntil } from 'rxjs/operators';
// // import { FormsModule } from '@angular/forms';
// // import { Select } from 'primeng/select';

// // // PrimeNG Modules
// // import { ChartModule } from 'primeng/chart';
// // import { DropdownModule } from 'primeng/dropdown';
// // import { ButtonModule } from 'primeng/button';
// // import { SkeletonModule } from 'primeng/skeleton';

// // // App Services
// // import { AppMessageService } from '../../../../core/services/message.service';
// // import { ThemeService } from '../../../../core/services/theme.service';
// // import { ChartService, ChartOption } from '../../../../core/services/chart.service';

// // // --- NEW: Define a specific type for PrimeNG charts ---
// // type PrimeNgChartType = 'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'polarArea' | 'radar';

// // @Component({
// //   selector: 'app-dashboard-chart-combo',
// //   standalone: true,
// //   imports: [CommonModule, ChartModule,Select, FormsModule, ButtonModule, SkeletonModule, DropdownModule],
// //   templateUrl: './dashboard-chart-combo.component.html',
// //   styleUrls: ['./dashboard-chart-combo.component.css']
// // })
// // export class DashboardChartComboComponent implements OnInit, OnDestroy {
// //   // --- State Management ---
// //   isLoading = true;
// //   chartData: any;
// //   chartOptions: any;
// //   chartType: PrimeNgChartType = 'bar'; // <-- CORRECTED: Use our new, specific type
// //   chartTitle: string = 'Analytics Chart';

// //   // --- Filter Controls ---
// //   chartOptions$: Observable<ChartOption[]> | undefined;
// //   selectedChart: string = 'revenueAndProfitTrend';

// //   periodOptions: any[] = [
// //     { label: 'Last 7 Days', value: 'last7days' },
// //     { label: 'Last 30 Days', value: 'last30days' },
// //     { label: 'Last 90 Days', value: 'last90days' },
// //     { label: 'This Month', value: 'thismonth' },
// //     { label: 'This Year', value: 'thisyear' },
// //   ];
// //   selectedPeriod: string = 'last30days';

// //   private destroy$ = new Subject<void>();

// //   // --- Dependency Injection ---
// //   private platformId = inject(PLATFORM_ID);
// //   private chartService = inject(ChartService);
// //   private messageService = inject(AppMessageService);
// //   private themeService = inject(ThemeService);
// //   private cd = inject(ChangeDetectorRef);

// //   ngOnInit() {
// //     this.chartOptions$ = this.chartService.getChartOptions();
// //     this.fetchChartData();
// //     this.themeService.settings$.pipe(takeUntil(this.destroy$)).subscribe(() => {
// //         if (this.chartData) {
// //             this.refreshChartStyles();
// //         }
// //     });
// //   }

// //   ngOnDestroy() {
// //     this.destroy$.next();
// //     this.destroy$.complete();
// //   }

// //   fetchChartData(): void {
// //     this.isLoading = true;
// //     if (!this.selectedChart || !this.selectedPeriod) return;

// //     this.chartService.getChartData(this.selectedChart, this.selectedPeriod)
// //       .pipe(takeUntil(this.destroy$))
// //       .subscribe({
// //         next: (response) => {
// //           const apiData = response.data;
// //           if (apiData && apiData.data?.length > 0) {
// //             this.chartTitle = apiData.title;
// //             this.chartType = this.getPrimeNgChartType(apiData.type);
// //             this.prepareChart(apiData);
// //           } else {
// //             this.messageService.showWarn('No Data', 'No data found for the selected criteria.');
// //             this.chartData = null;
// //           }
// //           this.isLoading = false;
// //           this.cd.markForCheck();
// //         },
// //         error: (err) => {
// //           this.isLoading = false;
// //           this.chartData = null;
// //           this.messageService.showError('Error', 'Failed to fetch chart data.');
// //           this.cd.markForCheck();
// //         }
// //       });
// //   }
  
// //   private prepareChart(apiData: any): void {
// //     if (!isPlatformBrowser(this.platformId)) return;
    
// //     const documentStyle = getComputedStyle(document.documentElement);
// //     const accentColor = documentStyle.getPropertyValue('--theme-accent-primary').trim();
// //     const secondaryColor = documentStyle.getPropertyValue('--theme-warning-primary').trim();

// //     switch(apiData.type) {
// //         case 'line':
// //             this.chartData = {
// //                 labels: apiData.data.map((d: any) => d.date),
// //                 datasets: [
// //                     { label: 'Revenue', data: apiData.data.map((d: any) => d.revenue), borderColor: accentColor, fill: false, tension: 0.4 },
// //                     { label: 'Profit', data: apiData.data.map((d: any) => d.profit), borderColor: secondaryColor, fill: false, tension: 0.4 }
// //                 ]
// //             };
// //             break;
// //         case 'bar':
// //              this.chartData = {
// //                 labels: apiData.data.map((d: any) => d.brand || d.label), // Handle both brand and category charts
// //                 datasets: [{ label: 'Total Revenue', data: apiData.data.map((d: any) => d.value), backgroundColor: accentColor }]
// //             };
// //             break;
// //         case 'pie':
// //         case 'donut':
// //              this.chartData = {
// //                 labels: apiData.data.map((d: any) => d.label),
// //                 datasets: [{ data: apiData.data.map((d: any) => d.value) }]
// //             };
// //             break;
// //         default:
// //             this.chartData = { labels: [], datasets: [] };
// //     }
// //     this.refreshChartStyles();
// //   }
  
// //   private refreshChartStyles(): void {
// //       this.chartOptions = this.getCommonChartOptions();
// //   }

// //   // --- CORRECTED: The return type now uses our specific PrimeNgChartType ---
// //   private getPrimeNgChartType(backendType: string): PrimeNgChartType {
// //       const typeMap: { [key: string]: PrimeNgChartType } = {
// //           line: 'line',
// //           bar: 'bar',
// //           pie: 'pie',
// //           donut: 'doughnut',
// //           stackedBar: 'bar'
// //       };
// //       return typeMap[backendType] || 'bar';
// //   }

// //   private getCommonChartOptions(): any {
// //     // ... your getCommonChartOptions function remains here ...
// //   }
// // }

// // // import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
// // // import { isPlatformBrowser, CommonModule } from '@angular/common';
// // // import { Subject } from 'rxjs';
// // // import { takeUntil } from 'rxjs/operators';
// // // import { FormsModule } from '@angular/forms';

// // // // PrimeNG Modules
// // // import { ChartModule } from 'primeng/chart';
// // // import { InputTextModule } from 'primeng/inputtext';
// // // import { ButtonModule } from 'primeng/button';
// // // import { SkeletonModule } from 'primeng/skeleton';
// // // import { SelectButtonModule } from 'primeng/selectbutton';
// // // // App Services
// // // import { DashboardService } from '../../../../core/services/dashboard.service';
// // // import { AppMessageService } from '../../../../core/services/message.service';
// // // import { ThemeService } from '../../../../core/services/theme.service';
// // // import { ChartService } from '../../../../core/services/chart.service';
// // // type ChartView = 'Monthly' | 'Weekly';

// // // @Component({
// // //   selector: 'app-dashboard-chart-combo',
// // //   standalone: true,
// // //   imports: [CommonModule, ChartModule, FormsModule, InputTextModule, ButtonModule, SkeletonModule, SelectButtonModule],
// // //   templateUrl: './dashboard-chart-combo.component.html',
// // //   styleUrls: ['./dashboard-chart-combo.component.css']
// // // })
// // // export class DashboardChartComboComponent implements OnInit, OnDestroy {
// // //   // --- State Management ---
// // //   yearInput: string = new Date().getFullYear().toString();
// // //   isLoading = true;
// // //   chartData: any;
// // //   chartOptions: any;
// // //   dashboardYearlyChart: any;
  
// // //   // --- View Control ---
// // //   viewOptions: any[] = [{ label: 'Monthly', value: 'Monthly' }, { label: 'Weekly', value: 'Weekly' }];
// // //   selectedView: ChartView = 'Monthly';

// // //   private destroy$ = new Subject<void>();
// // //   private monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// // //   // --- Dependency Injection ---
// // //   platformId = inject(PLATFORM_ID);
// // //   private ChartService = inject(ChartService);
// // //   private messageService = inject(AppMessageService);
// // //   private themeService = inject(ThemeService);
// // //   private cd = inject(ChangeDetectorRef);

// // //   ngOnInit() {
// // //     this.fetchSalesData();
// // //     this.themeService.settings$.pipe(takeUntil(this.destroy$)).subscribe(() => {
// // //         if (this.dashboardYearlyChart) {
// // //             this.updateChart();
// // //         }
// // //     });
// // //   }

// // //   ngOnDestroy() {
// // //     this.destroy$.next();
// // //     this.destroy$.complete();
// // //   }

// // //   getChartOptions(): void {
// // //     this.isLoading = true;
// // //     const year = parseInt(this.yearInput, 10);
// // //     if (isNaN(year)) {
// // //       this.messageService.showError('Invalid Year', 'Please enter a valid year.');
// // //       this.isLoading = false;
// // //       return;
// // //     }

// // //     this.ChartService.getChartOptions({ year })
// // //       .pipe(takeUntil(this.destroy$))
// // //       .subscribe(res => {
// // //         if (res?.success && res.data) {
// // //           this.dashboardYearlyChart = res.data;
// // //           this.updateChart(); // Initial chart render
// // //         } else {
// // //           this.messageService.showWarn('No Data', 'No sales data found for the selected year.');
// // //           this.dashboardYearlyChart = null; // Clear old data
// // //           this.updateChart(); // Render empty chart
// // //         }
// // //         this.isLoading = false;
// // //         this.cd.markForCheck();
// // //       });
// // //   }
// // //   getChartData(): void {
// // //     this.isLoading = true;
// // //     const year = parseInt(this.yearInput, 10);
// // //     if (isNaN(year)) {
// // //       this.messageService.showError('Invalid Year', 'Please enter a valid year.');
// // //       this.isLoading = false;
// // //       return;
// // //     }

// // //     this.ChartService.getChartData({ year })
// // //       .pipe(takeUntil(this.destroy$))
// // //       .subscribe(res => {
// // //         if (res?.success && res.data) {
// // //           this.dashboardYearlyChart = res.data;
// // //           this.updateChart(); // Initial chart render
// // //         } else {
// // //           this.messageService.showWarn('No Data', 'No sales data found for the selected year.');
// // //           this.dashboardYearlyChart = null; // Clear old data
// // //           this.updateChart(); // Render empty chart
// // //         }
// // //         this.isLoading = false;
// // //         this.cd.markForCheck();
// // //       });
// // //   }

// // //   onViewChange(view: ChartView): void {
// // //     this.selectedView = view;
// // //     this.updateChart();
// // //   }

// // //   updateChart(): void {
// // //     if (this.selectedView === 'Monthly') {
// // //       this.prepareMonthlyChart();
// // //     } else {
// // //       this.prepareWeeklyChart();
// // //     }
// // //   }

// // //   private prepareMonthlyChart(): void {
// // //     if (!isPlatformBrowser(this.platformId)) return;

// // //     const documentStyle = getComputedStyle(document.documentElement);
// // //     const accentColor = documentStyle.getPropertyValue('--theme-accent-primary').trim();
// // //     // Use the warning color as a secondary accent for the line chart
// // //     const secondaryAccentColor = documentStyle.getPropertyValue('--theme-warning-primary').trim();
    
// // //     const yearlyData = this.dashboardYearlyChart?.yearlySales?.monthlySales || [];
    
// // //     const labels = yearlyData.map((sale: any) => this.monthNames[sale.month - 1]);
// // //     const revenueData = yearlyData.map((sale: any) => sale.totalRevenue);
// // //     const salesCountData = yearlyData.map((sale: any) => sale.salesCount);

// // //     this.chartData = {
// // //       labels: labels,
// // //       datasets: [
// // //         {
// // //           type: 'line',
// // //           label: 'Number of Sales',
// // //           borderColor: secondaryAccentColor,
// // //           borderWidth: 2,
// // //           fill: false,
// // //           tension: 0.4,
// // //           data: salesCountData,
// // //           yAxisID: 'y1'
// // //         },
// // //         {
// // //           type: 'bar',
// // //           label: 'Monthly Revenue',
// // //           backgroundColor: accentColor,
// // //           borderColor: accentColor,
// // //           data: revenueData,
// // //           yAxisID: 'y'
// // //         }
// // //       ]
// // //     };
// // //     this.chartOptions = this.getCommonChartOptions('Month', 'Total Revenue', 'Number of Sales');
// // //   }

// // //   private prepareWeeklyChart(): void {
// // //     if (!isPlatformBrowser(this.platformId)) return;

// // //     const documentStyle = getComputedStyle(document.documentElement);
// // //     const accentColor = documentStyle.getPropertyValue('--theme-accent-primary').trim();
// // //     const weeklyData = this.dashboardYearlyChart?.weeklySales || [];

// // //     const labels = weeklyData.map((week: any) => `W${week.week}`);
// // //     const weeklyRevenue = weeklyData.map((week: any) =>
// // //       week.dailySales.reduce((sum: number, day: any) => sum + (day.totalRevenue || 0), 0)
// // //     );

// // //     this.chartData = {
// // //       labels: labels,
// // //       datasets: [{
// // //         label: 'Weekly Revenue',
// // //         data: weeklyRevenue,
// // //         backgroundColor: accentColor,
// // //         borderColor: accentColor,
// // //         barThickness: 20,
// // //       }]
// // //     };
// // //     this.chartOptions = this.getCommonChartOptions('Week', 'Total Revenue');
// // //   }

// // //   private getCommonChartOptions(xTitle: string, yTitle: string, y1Title?: string): any {
// // //     if (!isPlatformBrowser(this.platformId)) return {};
    
// // //     const documentStyle = getComputedStyle(document.documentElement);
// // //     const textColor = documentStyle.getPropertyValue('--theme-text-primary').trim();
// // //     const textColorSecondary = documentStyle.getPropertyValue('--theme-text-secondary').trim();
// // //     const surfaceBorder = documentStyle.getPropertyValue('--theme-border-primary').trim();
// // //     const secondaryAccentColor = documentStyle.getPropertyValue('--theme-warning-primary').trim();

// // //     const scales: any = {
// // //       x: {
// // //         ticks: { color: textColorSecondary, font: { weight: 500 } },
// // //         grid: { color: 'transparent' },
// // //         title: { display: true, text: xTitle, color: textColor }
// // //       },
// // //       y: {
// // //         ticks: { color: textColorSecondary, callback: (val: number) => `₹${val / 1000}k` },
// // //         grid: { color: surfaceBorder, drawBorder: false },
// // //         title: { display: true, text: yTitle, color: textColor },
// // //         beginAtZero: true
// // //       }
// // //     };

// // //     if (y1Title) {
// // //       scales.y1 = {
// // //         position: 'right',
// // //         ticks: { color: secondaryAccentColor },
// // //         grid: { drawOnChartArea: false },
// // //         title: { display: true, text: y1Title, color: secondaryAccentColor },
// // //         beginAtZero: true
// // //       };
// // //     }

// // //     return {
// // //       maintainAspectRatio: false,
// // //       aspectRatio: 0.7,
// // //       plugins: {
// // //         legend: { position: 'top', labels: { color: textColor, usePointStyle: true } },
// // //         tooltip: {
// // //             backgroundColor: 'rgba(0,0,0,0.8)',
// // //             titleFont: { size: 14, weight: 'bold' },
// // //             bodyFont: { size: 12 },
// // //             padding: 10,
// // //             cornerRadius: 4,
// // //             displayColors: true,
// // //             boxPadding: 4
// // //         }
// // //       },
// // //       scales: scales
// // //     };
// // //   }
// // // }