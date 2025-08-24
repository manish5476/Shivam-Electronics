
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ChartModule } from 'primeng/chart';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectButtonModule } from 'primeng/selectbutton';

// App Services
import { DashboardService } from '../../../../core/services/dashboard.service';
import { AppMessageService } from '../../../../core/services/message.service';
import { ThemeService } from '../../../../core/services/theme.service';

type ChartView = 'Monthly' | 'Weekly';

@Component({
  selector: 'app-dashboard-chart-combo',
  standalone: true,
  imports: [CommonModule, ChartModule, FormsModule, InputTextModule, ButtonModule, SkeletonModule, SelectButtonModule],
  templateUrl: './dashboard-chart-combo.component.html',
  styleUrls: ['./dashboard-chart-combo.component.css']
})
export class DashboardChartComboComponent implements OnInit, OnDestroy {
  // --- State Management ---
  yearInput: string = new Date().getFullYear().toString();
  isLoading = true;
  chartData: any;
  chartOptions: any;
  dashboardYearlyChart: any;
  
  // --- View Control ---
  viewOptions: any[] = [{ label: 'Monthly', value: 'Monthly' }, { label: 'Weekly', value: 'Weekly' }];
  selectedView: ChartView = 'Monthly';

  private destroy$ = new Subject<void>();
  private monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // --- Dependency Injection ---
  platformId = inject(PLATFORM_ID);
  private dashboardService = inject(DashboardService);
  private messageService = inject(AppMessageService);
  private themeService = inject(ThemeService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit() {
    this.fetchSalesData();

    // Reactively update chart colors whenever the theme changes
    this.themeService.settings$.pipe(takeUntil(this.destroy$)).subscribe(() => {
        // Only update if data already exists, otherwise fetch will handle it
        if (this.dashboardYearlyChart) {
            this.updateChart();
        }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchSalesData(): void {
    this.isLoading = true;
    const year = parseInt(this.yearInput, 10);
    if (isNaN(year)) {
      this.messageService.showError('Invalid Year', 'Please enter a valid year.');
      this.isLoading = false;
      return;
    }

    this.dashboardService.getSalesDataForChartsCombo({ year })
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (res?.success && res.data) {
          this.dashboardYearlyChart = res.data;
          this.updateChart(); // Initial chart render
        } else {
          this.messageService.showWarn('No Data', 'No sales data found for the selected year.');
          this.dashboardYearlyChart = null; // Clear old data
          this.updateChart(); // Render empty chart
        }
        this.isLoading = false;
        this.cd.markForCheck();
      });
  }

  onViewChange(view: ChartView): void {
    this.selectedView = view;
    this.updateChart();
  }

  updateChart(): void {
    if (this.selectedView === 'Monthly') {
      this.prepareMonthlyChart();
    } else {
      this.prepareWeeklyChart();
    }
  }

  private prepareMonthlyChart(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const documentStyle = getComputedStyle(document.documentElement);
    const accentColor = documentStyle.getPropertyValue('--theme-accent-primary').trim();
    // Use the warning color as a secondary accent for the line chart
    const secondaryAccentColor = documentStyle.getPropertyValue('--theme-warning-primary').trim();
    
    const yearlyData = this.dashboardYearlyChart?.yearlySales?.monthlySales || [];
    
    const labels = yearlyData.map((sale: any) => this.monthNames[sale.month - 1]);
    const revenueData = yearlyData.map((sale: any) => sale.totalRevenue);
    const salesCountData = yearlyData.map((sale: any) => sale.salesCount);

    this.chartData = {
      labels: labels,
      datasets: [
        {
          type: 'line',
          label: 'Number of Sales',
          borderColor: secondaryAccentColor,
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          data: salesCountData,
          yAxisID: 'y1'
        },
        {
          type: 'bar',
          label: 'Monthly Revenue',
          backgroundColor: accentColor,
          borderColor: accentColor,
          data: revenueData,
          yAxisID: 'y'
        }
      ]
    };
    this.chartOptions = this.getCommonChartOptions('Month', 'Total Revenue', 'Number of Sales');
  }

  private prepareWeeklyChart(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const documentStyle = getComputedStyle(document.documentElement);
    const accentColor = documentStyle.getPropertyValue('--theme-accent-primary').trim();
    const weeklyData = this.dashboardYearlyChart?.weeklySales || [];

    const labels = weeklyData.map((week: any) => `W${week.week}`);
    const weeklyRevenue = weeklyData.map((week: any) =>
      week.dailySales.reduce((sum: number, day: any) => sum + (day.totalRevenue || 0), 0)
    );

    this.chartData = {
      labels: labels,
      datasets: [{
        label: 'Weekly Revenue',
        data: weeklyRevenue,
        backgroundColor: accentColor,
        borderColor: accentColor,
        barThickness: 20,
      }]
    };
    this.chartOptions = this.getCommonChartOptions('Week', 'Total Revenue');
  }

  private getCommonChartOptions(xTitle: string, yTitle: string, y1Title?: string): any {
    if (!isPlatformBrowser(this.platformId)) return {};
    
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--theme-text-primary').trim();
    const textColorSecondary = documentStyle.getPropertyValue('--theme-text-secondary').trim();
    const surfaceBorder = documentStyle.getPropertyValue('--theme-border-primary').trim();
    const secondaryAccentColor = documentStyle.getPropertyValue('--theme-warning-primary').trim();

    const scales: any = {
      x: {
        ticks: { color: textColorSecondary, font: { weight: 500 } },
        grid: { color: 'transparent' },
        title: { display: true, text: xTitle, color: textColor }
      },
      y: {
        ticks: { color: textColorSecondary, callback: (val: number) => `₹${val / 1000}k` },
        grid: { color: surfaceBorder, drawBorder: false },
        title: { display: true, text: yTitle, color: textColor },
        beginAtZero: true
      }
    };

    if (y1Title) {
      scales.y1 = {
        position: 'right',
        ticks: { color: secondaryAccentColor },
        grid: { drawOnChartArea: false },
        title: { display: true, text: y1Title, color: secondaryAccentColor },
        beginAtZero: true
      };
    }

    return {
      maintainAspectRatio: false,
      aspectRatio: 0.7,
      plugins: {
        legend: { position: 'top', labels: { color: textColor, usePointStyle: true } },
        tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 4,
            displayColors: true,
            boxPadding: 4
        }
      },
      scales: scales
    };
  }
}