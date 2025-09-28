// enhanced-dashboard.component.ts

import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelModule } from 'primeng/panel';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-enhanced-kpi-summary',
  standalone: true,
  imports: [
    CommonModule,
    PanelModule,
    SkeletonModule,
    MessageModule,
    ChartModule,
    CardModule,
    ProgressBarModule,
    DividerModule,
    TagModule
  ],
   templateUrl: './enhanced-kpi-summary.component.html',
  styleUrl: './enhanced-kpi-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnhancedKpiSummaryComponent implements OnChanges {
  @Input() title: string = 'Business Dashboard';
  @Input() data: any;
  @Input() loading: boolean = false;

  // Chart data properties
  revenueChartData: any;
  revenueChartOptions: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.prepareRevenueChart();
      this.cdr.markForCheck();
    }
    if (changes['loading']) {
      this.cdr.markForCheck();
    }
  }

  private prepareRevenueChart(): void {
    if (!this.data.charts || !this.data.charts.revenueTrend) return;

    const labels = this.data.charts.revenueTrend.map((item: any) => item._id);
    const values = this.data.charts.revenueTrend.map((item: any) => item.dailyRevenue);

    this.revenueChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Daily Revenue',
          data: values,
          fill: true,
          borderColor: 'var(--theme-accent-primary)',
          tension: 0.4,
          backgroundColor: 'rgba(59, 130, 246, 0.2)' // Blue shade for fill
        }
      ]
    };

    this.revenueChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => `${context.dataset.label}: $${context.raw.toLocaleString()}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: 'var(--theme-text-secondary)' }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'var(--theme-border)' },
          ticks: {
            color: 'var(--theme-text-secondary)',
            callback: (value: number) => `$${value / 1000}k`
          }
        }
      }
    };
  }

  // Helper to get tag severity based on value
  getChangeSeverity(change: number): 'success' | 'danger' {
    return change >= 0 ? 'success' : 'danger';
  }

  // Helper to format percentage
  formatPercent(change: number): string {
    return `${Math.abs(change)}% ${change >= 0 ? '↑' : '↓'}`;
  }
}

// // enhanced-dashboard.component.ts

// import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { PanelModule } from 'primeng/panel';
// import { SkeletonModule } from 'primeng/skeleton';
// import { MessageModule } from 'primeng/message';
// import { ChartModule } from 'primeng/chart';
// import { CardModule } from 'primeng/card';
// import { ProgressBarModule } from 'primeng/progressbar';
// import { DividerModule } from 'primeng/divider';
// import { TagModule } from 'primeng/tag';

// @Component({
//   selector: 'app-enhanced-dashboard',
//   standalone: true,
//   imports: [
//     CommonModule,
//     PanelModule,
//     SkeletonModule,
//     MessageModule,
//     ChartModule,
//     CardModule,
//     ProgressBarModule,
//     DividerModule,
//     TagModule
//   ],
//   templateUrl: './enhanced-kpi-summary.component.html',
//   styleUrl: './enhanced-kpi-summary.component.css',
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// // @Component({
// //   selector: 'app-enhanced-kpi-summary',
// //   standalone: true,
// //   imports: [CommonModule, PanelModule, SkeletonModule, MessageModule],
// //   templateUrl: './enhanced-kpi-summary.component.html',
// //   styleUrl: './enhanced-kpi-summary.component.css',
// //   changeDetection: ChangeDetectionStrategy.OnPush
// // })
// export class EnhancedDashboardComponent implements OnChanges {
//   @Input() title: string = 'Business Dashboard';
//   @Input() data: any;
//   @Input() loading: boolean = false;

//   // Chart data properties
//   revenueChartData: any;
//   revenueChartOptions: any;

//   constructor(private cdr: ChangeDetectorRef) { }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['data'] && this.data) {
//       this.prepareRevenueChart();
//       this.cdr.markForCheck();
//     }
//     if (changes['loading']) {
//       this.cdr.markForCheck();
//     }
//   }

//   private prepareRevenueChart(): void {
//     if (!this.data.charts || !this.data.charts.revenueTrend) return;

//     const labels = this.data.charts.revenueTrend.map((item: any) => item._id);
//     const values = this.data.charts.revenueTrend.map((item: any) => item.dailyRevenue);

//     this.revenueChartData = {
//       labels: labels,
//       datasets: [
//         {
//           label: 'Daily Revenue',
//           data: values,
//           fill: true,
//           borderColor: 'var(--theme-accent-primary)',
//           tension: 0.4,
//           backgroundColor: 'rgba(59, 130, 246, 0.2)' // Blue shade for fill
//         }
//       ]
//     };

//     this.revenueChartOptions = {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: {
//         legend: {
//           display: false
//         },
//         tooltip: {
//           callbacks: {
//             label: (context: any) => `${context.dataset.label}: $${context.raw.toLocaleString()}`
//           }
//         }
//       },
//       scales: {
//         x: {
//           grid: { display: false },
//           ticks: { color: 'var(--theme-text-secondary)' }
//         },
//         y: {
//           beginAtZero: true,
//           grid: { color: 'var(--theme-border)' },
//           ticks: {
//             color: 'var(--theme-text-secondary)',
//             callback: (value: number) => `$${value / 1000}k`
//           }
//         }
//       }
//     };
//   }

//   // Helper to get tag severity based on value
//   getChangeSeverity(change: number): string {
//     return change >= 0 ? 'success' : 'danger';
//   }

//   // Helper to format percentage
//   formatPercent(change: number): string {
//     return `${Math.abs(change)}% ${change >= 0 ? '↑' : '↓'}`;
//   }
// }

// // // enhanced-kpi-summary.component.ts

// // import { Component, Input, ChangeDetectionStrategy, SimpleChanges, ChangeDetectorRef } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { PanelModule } from 'primeng/panel';
// // import { SkeletonModule } from 'primeng/skeleton';
// // import { MessageModule } from 'primeng/message';

// // @Component({
// //   selector: 'app-enhanced-kpi-summary',
// //   standalone: true,
// //   imports: [CommonModule, PanelModule, SkeletonModule, MessageModule],
// //   templateUrl: './enhanced-kpi-summary.component.html',
// //   styleUrl: './enhanced-kpi-summary.component.css',
// //   changeDetection: ChangeDetectionStrategy.OnPush
// // })
// // export class EnhancedKpiSummaryComponent {
// //   @Input() title: string = 'KPI Summary';
// //   @Input() data:any
// //   @Input() loading: boolean = false;

// //   constructor(private cdr: ChangeDetectorRef) { }

// //   ngOnChanges(changes: SimpleChanges): void {
// //     if (changes['data']) {
// //       console.log(this.data);
// //       this.cdr.markForCheck();
// //     }
// //     if (changes['loading']) {
// //       this.cdr.markForCheck();
// //     }
// //   }
// // }

// // // // enhanced-kpi-summary.component.ts

// // // import {
// // //   Component,
// // //   Input,
// // //   ChangeDetectionStrategy,
// // //   SimpleChanges,
// // //   ChangeDetectorRef // 1. Import ChangeDetectorRef
// // // } from '@angular/core';
// // // import { CommonModule } from '@angular/common';
// // // import { PanelModule } from 'primeng/panel';
// // // import { SkeletonModule } from 'primeng/skeleton';
// // // import { MessageModule } from 'primeng/message';

// // // @Component({
// // //   selector: 'app-enhanced-kpi-summary',
// // //   standalone: true,
// // //   imports: [CommonModule, PanelModule, SkeletonModule, MessageModule],
// // //   templateUrl: './enhanced-kpi-summary.component.html',
// // //   styleUrl: './enhanced-kpi-summary.component.css',
// // //   changeDetection: ChangeDetectionStrategy.OnPush
// // // })
// // // export class EnhancedKpiSummaryComponent {
// // //   @Input() title: string = 'KPI Summary';
// // //   @Input() data: {
// // //     totalRevenue: { value: number; change: number };
// // //     totalSales: { value: number; change: number };
// // //     grossProfit: { value: number; change: number };
// // //     newCustomers: { value: number; change: number };
// // //   } | null = null;
// // //   @Input() loading: boolean = false;

// // //   // 2. Inject it in the constructor
// // //   constructor(private cdr: ChangeDetectorRef) {}

// // //   ngOnChanges(changes: SimpleChanges): void {
// // //     if (changes['data'] && changes['data'].currentValue) {
// // //       console.log('Data received:', this.data);
// // //       this.cdr.markForCheck();
// // //     }
// // //     if (changes['loading']) {
// // //       console.log('Loading state changed:', this.loading);
// // //       this.cdr.markForCheck();
// // //     }
// // //   }
// // // }