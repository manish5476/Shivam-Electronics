import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';

// PrimeNG Modules
import { SkeletonModule } from 'primeng/skeleton';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-dashboard-summary',
  standalone: true,
  imports: [
    CommonModule, 
    SkeletonModule, 
    CarouselModule, 
    ButtonModule, 
    AvatarModule,
    CurrencyPipe,
    DecimalPipe
  ],
  template: `
    <div class="summary-container" *ngIf="!isLoading && summaryData; else loadingState" @fadeInUp>
      <div class="kpi-grid">
        <div *ngFor="let metric of metrics" class="kpi-card" [ngClass]="metric.cssClass">
          <div class="kpi-content">
            <span class="kpi-title">{{ metric.label }}</span>
            <span class="kpi-value">{{ metric.value }}</span>
          </div>
          <i class="kpi-icon" [ngClass]="metric.icon"></i>
        </div>
      </div>

      <div class="content-grid">
        <div class="dashboard-card">
          <div class="card-header">
            <h3 class="card-title">Outstanding Payments</h3>
          </div>
          <div class="item-list">
            <ng-container *ngIf="summaryData.customersWithDues?.length > 0; else noDues">
              <div class="list-item" *ngFor="let customer of summaryData.customersWithDues">
                <p-avatar [label]="customer.fullname.charAt(0)" shape="circle"></p-avatar>
                <span class="item-name">{{ customer.fullname }}</span>
                <span class="item-value negative">{{ customer.remainingAmount | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>
            </ng-container>
            <ng-template #noDues>
              <div class="empty-state">
                <i class="pi pi-check-circle success"></i>
                <span>All clear! No outstanding payments.</span>
              </div>
            </ng-template>
          </div>
        </div>

        <div class="dashboard-card product-carousel-card">
          <div class="card-header">
            <h3 class="card-title">Top Selling Products</h3>
          </div>
          <p-carousel [value]="summaryData.topSellingProducts" [numVisible]="1" [numScroll]="1" [circular]="true">
            <ng-template let-product pTemplate="item">
              <div class="product-item">
                <img [src]="product.thumbnail" (error)="onImageError($event)" [alt]="product.productName" class="product-image">
                <div class="product-details">
                  <h4 class="product-name">{{ product.productName }}</h4>
                  <span class="product-quantity">{{ product.totalQuantity }} units sold</span>
                </div>
              </div>
            </ng-template>
          </p-carousel>
        </div>
      </div>
    </div>

    <ng-template #loadingState>
       <div class="kpi-grid">
         <p-skeleton *ngFor="let i of [1,2,3,4,5]" height="6rem" styleClass="p-mb-2"></p-skeleton>
       </div>
       <div class="content-grid">
         <p-skeleton height="20rem"></p-skeleton>
         <p-skeleton height="20rem"></p-skeleton>
       </div>
    </ng-template>
  `,
  styleUrls: ['./dashboard-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'none' })),
      ]),
    ]),
  ],
})
export class DashboardSummaryComponent implements OnChanges {
  @Input() summaryData: any;
  @Input() isLoading: boolean = true;
  
  metrics: any[] = [];
  
  // Pipes for formatting values in TypeScript
  private currencyPipe = new CurrencyPipe('en-IN'); // Correct: Only provide the locale
  private decimalPipe = new DecimalPipe('en-IN');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['summaryData'] && this.summaryData) {
      this.buildMetrics();
    }
  }

  private buildMetrics(): void {
    this.metrics = [
      {
        label: 'Total Revenue',
        value: this.currencyPipe.transform(this.summaryData.totalRevenue),
        icon: 'pi pi-chart-line',
        cssClass: 'kpi-card-revenue'
      },
      {
        label: 'Total Sales',
        value: this.summaryData.totalSales,
        icon: 'pi pi-shopping-cart',
        cssClass: 'kpi-card-sales'
      },
      {
        label: 'Gross Profit',
        value: this.currencyPipe.transform(this.summaryData.grossProfit),
        icon: 'pi pi-money-bill',
        cssClass: 'kpi-card-profit'
      },
      {
        label: 'Avg. Order Value',
        value: this.currencyPipe.transform(this.summaryData.averageOrderValue),
        icon: 'pi pi-tag',
        cssClass: 'kpi-card-aov'
      },
      {
        label: 'New Customers',
        value: this.summaryData.newCustomers,
        icon: 'pi pi-user-plus',
        cssClass: 'kpi-card-customers'
      }
    ];
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://atlantis.primeng.org/images/logo-light.png';
  }
}
// // dashboard-summary.component.ts
// import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { SkeletonModule } from 'primeng/skeleton';
// import { trigger, state, style, animate, transition } from '@angular/animations';

// @Component({
//   selector: 'app-dashboard-summary',
//   standalone: true,
//   imports: [CommonModule, SkeletonModule],
//   templateUrl: './dashboard-summary.component.html',
//   styleUrls: ['./dashboard-summary.component.css'],
//   changeDetection: ChangeDetectionStrategy.OnPush, // Optimized for performance
//   animations: [
//     trigger('fadeIn', [
//       transition(':enter', [style({ opacity: 0 }), animate('0.5s ease', style({ opacity: 1 }))]),
//     ]),
//     trigger('carouselSlide', [
//       transition('* => *', animate('0.5s ease-in-out')),
//     ]),
//   ],
// })
// export class DashboardSummaryComponent {
//   @Input() summaryData: any;
//   @Input() isLoading: boolean = true;
//   currentSlide = 0;
//   metrics: any;

//   prevSlide() {
//     if (this.currentSlide > 0) {
//       this.currentSlide--;
//     }
//   }

//   nextSlide() {
//     if (this.currentSlide < this.summaryData.topSellingProducts.length - 1) {
//       this.currentSlide++;
//     }
//   }
// }

// // import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { SkeletonModule } from 'primeng/skeleton';

// // @Component({
// //   selector: 'app-dashboard-summary',
// //   standalone: true,
// //   imports: [CommonModule, SkeletonModule],
// //   templateUrl: './dashboard-summary.component.html',
// //   styleUrls: ['./dashboard-summary.component.css'],
// //   changeDetection: ChangeDetectionStrategy.OnPush // Optimized for performance
// // })
// // export class DashboardSummaryComponent {
// //   @Input() summaryData: any;
// //   @Input() isLoading: boolean = true;
// //   currentSlide = 0;
// // metrics: any;

// // prevSlide() {
// //   if (this.currentSlide > 0) {
// //     this.currentSlide--;
// //   }
// // }

// // nextSlide() {
// //   if (this.currentSlide < this.summaryData.topSellingProducts.length - 1) {
// //     this.currentSlide++;
// //   }
// // }

// // }
