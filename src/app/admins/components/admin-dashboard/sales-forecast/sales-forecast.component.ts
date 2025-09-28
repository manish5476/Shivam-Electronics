import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

// Strongly-typed interfaces for the component's data
export interface SalesForecastData {
  historicalData: {
    _id: {
      year: number;
      month: number;
    };
    totalSales: number;
  }[];
  forecast: {
    nextMonth: string;
  };
}


@Component({
  selector: 'app-sales-forecast',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './sales-forecast.component.html',
  styleUrls: ['./sales-forecast.component.css']
})
export class SalesForecastComponent implements OnChanges {
  @Input() data: SalesForecastData | null = null;

  // Chart properties
  forecastChartData: { name: string; value: number }[] = [];
  chartColorScheme!: Color;

  constructor() {
    this.setChartColors();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.prepareChartData();
    }
  }

  private prepareChartData(): void {
    if (!this.data) return;

    // Map historical data
    const historicalSeries = this.data.historicalData.map(item => ({
      name: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' }),
      value: item.totalSales
    }));

    // Find the last historical date to determine the next month
    const lastEntry = this.data.historicalData[this.data.historicalData.length - 1];
    const nextMonthDate = new Date(lastEntry._id.year, lastEntry._id.month);

    // Add the forecast data as the next item in the series
    const forecastSeries = {
      name: nextMonthDate.toLocaleString('default', { month: 'short' }),
      value: parseFloat(this.data.forecast.nextMonth)
    };

    this.forecastChartData = [...historicalSeries, forecastSeries];
  }

  private setChartColors(): void {
    const style = getComputedStyle(document.documentElement);
    const accentColor = style.getPropertyValue('--theme-accent-primary').trim();
    const forecastColor = style.getPropertyValue('--theme-info-primary').trim();

    this.chartColorScheme = {
      name: 'salesForecast',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: [
        accentColor,
        accentColor,
        accentColor,
        accentColor,
        forecastColor // Last color is for the forecast
      ]
    };
  }
}