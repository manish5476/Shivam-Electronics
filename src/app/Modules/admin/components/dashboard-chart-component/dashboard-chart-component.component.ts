
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ChartModule } from 'primeng/chart';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DropdownModule } from 'primeng/dropdown';

// App Services
import { DashboardService } from '../../../../core/services/dashboard.service';
import { AppMessageService } from '../../../../core/services/message.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { CommonMethodService } from '../../../../core/Utils/common-method.service';

type ChartType = 'bar' | 'line' | 'combo';

@Component({
  selector: 'app-dashboard-chart-component',
  standalone: true,
  imports: [CommonModule, ChartModule, FormsModule, InputTextModule, ButtonModule, SkeletonModule, DropdownModule],
  templateUrl: './dashboard-chart-component.component.html',
  styleUrls: ['./dashboard-chart-component.component.css']
})
export class DashboardChartComponentComponent implements OnInit, OnDestroy {
  // --- State Management ---
  yearInput: string = new Date().getFullYear().toString();
  isLoading = true;
  chartData: any;
  chartOptions: any;
  dashboardChartData: any;

  // --- View Control ---
  chartTypeOptions: any[] = [
    { label: 'Combo Chart', value: 'combo', icon: 'pi pi-chart-pie' },
    { label: 'Bar Chart', value: 'bar', icon: 'pi pi-chart-bar' },
    { label: 'Line Chart', value: 'line', icon: 'pi pi-chart-line' }
  ];
  selectedChartType: ChartType = 'combo';

  private destroy$ = new Subject<void>();
  private monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // --- Dependency Injection ---
  platformId = inject(PLATFORM_ID);
  private dashboardService = inject(DashboardService);
  private messageService = inject(AppMessageService);
  private themeService = inject(ThemeService);
  private cd = inject(ChangeDetectorRef);
  public commonMethod = inject(CommonMethodService);

  ngOnInit() {
    this.fetchSalesData();

    // Reactively update chart colors whenever the theme changes
    this.themeService.settings$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.dashboardChartData) {
        this.updateChart();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchSalesData(): void {
    this.isLoading = true;
    const year = parseInt(this.yearInput, 10);
    if (isNaN(year)) {
      this.messageService.showError('Invalid Year', 'Please enter a valid year.');
      this.isLoading = false;
      return;
    }

    // // Using the specific yearly endpoint as per your original component
    // this.dashboardService.getSalesDataForChartsYearly({ year })
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(res => {
    //     if (res?.success && res.data) {
    //       this.dashboardChartData = res.data;
    //       this.updateChart();
    //     } else {
    //       this.messageService.showWarn('No Data', 'No sales data found for the selected year.');
    //       this.dashboardChartData = null;
    //       this.updateChart();
    //     }
    //     this.isLoading = false;
    //     this.cd.markForCheck();
    //   });
  }

  onChartTypeChange(): void {
    this.updateChart();
  }

  updateChart(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const documentStyle = getComputedStyle(document.documentElement);
    const accentColor = documentStyle.getPropertyValue('--theme-accent-primary').trim();
    const secondaryAccentColor = documentStyle.getPropertyValue('--theme-accent-secondary').trim();
    const monthlyData = this.dashboardChartData?.monthlySales || [];
    
    const labels = monthlyData.map((sale: any) => this.monthNames[sale.month - 1]);
    const revenueData = monthlyData.map((sale: any) => sale.totalRevenue);
    const salesCountData = monthlyData.map((sale: any) => sale.salesCount);

    const datasets = [];
    if (this.selectedChartType === 'bar' || this.selectedChartType === 'combo') {
        datasets.push({
            type: 'bar',
            label: 'Monthly Revenue',
            backgroundColor: this.createGradient(accentColor),
            borderColor: accentColor,
            data: revenueData,
            yAxisID: 'y'
        });
    }
    if (this.selectedChartType === 'line' || this.selectedChartType === 'combo') {
        datasets.push({
            type: 'line',
            label: 'Number of Sales',
            borderColor: secondaryAccentColor,
            borderWidth: 2,
            fill: true,
            backgroundColor: this.createGradient(secondaryAccentColor, 0.2),
            tension: 0.4,
            data: salesCountData,
            yAxisID: 'y1',
            pointBackgroundColor: secondaryAccentColor,
            pointBorderColor: documentStyle.getPropertyValue('--theme-bg-secondary'),
            pointHoverBackgroundColor: documentStyle.getPropertyValue('--theme-bg-secondary'),
            pointHoverBorderColor: secondaryAccentColor,
            pointRadius: 4,
            pointHoverRadius: 6
        });
    }

    this.chartData = { labels, datasets };
    this.chartOptions = this.getCommonChartOptions('Month', 'Total Revenue', 'Number of Sales');
  }

  private getCommonChartOptions(xTitle: string, yTitle: string, y1Title?: string): any {
    if (!isPlatformBrowser(this.platformId)) return {};
    
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--theme-text-primary');
    const textColorSecondary = documentStyle.getPropertyValue('--theme-text-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--theme-border-primary');
    const secondaryAccentColor = documentStyle.getPropertyValue('--theme-accent-secondary');

    const scales: any = {
      x: {
        ticks: { color: textColorSecondary, font: { weight: 500 } },
        grid: { color: 'transparent' },
        title: { display: true, text: xTitle, color: textColor }
      },
      y: {
        ticks: { color: textColorSecondary, callback: (val: number) => `₹${val / 1000}k` },
        grid: { color: surfaceBorder, drawBorder: false },
        title: { display: true, text: yTitle, color: textColor },
        beginAtZero: true
      }
    };

    if (y1Title && (this.selectedChartType === 'combo')) {
      scales.y1 = {
        position: 'right',
        ticks: { color: secondaryAccentColor },
        grid: { drawOnChartArea: false },
        title: { display: true, text: y1Title, color: secondaryAccentColor },
        beginAtZero: true
      };
    }

    return {
      maintainAspectRatio: false,
      aspectRatio: 0.7,
      plugins: {
        legend: { position: 'top', labels: { color: textColor, usePointStyle: true } },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: 'var(--theme-bg-secondary)',
          titleColor: 'var(--theme-text-primary)',
          bodyColor: 'var(--theme-text-secondary)',
          borderColor: 'var(--theme-border-primary)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          callbacks: {
              label: (context: any) => {
                  let label = context.dataset.label || '';
                  if (label) { label += ': '; }
                  if (context.parsed.y !== null) {
                      if (context.dataset.yAxisID === 'y') {
                          label += this.commonMethod.formatCurrency(context.parsed.y);
                      } else {
                          label += context.parsed.y;
                      }
                  }
                  return label;
              }
          }
        }
      },
      scales: scales
    };
  }
  
  private createGradient(color: string, opacity: number = 0.5): CanvasGradient {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    
    const rgbaColor = this.hexToRgba(color, opacity);

    gradient.addColorStop(0, rgbaColor);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    return gradient;
  }
  
  private hexToRgba(hex: string, alpha: number = 1): string {
      let r = 0, g = 0, b = 0;
      if (hex.length === 4) {
          r = parseInt(hex[1] + hex[1], 16);
          g = parseInt(hex[2] + hex[2], 16);
          b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
          r = parseInt(hex.slice(1, 3), 16);
          g = parseInt(hex.slice(3, 5), 16);
          b = parseInt(hex.slice(5, 7), 16);
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
// import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
// import { ChartModule } from 'primeng/chart';
// import { DashboardService } from '../../../../core/services/dashboard.service';
// import { AppMessageService } from '../../../../core/services/message.service';
// import { Subject, takeUntil, catchError } from 'rxjs';
// import { SkeletonModule } from 'primeng/skeleton';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';

// type ChartView = 'bar' | 'line' | 'both';

// @Component({
//   selector: 'app-dashboard-chart-component',
//   standalone: true,
//   imports: [ChartModule, FormsModule, SkeletonModule, CommonModule, ButtonModule, InputTextModule],
//   templateUrl: './dashboard-chart-component.component.html',
//   styleUrls: ['./dashboard-chart-component.component.css']
// })
// export class DashboardChartComponentComponent implements OnInit, OnDestroy {
//   chartDataBar: any;
//   chartOptionsBar: any;
//   chartDataLine: any;
//   chartOptionsLine: any;

//   isLoading = false;
//   dashboardYearlyChart: any;

//   private destroy$ = new Subject<void>();

//   chartView: ChartView = 'bar'; // default view
//   yearInput: string = new Date().getFullYear().toString();

//   constructor(
//     private dashboardService: DashboardService,
//     private messageService: AppMessageService,
//     private cd: ChangeDetectorRef
//   ) {}

//   ngOnInit() {
//     this.getSalesDataForChartsYearly();
//   }

//   getSalesDataForChartsYearly(): void {
//     const year = this.yearInput ? parseInt(this.yearInput) : new Date().getFullYear();
//     if (isNaN(year) || year < 2000 || year > 2100) {
//       this.messageService.showError('Please enter a valid year (2000-2100).');
//       return;
//     }
//     const params = { year };
//     this.isLoading = true;
//     this.dashboardService.getSalesDataForChartsYearly(params)
//       .pipe(
//         takeUntil(this.destroy$),
//         catchError((err) => {
//           this.messageService.showError('Failed to fetch chart data.');
//           this.isLoading = false;
//           this.cd.markForCheck();
//           throw err;
//         })
//       )
//       .subscribe((res: any) => {
//         if (res?.success && res.data) {
//           this.dashboardYearlyChart = res.data;
//           this.prepareCharts();
//         } else {
//           this.messageService.showError('No data available for the selected year.');
//         }
//         this.isLoading = false;
//         this.cd.markForCheck();
//       });
//   }

//   prepareCharts(): void {
//     const documentStyle = getComputedStyle(document.documentElement);
//     const textColor = documentStyle.getPropertyValue('--text-color') || '#1f2937';
//     const textColorSecondary = documentStyle.getPropertyValue('--text-muted-color') || '#6b7280';
//     const surfaceBorder = documentStyle.getPropertyValue('--content-border-color') || '#e5e7eb';

//     const sales = this.dashboardYearlyChart ? this.dashboardYearlyChart.monthlySales : [];
//     const brightOrange = '#f97316'; // Vibrant orange
//     const skyBlue = '#60a5fa'; // Light blue

//     this.chartDataBar = {
//       labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//       datasets: [
//         {
//           label: 'Total Revenue ($)',
//           data: sales.map((m: { totalRevenue: any }) => m.totalRevenue),
//           backgroundColor: brightOrange,
//           borderColor: brightOrange,
//           borderWidth: 1,
//           barThickness: 20
//         },
//         {
//           label: 'Sales Count',
//           data: sales.map((m: { salesCount: any }) => m.salesCount),
//           backgroundColor: skyBlue,
//           borderColor: skyBlue,
//           borderWidth: 1,
//           barThickness: 20
//         }
//       ]
//     };

//     this.chartOptionsBar = {
//       maintainAspectRatio: false,
//       plugins: {
//         legend: {
//           labels: { color: textColor, font: { size: 14 } },
//           position: 'top'
//         },
//         tooltip: {
//           backgroundColor: '#1f2937',
//           titleColor: '#ffffff',
//           bodyColor: '#ffffff',
//           titleFont: { size: 14 },
//           bodyFont: { size: 12 },
//           padding: 10,
//           cornerRadius: 4
//         }
//       },
//       scales: {
//         x: {
//           ticks: { color: textColorSecondary, font: { size: 12 } },
//           grid: { display: false }
//         },
//         y: {
//           type: 'linear',
//           beginAtZero: true,
//           max: Math.max(...sales.map((m: { totalRevenue: any }) => m.totalRevenue)) * 1.2 || 10000,
//           ticks: {
//             color: textColorSecondary,
//             font: { size: 12 },
//             callback: function (value: any) {
//               return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
//             }
//           },
//           grid: { color: surfaceBorder }
//         }
//       }
//     };

//     this.chartDataLine = {
//       labels: this.chartDataBar.labels,
//       datasets: [
//         {
//           label: 'Total Revenue ($)',
//           data: sales.map((m: { totalRevenue: any }) => m.totalRevenue),
//           fill: false,
//           borderColor: brightOrange,
//           backgroundColor: brightOrange,
//           tension: 0.4,
//           pointRadius: 5,
//           pointHoverRadius: 7
//         },
//         {
//           label: 'Sales Count',
//           data: sales.map((m: { salesCount: any }) => m.salesCount),
//           fill: false,
//           borderColor: skyBlue,
//           backgroundColor: skyBlue,
//           tension: 0.4,
//           pointRadius: 5,
//           pointHoverRadius: 7
//         }
//       ]
//     };

//     this.chartOptionsLine = {
//       maintainAspectRatio: false,
//       plugins: {
//         legend: {
//           labels: { color: textColor, font: { size: 14 } },
//           position: 'top'
//         },
//         tooltip: {
//           backgroundColor: '#1f2937',
//           titleColor: '#ffffff',
//           bodyColor: '#ffffff',
//           titleFont: { size: 14 },
//           bodyFont: { size: 12 },
//           padding: 10,
//           cornerRadius: 4
//         }
//       },
//       scales: {
//         x: {
//           ticks: { color: textColorSecondary, font: { size: 12 } },
//           grid: { display: false }
//         },
//         y: {
//           ticks: {
//             color: textColorSecondary,
//             font: { size: 12 },
//             callback: function (value: any) {
//               return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
//             }
//           },
//           grid: { color: surfaceBorder }
//         }
//       }
//     };
//   }

//   onToggleView(view: ChartView) {
//     this.chartView = view;
//     this.cd.markForCheck();
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
// }
// // import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
// // import { ChartModule } from 'primeng/chart';
// // import { DashboardService } from '../../../../core/services/dashboard.service';
// // import { AppMessageService } from '../../../../core/services/message.service';
// // import { Subject, takeUntil, catchError } from 'rxjs';
// // import { SkeletonModule } from 'primeng/skeleton';
// // import { CommonModule } from '@angular/common';
// // import { TabsModule } from 'primeng/tabs';
// // import { FormsModule } from '@angular/forms';

// // type ChartView = 'bar' | 'line' | 'both';

// // @Component({
// //   selector: 'app-dashboard-chart-component',
// //   standalone: true,
// //   imports: [ChartModule, FormsModule, TabsModule, SkeletonModule, CommonModule],
// //   templateUrl: './dashboard-chart-component.component.html',
// //   styleUrl: './dashboard-chart-component.component.css'
// // })
// // export class DashboardChartComponentComponent implements OnInit, OnDestroy {
// //   chartDataBar: any;
// //   chartOptionsBar: any;
// //   chartDataLine: any;
// //   chartOptionsLine: any;

// //   isLoading = false;
// //   dashboardYearlyChart: any;

// //   private destroy$ = new Subject<void>();

// //   chartView: ChartView = 'bar'; // default view
// //   yearInput: any;

// //   constructor(
// //     private dashboardService: DashboardService,
// //     private messageService: AppMessageService,
// //     private cd: ChangeDetectorRef
// //   ) { }

// //   ngOnInit() {
// //     this.getSalesDataForChartsYearly();
// //   }

// //   getSalesDataForChartsYearly(): void {
// //    let params = {
// //       year: this.yearInput?this.yearInput:2025
// //     }
// //     this.isLoading = true;
// //     this.dashboardService.getSalesDataForChartsYearly(params)
// //       .pipe(
// //         takeUntil(this.destroy$),
// //         catchError((err, caught) => {
// //           this.messageService.showError('Failed to fetch summary.');
// //           this.isLoading = false;
// //           throw err;
// //         })
// //       )
// //       .subscribe((res: any) => {
// //         if (res?.success && res.data) {
// //           this.dashboardYearlyChart = res.data;
// //           this.prepareCharts();
// //         }
// //         this.isLoading = false;
// //       });
// //   }

// //   prepareCharts(): void {
// //     const documentStyle = getComputedStyle(document.documentElement);
// //     const textColor = documentStyle.getPropertyValue('--p-text-color');
// //     const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
// //     const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

// //     const sales = this.dashboardYearlyChart ? this.dashboardYearlyChart.monthlySales : [];
// //     const brightOrange = '#FFA500'; // Or any other vibrant orange
// //     const lightColor = '#87CEEB';   // Example: Sky Blue, or pick another light pastel color

// //     this.chartDataBar = {
// //       labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
// //       datasets: [
// //         {
// //           label: 'Total Revenue',
// //           data: sales.map((m: { totalRevenue: any; }) => m.totalRevenue),
// //           backgroundColor: brightOrange, // Set to bright orange
// //           borderColor: brightOrange
// //         },
// //         {
// //           label: 'Sales Count',
// //           data: sales.map((m: { salesCount: any; }) => m.salesCount),
// //           backgroundColor: lightColor, // Set to light color
// //           borderColor: lightColor
// //         }
// //       ]
// //     };
   
// //     this.chartOptionsBar = {
// //       maintainAspectRatio: false,
// //       plugins: {
// //         legend: { labels: { color: textColor } }
// //       },
// //       scales: {
// //         x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, drawBorder: false } },
// //         y: {
// //           type: 'linear', // Ensure type is linear for min/max
// //           beginAtZero: true, // Start Y-axis from zero
// //           max: 10000, // **Set the maximum value for the Y-axis**
// //           ticks: {
// //             color: textColorSecondary,
// //             callback: function (value: any) { // Optional: Add a thousand separator or currency symbol
// //               return value.toLocaleString(); // Formats numbers with commas
// //             }
// //           },
// //           grid: { color: surfaceBorder, drawBorder: false }
// //         }
// //       }
// //     };
   

// //     this.chartDataLine = {
// //       labels: this.chartDataBar.labels,
// //       datasets: [
// //         {
// //           label: 'Total Revenue',
// //           data: sales.map((m: { totalRevenue: any }) => m.totalRevenue),
// //           fill: false,
// //           borderColor: brightOrange, // Set to bright orange
// //           tension: 0.4
// //         },
// //         {
// //           label: 'Sales Count',
// //           data: sales.map((m: { salesCount: any }) => m.salesCount),
// //           fill: false,
// //           borderColor: lightColor, // Set to light color
// //           tension: 0.4
// //         }
// //       ]
// //     };
// //     this.chartOptionsLine = {
// //       maintainAspectRatio: false,
// //       plugins: {
// //         legend: { labels: { color: textColor } }
// //       },
// //       scales: {
// //         x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
// //         y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }
// //       }
// //     };

// //     this.cd.markForCheck();
// //   }

// //   onToggleView(view: ChartView) {
// //     this.chartView = view;
// //   }

// //   ngOnDestroy(): void {
// //     this.destroy$.next();
// //     this.destroy$.complete();
// //   }
// // }

// //  // Bar chart data & options
// //     // this.chartDataBar = {
// //     //   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
// //     //   datasets: [
// //     //     {
// //     //       label: 'Total Revenue',
// //     //       data: sales.map((m: { totalRevenue: any; }) => m.totalRevenue),
// //     //       backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
// //     //       borderColor: documentStyle.getPropertyValue('--p-primary-500')
// //     //     },
// //     //     {
// //     //       label: 'Sales Count',
// //     //       data: sales.map((m: { salesCount: any; }) => m.salesCount),
// //     //       backgroundColor: documentStyle.getPropertyValue('--p-gray-400'),
// //     //       borderColor: documentStyle.getPropertyValue('--p-gray-400')
// //     //     }
// //     //   ]
// //     // };
// //     // this.chartOptionsBar = {
// //     //   maintainAspectRatio: false,
// //     //   plugins: {
// //     //     legend: { labels: { color: textColor } }
// //     //   },
// //     //   scales: {
// //     //     x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, drawBorder: false } },
// //     //     y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, drawBorder: false } }
// //     //   }
// //     // };
    
// //  // // Line chart data & options (same data but line style + tension for smooth curves)
// //     // this.chartDataLine = {
// //     //   labels: this.chartDataBar.labels,
// //     //   datasets: [
// //     //     {
// //     //       label: 'Total Revenue',
// //     //       data: sales.map((m: { totalRevenue: any }) => m.totalRevenue),
// //     //       fill: false,
// //     //       // yAxisID: 'y',
// //     //       borderColor: documentStyle.getPropertyValue('--p-primary-500'),
// //     //       tension: 0.4
// //     //     },
// //     //     {
// //     //       label: 'Sales Count',
// //     //       data: sales.map((m: { salesCount: any }) => m.salesCount),
// //     //       fill: false,
// //     //       // yAxisID: 'y',
// //     //       borderColor: documentStyle.getPropertyValue('--p-gray-400'),
// //     //       tension: 0.4
// //     //     }
// //     //   ]
// //     // };
// //     // this.chartOptionsLine = {
// //     //   maintainAspectRatio: false,
// //     //   plugins: {
// //     //     legend: { labels: { color: textColor } }
// //     //   },
// //     //   scales: {
// //     //     x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
// //     //     y: {
// //     //       type: 'linear', // Ensure type is linear for min/max
// //     //       beginAtZero: true, // Start Y-axis from zero
// //     //       max: 10000, // **Set the maximum value for the Y-axis**
// //     //       ticks: {
// //     //         color: textColorSecondary,
// //     //         callback: function (value: any) { // Optional: Add a thousand separator or currency symbol
// //     //           return value.toLocaleString();
// //     //         }
// //     //       },
// //     //       grid: { color: surfaceBorder }
// //     //     }
// //     //   }
// //     // };
// // // import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
// // // import { ChartModule } from 'primeng/chart';
// // // import { DashboardService } from '../../../../core/services/dashboard.service';
// // // import { AppMessageService } from '../../../../core/services/message.service';
// // // // import { ConsolidatedSummaryData, ApiResponse } from '../../../../core/models/dashboard-models';
// // // import { Subject, takeUntil, catchError } from 'rxjs';
// // // import { SkeletonModule } from 'primeng/skeleton';
// // // import { CommonModule } from '@angular/common';
// // // @Component({
// // //   selector: 'app-dashboard-chart-component',
// // //   standalone: true,
// // //   imports: [ChartModule,SkeletonModule,CommonModule],
// // //   templateUrl: './dashboard-chart-component.component.html',
// // //   styleUrl: './dashboard-chart-component.component.css'
// // // })
// // // export class DashboardChartComponentComponent implements OnInit, OnDestroy {
// // //   chartData: any;
// // //   chartOptions: any;
// // //   isLoading = false;
// // //   dashboardSummary!: any;

// // //   private destroy$ = new Subject<void>();
// // //   dashboardYearlyChart: any;

// // //   constructor(
// // //     private dashboardService: DashboardService,
// // //     private messageService: AppMessageService,
// // //     private cd: ChangeDetectorRef
// // //   ) { }

// // //   ngOnInit() {
// // //     this.getSalesDataForChartsYearly({ year: 2025 });
// // //   }

// // //   getSalesDataForChartsYearly(params: any): void {
// // //     this.isLoading = true;
// // //     this.dashboardService.getSalesDataForChartsYearly(params)
// // //       .pipe(
// // //         takeUntil(this.destroy$),
// // //         catchError((err, caught) => {
// // //           this.messageService.showError('Failed to fetch summary.');
// // //           this.isLoading = false;
// // //           throw err;
// // //         })
// // //       )
// // //       .subscribe((res: any) => {
// // //         if (res?.success && res.data) {
// // //           this.dashboardYearlyChart = res.data;
// // //           this.prepareChart();
// // //         }
// // //         this.isLoading = false;
// // //       });
// // //   }

// // //   prepareChart(): void {
// // //     const documentStyle = getComputedStyle(document.documentElement);
// // //     const textColor = documentStyle.getPropertyValue('--p-text-color');
// // //     const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
// // //     const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

// // //     const sales = this.dashboardYearlyChart?this.dashboardYearlyChart.monthlySales:null;

// // //     this.chartData = {
// // //       labels: [
// // //         'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
// // //         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
// // //       ],
// // //       datasets: [
// // //         {
// // //           label: 'Total Revenue',
// // //           data: sales.map((m: { totalRevenue: any; }) => m.totalRevenue),
// // //           backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
// // //           borderColor: documentStyle.getPropertyValue('--p-primary-500')
// // //         },
// // //         {
// // //           label: 'Sales Count',
// // //           data: sales.map((m: { salesCount: any; }) => m.salesCount),
// // //           backgroundColor: documentStyle.getPropertyValue('--p-gray-400'),
// // //           borderColor: documentStyle.getPropertyValue('--p-gray-400')
// // //         }
// // //       ]
// // //     };

// // //     this.chartOptions = {
// // //       maintainAspectRatio: false,
// // //       plugins: {
// // //         legend: {
// // //           labels: {
// // //             color: textColor
// // //           }
// // //         }
// // //       },
// // //       scales: {
// // //         x: {
// // //           ticks: {
// // //             color: textColorSecondary
// // //           },
// // //           grid: {
// // //             color: surfaceBorder,
// // //             drawBorder: false
// // //           }
// // //         },
// // //         y: {
// // //           ticks: {
// // //             color: textColorSecondary
// // //           },
// // //           grid: {
// // //             color: surfaceBorder,
// // //             drawBorder: false
// // //           }
// // //         }
// // //       }
// // //     };

// // //     this.cd.markForCheck();
// // //   }

// // //   ngOnDestroy(): void {
// // //     this.destroy$.next();
// // //     this.destroy$.complete();
// // //   }
// // // }
