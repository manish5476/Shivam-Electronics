import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { AppMessageService } from '../../../../core/services/message.service';
import { Subject, takeUntil, catchError } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { FormsModule } from '@angular/forms';

type ChartView = 'bar' | 'line' | 'both';

@Component({
  selector: 'app-dashboard-chart-component',
  standalone: true,
  imports: [ChartModule, FormsModule, TabsModule, SkeletonModule, CommonModule],
  templateUrl: './dashboard-chart-component.component.html',
  styleUrl: './dashboard-chart-component.component.css'
})
export class DashboardChartComponentComponent implements OnInit, OnDestroy {
  chartDataBar: any;
  chartOptionsBar: any;
  chartDataLine: any;
  chartOptionsLine: any;

  isLoading = false;
  dashboardYearlyChart: any;

  private destroy$ = new Subject<void>();

  chartView: ChartView = 'bar'; // default view
  yearInput: any;

  constructor(
    private dashboardService: DashboardService,
    private messageService: AppMessageService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getSalesDataForChartsYearly();
  }

  getSalesDataForChartsYearly(): void {
   let params = {
      year: this.yearInput?this.yearInput:2025
    }
    this.isLoading = true;
    this.dashboardService.getSalesDataForChartsYearly(params)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err, caught) => {
          this.messageService.showError('Failed to fetch summary.');
          this.isLoading = false;
          throw err;
        })
      )
      .subscribe((res: any) => {
        if (res?.success && res.data) {
          this.dashboardYearlyChart = res.data;
          this.prepareCharts();
        }
        this.isLoading = false;
      });
  }

  prepareCharts(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    const sales = this.dashboardYearlyChart ? this.dashboardYearlyChart.monthlySales : [];
    const brightOrange = '#FFA500'; // Or any other vibrant orange
    const lightColor = '#87CEEB';   // Example: Sky Blue, or pick another light pastel color

    this.chartDataBar = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Total Revenue',
          data: sales.map((m: { totalRevenue: any; }) => m.totalRevenue),
          backgroundColor: brightOrange, // Set to bright orange
          borderColor: brightOrange
        },
        {
          label: 'Sales Count',
          data: sales.map((m: { salesCount: any; }) => m.salesCount),
          backgroundColor: lightColor, // Set to light color
          borderColor: lightColor
        }
      ]
    };
   
    this.chartOptionsBar = {
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor } }
      },
      scales: {
        x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, drawBorder: false } },
        y: {
          type: 'linear', // Ensure type is linear for min/max
          beginAtZero: true, // Start Y-axis from zero
          max: 10000, // **Set the maximum value for the Y-axis**
          ticks: {
            color: textColorSecondary,
            callback: function (value: any) { // Optional: Add a thousand separator or currency symbol
              return value.toLocaleString(); // Formats numbers with commas
            }
          },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      }
    };
   

    this.chartDataLine = {
      labels: this.chartDataBar.labels,
      datasets: [
        {
          label: 'Total Revenue',
          data: sales.map((m: { totalRevenue: any }) => m.totalRevenue),
          fill: false,
          borderColor: brightOrange, // Set to bright orange
          tension: 0.4
        },
        {
          label: 'Sales Count',
          data: sales.map((m: { salesCount: any }) => m.salesCount),
          fill: false,
          borderColor: lightColor, // Set to light color
          tension: 0.4
        }
      ]
    };
    this.chartOptionsLine = {
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor } }
      },
      scales: {
        x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
        y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }
      }
    };

    this.cd.markForCheck();
  }

  onToggleView(view: ChartView) {
    this.chartView = view;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

 // Bar chart data & options
    // this.chartDataBar = {
    //   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    //   datasets: [
    //     {
    //       label: 'Total Revenue',
    //       data: sales.map((m: { totalRevenue: any; }) => m.totalRevenue),
    //       backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
    //       borderColor: documentStyle.getPropertyValue('--p-primary-500')
    //     },
    //     {
    //       label: 'Sales Count',
    //       data: sales.map((m: { salesCount: any; }) => m.salesCount),
    //       backgroundColor: documentStyle.getPropertyValue('--p-gray-400'),
    //       borderColor: documentStyle.getPropertyValue('--p-gray-400')
    //     }
    //   ]
    // };
    // this.chartOptionsBar = {
    //   maintainAspectRatio: false,
    //   plugins: {
    //     legend: { labels: { color: textColor } }
    //   },
    //   scales: {
    //     x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, drawBorder: false } },
    //     y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, drawBorder: false } }
    //   }
    // };
    
 // // Line chart data & options (same data but line style + tension for smooth curves)
    // this.chartDataLine = {
    //   labels: this.chartDataBar.labels,
    //   datasets: [
    //     {
    //       label: 'Total Revenue',
    //       data: sales.map((m: { totalRevenue: any }) => m.totalRevenue),
    //       fill: false,
    //       // yAxisID: 'y',
    //       borderColor: documentStyle.getPropertyValue('--p-primary-500'),
    //       tension: 0.4
    //     },
    //     {
    //       label: 'Sales Count',
    //       data: sales.map((m: { salesCount: any }) => m.salesCount),
    //       fill: false,
    //       // yAxisID: 'y',
    //       borderColor: documentStyle.getPropertyValue('--p-gray-400'),
    //       tension: 0.4
    //     }
    //   ]
    // };
    // this.chartOptionsLine = {
    //   maintainAspectRatio: false,
    //   plugins: {
    //     legend: { labels: { color: textColor } }
    //   },
    //   scales: {
    //     x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
    //     y: {
    //       type: 'linear', // Ensure type is linear for min/max
    //       beginAtZero: true, // Start Y-axis from zero
    //       max: 10000, // **Set the maximum value for the Y-axis**
    //       ticks: {
    //         color: textColorSecondary,
    //         callback: function (value: any) { // Optional: Add a thousand separator or currency symbol
    //           return value.toLocaleString();
    //         }
    //       },
    //       grid: { color: surfaceBorder }
    //     }
    //   }
    // };
// import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
// import { ChartModule } from 'primeng/chart';
// import { DashboardService } from '../../../../core/services/dashboard.service';
// import { AppMessageService } from '../../../../core/services/message.service';
// // import { ConsolidatedSummaryData, ApiResponse } from '../../../../core/models/dashboard-models';
// import { Subject, takeUntil, catchError } from 'rxjs';
// import { SkeletonModule } from 'primeng/skeleton';
// import { CommonModule } from '@angular/common';
// @Component({
//   selector: 'app-dashboard-chart-component',
//   standalone: true,
//   imports: [ChartModule,SkeletonModule,CommonModule],
//   templateUrl: './dashboard-chart-component.component.html',
//   styleUrl: './dashboard-chart-component.component.css'
// })
// export class DashboardChartComponentComponent implements OnInit, OnDestroy {
//   chartData: any;
//   chartOptions: any;
//   isLoading = false;
//   dashboardSummary!: any;

//   private destroy$ = new Subject<void>();
//   dashboardYearlyChart: any;

//   constructor(
//     private dashboardService: DashboardService,
//     private messageService: AppMessageService,
//     private cd: ChangeDetectorRef
//   ) { }

//   ngOnInit() {
//     this.getSalesDataForChartsYearly({ year: 2025 });
//   }

//   getSalesDataForChartsYearly(params: any): void {
//     this.isLoading = true;
//     this.dashboardService.getSalesDataForChartsYearly(params)
//       .pipe(
//         takeUntil(this.destroy$),
//         catchError((err, caught) => {
//           this.messageService.showError('Failed to fetch summary.');
//           this.isLoading = false;
//           throw err;
//         })
//       )
//       .subscribe((res: any) => {
//         if (res?.success && res.data) {
//           this.dashboardYearlyChart = res.data;
//           this.prepareChart();
//         }
//         this.isLoading = false;
//       });
//   }

//   prepareChart(): void {
//     const documentStyle = getComputedStyle(document.documentElement);
//     const textColor = documentStyle.getPropertyValue('--p-text-color');
//     const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
//     const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

//     const sales = this.dashboardYearlyChart?this.dashboardYearlyChart.monthlySales:null;

//     this.chartData = {
//       labels: [
//         'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
//       ],
//       datasets: [
//         {
//           label: 'Total Revenue',
//           data: sales.map((m: { totalRevenue: any; }) => m.totalRevenue),
//           backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
//           borderColor: documentStyle.getPropertyValue('--p-primary-500')
//         },
//         {
//           label: 'Sales Count',
//           data: sales.map((m: { salesCount: any; }) => m.salesCount),
//           backgroundColor: documentStyle.getPropertyValue('--p-gray-400'),
//           borderColor: documentStyle.getPropertyValue('--p-gray-400')
//         }
//       ]
//     };

//     this.chartOptions = {
//       maintainAspectRatio: false,
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
//             color: surfaceBorder,
//             drawBorder: false
//           }
//         },
//         y: {
//           ticks: {
//             color: textColorSecondary
//           },
//           grid: {
//             color: surfaceBorder,
//             drawBorder: false
//           }
//         }
//       }
//     };

//     this.cd.markForCheck();
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
// }
