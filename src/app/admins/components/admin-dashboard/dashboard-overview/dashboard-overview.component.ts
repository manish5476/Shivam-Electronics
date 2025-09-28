import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Strongly-typed interface for the component's data
export interface DashboardOverviewData {
  totalRevenue: number;
  totalSales: number;
  grossProfit: number;
  averageOrderValue: number;
  newCustomers: number;
  topSellingProducts: {
    totalQuantity: number;
    productName: string;
    thumbnail: string;
  }[];
  customersWithDues: any[];
}

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.css']
})
export class DashboardOverviewComponent {
  @Input() data: DashboardOverviewData | null = null;
}