import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToolbarComponent } from '../../../../shared/Components/toolbar/toolbar.component';
// import { AdminDashboardService, User, DashboardStats } from '../../services/admin-dashboard.service';
// import { AnalyticsService, SalesPerformance, ProductPerformance } from '../../../../core/services/analytics.service';

interface ChartDataset {
  label: string;
  data: number[];
  fill: boolean;
  borderColor: string;
  tension: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartOptions {
  plugins: {
    legend: {
      labels: {
        color: string;
      };
    };
  };
  scales: {
    x: {
      ticks: {
        color: string;
      };
    };
    y: {
      ticks: {
        color: string;
      };
    };
  };
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    
  ],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- <app-toolbar></app-toolbar> -->
      

      <div class="bg-gray-900 text-white p-6 rounded-lg shadow-xl">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
            <div>
                <h3 class="text-sm text-gray-400 mb-1">Total Sales</h3>
                <p class="text-2xl font-semibold">$47,867</p>
            </div>
            <div class="mt-4">
                <p class="text-xs text-green-400">+20.1% (Last Month)</p>
            </div>
        </div>

        <div class="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
            <div>
                <h3 class="text-sm text-gray-400 mb-1">New Products This Week</h3>
                <p class="text-2xl font-semibold">7,564</p>
            </div>
             <div class="mt-4">
                <div class="flex space-x-2">
                    <div class="bg-blue-500 h-4 rounded w-1/4"></div>
                    <div class="bg-blue-500 h-6 rounded w-1/4"></div>
                    <div class="bg-orange-500 h-8 rounded w-1/4"></div>
                    <div class="bg-blue-500 h-6 rounded w-1/4"></div>
                    <div class="bg-orange-500 h-4 rounded w-1/4"></div>
                    <div class="bg-blue-500 h-6 rounded w-1/4"></div>
                    <div class="bg-orange-500 h-8 rounded w-1/4"></div>
                </div>
            </div>
            <div class="mt-4">
                 <p class="text-xs text-green-400">17% increase</p>
            </div>
        </div>

        <div class="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
            <div>
                <h3 class="text-sm text-gray-400 mb-1">Website Traffic</h3>
                <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-white"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                    <p class="text-base font-medium">890 k</p>
                </div>
            </div>
            <div class="mt-4 flex-grow flex items-center justify-center">
                <div class="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <span class="text-xs text-gray-300">Pie Chart</span>
                </div>
            </div>
            <div class="mt-4">
                <p class="text-xs text-gray-400">Last 7 days</p>
            </div>
        </div>

        <div class="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
            <div>
                <h3 class="text-sm text-gray-400 mb-1">Conversion Rate</h3>
                <div class="flex items-center space-x-2">
                     <p class="text-2xl font-semibold">42.3k</p>
                     <p class="text-base text-gray-400">/ $5.40</p>
                </div>

            </div>
            <div class="mt-4 flex-grow flex items-center justify-center">
               <div class="w-32 h-16 bg-gradient-to-r from-gray-700 to-gray-900  flex items-center justify-center">
                    <span class="text-xs text-gray-300">Line Chart</span>
                </div>
            </div>
             <div class="mt-4">
                <p class="text-xs text-orange-400">▲ 23.5%</p>
            </div>
        </div>
    </div>
</div>


      <div class="p-6">
        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <p-card class="bg-white shadow-md">
            <div class="text-center">
              <h3 class="text-gray-500 text-sm">Total Sales</h3>
              <p class="text-2xl font-bold text-blue-600">{{ dashboardStats.totalSales | currency }}</p>
              <span class="text-green-500 text-sm">+{{ dashboardStats.salesGrowth }}%</span>
            </div>
          </p-card>

          <p-card class="bg-white shadow-md">
            <div class="text-center">
              <h3 class="text-gray-500 text-sm">Total Orders</h3>
              <p class="text-2xl font-bold text-purple-600">{{ dashboardStats.totalOrders }}</p>
              <span class="text-green-500 text-sm">+{{ dashboardStats.ordersGrowth }}%</span>
            </div>
          </p-card>

          <p-card class="bg-white shadow-md">
            <div class="text-center">
              <h3 class="text-gray-500 text-sm">Total Customers</h3>
              <p class="text-2xl font-bold text-green-600">{{ dashboardStats.totalCustomers }}</p>
              <span class="text-green-500 text-sm">+{{ dashboardStats.customersGrowth }}%</span>
            </div>
          </p-card>

          <p-card class="bg-white shadow-md">
            <div class="text-center">
              <h3 class="text-gray-500 text-sm">Total Products</h3>
              <p class="text-2xl font-bold text-orange-600">{{ dashboardStats.totalProducts }}</p>
              <span class="text-green-500 text-sm">+{{ dashboardStats.productsGrowth }}%</span>
            </div>
          </p-card>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <p-card class="bg-white shadow-md">
            <h2 class="text-xl font-semibold mb-4">Sales Trend</h2>
            <p-chart type="line" [data]="salesData" [options]="chartOptions"></p-chart>
          </p-card>

          <p-card class="bg-white shadow-md">
            <h2 class="text-xl font-semibold mb-4">Top Products</h2>
            <p-table [value]="topProducts" [paginator]="true" [rows]="5">
              <ng-template pTemplate="header">
                <tr>
                  <th>Product</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-product>
                <tr>
                  <td>{{ product.name }}</td>
                  <td>{{ product.totalQuantity }}</td>
                  <td>{{ product.totalRevenue | currency }}</td>
                </tr>
              </ng-template>
            </p-table>
          </p-card>
        </div>

        <!-- Recent Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <p-card class="bg-white shadow-md">
            <h2 class="text-xl font-semibold mb-4">Recent Orders</h2>
            <p-table [value]="recentOrders" [paginator]="true" [rows]="5">
              <ng-template pTemplate="header">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-order>
                <tr>
                  <td>{{ order.invoiceNumber }}</td>
                  <td>{{ order.buyerDetails?.name }}</td>
                  <td>{{ order.totalAmount | currency }}</td>
                  <td>
                    <span [class]="getStatusClass(order.status)">
                      {{ order.status }}
                    </span>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-card>

          <p-card class="bg-white shadow-md">
            <h2 class="text-xl font-semibold mb-4">Low Stock Alerts</h2>
            <p-table [value]="lowStockProducts" [paginator]="true" [rows]="5">
              <ng-template pTemplate="header">
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Reorder Point</th>
                  <th>Status</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-product>
                <tr>
                  <td>{{ product.name }}</td>
                  <td>{{ product.stockLevel }}</td>
                  <td>{{ product.reorderPoint }}</td>
                  <td>
                    <span [class]="getStockStatusClass(product.stockLevel, product.reorderPoint)">
                      {{ getStockStatus(product.stockLevel, product.reorderPoint) }}
                    </span>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-card>
        </div>
      </div>
    </div>
  `,
  // styles: [`
  // /* @import "tailwindcss"; */   
  //  :host ::ng-deep .p-card {
  //     @apply rounded-lg;
  //   }
  //   :host ::ng-deep .p-card-content {
  //     @apply p-4;
  //   }
  //   :host ::ng-deep .p-datatable {
  //     @apply rounded-lg;
  //   }
  //   :host ::ng-deep .p-datatable-header {
  //     @apply bg-white border-b;
  //   }
  //   :host ::ng-deep .p-datatable-thead > tr > th {
  //     @apply bg-gray-50 text-gray-700 font-semibold;
  //   }
  //   :host ::ng-deep .p-datatable-tbody > tr > td {
  //     @apply border-b;
  //   }
  //   :host ::ng-deep .p-paginator {
  //     @apply bg-white border-t;
  //   }
  // `]
})
export class AdminDashboardComponent implements OnInit {
  // Chart data
  salesData: ChartData;
  chartOptions: ChartOptions;

  // Dashboard data
  dashboardStats: any = {
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    salesGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    productsGrowth: 0
  };

  topProducts: any[] = [];
  recentOrders: any[] = [];
  lowStockProducts: any[] = [];

  constructor(
    // private dashboardService: AdminDashboardService,
    // private analyticsService: AnalyticsService
  ) {
    // Initialize chart data
    this.salesData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Sales',
          data: [65, 59, 80, 81, 56, 55],
          fill: false,
          borderColor: '#4CAF50',
          tension: 0.4
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          }
        },
        y: {
          ticks: {
            color: '#495057'
          }
        }
      }
    };
  }

  ngOnInit(): void {
    // this.loadDashboardData();
  }


  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'px-2 py-1 text-sm rounded-full bg-green-100 text-green-800';
      case 'unpaid':
        return 'px-2 py-1 text-sm rounded-full bg-red-100 text-red-800';
      default:
        return 'px-2 py-1 text-sm rounded-full bg-gray-100 text-gray-800';
    }
  }

  getStockStatusClass(stock: number, reorderPoint: number): string {
    if (stock <= 0) {
      return 'px-2 py-1 text-sm rounded-full bg-red-100 text-red-800';
    } else if (stock <= reorderPoint) {
      return 'px-2 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800';
    }
    return 'px-2 py-1 text-sm rounded-full bg-green-100 text-green-800';
  }

  getStockStatus(stock: number, reorderPoint: number): string {
    if (stock <= 0) {
      return 'Out of Stock';
    } else if (stock <= reorderPoint) {
      return 'Low Stock';
    }
    return 'In Stock';
  }
} 