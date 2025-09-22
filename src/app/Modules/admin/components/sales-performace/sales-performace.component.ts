import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-sales-performance',
  standalone: true,
  imports: [CommonModule, ChartModule, CardModule],
  template: `
    <div class="sales-performance">
      <!-- Historical Sales Card -->
      <p-card class="sales-card">
        <h2 class="section-title">📊 Historical Sales</h2>
        <p-chart type="line" [data]="chartData" [options]="chartOptions"></p-chart>
      </p-card>

      <!-- Forecast Card -->
      <p-card class="forecast-card">
        <h2 class="section-title">🔮 Next Month Forecast</h2>
        <div class="forecast-value" [ngClass]="trendClass">
          {{ forecastValue | currency:'USD':'symbol':'1.0-0' }}
          <span class="trend-indicator" *ngIf="trendArrow">
            {{ trendArrow }}
          </span>
        </div>
        <p class="forecast-label">Projected sales for next month</p>
      </p-card>
    </div>
  `,
  styles: [`
    .sales-performance {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
      padding: 2rem;
    }

    .sales-card, .forecast-card {
      border-radius: 1.6rem;
      padding: 2rem;
      box-shadow: 0 6px 22px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .sales-card:hover, .forecast-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 14px 40px rgba(0,0,0,0.15);
    }

    .section-title {
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: var(--theme-text-primary, #222);
    }

    .forecast-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .forecast-value {
      font-size: 2.4rem;
      font-weight: 800;
      margin: 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .forecast-label {
      font-size: 1rem;
      color: var(--theme-text-secondary, #666);
    }

    .forecast-value.up { color: #28a745; }
    .forecast-value.down { color: #dc3545; }
    .forecast-value.neutral { color: #42a5f5; }

    .trend-indicator {
      font-size: 1.6rem;
    }

    @media (max-width: 992px) {
      .sales-performance {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SalesPerformanceComponent implements OnInit {
  @Input() data: any;

  chartData: any;
  chartOptions: any;
  forecastValue: number = 0;
  trendArrow: string = '';
  trendClass: string = 'neutral';

  ngOnInit() {
    if (this.data?.historicalData) {
      const labels = this.data.historicalData.map((d: any) => `${d._id.month}/${d._id.year}`);
      const sales = this.data.historicalData.map((d: any) => d.totalSales);

      this.chartData = {
        labels,
        datasets: [
          {
            label: 'Sales',
            data: sales,
            fill: true,
            borderColor: '#42a5f5',
            backgroundColor: 'rgba(66,165,245,0.3)',
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: '#1e88e5'
          }
        ]
      };

      this.chartOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#888' } },
          y: { ticks: { color: '#888' } }
        }
      };

      // Forecast logic
      if (this.data?.forecast?.nextMonth) {
        this.forecastValue = parseFloat(this.data.forecast.nextMonth);
        const lastMonthSales = sales[sales.length - 1] || 0;

        if (this.forecastValue > lastMonthSales) {
          this.trendArrow = '↑';
          this.trendClass = 'up';
        } else if (this.forecastValue < lastMonthSales) {
          this.trendArrow = '↓';
          this.trendClass = 'down';
        } else {
          this.trendArrow = '→';
          this.trendClass = 'neutral';
        }
      }
    }
  }
}
