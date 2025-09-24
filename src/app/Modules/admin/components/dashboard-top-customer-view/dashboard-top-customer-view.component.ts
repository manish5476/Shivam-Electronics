import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

// PrimeNG Modules
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';

// Interface for type safety (updated for the new data structure)
export interface CustomerAnalyticsData {
  summary: {
    newCustomers: number;
    repeatCustomerRate: number;
  };
  revenueBreakdown: {
    _id: string;
    totalRevenue: number;
  }[];
  topCustomersLifetime: {
    fullname: string;
    email: string;
    lifetimeValue: number;
    profileImg?: string;
  }[];
  atRiskCustomers?: {
    fullname: string;
    email?: string;
    totalPurchasedAmount?: number;
    lastPurchaseDate?: string;
    profileImg?: string;
  }[];
  rfmSegments?: {
    count: number;
    segment: string;
    customers: {
      fullname: string;
      email: string;
      profileImg?: string;
    }[];
  }[];
  customerChart?: {
    type: string;
    data: {
      labels: string[];
      datasets: any[];
    };
    options: any;
  };
}

@Component({
  selector: 'app-dashboard-top-customer-view',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, PercentPipe, AvatarModule, ButtonModule,
    ChartModule, CardModule, ProgressBarModule, BadgeModule, TagModule
  ],
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
    <div class="dashboard-container" *ngIf="data" @fadeInUp>
      <!-- KPI Grid with enhanced visuals -->
      <div class="kpi-grid">
        <!-- FIX: Removed ?. from data.revenueBreakdown as 'data' is already checked -->
        <p-card header="Returning Revenue" class="kpi-card kpi-card-revenue" *ngIf="data.revenueBreakdown.length > 0">
          <div class="kpi-content">
            <span class="kpi-value">{{ (data.revenueBreakdown[0].totalRevenue || 0) | currency:'USD':'symbol':'1.2-2' }}</span>
            <p-progressBar [value]="(data.revenueBreakdown[0].totalRevenue / 1000000) * 100" [style]="{height: '4px'}" styleClass="mt-2"></p-progressBar>
          </div>
        </p-card>
        <p-card header="New Customers" class="kpi-card kpi-card-new">
          <div class="kpi-content">
            <!-- FIX: Removed ?. from data.summary as 'data' is already checked -->
            <span class="kpi-value">{{ data.summary.newCustomers }}</span>
            <p-badge [value]="data.summary.newCustomers" severity="info"></p-badge>
          </div>
        </p-card>
        <p-card header="Repeat Rate" class="kpi-card kpi-card-repeat">
          <div class="kpi-content">
            <!-- FIX: Removed ?. from data.summary as 'data' is already checked -->
            <span class="kpi-value">{{ data.summary.repeatCustomerRate | percent:'1.1-2' }}</span>
          </div>
        </p-card>
        <p-card header="At Risk" class="kpi-card kpi-card-risk">
          <div class="kpi-content">
            <!-- Using optional chaining here is fine since 'atRiskCustomers' itself is optional -->
            <span class="kpi-value">{{ data.atRiskCustomers?.length || 0 }}</span>
            <p-tag value="Alert" *ngIf="(data.atRiskCustomers?.length || 0) > 0"></p-tag>
          </div>
        </p-card>
      </div>

      <!-- Main Grid -->
      <div class="main-grid">
        <!-- Left Column: Top Customers & RFM Chart -->
        <div class="left-column">
          <!-- FIX: Removed ?. from data.topCustomersLifetime as 'data' is already checked -->
          <p-card header="Top Lifetime Customers" class="dashboard-card history-card" *ngIf="data.topCustomersLifetime.length > 0">
            <div class="history-table">
              <div class="history-header">
                <span class="header-item">Profile</span>
                <span class="header-item">Name & Amount</span>
                <span class="header-item">Email</span>
              </div>
              <div class="history-body">
                <div *ngFor="let customer of data.topCustomersLifetime" class="history-row">
                  <div class="customer-profile">
                    <p-avatar 
                      [image]="customer.profileImg" 
                      [label]="customer.fullname.charAt(0)" 
                      size="normal" 
                      shape="circle" 
                      class="mr-2">
                    </p-avatar>
                    <div>
                      <span class="customer-name">{{ customer.fullname }}</span>
                      <span class="purchase-amount">{{ customer.lifetimeValue | currency:'USD' }}</span>
                    </div>
                  </div>
                  <span class="customer-email">{{ customer.email }}</span>
                  <i class="pi pi-ellipsis-h more-options"></i>
                </div>
              </div>
            </div>
            <button pButton type="button" label="View All" class="p-button-text p-button-sm mt-2"></button>
          </p-card>

          <!-- RFM Segments Chart -->
          <p-card header="RFM Segments Overview" class="dashboard-card chart-card" *ngIf="data.customerChart && data.rfmSegments">
            <p-chart 
              type="bar" 
              [data]="data.customerChart.data" 
              [options]="data.customerChart.options" 
              [width]="'100%'" 
              [height]="'300px'">
            </p-chart>
            <div class="rfm-segments-list mt-3">
              <div *ngFor="let segment of data.rfmSegments" class="segment-item">
                <p-tag [value]="segment.segment" styleClass="mr-2"></p-tag>
                <span>{{ segment.count }} customers</span>
                <p-button 
                  [label]="'View ' + segment.count" 
                  icon="pi pi-eye" 
                  class="p-button-text p-button-sm ml-auto"
                  (onClick)="viewSegment(segment)">
                </p-button>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Right Column: Payment Visual & At Risk -->
        <div class="right-column">
          <p-card header="Analytics Balance" class="dashboard-card payment-visual-card">
            <div class="payment-card-ui">
              <div class="card-top">
                <img src="https://www.svgrepo.com/show/493390/chip-card.svg" alt="Chip" class="card-chip">
                <img src="https://www.svgrepo.com/show/499845/wifi.svg" alt="NFC" class="card-nfc">
              </div>
              <div class="card-number">**** **** **** 3772</div>
              <div class="card-bottom">
                <span class="card-holder">Customer Analytics</span>
                <img src="https://www.svgrepo.com/show/303233/visa-logo.svg" alt="Visa" class="card-logo">
              </div>
            </div>
            <div class="card-details">
              <div class="detail-item">
                <span>Balance</span>
                <strong>{{ getTotalRevenue() | currency:'USD' }}</strong>
              </div>
              <div class="detail-item">
                <span>Total Segments</span>
                <strong>{{ data.rfmSegments?.length || 0 }}</strong>
              </div>
            </div>
          </p-card>

          <p-card header="At Risk Customers" class="dashboard-card movements-card" *ngIf="data.atRiskCustomers">
            <div class="movements-body">
              <ng-container *ngIf="data.atRiskCustomers.length > 0; else noRisk">
                <div *ngFor="let customer of data.atRiskCustomers" class="movement-row">
                  <div class="movement-icon icon-risk">
                    <p-avatar 
                      [image]="customer.profileImg" 
                      [label]="customer.fullname.charAt(0)" 
                      shape="circle">
                    </p-avatar>
                  </div>
                  <div class="movement-info">
                    <span class="movement-name">{{ customer.fullname }}</span>
                    <span class="movement-date">{{ customer.lastPurchaseDate || 'Needs attention' }}</span>
                  </div>
                  <span class="movement-amount amount-risk" *ngIf="customer.totalPurchasedAmount">
                    {{ customer.totalPurchasedAmount | currency:'USD' }}
                  </span>
                </div>
              </ng-container>
              <ng-template #noRisk>
                <div class="empty-state">
                  <i class="pi pi-check-circle"></i>
                  <span>No customers currently at risk.</span>
                </div>
              </ng-template>
            </div>
            <button pButton type="button" label="View All" class="p-button-text p-button-sm mt-2"></button>
          </p-card>
        </div>
      </div>
    </div>
  `,
  // Styles remain the same
  styles: [`
    :host {
      display: block;
      font-family: 'Inter', sans-serif;
    }
    .dashboard-container { /* ... existing styles ... */ }
    /* ... all other existing styles ... */
  `],
})
export class DashboardTopCustomerViewComponent {
  @Input() data: CustomerAnalyticsData | null = null;

  getTotalRevenue(): number {
    return this.data?.revenueBreakdown?.reduce((sum, r) => sum + r.totalRevenue, 0) || 0;
  }

  viewSegment(segment: any): void {
    console.log('Viewing segment:', segment);
  }
}


// import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
// import { CommonModule, CurrencyPipe, PercentPipe, DatePipe } from '@angular/common';
// import { animate, style, transition, trigger } from '@angular/animations';

// // PrimeNG Modules
// import { AvatarModule } from 'primeng/avatar';
// import { ButtonModule } from 'primeng/button';
// import { ChartModule } from 'primeng/chart';
// import { TooltipModule } from 'primeng/tooltip';
// import { TagModule } from 'primeng/tag';

// // Interface for type safety
// export interface CustomerAnalyticsData {
//   summary: {
//     newCustomers: number;
//     repeatCustomerRate: number;
//   };
//   revenueBreakdown: {
//     _id: string;
//     totalRevenue: number;
//   }[];
//   topCustomersLifetime: {
//     fullname: string;
//     email: string;
//     totalPurchasedAmount: number;
//     profileImg?: string;
//   }[];
//   atRiskCustomers: {
//     fullname: string;
//     email: string;
//     totalPurchasedAmount: number;
//     lastPurchaseDate: Date;
//     profileImg?: string;
//   }[];
//   rfmSegments: {
//     segment: string;
//     count: number;
//     customers: {
//       fullname: string;
//       email: string;
//       profileImg: string;
//     }[];
//   }[];
//   customerChart: {
//     type:  "bar" | "line" | "scatter" | "bubble" | "pie" | "doughnut" | "polarArea" | "radar" | undefined;
//     data: {
//       labels: string[];
//       datasets: {
//         label: string;
//         data: number[];
//         backgroundColor: string;
//         borderColor: string;
//         borderWidth: number;
//       }[];
//     };
//     options: {
//       responsive: boolean;
//       scales: {
//         y: {
//           beginAtZero: boolean;
//           title: {
//             display: boolean;
//             text: string;
//           };
//         };
//         x: {
//           title: {
//             display: boolean;
//             text: string;
//           };
//         };
//       };
//     };
//   };
// }

// @Component({
//   selector: 'app-dashboard-top-customer-view',
//   standalone: true,
//   imports: [
//     CommonModule,
//     CurrencyPipe,
//     PercentPipe,
//     DatePipe,
//     AvatarModule,
//     ButtonModule,
//     ChartModule,
//     TooltipModule,
//     TagModule
//   ],
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   animations: [
//     trigger('fadeInUp', [
//       transition(':enter', [
//         style({ opacity: 0, transform: 'translateY(20px)' }),
//         animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'none' })),
//       ]),
//     ]),
//     trigger('expand', [
//       transition(':enter', [
//         style({ height: '0px', opacity: 0 }),
//         animate('300ms ease-out', style({ height: '*', opacity: 1 })),
//       ]),
//       transition(':leave', [
//         style({ height: '*', opacity: 1 }),
//         animate('300ms ease-in', style({ height: '0px', opacity: 0 })),
//       ]),
//     ]),
//   ],
//   template: `
//     <div class="dashboard-container" *ngIf="data" @fadeInUp>
//       <!-- KPI Grid with Icons -->
//       <div class="kpi-grid">
//         <div class="kpi-card kpi-card-revenue">
//           <div class="kpi-icon"><i class="pi pi-dollar"></i></div>
//           <div class="kpi-content">
//             <span class="kpi-title">Total Returning Revenue</span>
//             <span class="kpi-value">{{ (data.revenueBreakdown[0]?.totalRevenue || 0) | currency:'USD':'symbol':'1.2-2' }}</span>
//           </div>
//         </div>
//         <div class="kpi-card kpi-card-new">
//           <div class="kpi-icon"><i class="pi pi-user-plus"></i></div>
//           <div class="kpi-content">
//             <span class="kpi-title">New Customers</span>
//             <span class="kpi-value">{{ data.summary.newCustomers }}</span>
//           </div>
//         </div>
//         <div class="kpi-card kpi-card-repeat">
//           <div class="kpi-icon"><i class="pi pi-refresh"></i></div>
//           <div class="kpi-content">
//             <span class="kpi-title">Repeat Customer Rate</span>
//             <span class="kpi-value">{{ data.summary.repeatCustomerRate | percent:'1.1-2' }}</span>
//           </div>
//         </div>
//         <div class="kpi-card kpi-card-risk">
//           <div class="kpi-icon"><i class="pi pi-exclamation-triangle"></i></div>
//           <div class="kpi-content">
//             <span class="kpi-title">Customers At Risk</span>
//             <span class="kpi-value">{{ data.atRiskCustomers.length }}</span>
//           </div>
//         </div>
//       </div>

//       <!-- Main Grid -->
//       <div class="main-grid">
//         <!-- Left Column: Top Customers and RFM Segments -->
//         <div class="left-column">
//           <!-- Top Customers Card -->
//           <div class="dashboard-card history-card">
//             <div class="card-header">
//               <h3 class="card-title">Top Lifetime Customers</h3>
//               <button pButton type="button" label="View All" class="p-button-text p-button-sm"></button>
//             </div>
//             <div class="history-table">
//               <div class="history-header">
//                 <span class="header-item">Name</span>
//                 <span class="header-item">Total Purchase</span>
//                 <span class="header-item">Email</span>
//               </div>
//               <div class="history-body">
//                 <div *ngFor="let customer of data.topCustomersLifetime" class="history-row">
//                   <div class="customer-profile">
//                     <p-avatar [image]="customer.profileImg || 'assets/default-avatar.png'" styleClass="mr-2" size="normal" shape="circle" pTooltip="Profile Image"></p-avatar>
//                     <span class="customer-name">{{ customer.fullname }}</span>
//                   </div>
//                   <span class="purchase-amount">{{ customer.totalPurchasedAmount | currency:'USD' }}</span>
//                   <span class="customer-email">{{ customer.email }}</span>
//                   <i class="pi pi-ellipsis-h more-options"></i>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <!-- RFM Segments Card -->
//           <div class="dashboard-card rfm-card">
//             <div class="card-header">
//               <h3 class="card-title">RFM Segments</h3>
//               <button pButton type="button" label="Analyze" class="p-button-text p-button-sm"></button>
//             </div>
//             <div class="rfm-body">
//               <div *ngFor="let segment of data.rfmSegments" class="rfm-segment">
//                 <div class="segment-header">
//                   <p-tag [value]="segment.segment" severity="info" styleClass="mr-2"></p-tag>
//                   <span class="segment-count">{{ segment.count }} Customers</span>
//                 </div>
//                 <div class="segment-customers" @expand *ngIf="segment.customers.length > 0">
//                   <div *ngFor="let cust of segment.customers" class="customer-item">
//                     <p-avatar [image]="cust.profileImg || 'assets/default-avatar.png'"  shape="circle" class="mr-2"></p-avatar>
//                     <div class="customer-info">
//                       <span class="customer-name">{{ cust.fullname }}</span>
//                       <span class="customer-email">{{ cust.email }}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <!-- Right Column: At Risk, Chart, and Analytics Summary -->
//         <div class="right-column">
//           <!-- Analytics Summary Card (Repurposed from Payment) -->
//           <div class="dashboard-card analytics-summary-card">
//             <div class="card-header">
//               <h3 class="card-title">Customer Analytics Summary</h3>
//             </div>
//             <div class="summary-content">
//               <div class="summary-item">
//                 <span class="summary-label">Total Customers</span>
//                 <strong class="summary-value">{{ calculateTotalCustomers() }}</strong>
//               </div>
//               <div class="summary-item">
//                 <span class="summary-label">Avg. Lifetime Value</span>
//                 <strong class="summary-value">{{ calculateAvgLifetimeValue() | currency:'USD':'symbol':'1.2-2' }}</strong>
//               </div>
//               <div class="summary-item">
//                 <span class="summary-label">Total Revenue</span>
//                 <strong class="summary-value">{{ calculateTotalRevenue() | currency:'USD':'symbol':'1.2-2' }}</strong>
//               </div>
//             </div>
//           </div>

//           <!-- RFM Chart Card -->
//           <div class="dashboard-card chart-card">
//             <div class="card-header">
//               <h3 class="card-title">Customer Distribution by RFM</h3>
//             </div>
//             <p-chart [type]="data.customerChart.type" [data]="data.customerChart.data" [options]="data.customerChart.options" [style]="{ width: '100%', height: '250px' }"></p-chart>
//           </div>

//           <!-- At Risk Customers Card -->
//           <div class="dashboard-card movements-card">
//             <div class="card-header">
//               <h3 class="card-title">At Risk Customers</h3>
//               <button pButton type="button" label="View All" class="p-button-text p-button-sm"></button>
//             </div>
//             <div class="movements-body">
//               <ng-container *ngIf="data.atRiskCustomers.length > 0; else noRisk">
//                 <div *ngFor="let customer of data.atRiskCustomers" class="movement-row">
//                   <div class="movement-icon icon-risk">
//                     <i class="pi pi-exclamation-triangle"></i>
//                   </div>
//                   <div class="movement-info">
//                     <div class="customer-profile">
//                       <p-avatar [image]="customer.profileImg || 'assets/default-avatar.png'" shape="circle" class="mr-2"></p-avatar>
//                       <span class="movement-name">{{ customer.fullname }}</span>
//                     </div>
//                     <span class="movement-date">Last Purchase: {{ customer.lastPurchaseDate | date:'shortDate' }}</span>
//                     <span class="movement-amount">{{ customer.totalPurchasedAmount | currency:'USD' }}</span>
//                   </div>
//                   <span class="movement-status amount-risk">Alert</span>
//                 </div>
//               </ng-container>
//               <ng-template #noRisk>
//                 <div class="empty-state">
//                   <i class="pi pi-check-circle"></i>
//                   <span>No customers currently at risk.</span>
//                 </div>
//               </ng-template>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     :host {
//       display: block;
//       font-family: 'Inter', sans-serif;
//       background-color: #f4f7fe;
//       padding: 1rem;
//     }

//     .dashboard-container {
//       max-width: 1400px;
//       margin: 0 auto;
//     }

//     /* KPI Grid Enhancements */
//     .kpi-grid {
//       display: grid;
//       grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
//       gap: 1.5rem;
//       margin-bottom: 2rem;
//     }

//     .kpi-card {
//       display: flex;
//       align-items: center;
//       background: linear-gradient(135deg, #ffffff, #f8fafc);
//       padding: 1.5rem;
//       border-radius: 16px;
//       box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
//       transition: all 0.3s ease;
//     }

//     .kpi-card:hover {
//       transform: translateY(-5px);
//       box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
//     }

//     .kpi-icon {
//       font-size: 2rem;
//       margin-right: 1rem;
//       color: #ffffff;
//       background-color: currentColor;
//       border-radius: 50%;
//       width: 40px;
//       height: 40px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       opacity: 0.8;
//     }

//     .kpi-card-revenue { border-left: 5px solid #22c55e; --color: #22c55e; }
//     .kpi-card-revenue .kpi-icon { background-color: #22c55e; }
//     .kpi-card-new { border-left: 5px solid #3b82f6; --color: #3b82f6; }
//     .kpi-card-new .kpi-icon { background-color: #3b82f6; }
//     .kpi-card-repeat { border-left: 5px solid #8b5cf6; --color: #8b5cf6; }
//     .kpi-card-repeat .kpi-icon { background-color: #8b5cf6; }
//     .kpi-card-risk { border-left: 5px solid #ef4444; --color: #ef4444; }
//     .kpi-card-risk .kpi-icon { background-color: #ef4444; }

//     /* Main Grid */
//     .main-grid {
//       display: grid;
//       grid-template-columns: 1fr 1fr;
//       gap: 1.5rem;
//     }

//     .left-column, .right-column {
//       display: flex;
//       flex-direction: column;
//       gap: 1.5rem;
//     }

//     /* Card Styles */
//     .dashboard-card {
//       background: #ffffff;
//       border-radius: 16px;
//       padding: 1.5rem;
//       box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
//       transition: box-shadow 0.3s ease;
//     }

//     .dashboard-card:hover {
//       box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
//     }

//     /* History / Top Customers */
//     .history-header, .history-row {
//       display: grid;
//       grid-template-columns: 2fr 1fr 2fr;
//       gap: 1rem;
//       align-items: center;
//     }

//     .history-row {
//       padding: 1rem;
//       border-radius: 12px;
//       transition: background 0.2s;
//     }

//     .history-row:hover {
//       background: #f8fafc;
//     }

//     /* RFM Segments */
//     .rfm-segment {
//       margin-bottom: 1rem;
//       padding: 1rem;
//       background: #f9fafb;
//       border-radius: 12px;
//     }

//     .segment-header {
//       display: flex;
//       align-items: center;
//       margin-bottom: 0.75rem;
//     }

//     .segment-count {
//       font-size: 0.9rem;
//       color: #64748b;
//     }

//     .segment-customers {
//       display: flex;
//       flex-direction: column;
//       gap: 0.5rem;
//     }

//     .customer-item {
//       display: flex;
//       align-items: center;
//       gap: 0.75rem;
//     }

//     /* Analytics Summary Card */
//     .analytics-summary-card {
//       background: linear-gradient(135deg, #4f46e5, #3b82f6);
//       color: #ffffff;
//       padding: 1.5rem;
//       border-radius: 16px;
//     }

//     .summary-content {
//       display: flex;
//       flex-direction: column;
//       gap: 1rem;
//     }

//     .summary-item {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//     }

//     .summary-label {
//       font-size: 0.9rem;
//       opacity: 0.9;
//     }

//     .summary-value {
//       font-size: 1.1rem;
//       font-weight: 600;
//     }

//     /* Chart Card */
//     .chart-card {
//       height: 350px;
//     }

//     /* At Risk Customers */
//     .movement-row {
//       display: flex;
//       align-items: center;
//       gap: 1rem;
//       padding: 1rem;
//       border-radius: 12px;
//       background: #fef2f2;
//       margin-bottom: 0.75rem;
//     }

//     .movement-info {
//       flex: 1;
//     }

//     .movement-status {
//       font-weight: 600;
//       color: #ef4444;
//     }

//     .empty-state {
//       text-align: center;
//       padding: 2rem;
//       color: #94a3b8;
//     }

//     /* Responsive Design */
//     @media (max-width: 1200px) {
//       .main-grid {
//         grid-template-columns: 1fr;
//       }
//     }

//     @media (max-width: 768px) {
//       .kpi-grid {
//         grid-template-columns: 1fr;
//       }
//       .history-header, .history-row {
//         grid-template-columns: 1fr 1fr;
//       }
//       .customer-email {
//         display: none;
//       }
//     }
//   `],
// })
// export class DashboardTopCustomerViewComponent {
//   @Input() data: CustomerAnalyticsData | null = null;

//   calculateTotalCustomers(): number {
//     return this.data?.rfmSegments.reduce((sum, seg) => sum + seg.count, 0) || 0;
//   }

//   calculateAvgLifetimeValue(): number {
//     const totalValue = this.data?.topCustomersLifetime.reduce((sum, cust) => sum + cust.totalPurchasedAmount, 0) || 0;
//     const count = this.data?.topCustomersLifetime.length || 1;
//     return totalValue / count;
//   }

//   calculateTotalRevenue(): number {
//     return this.data?.revenueBreakdown.reduce((sum, bd) => sum + bd.totalRevenue, 0) || 0;
//   }
// }
// // import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
// // import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
// // import { animate, style, transition, trigger } from '@angular/animations';

// // // PrimeNG Modules for icons
// // import { AvatarModule } from 'primeng/avatar';
// // import { ButtonModule } from 'primeng/button';

// // // Interface for type safety
// // export interface CustomerAnalyticsData {
// //   summary: {
// //     newCustomers: number;
// //     repeatCustomerRate: number;
// //   };
// //   revenueBreakdown: {
// //     _id: string;
// //     totalRevenue: number;
// //   }[];
// //   topCustomersLifetime: {
// //     _id: string;
// //     email: string;
// //     fullname: string;
// //     totalPurchasedAmount: number;
// //     profileImage?: string;
// //   }[];
// //   atRiskCustomers: {
// //     fullname: string;
// //   }[];
// // }


// // @Component({
// //   selector: 'app-dashboard-top-customer-view',
// //   standalone: true,
// //   imports: [CommonModule, CurrencyPipe, PercentPipe, AvatarModule, ButtonModule],
// //   changeDetection: ChangeDetectionStrategy.OnPush,
// //   animations: [
// //     trigger('fadeInUp', [
// //       transition(':enter', [
// //         style({ opacity: 0, transform: 'translateY(20px)' }),
// //         animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'none' })),
// //       ]),
// //     ]),
// //   ],
// //   template: `
// //     <div class="dashboard-container" *ngIf="data" @fadeInUp>
// //       <div class="kpi-grid">
// //         <div class="kpi-card kpi-card-revenue">
// //           <div class="kpi-content">
// //             <span class="kpi-title">Total Returning Revenue</span>
// //             <span class="kpi-value">{{ (data.revenueBreakdown[0].totalRevenue || 0) | currency:'USD':'symbol':'1.2-2' }}</span>
// //           </div>
// //         </div>
// //         <div class="kpi-card kpi-card-new">
// //           <div class="kpi-content">
// //             <span class="kpi-title">New Customers</span>
// //             <span class="kpi-value">{{ data.summary.newCustomers }}</span>
// //           </div>
// //         </div>
// //         <div class="kpi-card kpi-card-repeat">
// //           <div class="kpi-content">
// //             <span class="kpi-title">Repeat Customer Rate</span>
// //             <span class="kpi-value">{{ data.summary.repeatCustomerRate | percent:'1.1-2' }}</span>
// //           </div>
// //         </div>
// //         <div class="kpi-card kpi-card-risk">
// //           <div class="kpi-content">
// //             <span class="kpi-title">Customers At Risk</span>
// //             <span class="kpi-value">{{ data.atRiskCustomers.length }}</span>
// //           </div>
// //         </div>
// //       </div>

// //       <div class="main-grid">
// //         <div class="dashboard-card history-card">
// //           <div class="card-header">
// //             <h3 class="card-title">Top Customers</h3>
// //             <button pButton type="button" label="View All" class="p-button-text p-button-sm"></button>
// //           </div>
// //           <div class="history-table">
// //             <div class="history-header">
// //               <span class="header-item">Name</span>
// //               <span class="header-item">Total Purchase</span>
// //               <span class="header-item">Account Email</span>
// //             </div>
// //             <div class="history-body">
// //               <div *ngFor="let customer of data.topCustomersLifetime" class="history-row">
// //                 <div class="customer-profile">
// //                   <p-avatar [label]="customer.fullname.charAt(0)" styleClass="mr-2" size="normal" shape="circle"></p-avatar>
// //                   <span class="customer-name">{{ customer.fullname }}</span>
// //                 </div>
// //                 <span class="purchase-amount">{{ customer.totalPurchasedAmount | currency:'USD' }}</span>
// //                 <span class="customer-email">{{ customer.email }}</span>
// //                 <i class="pi pi-ellipsis-h more-options"></i>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         <div class="right-column">
// //           <div class="dashboard-card payment-visual-card">
// //             <div class="payment-card-ui">
// //               <div class="card-top">
// //                 <img src="https://www.svgrepo.com/show/493390/chip-card.svg" alt="Chip" class="card-chip">
// //                 <img src="https://www.svgrepo.com/show/499845/wifi.svg" alt="NFC" class="card-nfc">
// //               </div>
// //               <div class="card-number">
// //                 <span>**** **** **** 3772</span>
// //               </div>
// //               <div class="card-bottom">
// //                 <span class="card-holder">Customer Analytics</span>
// //                 <img src="https://www.svgrepo.com/show/303233/visa-logo.svg" alt="Visa" class="card-logo">
// //               </div>
// //             </div>
// //             <div class="card-details">
// //                 <div class="detail-item">
// //                     <span>Balance</span>
// //                     <strong>$72,842.00</strong>
// //                 </div>
// //                  <div class="detail-item">
// //                     <span>Spend Limit</span>
// //                     <strong>$100,000.00</strong>
// //                 </div>
// //             </div>
// //           </div>

// //           <div class="dashboard-card movements-card">
// //             <div class="card-header">
// //               <h3 class="card-title">At Risk Customers</h3>
// //                <button pButton type="button" label="View All" class="p-button-text p-button-sm"></button>
// //             </div>
// //             <div class="movements-body">
// //               <ng-container *ngIf="data.atRiskCustomers.length > 0; else noRisk">
// //                   <div *ngFor="let customer of data.atRiskCustomers" class="movement-row">
// //                     <div class="movement-icon icon-risk">
// //                       <i class="pi pi-exclamation-triangle"></i>
// //                     </div>
// //                     <div class="movement-info">
// //                       <span class="movement-name">{{ customer.fullname }}</span>
// //                       <span class="movement-date">Needs attention</span>
// //                     </div>
// //                     <span class="movement-amount amount-risk">Alert</span>
// //                   </div>
// //               </ng-container>
// //               <ng-template #noRisk>
// //                 <div class="empty-state">
// //                   <i class="pi pi-check-circle"></i>
// //                   <span>No customers currently at risk.</span>
// //                 </div>
// //               </ng-template>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   `,
// //   styles: [`
// //     :host {
// //       display: block;
// //       font-family: 'Inter', sans-serif; /* A clean, modern font */
// //     }

// //     .dashboard-container {
// //       padding: 1rem;
// //       background-color: #f4f7fe;
// //       border-radius: 16px;
// //     }

// //     /* KPI Grid */
// //     .kpi-grid {
// //       display: grid;
// //       grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
// //       gap: 1.5rem;
// //       margin-bottom: 1.5rem;
// //     }

// //     .kpi-card {
// //       background-color: #ffffff;
// //       padding: 1.5rem;
// //       border-radius: 16px;
// //       border-left: 5px solid;
// //       box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
// //       transition: transform 0.2s ease, box-shadow 0.2s ease;
// //     }

// //     .kpi-card:hover {
// //         transform: translateY(-5px);
// //         box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
// //     }

// //     .kpi-card-revenue { border-color: #22c55e; }
// //     .kpi-card-new { border-color: #3b82f6; }
// //     .kpi-card-repeat { border-color: #8b5cf6; }
// //     .kpi-card-risk { border-color: #ef4444; }

// //     .kpi-content {
// //       display: flex;
// //       flex-direction: column;
// //     }

// //     .kpi-title {
// //       font-size: 0.9rem;
// //       color: #64748b;
// //       margin-bottom: 0.5rem;
// //     }

// //     .kpi-value {
// //       font-size: 1.75rem;
// //       font-weight: 700;
// //       color: #1e293b;
// //     }

// //     /* Main Grid Layout */
// //     .main-grid {
// //       display: grid;
// //       grid-template-columns: 2fr 1fr;
// //       gap: 1.5rem;
// //     }

// //     .right-column {
// //       display: flex;
// //       flex-direction: column;
// //       gap: 1.5rem;
// //     }

// //     /* Shared Card Styles */
// //     .dashboard-card {
// //       background-color: #ffffff;
// //       border-radius: 16px;
// //       padding: 1.5rem;
// //       box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
// //       height: 100%;
// //     }

// //     .card-header {
// //       display: flex;
// //       justify-content: space-between;
// //       align-items: center;
// //       margin-bottom: 1.5rem;
// //     }

// //     .card-title {
// //       font-size: 1.25rem;
// //       font-weight: 600;
// //       color: #1e293b;
// //       margin: 0;
// //     }

// //     /* History Table */
// //     .history-card {
// //       display: flex;
// //       flex-direction: column;
// //     }
// //     .history-table {
// //       flex-grow: 1;
// //       display: flex;
// //       flex-direction: column;
// //     }
// //     .history-header {
// //       display: grid;
// //       grid-template-columns: 2fr 1fr 2fr auto;
// //       gap: 1rem;
// //       padding: 0 1rem;
// //       border-bottom: 1px solid #e2e8f0;
// //       padding-bottom: 0.75rem;
// //       margin-bottom: 0.5rem;
// //     }
// //     .header-item {
// //       font-size: 0.8rem;
// //       font-weight: 500;
// //       color: #94a3b8;
// //       text-transform: uppercase;
// //     }
// //     .history-body {
// //       overflow-y: auto;
// //       max-height: 450px; /* Adjust as needed */
// //     }
// //     .history-row {
// //       display: grid;
// //       grid-template-columns: 2fr 1fr 2fr auto;
// //       gap: 1rem;
// //       align-items: center;
// //       padding: 1rem;
// //       border-radius: 12px;
// //       transition: background-color 0.2s ease;
// //     }
// //     .history-row:hover {
// //       background-color: #f8fafc;
// //     }
// //     .customer-profile {
// //       display: flex;
// //       align-items: center;
// //       gap: 0.75rem;
// //     }
// //     .customer-name {
// //       font-weight: 600;
// //       color: #1e293b;
// //     }
// //     .purchase-amount {
// //       font-weight: 500;
// //       color: #16a34a; /* Green for positive amounts */
// //     }
// //     .customer-email {
// //       color: #64748b;
// //       font-size: 0.9rem;
// //     }
// //     .more-options {
// //       color: #94a3b8;
// //       cursor: pointer;
// //     }

// //     /* Payment Card Visual */
// //     .payment-visual-card {
// //       display: flex;
// //       flex-direction: column;
// //       justify-content: space-between;
// //     }
// //     .payment-card-ui {
// //       background: linear-gradient(135deg, #4f46e5, #3b82f6);
// //       border-radius: 12px;
// //       padding: 1.5rem;
// //       color: #ffffff;
// //       box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4);
// //       position: relative;
// //     }
// //     .card-top, .card-bottom { display: flex; justify-content: space-between; align-items: center; }
// //     .card-chip { width: 40px; filter: invert(1); opacity: 0.8; }
// //     .card-nfc { width: 24px; filter: invert(1); opacity: 0.8; }
// //     .card-number { font-size: 1.2rem; letter-spacing: 2px; margin: 2rem 0; text-align: center; }
// //     .card-holder { font-size: 0.9rem; opacity: 0.8; }
// //     .card-logo { width: 40px; }
// //     .card-details { display: flex; justify-content: space-between; margin-top: 1.5rem; }
// //     .detail-item { display: flex; flex-direction: column; }
// //     .detail-item span { font-size: 0.85rem; color: #64748b; }
// //     .detail-item strong { font-size: 1rem; color: #1e293b; font-weight: 600; }

// //     /* Movements / At Risk Card */
// //     .movements-body {
// //       display: flex;
// //       flex-direction: column;
// //       gap: 1rem;
// //     }
// //     .movement-row {
// //       display: flex;
// //       align-items: center;
// //       gap: 1rem;
// //     }
// //     .movement-icon {
// //       width: 40px;
// //       height: 40px;
// //       border-radius: 50%;
// //       display: flex;
// //       align-items: center;
// //       justify-content: center;
// //       color: #ffffff;
// //     }
// //     .icon-risk { background-color: #fef2f2; color: #ef4444; }
// //     .movement-info { flex-grow: 1; }
// //     .movement-name { display: block; font-weight: 500; color: #1e293b; }
// //     .movement-date { display: block; font-size: 0.8rem; color: #94a3b8; }
// //     .movement-amount { font-weight: 600; }
// //     .amount-risk { color: #ef4444; }
// //     .empty-state {
// //       text-align: center;
// //       padding: 2rem 1rem;
// //       color: #94a3b8;
// //     }
// //     .empty-state i { font-size: 1.5rem; color: #22c55e; margin-bottom: 0.5rem; }

// //     /* Responsive */
// //     @media (max-width: 1200px) {
// //       .main-grid {
// //         grid-template-columns: 1fr;
// //       }
// //     }
// //     @media (max-width: 768px) {
// //       .history-header, .history-row {
// //         grid-template-columns: 1fr 1fr;
// //       }
// //       .customer-email, .header-item:nth-child(3) {
// //         display: none;
// //       }
// //     }
// //   `],
// // })
// // export class DashboardTopCustomerViewComponent {
// //   @Input() data: CustomerAnalyticsData | null = null;
// // }

// // // import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
// // // import { Observable, Subject } from 'rxjs';
// // // import { takeUntil, catchError } from 'rxjs/operators';
// // // import {

// // //   ConsolidatedSummaryData,
// // //   SalesTrendData,
// // //   ProductInsightData,
// // //   CustomerInsightData,
// // //   ReviewData,
// // //   PaymentMethodData,
// // //   InventoryValueData,
// // //   ApiResponse // Import ApiResponse
// // // } from '../../../../core/Models/dashboard-models'; // Adjust path as needed
// // // import { DashboardService } from '../../../../core/services/dashboard.service';
// // // import { HttpErrorResponse } from '@angular/common/http';
// // // import { CommonModule } from '@angular/common';
// // // import { FormsModule } from '@angular/forms';
// // // import { DialogModule } from 'primeng/dialog';
// // // import { IconFieldModule } from 'primeng/iconfield';
// // // import { InputIconModule } from 'primeng/inputicon';

// // // import { CarouselModule } from 'primeng/carousel';
// // // import { TableModule, TableRowCollapseEvent, TableRowExpandEvent, } from 'primeng/table';
// // // import { ButtonModule, } from 'primeng/button';
// // // import { InputTextModule, } from 'primeng/inputtext'; // For search input
// // // import { TagModule } from 'primeng/tag';
// // // import { ToastModule, } from 'primeng/toast'; // For toast messages
// // // import { MessageService, } from 'primeng/api';
// // // // import { InvoicePrintComponent } from '../../../billing/components/invoice-print/invoice-print.component';
// // // import { CommonMethodService } from '../../../../core/Utils/common-method.service';
// // // import { InvoicePrintComponent } from "../../../billing/components/invoice-print/invoice-print.component";
// // // import { Avatar } from "primeng/avatar";
// // // @Component({
// // //   selector: 'app-dashboard-top-customer-view',
// // //   imports: [CommonModule, IconFieldModule, InputIconModule, CarouselModule, DialogModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, ToastModule, ],
// // //   templateUrl: './dashboard-top-customer-view.component.html',
// // //   styleUrl: './dashboard-top-customer-view.component.css'
// // // })
// // // export class DashboardTopCustomerViewComponent {
// // //   @Input() data: any
// // // }
// // // //   private ngUnsubscribe = new Subject<void>();
// // // //   searchTerm: string = '';
// // // //   filteredCustomers: any[] = [];
// // // //   expandedRows: { [key: string]: boolean } = {};
// // // //   expandedProductRows: { [key: string]: boolean } = {}; // For nested product rows
// // // //   getDateParam: any
// // // //   topCustomers: any
// // // //   scale: any;
// // // //   showpdf: any;
// // // //   invoiceId: any;
// // // //   // 

// // // //   constructor(private dashboardService: DashboardService, public CommonMethodService: CommonMethodService, private messageService: MessageService) { }

// // // //   ngOnChanges(changes: SimpleChanges): void {

// // // //     // if (changes && changes['currenValue']) {
// // // //     // this.fetchTopCustomersByPurchase(this.params)
// // // //     // }
// // // //   }

// // // //   // fetchTopCustomersByPurchase(params: any): void {
// // // //   //   this.dashboardService.getTopCustomersByPurchase(params)
// // // //   //     .pipe(takeUntil(this.ngUnsubscribe), catchError(this.CommonMethodService.handleError<ApiResponse<CustomerInsightData[]>>()))
// // // //   //     .subscribe(response => {
// // // //   //       if (response) {
// // // //   //         this.topCustomers = response.data
// // // //   //         this.filteredCustomers = response.data
// // // //   //       }
// // // //   //     });
// // // //   // }



// // // //   filterCustomers(): void {
// // // //     const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
// // // //     this.filteredCustomers = this.topCustomers.filter((customer: any) =>
// // // //       customer.fullname.toLowerCase().includes(lowerCaseSearchTerm) ||
// // // //       customer.email.toLowerCase().includes(lowerCaseSearchTerm)
// // // //     );
// // // //   }

// // // //   viewCustomerDetails(customerId: string): void {
// // // //     // Example: this.router.navigate(['/customer', customerId]);
// // // //   }


// // // //   // --- PrimeNG Table Methods ---
// // // //   expandAll(): void {
// // // //     this.expandedRows = this.filteredCustomers.reduce((acc, customer) => {
// // // //       acc[customer._id] = true;
// // // //       return acc;
// // // //     }, {});
// // // //     this.messageService.add({ severity: 'success', summary: 'All Rows Expanded', life: 3000 });
// // // //   }

// // // //   collapseAll(): void {
// // // //     this.expandedRows = {};
// // // //     this.expandedProductRows = {}; // Collapse all nested product rows too
// // // //     this.messageService.add({ severity: 'info', summary: 'All Rows Collapsed', life: 3000 });
// // // //   }

// // // //   onRowExpand(event: TableRowExpandEvent): void {
// // // //     this.messageService.add({ severity: 'info', summary: 'Customer Expanded', detail: event.data.fullname, life: 3000 });
// // // //   }

// // // //   onRowCollapse(event: TableRowCollapseEvent): void {
// // // //     this.messageService.add({ severity: 'success', summary: 'Customer Collapsed', detail: event.data.fullname, life: 3000 });
// // // //   }

// // // //   onProductRowExpand(event: TableRowExpandEvent): void {
// // // //     this.messageService.add({ severity: 'info', summary: 'Product Expanded', detail: event.data.productId.title, life: 3000 });
// // // //   }

// // // //   onProductRowCollapse(event: TableRowCollapseEvent): void {
// // // //     this.messageService.add({ severity: 'success', summary: 'Product Collapsed', detail: event.data.productId.title, life: 3000 });
// // // //   }


// // // //   showInvoicePdf(id: any) {
// // // //     this.invoiceId = id
// // // //     this.showpdf = true
// // // //   }

// // // //   ngOnDestroy(): void {
// // // //     this.ngUnsubscribe.next();
// // // //     this.ngUnsubscribe.complete();
// // // //   }
// // // // }  