// dashboard-summary.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-dashboard-summary',
  standalone: true,
  imports: [CommonModule, SkeletonModule],
  templateUrl: './dashboard-summary.component.html',
  styleUrls: ['./dashboard-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Optimized for performance
  animations: [
    trigger('fadeIn', [
      transition(':enter', [style({ opacity: 0 }), animate('0.5s ease', style({ opacity: 1 }))]),
    ]),
    trigger('carouselSlide', [
      transition('* => *', animate('0.5s ease-in-out')),
    ]),
  ],
})
export class DashboardSummaryComponent {
  @Input() summaryData: any;
  @Input() isLoading: boolean = true;
  currentSlide = 0;
  metrics: any;

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  nextSlide() {
    if (this.currentSlide < this.summaryData.topSellingProducts.length - 1) {
      this.currentSlide++;
    }
  }
}

// import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { SkeletonModule } from 'primeng/skeleton';

// @Component({
//   selector: 'app-dashboard-summary',
//   standalone: true,
//   imports: [CommonModule, SkeletonModule],
//   templateUrl: './dashboard-summary.component.html',
//   styleUrls: ['./dashboard-summary.component.css'],
//   changeDetection: ChangeDetectionStrategy.OnPush // Optimized for performance
// })
// export class DashboardSummaryComponent {
//   @Input() summaryData: any;
//   @Input() isLoading: boolean = true;
//   currentSlide = 0;
// metrics: any;

// prevSlide() {
//   if (this.currentSlide > 0) {
//     this.currentSlide--;
//   }
// }

// nextSlide() {
//   if (this.currentSlide < this.summaryData.topSellingProducts.length - 1) {
//     this.currentSlide++;
//   }
// }

// }
