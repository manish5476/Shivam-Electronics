import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

// App Services
import { AppMessageService } from '../../../../core/services/message.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { ChartService, ChartOption } from '../../../../core/services/chart.service';

// --- NEW: Define a specific type for PrimeNG charts ---
type PrimeNgChartType = 'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'polarArea' | 'radar';

@Component({
  selector: 'app-dashboard-chart-combo',
  standalone: true,
  imports: [CommonModule, ChartModule, FormsModule, ButtonModule, SkeletonModule, DropdownModule],
  templateUrl: './dashboard-chart-combo.component.html',
  styleUrls: ['./dashboard-chart-combo.component.css']
})
export class DashboardChartComboComponent implements OnInit, OnDestroy {
  // --- State Management ---
  isLoading = true;
  chartData: any;
  chartOptions: any;
  chartType: PrimeNgChartType = 'bar'; // <-- CORRECTED: Use our new, specific type
  chartTitle: string = 'Analytics Chart';

  // --- Filter Controls ---
  chartOptions$: Observable<ChartOption[]> | undefined;
  selectedChart: string = 'revenueAndProfitTrend';

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
    this.fetchChartData();
    this.themeService.settings$.pipe(takeUntil(this.destroy$)).subscribe(() => {
        if (this.chartData) {
            this.refreshChartStyles();
        }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchChartData(): void {
    this.isLoading = true;
    if (!this.selectedChart || !this.selectedPeriod) return;

    this.chartService.getChartData(this.selectedChart, this.selectedPeriod)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const apiData = response.data;
          if (apiData && apiData.data?.length > 0) {
            this.chartTitle = apiData.title;
            this.chartType = this.getPrimeNgChartType(apiData.type);
            this.prepareChart(apiData);
          } else {
            this.messageService.showWarn('No Data', 'No data found for the selected criteria.');
            this.chartData = null;
          }
          this.isLoading = false;
          this.cd.markForCheck();
        },
        error: (err) => {
          this.isLoading = false;
          this.chartData = null;
          this.messageService.showError('Error', 'Failed to fetch chart data.');
          this.cd.markForCheck();
        }
      });
  }
  
  private prepareChart(apiData: any): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const documentStyle = getComputedStyle(document.documentElement);
    const accentColor = documentStyle.getPropertyValue('--theme-accent-primary').trim();
    const secondaryColor = documentStyle.getPropertyValue('--theme-warning-primary').trim();

    switch(apiData.type) {
        case 'line':
            this.chartData = {
                labels: apiData.data.map((d: any) => d.date),
                datasets: [
                    { label: 'Revenue', data: apiData.data.map((d: any) => d.revenue), borderColor: accentColor, fill: false, tension: 0.4 },
                    { label: 'Profit', data: apiData.data.map((d: any) => d.profit), borderColor: secondaryColor, fill: false, tension: 0.4 }
                ]
            };
            break;
        case 'bar':
             this.chartData = {
                labels: apiData.data.map((d: any) => d.brand || d.label), // Handle both brand and category charts
                datasets: [{ label: 'Total Revenue', data: apiData.data.map((d: any) => d.value), backgroundColor: accentColor }]
            };
            break;
        case 'pie':
        case 'donut':
             this.chartData = {
                labels: apiData.data.map((d: any) => d.label),
                datasets: [{ data: apiData.data.map((d: any) => d.value) }]
            };
            break;
        default:
            this.chartData = { labels: [], datasets: [] };
    }
    this.refreshChartStyles();
  }
  
  private refreshChartStyles(): void {
      this.chartOptions = this.getCommonChartOptions();
  }

  // --- CORRECTED: The return type now uses our specific PrimeNgChartType ---
  private getPrimeNgChartType(backendType: string): PrimeNgChartType {
      const typeMap: { [key: string]: PrimeNgChartType } = {
          line: 'line',
          bar: 'bar',
          pie: 'pie',
          donut: 'doughnut',
          stackedBar: 'bar'
      };
      return typeMap[backendType] || 'bar';
  }

  private getCommonChartOptions(): any {
    // ... your getCommonChartOptions function remains here ...
  }
}

// import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
// import { isPlatformBrowser, CommonModule } from '@angular/common';
// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
// import { FormsModule } from '@angular/forms';

// // PrimeNG Modules
// import { ChartModule } from 'primeng/chart';
// import { InputTextModule } from 'primeng/inputtext';
// import { ButtonModule } from 'primeng/button';
// import { SkeletonModule } from 'primeng/skeleton';
// import { SelectButtonModule } from 'primeng/selectbutton';
// // App Services
// import { DashboardService } from '../../../../core/services/dashboard.service';
// import { AppMessageService } from '../../../../core/services/message.service';
// import { ThemeService } from '../../../../core/services/theme.service';
// import { ChartService } from '../../../../core/services/chart.service';
// type ChartView = 'Monthly' | 'Weekly';

// @Component({
//   selector: 'app-dashboard-chart-combo',
//   standalone: true,
//   imports: [CommonModule, ChartModule, FormsModule, InputTextModule, ButtonModule, SkeletonModule, SelectButtonModule],
//   templateUrl: './dashboard-chart-combo.component.html',
//   styleUrls: ['./dashboard-chart-combo.component.css']
// })
// export class DashboardChartComboComponent implements OnInit, OnDestroy {
//   // --- State Management ---
//   yearInput: string = new Date().getFullYear().toString();
//   isLoading = true;
//   chartData: any;
//   chartOptions: any;
//   dashboardYearlyChart: any;
  
//   // --- View Control ---
//   viewOptions: any[] = [{ label: 'Monthly', value: 'Monthly' }, { label: 'Weekly', value: 'Weekly' }];
//   selectedView: ChartView = 'Monthly';

//   private destroy$ = new Subject<void>();
//   private monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//   // --- Dependency Injection ---
//   platformId = inject(PLATFORM_ID);
//   private ChartService = inject(ChartService);
//   private messageService = inject(AppMessageService);
//   private themeService = inject(ThemeService);
//   private cd = inject(ChangeDetectorRef);

//   ngOnInit() {
//     this.fetchSalesData();
//     this.themeService.settings$.pipe(takeUntil(this.destroy$)).subscribe(() => {
//         if (this.dashboardYearlyChart) {
//             this.updateChart();
//         }
//     });
//   }

//   ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   getChartOptions(): void {
//     this.isLoading = true;
//     const year = parseInt(this.yearInput, 10);
//     if (isNaN(year)) {
//       this.messageService.showError('Invalid Year', 'Please enter a valid year.');
//       this.isLoading = false;
//       return;
//     }

//     this.ChartService.getChartOptions({ year })
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(res => {
//         if (res?.success && res.data) {
//           this.dashboardYearlyChart = res.data;
//           this.updateChart(); // Initial chart render
//         } else {
//           this.messageService.showWarn('No Data', 'No sales data found for the selected year.');
//           this.dashboardYearlyChart = null; // Clear old data
//           this.updateChart(); // Render empty chart
//         }
//         this.isLoading = false;
//         this.cd.markForCheck();
//       });
//   }
//   getChartData(): void {
//     this.isLoading = true;
//     const year = parseInt(this.yearInput, 10);
//     if (isNaN(year)) {
//       this.messageService.showError('Invalid Year', 'Please enter a valid year.');
//       this.isLoading = false;
//       return;
//     }

//     this.ChartService.getChartData({ year })
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(res => {
//         if (res?.success && res.data) {
//           this.dashboardYearlyChart = res.data;
//           this.updateChart(); // Initial chart render
//         } else {
//           this.messageService.showWarn('No Data', 'No sales data found for the selected year.');
//           this.dashboardYearlyChart = null; // Clear old data
//           this.updateChart(); // Render empty chart
//         }
//         this.isLoading = false;
//         this.cd.markForCheck();
//       });
//   }

//   onViewChange(view: ChartView): void {
//     this.selectedView = view;
//     this.updateChart();
//   }

//   updateChart(): void {
//     if (this.selectedView === 'Monthly') {
//       this.prepareMonthlyChart();
//     } else {
//       this.prepareWeeklyChart();
//     }
//   }

//   private prepareMonthlyChart(): void {
//     if (!isPlatformBrowser(this.platformId)) return;

//     const documentStyle = getComputedStyle(document.documentElement);
//     const accentColor = documentStyle.getPropertyValue('--theme-accent-primary').trim();
//     // Use the warning color as a secondary accent for the line chart
//     const secondaryAccentColor = documentStyle.getPropertyValue('--theme-warning-primary').trim();
    
//     const yearlyData = this.dashboardYearlyChart?.yearlySales?.monthlySales || [];
    
//     const labels = yearlyData.map((sale: any) => this.monthNames[sale.month - 1]);
//     const revenueData = yearlyData.map((sale: any) => sale.totalRevenue);
//     const salesCountData = yearlyData.map((sale: any) => sale.salesCount);

//     this.chartData = {
//       labels: labels,
//       datasets: [
//         {
//           type: 'line',
//           label: 'Number of Sales',
//           borderColor: secondaryAccentColor,
//           borderWidth: 2,
//           fill: false,
//           tension: 0.4,
//           data: salesCountData,
//           yAxisID: 'y1'
//         },
//         {
//           type: 'bar',
//           label: 'Monthly Revenue',
//           backgroundColor: accentColor,
//           borderColor: accentColor,
//           data: revenueData,
//           yAxisID: 'y'
//         }
//       ]
//     };
//     this.chartOptions = this.getCommonChartOptions('Month', 'Total Revenue', 'Number of Sales');
//   }

//   private prepareWeeklyChart(): void {
//     if (!isPlatformBrowser(this.platformId)) return;

//     const documentStyle = getComputedStyle(document.documentElement);
//     const accentColor = documentStyle.getPropertyValue('--theme-accent-primary').trim();
//     const weeklyData = this.dashboardYearlyChart?.weeklySales || [];

//     const labels = weeklyData.map((week: any) => `W${week.week}`);
//     const weeklyRevenue = weeklyData.map((week: any) =>
//       week.dailySales.reduce((sum: number, day: any) => sum + (day.totalRevenue || 0), 0)
//     );

//     this.chartData = {
//       labels: labels,
//       datasets: [{
//         label: 'Weekly Revenue',
//         data: weeklyRevenue,
//         backgroundColor: accentColor,
//         borderColor: accentColor,
//         barThickness: 20,
//       }]
//     };
//     this.chartOptions = this.getCommonChartOptions('Week', 'Total Revenue');
//   }

//   private getCommonChartOptions(xTitle: string, yTitle: string, y1Title?: string): any {
//     if (!isPlatformBrowser(this.platformId)) return {};
    
//     const documentStyle = getComputedStyle(document.documentElement);
//     const textColor = documentStyle.getPropertyValue('--theme-text-primary').trim();
//     const textColorSecondary = documentStyle.getPropertyValue('--theme-text-secondary').trim();
//     const surfaceBorder = documentStyle.getPropertyValue('--theme-border-primary').trim();
//     const secondaryAccentColor = documentStyle.getPropertyValue('--theme-warning-primary').trim();

//     const scales: any = {
//       x: {
//         ticks: { color: textColorSecondary, font: { weight: 500 } },
//         grid: { color: 'transparent' },
//         title: { display: true, text: xTitle, color: textColor }
//       },
//       y: {
//         ticks: { color: textColorSecondary, callback: (val: number) => `₹${val / 1000}k` },
//         grid: { color: surfaceBorder, drawBorder: false },
//         title: { display: true, text: yTitle, color: textColor },
//         beginAtZero: true
//       }
//     };

//     if (y1Title) {
//       scales.y1 = {
//         position: 'right',
//         ticks: { color: secondaryAccentColor },
//         grid: { drawOnChartArea: false },
//         title: { display: true, text: y1Title, color: secondaryAccentColor },
//         beginAtZero: true
//       };
//     }

//     return {
//       maintainAspectRatio: false,
//       aspectRatio: 0.7,
//       plugins: {
//         legend: { position: 'top', labels: { color: textColor, usePointStyle: true } },
//         tooltip: {
//             backgroundColor: 'rgba(0,0,0,0.8)',
//             titleFont: { size: 14, weight: 'bold' },
//             bodyFont: { size: 12 },
//             padding: 10,
//             cornerRadius: 4,
//             displayColors: true,
//             boxPadding: 4
//         }
//       },
//       scales: scales
//     };
//   }
// }