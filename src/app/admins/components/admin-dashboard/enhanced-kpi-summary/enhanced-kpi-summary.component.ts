import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelModule } from 'primeng/panel';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview'; // Import TabViewModule

@Component({
  selector: 'app-enhanced-kpi-summary',
  standalone: true,
  imports: [
    CommonModule, PanelModule, SkeletonModule, MessageModule, ChartModule,
    CardModule, ProgressBarModule, DividerModule, TagModule, TabViewModule // Add TabViewModule
  ],
  templateUrl: './enhanced-kpi-summary.component.html',
  styleUrls: ['./enhanced-kpi-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnhancedKpiSummaryComponent implements OnChanges {
  @Input() title: string = 'Business Dashboard';
  @Input() data: any;
  @Input() loading: boolean = false;

  revenueMicroChartData: any;
  microChartOptions: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.prepareMicroCharts();
    }
  }

  private prepareMicroCharts(): void {
    // Prepare Revenue Micro-chart
    const trendData = this.data.charts?.revenueTrend || [];
    const labels = trendData.map((item: any) => ''); // No labels for a clean look
    const values = trendData.map((item: any) => item.dailyRevenue);

    this.revenueMicroChartData = {
      labels: labels,
      datasets: [{
        data: values,
        borderColor: 'var(--theme-accent-primary)',
        borderWidth: 2,
        fill: false,
        pointRadius: 0, // No points on the line
        tension: 0.4
      }]
    };
    
    // Generic options for all micro-charts
    this.microChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false } // Disable tooltips for micro-charts
      },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    };
  }

  getChangeSeverity(change: number): 'success' | 'danger' | 'warning' {
    if (change > 0) return 'success';
    if (change < 0) return 'danger';
    return 'warning';
  }

  formatPercent(change: number): string {
    const arrow = change >= 0 ? '↑' : '↓';
    return `${Math.abs(change)}% ${arrow}`;
  }
}