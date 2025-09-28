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
  @Input() data: any
  chartData: { name: string; value: number }[] = [];
  isDialogVisible: boolean = false;

  // By binding [view]="view", we ensure ngx-charts respects the container's size
  view: any

  chartColorScheme!: Color;

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
    this.chartColorScheme = {
      name: 'vivid',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: [
        style.getPropertyValue('--theme-accent-primary-light').trim(),
        style.getPropertyValue('--theme-accent-primary').trim(),
        style.getPropertyValue('--theme-info-primary').trim(),
        style.getPropertyValue('--theme-success-primary').trim()
      ]
    };
  }

  private prepareChartData(): void {
    if (!this.data) return;
    this.chartData = this.data.map((item: { year: number; month: number; totalRevenue: any; }) => ({
      name: new Date(item.year, item.month - 1).toLocaleString('default', { month: 'short' }),
      value: item.totalRevenue
    }));
  }

  openDialog(): void {
    this.isDialogVisible = true;
  }
}
// import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
// import { DialogModule } from 'primeng/dialog';
// import { ButtonModule } from 'primeng/button';

// export interface YearlySale {
//   year: number;
//   month: number;
//   totalRevenue: number;
//   salesCount: number;
// }

// @Component({
//   selector: 'app-yearly-sales',
//   standalone: true,
//   imports: [CommonModule, NgxChartsModule, DialogModule, ButtonModule],
//   templateUrl: './yearly-sales.component.html',
//   styleUrls: ['./yearly-sales.component.css']
// })
// export class YearlySalesComponent implements OnChanges {
//   @Input() title: string = 'Yearly Sales';
//   @Input() data: YearlySale[] | null = null;

//   chartData: { name: string; value: number }[] = [];
//   isDialogVisible: boolean = false;

//   chartColorScheme!: Color;
//   previewChartOptions: any = {};
//   dialogChartOptions: any = {};

//   constructor() {
//     this.setChartColors();
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['data'] && this.data) {
//       this.prepareChartData();
//     }
//   }

//   private setChartColors(): void {
//     const style = getComputedStyle(document.documentElement);
//     this.chartColorScheme = {
//       name: 'vivid',
//       selectable: true,
//       group: ScaleType.Ordinal,
//       domain: [
//         style.getPropertyValue('--theme-accent-primary-light').trim(),
//         style.getPropertyValue('--theme-accent-primary').trim(),
//         style.getPropertyValue('--theme-info-primary').trim(),
//         style.getPropertyValue('--theme-success-primary').trim()
//       ]
//     };
//   }

//   private prepareChartData(): void {
//     if (!this.data) return;
//     this.chartData = this.data.map(item => ({
//       name: new Date(item.year, item.month - 1).toLocaleString('default', { month: 'short' }),
//       value: item.totalRevenue
//     }));
//   }

//   openDialog(): void {
//     this.isDialogVisible = true;
//   }
// }