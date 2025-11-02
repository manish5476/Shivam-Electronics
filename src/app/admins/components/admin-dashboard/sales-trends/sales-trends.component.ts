import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

// ─────────────────────────────────────────────────────────────────────────────
// Strongly-typed interfaces
// ─────────────────────────────────────────────────────────────────────────────
interface DailyTrend {
  _id: string;               // date string (e.g. "2025-10-15")
  dailyRevenue: number;
}
interface MonthlySummary {
  year: number;
  month: number;             // 1-12
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

  // ── Chart data ─────────────────────────────────────────────────────────────
  previewChartData: any[] = [];   // used only in the widget preview
  dialogChartData: any[] = [];    // used in the full-size dialog

  chartColorScheme!: Color;

  // ── KPI values ─────────────────────────────────────────────────────────────
  totalYearlyRevenue = 0;
  bestPerformingMonth: { name: string; value: number } | null = null;
  peakRevenueDay: { date: string; value: number } | null = null;

  // ── Dialog state ───────────────────────────────────────────────────────────
  isDialogVisible = false;

  constructor() {
    this.setChartColors();
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.processData();
    }
  }

  // ── Core processing ────────────────────────────────────────────────────────
  private processData(): void {
    if (!this.data || this.data.length < 3) return;

    this.calculateKpiSummaries();
    this.prepareChartData();
  }

  private calculateKpiSummaries(): void {
    const [daily, monthly, yearly] = this.data!;

    // Total yearly revenue
    this.totalYearlyRevenue = yearly.reduce((s, m) => s + m.totalRevenue, 0);

    // Peak day
    if (daily.length) {
      const peak = daily.reduce((a, b) => (a.dailyRevenue > b.dailyRevenue ? a : b));
      this.peakRevenueDay = { date: peak._id, value: peak.dailyRevenue };
    }

    // Best month
    if (monthly.length) {
      const best = monthly.reduce((a, b) => (a.totalRevenue > b.totalRevenue ? a : b));
      this.bestPerformingMonth = {
        name: new Date(best.year, best.month - 1).toLocaleString('default', { month: 'long' }),
        value: best.totalRevenue
      };
    }
  }

  private prepareChartData(): void {
    const [, monthly, yearly] = this.data!;

    // ── Preview (small bar chart) ───────────────────────────────────────
    this.previewChartData = monthly
      .filter(m => m.totalRevenue > 0)
      .map(m => ({
        name: new Date(m.year, m.month - 1).toLocaleString('default', { month: 'short' }),
        value: m.totalRevenue
      }));

    // ── Dialog (full-size bar chart) ───────────────────────────────────
    this.dialogChartData = yearly.map(m => ({
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
        style.getPropertyValue('--theme-warning-primary').trim()
      ]
    };
  }

  // ── UI actions ─────────────────────────────────────────────────────────────
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

//   // Chart data
//   previewChartData: any[] = [];
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
//     this.prepareChartData(); // This now prepares both charts
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

//   private prepareChartData(): void {
//     const [dailyData, monthlyData, yearlyData] = this.data!;

//     // Data for the simple preview area chart
//     this.previewChartData = [{
//       name: 'Monthly Revenue',
//       series: monthlyData
//         .filter(m => m.totalRevenue > 0)
//         .map(m => ({
//           name: new Date(m.year, m.month - 1).toLocaleString('default', { month: 'short' }),
//           value: m.totalRevenue,
//         })),
//     }];

//     // Data for the detailed dialog bar chart
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
