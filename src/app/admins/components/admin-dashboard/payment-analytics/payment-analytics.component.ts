import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

// Strongly-typed interfaces for the component's data
export interface PaymentAnalyticsData {
  financialHealth: {
    totalBilled: number;
    totalCollected: number;
    collectionRate: number;
  };
  paymentMethods: {
    _id: string;
    totalAmount: number;
    count: number;
  }[];
  failedPayments: {
    count: number;
    totalValue: number;
  };
  collectionTrends: {
    _id: string; // Date string
    dailyTotal: number;
  }[];
}


@Component({
  selector: 'app-payment-analytics',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './payment-analytics.component.html',
  styleUrls: ['./payment-analytics.component.css']
})
export class PaymentAnalyticsComponent implements OnChanges {
  @Input() data: any

  // Chart properties
  collectionTrendData: any[] = [];
  paymentMethodData: { name: string; value: number }[] = [];
  collectionRateData: { name: string; value: number }[] = [];
  
  // Color Schemes
  lineChartColorScheme: Color;
  pieChartColorScheme: Color;
  gaugeColorScheme: Color;

  constructor() {
    const style = getComputedStyle(document.documentElement);
    
    // Define color schemes using your theme variables
    this.lineChartColorScheme = {
      name: 'collectionTrend',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: [style.getPropertyValue('--theme-accent-primary').trim()]
    };
    
    this.pieChartColorScheme = {
      name: 'paymentMethods',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: [
        style.getPropertyValue('--theme-accent-primary').trim(),
        style.getPropertyValue('--theme-info-primary').trim(),
        style.getPropertyValue('--theme-success-primary').trim(),
        style.getPropertyValue('--theme-warning-primary').trim()
      ]
    };

    this.gaugeColorScheme = {
      name: 'collectionRate',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: [style.getPropertyValue('--theme-success-primary').trim()]
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.prepareAllCharts();
    }
  }

  private prepareAllCharts(): void {
    if (!this.data) return;

    // 1. Collection Trends Area Chart
    this.collectionTrendData = [{
      name: 'Collections',
      series: this.data.collectionTrends.map((trend:any) => ({
        name: new Date(trend._id),
        value: trend.dailyTotal
      }))
    }];

    // 2. Payment Methods Donut Chart
    this.paymentMethodData = this.data.paymentMethods.map((method:any) => ({
      name: method._id.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()), // Format name
      value: method.totalAmount
    }));

    // 3. Collection Rate Gauge Chart
    this.collectionRateData = [{
      name: 'Collection Rate',
      value: this.data.financialHealth.collectionRate
    }];
  }
}
// import { CommonModule } from '@angular/common';
// import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
// import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

// // Strongly-typed interfaces for the component's data
// export interface PaymentAnalyticsData {
//   summary: {
//     totalCollected: number;
//     totalDues: number;
//     collectionRate: number;
//   };
//   breakdownByMethod: {
//     _id: string; // e.g., 'cash', 'upi'
//     totalAmount: number;
//   }[];
// }

// @Component({
//   selector: 'app-payment-analytics',
//   standalone: true,
//   imports: [CommonModule, NgxChartsModule],
//   templateUrl: './payment-analytics.component.html',
//   styleUrls: ['./payment-analytics.component.css']
// })
// export class PaymentAnalyticsComponent implements OnChanges {
//   @Input() data: any

//   // Chart properties
//   breakdownChartData: { name: string; value: number }[] = [];
//   gaugeChartData: { name: string; value: number }[] = [];
  
//   barChartColorScheme: Color;
//   gaugeColorScheme: Color;

//   constructor() {
//     const style = getComputedStyle(document.documentElement);
//     // Color scheme for the bar chart
//     this.barChartColorScheme = {
//       name: 'paymentMethods',
//       selectable: true,
//       group: ScaleType.Ordinal,
//       domain: [
//         style.getPropertyValue('--theme-accent-primary').trim(),
//         style.getPropertyValue('--theme-info-primary').trim(),
//         style.getPropertyValue('--theme-success-primary').trim(),
//         style.getPropertyValue('--theme-warning-primary').trim()
//       ]
//     };
//     // Color scheme for the gauge chart
//     this.gaugeColorScheme = {
//       name: 'collectionRate',
//       selectable: true,
//       group: ScaleType.Ordinal,
//       domain: [style.getPropertyValue('--theme-success-primary').trim()]
//     };
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['data'] && this.data) {
//       // Prepare data for the bar chart
//       this.breakdownChartData = this.data.breakdownByMethod.map((method: { _id: string; totalAmount: any; }) => ({
//         name: method._id.charAt(0).toUpperCase() + method._id.slice(1), // Capitalize name
//         value: method.totalAmount
//       }));
//       // Prepare data for the gauge chart
//       this.gaugeChartData = [{
//         name: 'Collection Rate',
//         value: this.data.summary.collectionRate * 100 // Convert rate to percentage
//       }];
//     }
//   }
// }

// // import { Component, Input } from '@angular/core';

// // @Component({
// //   selector: 'app-payment-analytics',
// //   imports: [],
// //   templateUrl: './payment-analytics.component.html',
// //   styleUrl: './payment-analytics.component.css'
// // })
// // export class PaymentAnalyticsComponent {
// //   @Input() data: any
// //   @Input() loading: any
// // }
