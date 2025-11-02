import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

// PrimeNG & Charting Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

// Strongly-typed interfaces for the component's data
export interface CustomerAnalyticsData {
  summary: {
    newCustomers: number;
    repeatCustomerRate: number;
  };
  revenueBreakdown: any[]; // Assuming this might be used in the future
  topCustomersLifetime: {
    _id: string;
    fullname: string;
    lifetimeValue: number;
  }[];
}

@Component({
  selector: 'app-customer-analytics',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    NgxChartsModule
  ],
  templateUrl: './customer-analytics.component.html',
  styleUrls: ['./customer-analytics.component.css']
})
export class CustomerAnalyticsComponent implements OnChanges {
  @Input() data: any
  @Output() openDetail = new EventEmitter<any>();

  // Properties for the ngx-charts donut chart
  repeatRateChartData: { name: string, value: number }[] = [];
  chartColorScheme: Color;

  constructor() {
    const style = getComputedStyle(document.documentElement);
    this.chartColorScheme = {
      name: 'customerLoyalty',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: [
        style.getPropertyValue('--theme-accent-primary').trim(),
        style.getPropertyValue('--theme-bg-ternary').trim()
      ]
    };
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      // Prepare data for the donut chart
      const repeatRate = this.data.summary.repeatCustomerRate * 100;
      this.repeatRateChartData = [
        { name: 'Repeat', value: repeatRate },
        { name: 'New', value: 100 - repeatRate }
      ];
    }
  }

viewCustomerDetails(customer: any): void {
  this.openDetail.emit({
    title: `Customer: ${customer.fullname}`,
    data: customer,
    template: 'customerTemplate'
  });
}

  
}