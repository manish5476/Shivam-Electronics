import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, effect, PLATFORM_ID } from '@angular/core';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { AppMessageService } from '../../../../core/services/message.service';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DashboardChartComponentComponent } from "../dashboard-chart-component/dashboard-chart-component.component";

@Component({
  selector: 'app-dashboard-chart-combo',
  standalone: true,
  imports: [CommonModule, ChartModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './dashboard-chart-combo.component.html',
  styleUrls: ['./dashboard-chart-combo.component.css']
})
export class DashboardChartComboComponent implements OnInit, OnDestroy {
  yearInput: string = '2025';
  monthlyChartData: any;
  monthlyChartOptions: any;
  weeklyChartData: any;
  weeklyChartOptions: any;

  isLoading = false;
  dashboardYearlyChart: any;
  private destroy$ = new Subject<void>();
  private monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  platformId = inject(PLATFORM_ID);
  // configService = inject(AppConfigService);
  // designerService = inject(DesignerService);
  private dashboardService = inject(DashboardService);
  private messageService = inject(AppMessageService);
  private cd = inject(ChangeDetectorRef);

  constructor() {
    // this.themeEffect = effect(() => {
    //   if (this.configService.transitionComplete()) {
    //     if (this.designerService.preset()) {
    //       this.initCharts();
    //     }
    //   }
    // });
  }

  themeEffect: any;

  ngOnInit() {
    this.initCharts();
    this.fetchSalesData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initCharts() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
      const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

      // Monthly Combo Chart Options
      this.monthlyChartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: {
            labels: { color: textColor }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context: any) => {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  if (context.dataset.type === 'bar') {
                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                  } else {
                    label += context.parsed.y;
                  }
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: textColorSecondary },
            grid: { color: surfaceBorder },
            title: { display: true, text: 'Month', color: textColor }
          },
          y: {
            ticks: {
              color: textColorSecondary,
              callback: (value: number) => '$' + value.toLocaleString()
            },
            grid: { color: surfaceBorder },
            title: { display: true, text: 'Total Revenue', color: textColor },
            beginAtZero: true
          },
          y1: {
            position: 'right',
            ticks: { color: textColorSecondary },
            grid: { drawOnChartArea: false, color: surfaceBorder },
            title: { display: true, text: 'Number of Sales', color: textColor },
            beginAtZero: true
          }
        }
      };

      // Weekly Chart Options
      this.weeklyChartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: {
            labels: { color: textColor }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: textColorSecondary },
            grid: { color: surfaceBorder },
            title: { display: true, text: 'Week', color: textColor }
          },
          y: {
            ticks: {
              color: textColorSecondary,
              callback: (value: number) => '$' + value.toLocaleString()
            },
            grid: { color: surfaceBorder },
            title: { display: true, text: 'Total Revenue', color: textColor },
            beginAtZero: true
          }
        }
      };

      this.prepareCharts();
      this.cd.markForCheck();
    }
  }

  fetchSalesData(): void {
    this.isLoading = true;
    this.dashboardYearlyChart = null;
    this.cd.detectChanges();

    const params = { year: parseInt(this.yearInput, 10) };
    if (isNaN(params.year)) {
      this.messageService.showError('Please enter a valid year.');
      this.isLoading = false;
      this.cd.detectChanges();
      return;
    }

    this.dashboardService.getSalesDataForChartsCombo(params)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.messageService.showError('Failed to fetch sales data.');
          this.isLoading = false;
          this.cd.detectChanges();
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res?.success && res.data) {
          this.dashboardYearlyChart = res.data;
          this.initCharts();
        } else {
          this.messageService.showError('No data received or failed response for sales data.');
          this.initCharts();
        }
        this.isLoading = false;
        this.cd.detectChanges();
      });
  }

  prepareCharts(): void {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const currentYear = this.dashboardYearlyChart?.year || 'N/A';
      const yearlyData = this.dashboardYearlyChart?.yearlySales?.monthlySales;
      const weeklyData = this.dashboardYearlyChart?.weeklySales;

      // Monthly Combo Chart
      if (!yearlyData || !Array.isArray(yearlyData)) {
        console.warn('Monthly sales data is not available or in the expected format.');
        this.monthlyChartData = {
          labels: [],
          datasets: [
            {
              type: 'bar',
              label: `Monthly Revenue (${currentYear})`,
              data: [],
              backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
              borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
              yAxisID: 'y'
            },
            {
              type: 'line',
              label: `Monthly Sales Count (${currentYear})`,
              data: [],
              fill: false,
              tension: 0.4,
              borderColor: documentStyle.getPropertyValue('--p-orange-500'),
              borderDash: [5, 5],
              yAxisID: 'y1'
            }
          ]
        };
      } else {
        const labels = yearlyData.map((sale: any) => this.monthNames[sale.month - 1]);
        const revenueData = yearlyData.map((sale: any) => sale.totalRevenue);
        const salesCountData = yearlyData.map((sale: any) => sale.salesCount);

        this.monthlyChartData = {
          labels: labels,
          datasets: [
            {
              type: 'bar',
              label: `Monthly Revenue (${currentYear})`,
              data: revenueData,
              backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
              borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
              hoverBackgroundColor: documentStyle.getPropertyValue('--p-cyan-400'),
              hoverBorderColor: documentStyle.getPropertyValue('--p-cyan-400'),
              yAxisID: 'y'
            },
            {
              type: 'line',
              label: `Monthly Sales Count (${currentYear})`,
              data: salesCountData,
              fill: false,
              tension: 0.4,
              borderColor: documentStyle.getPropertyValue('--p-orange-500'),
              borderDash: [5, 5],
              pointBackgroundColor: documentStyle.getPropertyValue('--p-orange-500'),
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: documentStyle.getPropertyValue('--p-orange-500'),
              yAxisID: 'y1'
            }
          ]
        };
      }

      // Weekly Chart
      if (!weeklyData || !Array.isArray(weeklyData)) {
        console.warn('Weekly sales data is not available or in the expected format.');
        this.weeklyChartData = {
          labels: [],
          datasets: [
            {
              type: 'bar',
              label: `Weekly Revenue (${currentYear})`,
              data: [],
              backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
              borderColor: documentStyle.getPropertyValue('--p-gray-500')
            }
          ]
        };
      } else {
        const labels = weeklyData.map((week: any) => `Week ${week.week}`);
        const weeklyRevenue = weeklyData.map((week: any) =>
          week.dailySales.reduce((sum: number, day: any) => sum + (day.totalRevenue || 0), 0)
        );

        this.weeklyChartData = {
          labels: labels,
          datasets: [
            {
              type: 'bar',
              label: `Weekly Revenue (${currentYear})`,
              data: weeklyRevenue,
              backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
              borderColor: documentStyle.getPropertyValue('--p-gray-500'),
              hoverBackgroundColor: documentStyle.getPropertyValue('--p-gray-400'),
              hoverBorderColor: documentStyle.getPropertyValue('--p-gray-400')
            }
          ]
        };
      }
    }
  }
}