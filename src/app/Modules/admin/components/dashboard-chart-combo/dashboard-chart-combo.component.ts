// // // import { Component } from '@angular/core';

// // // @Component({
// // //   selector: 'app-dashboard-chart-combo',
// // //   imports: [],
// // //   templateUrl: './dashboard-chart-combo.component.html',
// // //   styleUrl: './dashboard-chart-combo.component.css'
// // // })
// // // export class DashboardChartComboComponent {

// // // }
// // import { isPlatformBrowser } from '@angular/common';
// // import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
// // import { DashboardService } from '../../../../core/services/dashboard.service';
// // import { AppMessageService } from '../../../../core/services/message.service';
// // import { Subject, takeUntil, catchError, of } from 'rxjs';
// // import { CommonModule } from '@angular/common';
// // import { ChartModule } from 'primeng/chart';

// // @Component({
// //   selector: 'app-dashboard-chart-combo',
// //   standalone: true,
// //   imports: [CommonModule, ChartModule],
// //   templateUrl: './dashboard-chart-combo.component.html',
// //   styleUrls: ['./dashboard-chart-combo.component.css']
// // })
// // export class DashboardChartComboComponent implements OnInit, OnDestroy {
// //   // Chart data and options
// //   barChartData: any;
// //   barChartOptions: any;
// //   lineChartData: any;
// //   lineChartOptions: any;

// //   isLoading = false;
// //   dashboardYearlyChart: any;
// //   private destroy$ = new Subject<void>();
// //   private monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// //   private platformId = inject(PLATFORM_ID);
// //   private dashboardService = inject(DashboardService);
// //   private messageService = inject(AppMessageService);
// //   private cd = inject(ChangeDetectorRef);

// //   ngOnInit() {
// //     this.initializeChartOptions();
// //     this.getSalesDataForChartsYearly({ year: 2025 });
// //   }

// //   ngOnDestroy() {
// //     this.destroy$.next();
// //     this.destroy$.complete();
// //   }

// //   initializeChartOptions(): void {
// //     if (isPlatformBrowser(this.platformId)) {
// //       const documentStyle = getComputedStyle(document.documentElement);
// //       const textColor = documentStyle.getPropertyValue('--p-text-color');
// //       const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
// //       const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

// //       // Bar Chart Options (Monthly Revenue)
// //       this.barChartOptions = {
// //         maintainAspectRatio: false,
// //         aspectRatio: 0.6,
// //         plugins: {
// //           legend: {
// //             labels: { color: textColor }
// //           },
// //           tooltip: {
// //             callbacks: {
// //               label: (context: any) => {
// //                 let label = context.dataset.label || '';
// //                 if (label) label += ': ';
// //                 if (context.parsed.y !== null) {
// //                   label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
// //                 }
// //                 return label;
// //               }
// //             }
// //           }
// //         },
// //         scales: {
// //           x: {
// //             ticks: { color: textColorSecondary },
// //             grid: { color: surfaceBorder, drawBorder: false },
// //             title: { display: true, text: 'Month', color: textColor }
// //           },
// //           y: {
// //             ticks: {
// //               color: textColorSecondary,
// //               callback: (value: number) => '$' + value.toLocaleString()
// //             },
// //             grid: { color: surfaceBorder, drawBorder: false },
// //             title: { display: true, text: 'Total Revenue', color: textColor },
// //             beginAtZero: true
// //           }
// //         }
// //       };

// //       // Line Chart Options (Monthly Sales Count)
// //       this.lineChartOptions = {
// //         maintainAspectRatio: false,
// //         aspectRatio: 0.6,
// //         plugins: {
// //           legend: {
// //             labels: { color: textColor }
// //           },
// //           tooltip: {
// //             callbacks: {
// //               label: (context: any) => {
// //                 let label = context.dataset.label || '';
// //                 if (label) label += ': ';
// //                 if (context.parsed.y !== null) {
// //                   label += context.parsed.y;
// //                 }
// //                 return label;
// //               }
// //             }
// //           }
// //         },
// //         scales: {
// //           x: {
// //             ticks: { color: textColorSecondary },
// //             grid: { color: surfaceBorder, drawBorder: false },
// //             title: { display: true, text: 'Month', color: textColor }
// //           },
// //           y: {
// //             ticks: { color: textColorSecondary },
// //             grid: { color: surfaceBorder, drawBorder: false },
// //             title: { display: true, text: 'Number of Sales', color: textColor },
// //             beginAtZero: true
// //           }
// //         }
// //       };
// //     }
// //   }

// //   getSalesDataForChartsYearly(params: any): void {
// //     this.isLoading = true;
// //     this.dashboardYearlyChart = null;
// //     this.cd.detectChanges();

// //     this.dashboardService.getSalesDataForChartsCombo(params)
// //       .pipe(
// //         takeUntil(this.destroy$),
// //         catchError((err) => {
// //           this.messageService.showError('Failed to fetch yearly sales data.');
// //           this.isLoading = false;
// //           this.cd.detectChanges();
// //           return of(null);
// //         })
// //       )
// //       .subscribe((res: any) => {
// //         if (res?.success && res.data) {
// //           this.dashboardYearlyChart = res.data;
// //           this.prepareCharts();
// //         } else {
// //           this.messageService.showError('No data received or failed response for yearly sales.');
// //           this.prepareCharts();
// //         }
// //         this.isLoading = false;
// //         this.cd.detectChanges();
// //       });
// //   }

// //   prepareCharts(): void {
// //     const yearlyData = this.dashboardYearlyChart?.yearlySales?.monthlySales;
// //     const currentYear = this.dashboardYearlyChart?.year || 'N/A';

// //     if (!yearlyData || !Array.isArray(yearlyData)) {
// //       console.warn('Yearly sales data is not available or in the expected format. Clearing charts.');
// //       this.barChartData = {
// //         labels: [],
// //         datasets: [{ data: [], label: `Monthly Revenue (${currentYear})`, backgroundColor: '#4BC0C0' }]
// //       };
// //       this.lineChartData = {
// //         labels: [],
// //         datasets: [{ data: [], label: `Monthly Sales Count (${currentYear})`, borderColor: '#36A2EB', fill: false, tension: 0.4 }]
// //       };
// //       return;
// //     }

// //     const labels = yearlyData.map((sale: any) => this.monthNames[sale.month - 1]);

// //     // Prepare Bar Chart Data (Monthly Revenue)
// //     const revenueData = yearlyData.map((sale: any) => sale.totalRevenue);
// //     this.barChartData = {
// //       labels: labels,
// //       datasets: [
// //         {
// //           type: 'bar',
// //           label: `Monthly Revenue (${currentYear})`,
// //           backgroundColor: '#4BC0C0',
// //           borderColor: '#4BC0C0',
// //           hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
// //           hoverBorderColor: '#4BC0C0',
// //           data: revenueData
// //         }
// //       ]
// //     };

// //     // Prepare Line Chart Data (Monthly Sales Count)
// //     const salesCountData = yearlyData.map((sale: any) => sale.salesCount);
// //     this.lineChartData = {
// //       labels: labels,
// //       datasets: [
// //         {
// //           type: 'line',
// //           label: `Monthly Sales Count (${currentYear})`,
// //           borderColor: '#36A2EB',
// //           backgroundColor: 'rgba(54, 162, 235, 0.2)',
// //           pointBackgroundColor: '#36A2EB',
// //           pointBorderColor: '#fff',
// //           pointHoverBackgroundColor: '#fff',
// //           pointHoverBorderColor: '#36A2EB',
// //           fill: false,
// //           tension: 0.4,
// //           data: salesCountData
// //         }
// //       ]
// //     };
// //   }
// // }
// import { isPlatformBrowser } from '@angular/common';
// import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
// import { DashboardService } from '../../../../core/services/dashboard.service';
// import { AppMessageService } from '../../../../core/services/message.service';
// import { Subject, takeUntil, catchError, of } from 'rxjs';
// import { CommonModule } from '@angular/common';
// import { ChartModule } from 'primeng/chart';
// import { FormsModule } from '@angular/forms';
// import { InputTextModule } from 'primeng/inputtext';
// import { ButtonModule } from 'primeng/button';

// @Component({
//   selector: 'app-dashboard-chart-combo',
//   standalone: true,
//   imports: [CommonModule, ChartModule, FormsModule, InputTextModule, ButtonModule],
//   templateUrl: './dashboard-chart-combo.component.html',
//   styleUrls: ['./dashboard-chart-combo.component.css']
// })
// export class DashboardChartComboComponent implements OnInit, OnDestroy {
//   // Chart data and options
//   monthlyChartData: any;
//   monthlyChartOptions: any;
//   weeklyChartData: any;
//   weeklyChartOptions: any;

//   isLoading = false;
//   dashboardYearlyChart: any;
//   yearInput: string = '2025'; // Default year
//   private destroy$ = new Subject<void>();
//   private monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//   private platformId = inject(PLATFORM_ID);
//   private dashboardService = inject(DashboardService);
//   private messageService = inject(AppMessageService);
//   private cd = inject(ChangeDetectorRef);

//   ngOnInit() {
//     this.initializeChartOptions();
//     this.fetchSalesData();
//   }

//   ngOnDestroy() {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   initializeChartOptions(): void {
//     if (isPlatformBrowser(this.platformId)) {
//       const documentStyle = getComputedStyle(document.documentElement);
//       const textColor = documentStyle.getPropertyValue('--p-text-color');
//       const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
//       const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

//       // Monthly Combo Chart Options (Bar for Revenue, Line for Sales Count)
//       this.monthlyChartOptions = {
//         maintainAspectRatio: false,
//         aspectRatio: 0.6,
//         plugins: {
//           legend: {
//             labels: { color: textColor }
//           },
//           tooltip: {
//             mode: 'index',
//             intersect: false,
//             callbacks: {
//               label: (context: any) => {
//                 let label = context.dataset.label || '';
//                 if (label) label += ': ';
//                 if (context.parsed.y !== null) {
//                   if (context.dataset.type === 'bar') {
//                     label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
//                   } else {
//                     label += context.parsed.y;
//                   }
//                 }
//                 return label;
//               }
//             }
//           }
//         },
//         scales: {
//           x: {
//             ticks: { color: textColorSecondary },
//             grid: { color: surfaceBorder, drawBorder: false },
//             title: { display: true, text: 'Month', color: textColor }
//           },
//           y: {
//             ticks: {
//               color: textColorSecondary,
//               callback: (value: number) => '$' + value.toLocaleString()
//             },
//             grid: { color: surfaceBorder, drawBorder: false },
//             title: { display: true, text: 'Total Revenue', color: textColor },
//             beginAtZero: true
//           },
//           y1: {
//             position: 'right',
//             ticks: { color: textColorSecondary },
//             grid: { drawOnChartArea: false, color: surfaceBorder },
//             title: { display: true, text: 'Number of Sales', color: textColor },
//             beginAtZero: true
//           }
//         }
//       };

//       // Weekly Chart Options (Bar for Weekly Revenue)
//       this.weeklyChartOptions = {
//         maintainAspectRatio: false,
//         aspectRatio: 0.6,
//         plugins: {
//           legend: {
//             labels: { color: textColor }
//           },
//           tooltip: {
//             callbacks: {
//               label: (context: any) => {
//                 let label = context.dataset.label || '';
//                 if (label) label += ': ';
//                 if (context.parsed.y !== null) {
//                   label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
//                 }
//                 return label;
//               }
//             }
//           }
//         },
//         scales: {
//           x: {
//             ticks: { color: textColorSecondary },
//             grid: { color: surfaceBorder, drawBorder: false },
//             title: { display: true, text: 'Week', color: textColor }
//           },
//           y: {
//             ticks: {
//               color: textColorSecondary,
//               callback: (value: number) => '$' + value.toLocaleString()
//             },
//             grid: { color: surfaceBorder, drawBorder: false },
//             title: { display: true, text: 'Total Revenue', color: textColor },
//             beginAtZero: true
//           }
//         }
//       };
//     }
//   }

//   fetchSalesData(): void {
//     this.isLoading = true;
//     this.dashboardYearlyChart = null;
//     this.cd.detectChanges();

//     const params = { year: parseInt(this.yearInput, 10) };
//     if (isNaN(params.year)) {
//       this.messageService.showError('Please enter a valid year.');
//       this.isLoading = false;
//       this.cd.detectChanges();
//       return;
//     }

//     this.dashboardService.getSalesDataForChartsCombo(params)
//       .pipe(
//         takeUntil(this.destroy$),
//         catchError((err) => {
//           this.messageService.showError('Failed to fetch sales data.');
//           this.isLoading = false;
//           this.cd.detectChanges();
//           return of(null);
//         })
//       )
//       .subscribe((res: any) => {
//         if (res?.success && res.data) {
//           this.dashboardYearlyChart = res.data;
//           this.prepareCharts();
//         } else {
//           this.messageService.showError('No data received or failed response for sales data.');
//           this.prepareCharts();
//         }
//         this.isLoading = false;
//         this.cd.detectChanges();
//       });
//   }

//   prepareCharts(): void {
//     const yearlyData = this.dashboardYearlyChart?.yearlySales?.monthlySales;
//     const weeklyData = this.dashboardYearlyChart?.weeklySales;
//     const currentYear = this.dashboardYearlyChart?.year || 'N/A';

//     // Prepare Monthly Combo Chart
//     if (!yearlyData || !Array.isArray(yearlyData)) {
//       console.warn('Monthly sales data is not available or in the expected format. Clearing monthly chart.');
//       this.monthlyChartData = {
//         labels: [],
//         datasets: [
//           { type: 'bar', data: [], label: `Monthly Revenue (${currentYear})`, backgroundColor: '#4BC0C0' },
//           { type: 'line', data: [], label: `Monthly Sales Count (${currentYear})`, borderColor: '#36A2EB', fill: false, tension: 0.4, yAxisID: 'y1' }
//         ]
//       };
//     } else {
//       const labels = yearlyData.map((sale: any) => this.monthNames[sale.month - 1]);
//       const revenueData = yearlyData.map((sale: any) => sale.totalRevenue);
//       const salesCountData = yearlyData.map((sale: any) => sale.salesCount);

//       this.monthlyChartData = {
//         labels: labels,
//         datasets: [
//           {
//             type: 'bar',
//             label: `Monthly Revenue (${currentYear})`,
//             backgroundColor: '#4BC0C0',
//             borderColor: '#4BC0C0',
//             hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
//             hoverBorderColor: '#4BC0C0',
//             data: revenueData,
//             yAxisID: 'y'
//           },
//           {
//             type: 'line',
//             label: `Monthly Sales Count (${currentYear})`,
//             borderColor: '#36A2EB',
//             backgroundColor: 'rgba(54, 162, 235, 0.2)',
//             pointBackgroundColor: '#36A2EB',
//             pointBorderColor: '#fff',
//             pointHoverBackgroundColor: '#fff',
//             pointHoverBorderColor: '#36A2EB',
//             fill: false,
//             tension: 0.4,
//             data: salesCountData,
//             yAxisID: 'y1'
//           }
//         ]
//       };
//     }

//     // Prepare Weekly Chart
//     if (!weeklyData || !Array.isArray(weeklyData)) {
//       console.warn('Weekly sales data is not available or in the expected format. Clearing weekly chart.');
//       this.weeklyChartData = {
//         labels: [],
//         datasets: [{ type: 'bar', data: [], label: `Weekly Revenue (${currentYear})`, backgroundColor: '#FF9F40' }]
//       };
//     } else {
//       const labels = weeklyData.map((week: any) => `Week ${week.week}`);
//       const weeklyRevenue = weeklyData.map((week: any) =>
//         week.dailySales.reduce((sum: number, day: any) => sum + (day.totalRevenue || 0), 0)
//       );

//       this.weeklyChartData = {
//         labels: labels,
//         datasets: [
//           {
//             type: 'bar',
//             label: `Weekly Revenue (${currentYear})`,
//             backgroundColor: '#FF9F40',
//             borderColor: '#FF9F40',
//             hoverBackgroundColor: 'rgba(255, 159, 64, 0.8)',
//             hoverBorderColor: '#FF9F40',
//             data: weeklyRevenue
//           }
//         ]
//       };
//     }
//   }
// }
import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, effect, PLATFORM_ID } from '@angular/core';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { AppMessageService } from '../../../../core/services/message.service';
// import { AppConfigService } from '@/service/appconfigservice';
// import { DesignerService } from '@/service/designerservice'; // Assuming this exists as per ChartLineStyleDemo
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dashboard-chart-combo',
  standalone: true,
  imports: [CommonModule, ChartModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './dashboard-chart-combo.component.html',
  styleUrls: ['./dashboard-chart-combo.component.css']
})
export class DashboardChartComboComponent implements OnInit, OnDestroy {
  monthlyChartData: any;
  monthlyChartOptions: any;
  weeklyChartData: any;
  weeklyChartOptions: any;

  isLoading = false;
  dashboardYearlyChart: any;
  yearInput: string = '2025';
  private destroy$ = new Subject<void>();
  private monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  platformId = inject(PLATFORM_ID);
  // configService = inject(AppConfigService);
  // designerService = inject(DesignerService);
  private dashboardService = inject(DashboardService);
  private messageService = inject(AppMessageService);
  private cd = inject(ChangeDetectorRef);

  constructor() {
    // this.themeEffect = effect(() => {
    //   if (this.configService.transitionComplete()) {
    //     if (this.designerService.preset()) {
    //       this.initCharts();
    //     }
    //   }
    // });
  }

  themeEffect: any;

  ngOnInit() {
    this.initCharts();
    this.fetchSalesData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initCharts() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
      const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

      // Monthly Combo Chart Options
      this.monthlyChartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: {
            labels: { color: textColor }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context: any) => {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  if (context.dataset.type === 'bar') {
                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                  } else {
                    label += context.parsed.y;
                  }
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: textColorSecondary },
            grid: { color: surfaceBorder },
            title: { display: true, text: 'Month', color: textColor }
          },
          y: {
            ticks: {
              color: textColorSecondary,
              callback: (value: number) => '$' + value.toLocaleString()
            },
            grid: { color: surfaceBorder },
            title: { display: true, text: 'Total Revenue', color: textColor },
            beginAtZero: true
          },
          y1: {
            position: 'right',
            ticks: { color: textColorSecondary },
            grid: { drawOnChartArea: false, color: surfaceBorder },
            title: { display: true, text: 'Number of Sales', color: textColor },
            beginAtZero: true
          }
        }
      };

      // Weekly Chart Options
      this.weeklyChartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: {
            labels: { color: textColor }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: textColorSecondary },
            grid: { color: surfaceBorder },
            title: { display: true, text: 'Week', color: textColor }
          },
          y: {
            ticks: {
              color: textColorSecondary,
              callback: (value: number) => '$' + value.toLocaleString()
            },
            grid: { color: surfaceBorder },
            title: { display: true, text: 'Total Revenue', color: textColor },
            beginAtZero: true
          }
        }
      };

      this.prepareCharts();
      this.cd.markForCheck();
    }
  }

  fetchSalesData(): void {
    this.isLoading = true;
    this.dashboardYearlyChart = null;
    this.cd.detectChanges();

    const params = { year: parseInt(this.yearInput, 10) };
    if (isNaN(params.year)) {
      this.messageService.showError('Please enter a valid year.');
      this.isLoading = false;
      this.cd.detectChanges();
      return;
    }

    this.dashboardService.getSalesDataForChartsCombo(params)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.messageService.showError('Failed to fetch sales data.');
          this.isLoading = false;
          this.cd.detectChanges();
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res?.success && res.data) {
          this.dashboardYearlyChart = res.data;
          this.initCharts();
        } else {
          this.messageService.showError('No data received or failed response for sales data.');
          this.initCharts();
        }
        this.isLoading = false;
        this.cd.detectChanges();
      });
  }

  prepareCharts(): void {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const currentYear = this.dashboardYearlyChart?.year || 'N/A';
      const yearlyData = this.dashboardYearlyChart?.yearlySales?.monthlySales;
      const weeklyData = this.dashboardYearlyChart?.weeklySales;

      // Monthly Combo Chart
      if (!yearlyData || !Array.isArray(yearlyData)) {
        console.warn('Monthly sales data is not available or in the expected format.');
        this.monthlyChartData = {
          labels: [],
          datasets: [
            {
              type: 'bar',
              label: `Monthly Revenue (${currentYear})`,
              data: [],
              backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
              borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
              yAxisID: 'y'
            },
            {
              type: 'line',
              label: `Monthly Sales Count (${currentYear})`,
              data: [],
              fill: false,
              tension: 0.4,
              borderColor: documentStyle.getPropertyValue('--p-orange-500'),
              borderDash: [5, 5],
              yAxisID: 'y1'
            }
          ]
        };
      } else {
        const labels = yearlyData.map((sale: any) => this.monthNames[sale.month - 1]);
        const revenueData = yearlyData.map((sale: any) => sale.totalRevenue);
        const salesCountData = yearlyData.map((sale: any) => sale.salesCount);

        this.monthlyChartData = {
          labels: labels,
          datasets: [
            {
              type: 'bar',
              label: `Monthly Revenue (${currentYear})`,
              data: revenueData,
              backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
              borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
              hoverBackgroundColor: documentStyle.getPropertyValue('--p-cyan-400'),
              hoverBorderColor: documentStyle.getPropertyValue('--p-cyan-400'),
              yAxisID: 'y'
            },
            {
              type: 'line',
              label: `Monthly Sales Count (${currentYear})`,
              data: salesCountData,
              fill: false,
              tension: 0.4,
              borderColor: documentStyle.getPropertyValue('--p-orange-500'),
              borderDash: [5, 5],
              pointBackgroundColor: documentStyle.getPropertyValue('--p-orange-500'),
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: documentStyle.getPropertyValue('--p-orange-500'),
              yAxisID: 'y1'
            }
          ]
        };
      }

      // Weekly Chart
      if (!weeklyData || !Array.isArray(weeklyData)) {
        console.warn('Weekly sales data is not available or in the expected format.');
        this.weeklyChartData = {
          labels: [],
          datasets: [
            {
              type: 'bar',
              label: `Weekly Revenue (${currentYear})`,
              data: [],
              backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
              borderColor: documentStyle.getPropertyValue('--p-gray-500')
            }
          ]
        };
      } else {
        const labels = weeklyData.map((week: any) => `Week ${week.week}`);
        const weeklyRevenue = weeklyData.map((week: any) =>
          week.dailySales.reduce((sum: number, day: any) => sum + (day.totalRevenue || 0), 0)
        );

        this.weeklyChartData = {
          labels: labels,
          datasets: [
            {
              type: 'bar',
              label: `Weekly Revenue (${currentYear})`,
              data: weeklyRevenue,
              backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
              borderColor: documentStyle.getPropertyValue('--p-gray-500'),
              hoverBackgroundColor: documentStyle.getPropertyValue('--p-gray-400'),
              hoverBorderColor: documentStyle.getPropertyValue('--p-gray-400')
            }
          ]
        };
      }
    }
  }
}