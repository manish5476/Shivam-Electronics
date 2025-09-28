import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxChartsModule, Color, ScaleType, TooltipModule } from '@swimlane/ngx-charts';
import { CommonModule } from '@angular/common';

// Define a unified interface for the incoming data
export interface SalesData {
  yearlySales: { year: number; month: number; totalRevenue: number; salesCount: number; }[];
  weeklySales: { year: number; week: number; dailySales: { date: string; totalRevenue: number; salesCount: number }[]; }[];
}

@Component({
  selector: 'app-sales-charts',
  standalone: true,
  imports: [CommonModule, NgxChartsModule,TooltipModule],
  templateUrl: './sales-charts.component.html',
  styleUrls: ['./sales-charts.component.css']
})
export class SalesChartsComponent implements OnChanges {
  // The 'loading' input has been removed
  @Input() data: SalesData | null = null;
  @Input() loading: boolean = false;
  yearlySalesData: any[] = [];
  weeklySalesData: any[] = [];
  chartColorScheme!: Color;

  constructor() {
    this.setChartColors();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.formatDataForCharts();
    }
  }

  setChartColors(): void {
    const style = getComputedStyle(document.documentElement);
    this.chartColorScheme = {
      name: 'glassmorphism',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: [
        style.getPropertyValue('--chart-color-1').trim() || '#8884d8',
        style.getPropertyValue('--chart-color-2').trim() || '#82ca9d',
        style.getPropertyValue('--chart-color-3').trim() || '#ffc658',
        style.getPropertyValue('--chart-color-4').trim() || '#fca5a5',
        style.getPropertyValue('--chart-color-5').trim() || '#6ee7b7',
      ]
    };
  }

  formatDataForCharts(): void {
    if (!this.data) return;

    this.yearlySalesData = this.data.yearlySales.map(sale => ({
      name: this.getMonthName(sale.month),
      value: sale.totalRevenue
    }));

    const weeklyRevenue = this.data.weeklySales
      .map(week => ({
        name: `Week ${week.week}`,
        value: week.dailySales.reduce((sum, day) => sum + day.totalRevenue, 0)
      }))
      .filter(week => week.value > 0);

    this.weeklySalesData = [{
      name: 'Revenue',
      series: weeklyRevenue
    }];
  }

  private getMonthName(monthNumber: number): string {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[monthNumber - 1] || 'N/A';
  }
}