import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytic-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytic-dashboard.component.html',
  styleUrls: ['./analytic-dashboard.component.css']
})
export class AnalyticDashboardComponent implements OnChanges {
  @Input() data: any;

  kpis: any[] = [];
  maxCategoryProfit: number = 0;
  maxBrandProfit: number = 0;
  colors: string[] = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6610f2', '#fd7e14', '#6f42c1', '#20c997', '#e83e8c'];
  activeTab: 'profit' | 'revenue' | 'quantity' = 'profit';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.prepareKpis();
      this.calculateMaximums();
    }
  }

  private prepareKpis(): void {
    this.kpis = [
      {
        icon: 'pi-wallet',
        iconClass: 'value',
        title: 'Total Inventory Value',
        value: this.formatCurrency(this.data.inventorySummary.totalValue)
      },
      {
        icon: 'pi-box',
        iconClass: 'items',
        title: 'Total Items in Stock',
        value: this.formatNumber(this.data.inventorySummary.totalItems)
      },
      {
        icon: 'pi-info-circle',
        iconClass: 'low',
        title: 'Low Stock SKUs',
        value: this.formatNumber(this.data.inventorySummary.lowStockCount)
      },
      {
        icon: 'pi-times-circle',
        iconClass: 'out',
        title: 'Out of Stock SKUs',
        value: this.formatNumber(this.data.inventorySummary.outOfStockCount)
      }
    ];
  }

  private calculateMaximums(): void {
    if (this.data.performanceByCategory?.length > 0) {
      this.maxCategoryProfit = Math.max(...this.data.performanceByCategory.map((c: any) => c.grossProfit));
    }
    if (this.data.performanceByBrand?.length > 0) {
      this.maxBrandProfit = Math.max(...this.data.performanceByBrand.map((b: any) => b.grossProfit));
    }
  }

  getTopProducts(tab: 'profit' | 'revenue' | 'quantity'): any[] {
    return this.data.topPerformingProducts[`topBy${tab.charAt(0).toUpperCase() + tab.slice(1)}`] || [];
  }

  calculatePercentage(value: number, max: number): number {
    return max ? (value / max) * 100 : 0;
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
    (event.target as HTMLImageElement).src = 'https://plus.unsplash.com/premium_photo-1683121716061-3faddf4dc504?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  }
}