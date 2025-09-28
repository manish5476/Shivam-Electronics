import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

// Strongly-typed interfaces for the component's data
interface DailyTrend {
  _id: string;
  dailyRevenue: number;
}
interface MonthlySummary {
  year: number;
  month: number;
  totalRevenue: number;
}
interface YearlySale {
    year: number;
    month: number;
    totalRevenue: number;
}

export type SalesTrendsData = [DailyTrend[], MonthlySummary[], YearlySale[]];

@Component({
  selector: 'app-sales-trends',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, DialogModule, ButtonModule],
  templateUrl: './sales-trends.component.html',
  styleUrls: ['./sales-trends.component.css']
})
export class SalesTrendsComponent implements OnChanges {
  @Input() data: SalesTrendsData | null = null;

  // Chart data
  previewChartData: any[] = [];
  dialogChartData: any[] = [];
  chartColorScheme!: Color;

  // KPI Summaries
  totalYearlyRevenue: number = 0;
  bestPerformingMonth: { name: string; value: number } | null = null;
  peakRevenueDay: { date: string; value: number } | null = null;

  isDialogVisible: boolean = false;

  constructor() {
    this.setChartColors();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.processData();
    }
  }

  private processData(): void {
    if (!this.data || this.data.length < 3 || !this.data[0] || !this.data[1] || !this.data[2]) return;

    this.calculateKpiSummaries();
    this.prepareChartData(); // This now prepares both charts
  }

  private calculateKpiSummaries(): void {
    const [dailyData, monthlyData, yearlyData] = this.data!;

    this.totalYearlyRevenue = yearlyData.reduce((sum, month) => sum + month.totalRevenue, 0);

    if (dailyData.length > 0) {
      const peakDay = dailyData.reduce((max, day) => day.dailyRevenue > max.dailyRevenue ? day : max, dailyData[0]);
      this.peakRevenueDay = { date: peakDay._id, value: peakDay.dailyRevenue };
    }

    if (monthlyData.length > 0) {
      const bestMonth = monthlyData.reduce((max, month) => month.totalRevenue > max.totalRevenue ? month : max, monthlyData[0]);
      this.bestPerformingMonth = {
        name: new Date(bestMonth.year, bestMonth.month - 1).toLocaleString('default', { month: 'long' }),
        value: bestMonth.totalRevenue
      };
    }
  }

  private prepareChartData(): void {
    const [dailyData, monthlyData, yearlyData] = this.data!;

    // Data for the simple preview area chart
    this.previewChartData = [{
      name: 'Monthly Revenue',
      series: monthlyData
        .filter(m => m.totalRevenue > 0)
        .map(m => ({
          name: new Date(m.year, m.month - 1).toLocaleString('default', { month: 'short' }),
          value: m.totalRevenue,
        })),
    }];

    // Data for the detailed dialog bar chart
    this.dialogChartData = yearlyData.map(m => ({
        name: new Date(m.year, m.month - 1).toLocaleString('default', { month: 'short' }),
        value: m.totalRevenue
    }));
  }

  private setChartColors(): void {
    const style = getComputedStyle(document.documentElement);
    this.chartColorScheme = {
      name: 'salesTrend',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: [
        style.getPropertyValue('--theme-accent-primary').trim(),
        style.getPropertyValue('--theme-info-primary').trim(),
        style.getPropertyValue('--theme-success-primary').trim(),
        style.getPropertyValue('--theme-warning-primary').trim(),
      ]
    };
  }

  openDialog(): void {
    this.isDialogVisible = true;
  }
}

// import { CommonModule } from '@angular/common';
// import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
// import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
// import { DialogModule } from 'primeng/dialog';
// import { ButtonModule } from 'primeng/button';

// // Strongly-typed interfaces for the component's data
// interface DailyTrend {
//   _id: string;
//   dailyRevenue: number;
// }
// interface MonthlySummary {
//   year: number;
//   month: number;
//   totalRevenue: number;
// }
// interface YearlySale {
//     year: number;
//     month: number;
//     totalRevenue: number;
// }

// export type SalesTrendsData = [DailyTrend[], MonthlySummary[], YearlySale[]];

// @Component({
//   selector: 'app-sales-trends',
//   standalone: true,
//   imports: [CommonModule, NgxChartsModule, DialogModule, ButtonModule],
//   templateUrl: './sales-trends.component.html',
//   styleUrls: ['./sales-trends.component.css']
// })
// export class SalesTrendsComponent implements OnChanges {
//   @Input() data: SalesTrendsData | null = null;

//   // Chart data for the dialog
//   dialogChartData: any[] = [];
//   chartColorScheme!: Color;

//   // KPI Summaries
//   totalYearlyRevenue: number = 0;
//   bestPerformingMonth: { name: string; value: number } | null = null;
//   peakRevenueDay: { date: string; value: number } | null = null;

//   isDialogVisible: boolean = false;

//   constructor() {
//     this.setChartColors();
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['data'] && this.data) {
//       this.processData();
//     }
//   }

//   private processData(): void {
//     if (!this.data || this.data.length < 3 || !this.data[0] || !this.data[1] || !this.data[2]) return;

//     this.calculateKpiSummaries();
//     this.prepareDialogChartData();
//   }

//   private calculateKpiSummaries(): void {
//     const [dailyData, monthlyData, yearlyData] = this.data!;

//     this.totalYearlyRevenue = yearlyData.reduce((sum, month) => sum + month.totalRevenue, 0);

//     if (dailyData.length > 0) {
//       const peakDay = dailyData.reduce((max, day) => day.dailyRevenue > max.dailyRevenue ? day : max, dailyData[0]);
//       this.peakRevenueDay = { date: peakDay._id, value: peakDay.dailyRevenue };
//     }

//     if (monthlyData.length > 0) {
//       const bestMonth = monthlyData.reduce((max, month) => month.totalRevenue > max.totalRevenue ? month : max, monthlyData[0]);
//       this.bestPerformingMonth = {
//         name: new Date(bestMonth.year, bestMonth.month - 1).toLocaleString('default', { month: 'long' }),
//         value: bestMonth.totalRevenue
//       };
//     }
//   }

//   private prepareDialogChartData(): void {
//     const [, , yearlyData] = this.data!;
//     this.dialogChartData = yearlyData.map(m => ({
//         name: new Date(m.year, m.month - 1).toLocaleString('default', { month: 'short' }),
//         value: m.totalRevenue
//     }));
//   }

//   private setChartColors(): void {
//     const style = getComputedStyle(document.documentElement);
//     this.chartColorScheme = {
//       name: 'salesTrend',
//       selectable: true,
//       group: ScaleType.Ordinal,
//       domain: [
//         style.getPropertyValue('--theme-accent-primary').trim(),
//         style.getPropertyValue('--theme-info-primary').trim(),
//         style.getPropertyValue('--theme-success-primary').trim(),
//         style.getPropertyValue('--theme-warning-primary').trim(),
//       ]
//     };
//   }

//   openDialog(): void {
//     this.isDialogVisible = true;
//   }
// }

// // import { CommonModule } from '@angular/common';
// // import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
// // import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
// // import { DialogModule } from 'primeng/dialog';
// // import { ButtonModule } from 'primeng/button';

// // // Strongly-typed interfaces for the component's data
// // interface DailyTrend {
// //   _id: string;
// //   dailyRevenue: number;
// // }
// // interface MonthlySummary {
// //   year: number;
// //   month: number;
// //   totalRevenue: number;
// // }
// // interface YearlySale {
// //     year: number;
// //     month: number;
// //     totalRevenue: number;
// // }

// // export type SalesTrendsData = [DailyTrend[], MonthlySummary[], YearlySale[]];

// // @Component({
// //   selector: 'app-sales-trends',
// //   standalone: true,
// //   imports: [CommonModule, NgxChartsModule, DialogModule, ButtonModule],
// //   templateUrl: './sales-trends.component.html',
// //   styleUrls: ['./sales-trends.component.css']
// // })
// // export class SalesTrendsComponent implements OnChanges {
// //   @Input() data: SalesTrendsData | null = null;

// //   // Chart data
// //   previewChartData: any[] = [];
// //   dialogChartData: any[] = [];
// //   chartColorScheme!: Color;

// //   // KPI Summaries
// //   totalYearlyRevenue: number = 0;
// //   bestPerformingMonth: { name: string; value: number } | null = null;
// //   peakRevenueDay: { date: string; value: number } | null = null;

// //   isDialogVisible: boolean = false;

// //   constructor() {
// //     this.setChartColors();
// //   }

// //   ngOnChanges(changes: SimpleChanges): void {
// //     if (changes['data'] && this.data) {
// //       this.processData();
// //     }
// //   }

// //   private processData(): void {
// //     if (!this.data || this.data.length < 3 || !this.data[0] || !this.data[1] || !this.data[2]) return;

// //     this.calculateKpiSummaries();
// //     this.prepareChartData();
// //   }

// //   private calculateKpiSummaries(): void {
// //     const [dailyData, monthlyData, yearlyData] = this.data!;

// //     this.totalYearlyRevenue = yearlyData.reduce((sum, month) => sum + month.totalRevenue, 0);

// //     if (dailyData.length > 0) {
// //       const peakDay = dailyData.reduce((max, day) => day.dailyRevenue > max.dailyRevenue ? day : max, dailyData[0]);
// //       this.peakRevenueDay = { date: peakDay._id, value: peakDay.dailyRevenue };
// //     }

// //     if (monthlyData.length > 0) {
// //       const bestMonth = monthlyData.reduce((max, month) => month.totalRevenue > max.totalRevenue ? month : max, monthlyData[0]);
// //       this.bestPerformingMonth = {
// //         name: new Date(bestMonth.year, bestMonth.month - 1).toLocaleString('default', { month: 'long' }),
// //         value: bestMonth.totalRevenue
// //       };
// //     }
// //   }

// //   private prepareChartData(): void {
// //     const [dailyData, monthlyData, yearlyData] = this.data!;

// //     // Data for the simple preview chart (monthly trend)
// //     this.previewChartData = [{
// //       name: 'Monthly Revenue',
// //       series: monthlyData
// //         .filter(m => m.totalRevenue > 0)
// //         .map(m => ({
// //           name: new Date(m.year, m.month - 1).toLocaleString('default', { month: 'short' }),
// //           value: m.totalRevenue,
// //         })),
// //     }];

// //     // Data for the detailed dialog combo chart
// //     this.dialogChartData = yearlyData.map(m => ({
// //         name: new Date(m.year, m.month - 1).toLocaleString('default', { month: 'short' }),
// //         value: m.totalRevenue
// //     }));
// //   }

// //   private setChartColors(): void {
// //     const style = getComputedStyle(document.documentElement);
// //     this.chartColorScheme = {
// //       name: 'salesTrend',
// //       selectable: true,
// //       group: ScaleType.Ordinal,
// //       domain: [
// //         style.getPropertyValue('--theme-accent-primary').trim(),
// //         style.getPropertyValue('--theme-info-primary').trim(),
// //         style.getPropertyValue('--theme-success-primary').trim(),
// //         style.getPropertyValue('--theme-warning-primary').trim(),
// //       ]
// //     };
// //   }

// //   openDialog(): void {
// //     this.isDialogVisible = true;
// //   }
// // }

// // // import { CommonModule } from '@angular/common';
// // // import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
// // // import { ChartModule } from 'primeng/chart';

// // // // Strongly-typed interfaces for the component's data
// // // interface DailyTrend {
// // //   _id: string; // Date string "YYYY-MM-DD"
// // //   dailyRevenue: number;
// // //   dailySalesCount: number;
// // // }

// // // interface MonthlySummary {
// // //   year: number;
// // //   month: number;
// // //   totalRevenue: number;
// // //   salesCount: number;
// // // }

// // // export type SalesTrendsData = [DailyTrend[], MonthlySummary[]];

// // // @Component({
// // //   selector: 'app-sales-trends',
// // //   standalone: true,
// // //   imports: [CommonModule, ChartModule],
// // //   templateUrl: './sales-trends.component.html',
// // //   styleUrls: ['./sales-trends.component.css']
// // // })
// // // export class SalesTrendsComponent implements OnChanges {
// // //   @Input() data: any 

// // //   chartData: any;
// // //   chartOptions: any;

// // //   ngOnChanges(changes: SimpleChanges): void {
// // //     if (changes['data'] && this.data) {
// // //       this.prepareChart();
// // //       console.log(this.data);
// // //     }
// // //   }

// // //   private prepareChart(): void {
// // //     if (!this.data || this.data.length < 2) return;

// // //     const [dailyData, monthlyData] = this.data;

// // //     // Use monthly data for labels
// // //     const labels = monthlyData.map((m: { year: number; month: number; }) => new Date(m.year, m.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' }));

// // //     this.chartData = {
// // //       labels: labels,
// // //       datasets: [
// // //         {
// // //           type: 'line',
// // //           label: 'Daily Revenue',
// // //           borderColor: 'var(--theme-info-primary)',
// // //           borderWidth: 2,
// // //           fill: false,
// // //           tension: 0.4,
// // //           data: dailyData.map((d: { dailyRevenue: any; }) => d.dailyRevenue),
// // //           yAxisID: 'y'
// // //         },
// // //         {
// // //           type: 'bar',
// // //           label: 'Monthly Revenue',
// // //           backgroundColor: 'var(--theme-accent-primary-light)',
// // //           borderColor: 'var(--theme-accent-primary)',
// // //           data: monthlyData.map((m: { totalRevenue: any; }) => m.totalRevenue),
// // //           yAxisID: 'y'
// // //         },
// // //         {
// // //           type: 'line',
// // //           label: 'Daily Sales Count',
// // //           borderColor: 'var(--theme-warning-primary)',
// // //           borderWidth: 2,
// // //           borderDash: [5, 5],
// // //           fill: false,
// // //           tension: 0.4,
// // //           data: dailyData.map((d: { dailySalesCount: any; }) => d.dailySalesCount),
// // //           yAxisID: 'y1' // Assign to the secondary y-axis
// // //         }
// // //       ]
// // //     };

// // //     this.chartOptions = this.getChartOptions();
// // //   }

// // //   private getChartOptions(): any {
// // //     const documentStyle = getComputedStyle(document.documentElement);

// // //     return {
// // //       maintainAspectRatio: false,
// // //       aspectRatio: 1.8,
// // //       plugins: {
// // //         legend: {
// // //           position: 'bottom',
// // //           labels: {
// // //             color: documentStyle.getPropertyValue('--theme-text-secondary'),
// // //             font: { family: 'var(--font-body)' }
// // //           }
// // //         },
// // //         tooltip: {
// // //           mode: 'index',
// // //           intersect: false,
// // //           backgroundColor: 'var(--theme-bg-overlay)',
// // //           titleColor: 'var(--theme-text-primary)',
// // //           bodyColor: 'var(--theme-text-secondary)',
// // //           borderColor: 'var(--theme-border-primary)',
// // //           borderWidth: 1
// // //         }
// // //       },
// // //       scales: {
// // //         x: {
// // //           ticks: { color: documentStyle.getPropertyValue('--theme-text-secondary') },
// // //           grid: { color: 'transparent' }
// // //         },
// // //         y: { // Primary Y-axis for Revenue
// // //           type: 'linear',
// // //           display: true,
// // //           position: 'left',
// // //           ticks: {
// // //             color: documentStyle.getPropertyValue('--theme-text-secondary'),
// // //             callback: (value: number) => `₹${value / 1000}k`
// // //           },
// // //           grid: { color: documentStyle.getPropertyValue('--theme-border-primary') }
// // //         },
// // //         y1: { // Secondary Y-axis for Sales Count
// // //           type: 'linear',
// // //           display: true,
// // //           position: 'right',
// // //           ticks: { color: documentStyle.getPropertyValue('--theme-text-secondary') },
// // //           grid: { drawOnChartArea: false } // Only show the axis line
// // //         }
// // //       }
// // //     };
// // //   }
// // // }