import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

export interface YearlySale {
  year: number;
  month: number;
  totalRevenue: number;
  salesCount: number;
}

@Component({
  selector: 'app-yearly-sales',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, DialogModule, ButtonModule],
  templateUrl: './yearly-sales.component.html',
  styleUrls: ['./yearly-sales.component.css']
})
export class YearlySalesComponent implements OnChanges {
  @Input() title: string = 'Yearly Sales';
  @Input() data: YearlySale[] = [];

  revenueData: { name: string; value: number }[] = [];
  salesData: { name: string; value: number }[] = [];
  isDialogVisible: boolean = false;

  view: [number, number] = [700, 400];

  revenueColorScheme!: Color;
  salesColorScheme!: Color;

  constructor() {
    this.setChartColors();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.prepareChartData();
    }
  }

  private setChartColors(): void {
    const style = getComputedStyle(document.documentElement);
    this.revenueColorScheme = {
      name: 'revenueScheme',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: [style.getPropertyValue('--theme-accent-primary').trim() || '#42A5F5']
    };

    this.salesColorScheme = {
      name: 'salesScheme',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: [style.getPropertyValue('--theme-success-primary').trim() || '#66BB6A']
    };
  }

  private prepareChartData(): void {
    if (!this.data) return;

    const months = Array.from({ length: 12 }, (_, i) =>
      new Date(2025, i).toLocaleString('default', { month: 'short' })
    );

    this.revenueData = months.map((month, index) => {
      const record = this.data.find(item => item.month === index + 1);
      return { name: month, value: record ? record.totalRevenue : 0 };
    });

  this.salesData = months.map((month, index) => {
  const record = this.data.find(item => item.month === index + 1);
  return {
    name: month,
    value: record ? record.salesCount : 0
  };
});

  }

  openDialog(): void {
    this.isDialogVisible = true;
  }
}
