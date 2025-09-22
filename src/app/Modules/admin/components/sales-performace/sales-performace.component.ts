import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

// PrimeNG Modules
import { ChartModule } from 'primeng/chart';
import { AvatarModule } from 'primeng/avatar';

// Mock data for demonstration if no data is provided
const mockSalesData = {
  historicalData: [
    { "_id": { "year": 2025, "month": 5 }, "totalSales": 185300 },
    { "_id": { "year": 2025, "month": 6 }, "totalSales": 210450 },
    { "_id": { "year": 2025, "month": 7 }, "totalSales": 205800 },
    { "_id": { "year": 2025, "month": 8 }, "totalSales": 235900 },
  ],
  forecast: {
    nextMonth: "245500.00"
  }
};

@Component({
  selector: 'app-sales-performance',
  standalone: true,
  imports: [CommonModule, ChartModule, CurrencyPipe, AvatarModule],
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
    <div class="analytics-container" *ngIf="chartData" @fadeInUp>
      <div class="content-grid">
        <!-- Historical Sales Chart -->
        <div class="dashboard-card chart-card">
          <div class="card-header">
            <h3 class="card-title">Historical Sales Performance</h3>
          </div>
          <div class="chart-wrapper">
            <p-chart type="line" [data]="chartData" [options]="chartOptions"></p-chart>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Forecast Card -->
          <div class="dashboard-card status-card">
            <div class="card-header">
              <h3 class="card-title">Next Month Forecast</h3>
            </div>
            <div class="status-content">
              <div class="status-icon" [ngClass]="trendClass">
                <i class="pi" [ngClass]="trendIcon"></i>
              </div>
              <span class="status-title">{{ forecastValue | currency:'INR':'symbol':'1.0-0' }}</span>
              <span class="status-subtitle">Projected sales for next month</span>
            </div>
          </div>

          <!-- Monthly Insights Card -->
          <div class="dashboard-card">
            <div class="card-header">
              <h3 class="card-title">Monthly Insights</h3>
            </div>
            <div class="item-list">
              <div class="list-item">
                <p-avatar icon="pi pi-calendar-clock" styleClass="p-avatar-icon"></p-avatar>
                <div class="item-info">
                  <span class="item-name">Last Month's Sales</span>
                  <span class="item-subtitle">{{ lastMonthLabel }}</span>
                </div>
                <span class="item-value">{{ lastMonthSales | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>
              <div class="list-item">
                <p-avatar icon="pi pi-chart-line" styleClass="p-avatar-icon" [ngClass]="trendClass"></p-avatar>
                <div class="item-info">
                  <span class="item-name">Projected Change</span>
                  <span class="item-subtitle">From last month</span>
                </div>
                <span class="item-value" [ngClass]="trendClass">{{ projectedChange | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>
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

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }
    .right-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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
      margin-bottom: 1.5rem;
    }
    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    /* Chart Card */
    .chart-card {
        min-height: 400px;
    }
    .chart-wrapper {
      flex-grow: 1;
      position: relative;
    }

    /* Status Card */
    .status-card {
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .status-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      flex-grow: 1;
      justify-content: center;
    }
    .status-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .status-icon.up { color: #22c55e; background-color: #f0fdf4; }
    .status-icon.down { color: #ef4444; background-color: #fef2f2; }
    .status-icon.neutral { color: #64748b; background-color: #f8fafc; }
    .status-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e293b;
    }
    .status-subtitle {
      font-size: 0.9rem;
      color: #64748b;
    }

    /* List Item Styles */
    .item-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .list-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .item-info {
      flex-grow: 1;
    }
    .item-name {
      font-weight: 600;
      color: #1e293b;
    }
    .item-subtitle {
      font-size: 0.85rem;
      color: #64748b;
    }
    .item-value {
      font-weight: 600;
      font-size: 1.1rem;
      color: #475569;
    }
    .item-value.up { color: #22c55e; }
    .item-value.down { color: #ef4444; }
    .item-value.neutral { color: #64748b; }

    :host ::ng-deep .p-avatar.up { background-color: #f0fdf4; color: #22c55e; }
    :host ::ng-deep .p-avatar.down { background-color: #fef2f2; color: #ef4444; }
    :host ::ng-deep .p-avatar.neutral { background-color: #f8fafc; color: #64748b; }
    
    /* Responsive */
    @media (max-width: 992px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SalesPerformanceComponent implements OnChanges {
  @Input() data: any = mockSalesData;

  chartData: any;
  chartOptions: any;

  forecastValue: number = 0;
  lastMonthSales: number = 0;
  lastMonthLabel: string = '';
  projectedChange: number = 0;
  
  trendIcon: string = 'pi-minus';
  trendClass: string = 'neutral';
  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.data?.historicalData) {
      this.processSalesData();
    }
  }

  private processSalesData(): void {
    const labels = this.data.historicalData.map((d: any) => 
      new Date(d._id.year, d._id.month - 1).toLocaleString('default', { month: 'short', year: '2-digit' })
    );
    const sales = this.data.historicalData.map((d: any) => d.totalSales);

    this.setupChart(labels, sales);
    this.setupForecast(sales);
  }

  private setupChart(labels: string[], sales: number[]): void {
    const textColor = '#475569';
    const textColorSecondary = '#94a3b8';
    const surfaceBorder = '#e2e8f0';

    this.chartData = {
      labels,
      datasets: [{
        label: 'Sales',
        data: sales,
        fill: true,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      }]
    };

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.6,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
        y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }
      }
    };
  }

  private setupForecast(sales: number[]): void {
    if (this.data?.forecast?.nextMonth) {
      this.forecastValue = parseFloat(this.data.forecast.nextMonth);
      this.lastMonthSales = sales[sales.length - 1] || 0;
      this.projectedChange = this.forecastValue - this.lastMonthSales;
      
      const lastMonthData = this.data.historicalData[this.data.historicalData.length - 1];
      this.lastMonthLabel = new Date(lastMonthData._id.year, lastMonthData._id.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

      if (this.projectedChange > 0) {
        this.trendIcon = 'pi pi-arrow-up';
        this.trendClass = 'up';
      } else if (this.projectedChange < 0) {
        this.trendIcon = 'pi pi-arrow-down';
        this.trendClass = 'down';
      } else {
        this.trendIcon = 'pi pi-minus';
        this.trendClass = 'neutral';
      }
    }
  }
}