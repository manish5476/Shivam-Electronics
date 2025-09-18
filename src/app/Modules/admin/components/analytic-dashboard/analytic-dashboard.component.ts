import { Component, Input, OnChanges, SimpleChanges, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytic-dashboard',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './analytic-dashboard.component.html',
  styleUrls: ['./analytic-dashboard.component.css']
})
export class AnalyticDashboardComponent implements OnChanges {
  @Input() data: any;

  // Properties to hold max values for calculating progress bar widths
  maxCategoryProfit: number = 0;
  maxBrandProfit: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.calculateMaximums();
    }
  }
  
  private calculateMaximums(): void {
    // Find the max profit in the category list to scale the bars correctly
    if (this.data.performanceByCategory?.length > 0) {
      this.maxCategoryProfit = Math.max(...this.data.performanceByCategory.map((c: any) => c.grossProfit));
    }
    // Find the max profit in the brand list
    if (this.data.performanceByBrand?.length > 0) {
      this.maxBrandProfit = Math.max(...this.data.performanceByBrand.map((b: any) => b.grossProfit));
    }
  }

  calculatePercentage(value: number, max: number): number {
    if (!max || !value) {
      return 0;
    }
    return (value / max) * 100;
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
    if (!id) return '';
    return id.split(',')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/([A-Z])/g, ' $1'))
      .join(', ');
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/48';
  }
}