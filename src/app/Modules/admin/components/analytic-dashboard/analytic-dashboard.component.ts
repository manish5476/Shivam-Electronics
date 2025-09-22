import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';

// PrimeNG Modules
import { SelectModule } from 'primeng/select';
import { AvatarModule } from 'primeng/avatar';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-analytic-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    AvatarModule,
    ProgressBarModule,
    CurrencyPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'none' })),
      ]),
    ]),
  ],
  template: `
    <div class="analytics-container" *ngIf="data" @fadeInUp>
      <div class="kpi-grid">
        <div class="kpi-card" *ngFor="let kpi of kpis">
          <div class="kpi-content">
            <span class="kpi-title">{{ kpi.title }}</span>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ kpi.value }}</span>
              <span class="kpi-change" [ngClass]="kpi.change.direction === 'up' ? 'positive' : 'negative'">
                <i class="pi" [ngClass]="kpi.change.direction === 'up' ? 'pi-arrow-up' : 'pi-arrow-down'"></i>
                {{ kpi.change.value }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="dashboard-card brand-performance-card">
          <div class="card-header">
            <h3 class="card-title">Performance by Brand</h3>
          </div>
          <div class="traffic-list">
            <div class="traffic-item" *ngFor="let item of trafficData">
              <div class="traffic-info">
                <span class="traffic-dot" [style.background-color]="item.color"></span>
                <span class="traffic-label">{{ item.label }}</span>
              </div>
              <div class="traffic-value">
                <p-progressBar [value]="item.value" [showValue]="false" [style]="{'height': '6px'}"></p-progressBar>
                <span>{{ item.value }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-card list-card">
          <div class="card-header">
            <h3 class="card-title">Top Categories by Profit</h3>
          </div>
          <div class="item-list">
            <div class="list-item" *ngFor="let leader of leaders">
              <p-avatar [label]="leader.initials" [style]="{'background-color': leader.color, 'color': '#ffffff'}" shape="circle"></p-avatar>
              <span class="item-name">{{ leader.name }}</span>
              <span class="item-value">{{ leader.amount }}</span>
            </div>
          </div>
        </div>

        <div class="dashboard-card list-card">
          <div class="card-header">
            <h3 class="card-title">Top Products by Profit</h3>
          </div>
          <div class="item-list">
            <div class="list-item" *ngFor="let product of products">
              <img [src]="product.image" (error)="onImageError($event)" [alt]="product.name" class="item-image">
              <div class="item-info">
                <span class="item-name">{{ product.name }}</span>
                <span class="item-subtitle">{{ product.user }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-card list-card">
          <div class="card-header">
            <h3 class="card-title">Top Brands by Profit</h3>
          </div>
          <div class="item-list">
            <div class="list-item" *ngFor="let seller of sellers">
              <img [src]="seller.photo" (error)="onImageError($event)" [alt]="seller.name" class="item-image circle">
              <span class="item-name">{{ seller.name }}</span>
              <span class="item-value">{{ seller.profit | currency:'INR':'symbol':'1.0-0' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Inter', sans-serif;
    }

    .analytics-container {
      padding: 1rem;
      background-color: #f4f7fe;
      border-radius: 16px;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .kpi-card {
      background-color: #ffffff;
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .kpi-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    }
    .kpi-title {
      font-size: 0.9rem;
      color: #64748b;
      margin-bottom: 0.5rem;
      display: block;
    }
    .kpi-value-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .kpi-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
    }
    .kpi-change {
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .kpi-change.positive { color: #16a34a; }
    .kpi-change.negative { color: #dc2626; }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }
    
    .brand-performance-card {
      grid-column: 1 / -1; /* Make this card span full width */
    }

    @media (min-width: 1200px) {
      .brand-performance-card {
        grid-column: auto; /* Reset on larger screens if desired */
      }
    }


    /* Shared Card Styles */
    .dashboard-card {
      background-color: #ffffff;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-shrink: 0;
    }
    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    /* Traffic Card / Brand Performance */
    .traffic-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .traffic-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .traffic-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .traffic-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .traffic-label {
      font-weight: 500;
      color: #475569;
    }
    .traffic-value {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .traffic-value span {
        font-size: 0.85rem;
        color: #64748b;
        width: 40px;
    }
    .traffic-value p-progressbar {
      flex-grow: 1;
    }

    /* List Cards */
    .item-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .list-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .item-name {
      font-weight: 600;
      color: #1e293b;
      flex-grow: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-info {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;
    }
    .item-subtitle {
        font-size: 0.85rem;
        color: #64748b;
    }
    .item-value {
      font-weight: 500;
      color: #475569;
    }
    .item-image {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      object-fit: cover;
    }
    .item-image.circle {
        border-radius: 50%;
    }
  `]
})
export class AnalyticDashboardComponent implements OnChanges {
  @Input() data: any;

  kpis: any[] = [];
  trafficData: any[] = [];
  leaders: any[] = [];
  products: any[] = [];
  sellers: any[] = [];

  private colors: string[] = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#ef4444', '#14b8a6'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.prepareKpis();
      this.prepareTraffic();
      this.prepareLeaders();
      this.prepareProducts();
      this.prepareSellers();
    }
  }

  private prepareKpis(): void {
    const inventory = this.data.inventorySummary;
    const totalProfit = this.data.performanceByCategory.reduce((sum: number, c: any) => sum + c.grossProfit, 0);
    const bounceRate = inventory.totalItems > 0 ? (inventory.lowStockCount / inventory.totalItems * 100) : 0;
    const saleRate = inventory.totalValue > 0 ? (totalProfit / inventory.totalValue * 100) : 0;

    this.kpis = [
      {
        title: 'Total Revenue',
        value: this.formatCurrency(inventory.totalValue),
        change: { value: 27, direction: 'up' },
      },
      {
        title: 'Total Items',
        value: this.formatNumber(inventory.totalItems),
        change: { value: 12, direction: 'up' },
      },
      {
        title: 'Low Stock Rate',
        value: bounceRate.toFixed(1) + '%',
        change: { value: 22, direction: 'down' },
      },
      {
        title: 'Profitability Rate',
        value: saleRate.toFixed(1) + '%',
        change: { value: 17, direction: 'up' },
      }
    ];
  }

  private prepareTraffic(): void {
    const totalProfit = this.data.performanceByBrand.reduce((sum: number, b: any) => sum + b.grossProfit, 0);
    if (totalProfit === 0) {
      this.trafficData = [];
      return;
    }
    this.trafficData = this.data.performanceByBrand
      .slice(0, 6)
      .map((b: any, i: number) => ({
        label: b._id,
        value: Math.round((b.grossProfit / totalProfit) * 100),
        color: this.colors[i % this.colors.length]
      }));
  }

  private prepareLeaders(): void {
    this.leaders = this.data.performanceByCategory
      .slice(0, 5)
      .map((c: any, i: number) => ({
      initials: (c._id.split(',')[0] || 'G').charAt(0).toUpperCase(),
      name: this.formatCategoryName(c._id),
      amount: this.formatCurrency(c.grossProfit),
      color: this.colors[i % this.colors.length]
    }));
  }

  private prepareProducts(): void {
    const topProducts = this.data.topPerformingProducts?.topByProfit || [];
    this.products = topProducts.slice(0, 5).map((p: any) => ({
      image: p.thumbnail,
      name: p.title,
      user: p.brand
    }));
  }

  private prepareSellers(): void {
    this.sellers = this.data.performanceByBrand
      .slice(0, 5)
      .map((b: any) => ({
      photo: b.thumbnails[0] || '',
      name: b._id,
      profit: b.grossProfit
    }));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-IN').format(num);
  }

  formatCategoryName(id: string): string {
    if (!id) return 'General';
    return id.split(',')[0].replace(/([A-Z])/g, ' $1').trim()
             .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://atlantis.primeng.org/images/ecommerce-dashboard/nasa.png';
  }
}
// import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ChartModule } from 'primeng/chart';
// import { DropdownModule } from 'primeng/dropdown';
// import { Select } from "primeng/select";
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-analytic-dashboard',
//   standalone: true,
//   imports: [CommonModule, Select,FormsModule, ChartModule, DropdownModule, Select],
//   templateUrl: './analytic-dashboard.component.html',
//   styleUrls: ['./analytic-dashboard.component.css']
// })
// export class AnalyticDashboardComponent implements OnChanges {
//   @Input() data: any;

//   kpis: any[] = [];
//   trafficData: any[] = [];
//   leaders: any[] = [];
//   products: any[] = [];
//   sellers: any[] = [];
//   maxCategoryProfit: number = 0;
//   maxBrandProfit: number = 0;
//   colors: string[] = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6610f2', '#fd7e14', '#6f42c1', '#20c997', '#e83e8c'];
//   activeTab: 'profit' | 'revenue' | 'quantity' = 'profit';
//   periodOptions: any[] = [{ label: 'Yearly', value: 'yearly' }];
//   selectedPeriod: string = 'yearly';
//   smallChartOptions: any;
//   chartData: any;
//   chartOptions: any;

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['data'] && this.data) {
//       this.prepareKpis();
//       this.calculateMaximums();
//       this.prepareTraffic();
//       this.prepareLeaders();
//       this.prepareProducts();
//       this.prepareSellers();
//       this.prepareCharts();
//     }
//   }

//   private prepareKpis(): void {
//     const inventory = this.data.inventorySummary;
//     const totalProfit = this.data.performanceByCategory.reduce((sum: number, c: any) => sum + c.grossProfit, 0);
//     const bounceRate = (inventory.lowStockCount / inventory.totalItems * 100).toFixed(2);
//     const saleRate = (totalProfit / inventory.totalValue * 100).toFixed(2);
//     this.kpis = [
//       {
//         title: 'Revenue Status',
//         value: this.formatNumber(inventory.totalValue),
//         change: { value: 27, direction: 'up' },
//         chartData: this.generateSmallChartData(0),
//         color: '#007bff'
//       },
//       {
//         title: 'Page View',
//         value: this.formatNumber(inventory.totalItems),
//         change: { value: 12, direction: 'up' },
//         chartData: this.generateSmallChartData(1),
//         color: '#fd7e14'
//       },
//       {
//         title: 'Bounce Rate',
//         value: bounceRate + '%',
//         change: { value: 22, direction: 'down' },
//         chartData: this.generateSmallChartData(2),
//         color: '#dc3545'
//       },
//       {
//         title: 'Product Sale Rate',
//         value: saleRate + '%',
//         change: { value: 17, direction: 'up' },
//         chartData: this.generateSmallChartData(3),
//         color: '#28a745'
//       }
//     ];
//   }

//   private generateSmallChartData(index: number): any {
//     const color = this.colors[index % this.colors.length];
//     return {
//       labels: ['', '', '', '', ''],
//       datasets: [
//         {
//           data: [Math.random() * 10 + 5, Math.random() * 10 + 5, Math.random() * 10 + 5, Math.random() * 10 + 5, Math.random() * 10 + 5],
//           borderColor: color,
//           backgroundColor: color.replace(')', ', 0.2)').replace('rgb', 'rgba'),
//           fill: true,
//           tension: 0.4
//         }
//       ]
//     };
//   }

//   private calculateMaximums(): void {
//     if (this.data.performanceByCategory?.length > 0) {
//       this.maxCategoryProfit = Math.max(...this.data.performanceByCategory.map((c: any) => c.grossProfit));
//     }
//     if (this.data.performanceByBrand?.length > 0) {
//       this.maxBrandProfit = Math.max(...this.data.performanceByBrand.map((b: any) => b.grossProfit));
//     }
//   }

//   private prepareTraffic(): void {
//     const totalProfit = this.data.performanceByBrand.reduce((sum: number, b: any) => sum + b.grossProfit, 0);
//     this.trafficData = this.data.performanceByBrand.map((b: any, i: number) => ({
//       label: b._id,
//       value: Math.round((b.grossProfit / totalProfit) * 100),
//       color: this.colors[i % this.colors.length]
//     }));
//   }

//   private prepareLeaders(): void {
//     this.leaders = this.data.performanceByCategory.map((c: any, i: number) => ({
//       initials: this.formatCategoryName(c._id).split(' ').map((w: string) => w[0]).join('').slice(0, 2),
//       name: this.formatCategoryName(c._id),
//       amount: this.formatCurrency(c.grossProfit),
//       changeDirection: Math.random() > 0.5 ? 'up' : 'down',
//       color: this.colors[i % this.colors.length]
//     })).slice(0, 5);
//   }

//   private prepareProducts(): void {
//     this.products = this.getTopProducts('profit').map((p: any) => ({
//       image: p.thumbnail,
//       name: p.title,
//       user: p.brand,
//       arrow: Math.random() > 0.5 ? 'up' : 'down'
//     })).slice(0, 5);
//   }

//   private prepareSellers(): void {
//     this.sellers = this.data.performanceByBrand.map((b: any) => ({
//       photo: b.thumbnails[0],
//       name: b._id,
//       rating: (Math.round((b.grossProfit / this.maxBrandProfit) * 50) / 10).toFixed(1)
//     })).slice(0, 5);
//   }

//   private prepareCharts(): void {
//     const documentStyle = getComputedStyle(document.documentElement);
//     const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
//     const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

//     this.smallChartOptions = {
//       maintainAspectRatio: false,
//       aspectRatio: 0.6,
//       plugins: {
//         legend: {
//           display: false
//         }
//       },
//       scales: {
//         x: {
//           display: false
//         },
//         y: {
//           display: false
//         }
//       }
//     };

//     this.chartData = {
//       labels: ['2021', '2022', '2023'],
//       datasets: [
//         {
//           data: [8000, 7000, 6000],
//           borderColor: '#007bff',
//           backgroundColor: 'rgba(0,123,255,0.2)',
//           fill: true,
//           tension: 0.4
//         },
//         {
//           data: [5000, 4000, 3000],
//           borderColor: '#fd7e14',
//           fill: false,
//           tension: 0.4
//         }
//       ]
//     };

//     this.chartOptions = {
//       maintainAspectRatio: false,
//       aspectRatio: 0.6,
//       plugins: {
//         legend: {
//           display: false
//         }
//       },
//       scales: {
//         x: {
//           ticks: {
//             color: textColorSecondary
//           },
//           grid: {
//             color: surfaceBorder
//           }
//         },
//         y: {
//           ticks: {
//             color: textColorSecondary
//           },
//           grid: {
//             color: surfaceBorder
//           }
//         }
//       }
//     };
//   }

//   getTopProducts(tab: 'profit' | 'revenue' | 'quantity'): any[] {
//     return this.data.topPerformingProducts[`topBy${tab.charAt(0).toUpperCase() + tab.slice(1)}`] || [];
//   }

//   calculatePercentage(value: number, max: number): number {
//     return max ? (value / max) * 100 : 0;
//   }

//   formatCurrency(amount: number): string {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       maximumFractionDigits: 0,
//     }).format(amount);
//   }

//   formatNumber(num: number): string {
//     return new Intl.NumberFormat('en-IN').format(num);
//   }

//   formatCategoryName(id: string): string {
//     if (!id) return '';
//     return id.split(',')
//       .map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/([A-Z])/g, ' $1'))
//       .join(', ');
//   }

//   onImageError(event: Event): void {
//     (event.target as HTMLImageElement).src = 'https://plus.unsplash.com/premium_photo-1683121716061-3faddf4dc504?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
//   }
// }