import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, TitleCasePipe, DecimalPipe } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

// PrimeNG Modules
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-paymentanalytics',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    TitleCasePipe,
    DecimalPipe,
    ProgressBarModule,
    AvatarModule
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
    <div class="analytics-container" *ngIf="data" @fadeInUp>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-title">Total Collected</span>
            <span class="kpi-value">{{ data.financialHealth?.totalCollected | currency:'INR':'symbol':'1.0-0' }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-title">Collection Rate</span>
            <span class="kpi-value">{{ data.financialHealth?.collectionRate | number:'1.1-1' }}%</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-title">Failed Payments</span>
            <span class="kpi-value">{{ data.failedPayments?.count || 0 }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-title">Payment Methods</span>
            <span class="kpi-value">{{ data.paymentMethods?.length || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="left-column">
          <div class="dashboard-card">
            <div class="card-header">
              <h3 class="card-title">Payment Methods Breakdown</h3>
            </div>
            <div class="item-list">
              <ng-container *ngIf="data.paymentMethods?.length > 0; else noMethods">
                <div class="method-item" *ngFor="let method of data.paymentMethods">
                  <p-avatar [icon]="getIconForMethod(method._id)" styleClass="p-avatar-icon"></p-avatar>
                  <div class="method-details">
                    <div class="method-info">
                      <span class="item-name">{{ method._id | titlecase }}</span>
                      <span class="item-value">{{ method.totalAmount | currency:'INR':'symbol':'1.0-0' }}</span>
                    </div>
                    <p-progressBar [value]="computeMethodShare(method)" [showValue]="false" [style]="{'height': '6px'}"></p-progressBar>
                  </div>
                </div>
              </ng-container>
              <ng-template #noMethods>
                <div class="empty-state">No payment methods recorded.</div>
              </ng-template>
            </div>
          </div>

          <div class="dashboard-card">
            <div class="card-header">
              <h3 class="card-title">Recent Collection Trends</h3>
            </div>
            <div class="item-list">
              <ng-container *ngIf="data.collectionTrends?.length > 0; else noTrends">
                <div class="list-item" *ngFor="let trend of data.collectionTrends">
                  <p-avatar icon="pi pi-calendar" styleClass="p-avatar-icon"></p-avatar>
                  <div class="item-info">
                    <span class="item-name">{{ trend._id | date: 'longDate' }}</span>
                    <span class="item-subtitle">Daily Total</span>
                  </div>
                  <span class="item-value positive">{{ trend.dailyTotal | currency:'INR':'symbol':'1.0-0' }}</span>
                </div>
              </ng-container>
               <ng-template #noTrends>
                <div class="empty-state">No collection trend data available.</div>
              </ng-template>
            </div>
          </div>
        </div>

        <div class="right-column">
          <div class="dashboard-card status-card">
             <div class="card-header">
              <h3 class="card-title">Failed Payments</h3>
            </div>
            <div class="status-content" *ngIf="data.failedPayments?.count === 0; else hasFailed">
                <div class="status-icon success">
                    <i class="pi pi-check-circle"></i>
                </div>
                <span class="status-title">All Good</span>
                <span class="status-subtitle">No failed payments detected.</span>
            </div>
            <ng-template #hasFailed>
               <div class="status-content">
                <div class="status-icon failure">
                    <i class="pi pi-times-circle"></i>
                </div>
                <span class="status-title">{{ data.failedPayments?.count }} Failed</span>
                <span class="status-subtitle">{{ data.failedPayments?.totalValue | currency:'INR':'symbol':'1.0-0' }} in value</span>
            </div>
            </ng-template>
          </div>
           <div class="dashboard-card">
             <div class="card-header">
              <h3 class="card-title">Financial Health</h3>
            </div>
            <div class="item-list">
                <div class="list-item">
                    <span class="item-name">Total Billed</span>
                    <span class="item-value">{{ data.financialHealth?.totalBilled | currency:'INR':'symbol':'1.0-0' }}</span>
                </div>
                 <div class="list-item">
                    <span class="item-name">Total Collected</span>
                    <span class="item-value positive">{{ data.financialHealth?.totalCollected | currency:'INR':'symbol':'1.0-0' }}</span>
                </div>
                 <div class="list-item">
                    <span class="item-name">Collection Rate</span>
                    <span class="item-value">{{ data.financialHealth?.collectionRate | number:'1.1-1' }}%</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Inter', sans-serif;
    }
    .analytics-container {
      padding: 1rem;
      background-color: #f4f7fe;
      border-radius: 16px;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .kpi-card {
      background-color: #ffffff;
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .kpi-title {
      font-size: 0.9rem;
      color: #64748b;
      margin-bottom: 0.5rem;
      display: block;
    }
    .kpi-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
    }
    
    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }
    .left-column, .right-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Shared Card & List Styles */
    .dashboard-card {
      background-color: #ffffff;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
    }
    .card-header {
      margin-bottom: 1.5rem;
    }
    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }
    .item-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .list-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .item-name {
      font-weight: 600;
      color: #1e293b;
      flex-grow: 1;
    }
     .item-info {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;
    }
    .item-subtitle {
        font-size: 0.85rem;
        color: #64748b;
    }
    .item-value {
      font-weight: 600;
      color: #475569;
    }
    .item-value.positive { color: #16a34a; }

    /* Payment Methods Card */
    .method-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .method-details {
      flex-grow: 1;
    }
    .method-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    /* Status Card */
    .status-card {
        align-items: center;
        justify-content: center;
        text-align: center;
        min-height: 200px;
    }
    .status-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }
    .status-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    .status-icon.success { color: #22c55e; }
    .status-icon.failure { color: #ef4444; }
    .status-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1e293b;
    }
    .status-subtitle {
        font-size: 0.9rem;
        color: #64748b;
    }
    
    .empty-state {
        text-align: center;
        padding: 1rem;
        color: #94a3b8;
    }
    
    /* Responsive */
    @media (max-width: 992px) {
        .content-grid {
            grid-template-columns: 1fr;
        }
    }
  `]
})
export class PaymentanalyticsComponent {
  @Input() data: any;

  computeMethodShare(method: any): number {
    const total = this.data?.financialHealth?.totalCollected || 1;
    const ratio = (method.totalAmount || 0) / total;
    return Math.round(ratio * 100);
  }

  getIconForMethod(methodId: string): string {
    switch (methodId) {
      case 'credit_card': return 'pi pi-credit-card';
      case 'cash': return 'pi pi-money-bill';
      case 'wallet': return 'pi pi-wallet';
      case 'upi': return 'pi pi-qrcode';
      default: return 'pi pi-dollar';
    }
  }
}

// import { CommonModule } from '@angular/common';
// import { Component, Input } from '@angular/core';

// @Component({
//   selector: 'app-paymentanalytics',
//   imports: [CommonModule],
//   templateUrl: './paymentanalytics.component.html',
//   styleUrl: './paymentanalytics.component.css'
// })
// export class PaymentanalyticsComponent {
//   @Input() data: any


// // inside PaymentanalyticsComponent
// computeMethodShare(method: any): number {
//   const total = this.data?.financialHealth?.totalCollected || this.data?.paymentMethods?.reduce((s: number, m: any) => s + (m.totalAmount || 0), 0) || 1;
//   // avoid division by zero
//   const ratio = (method.totalAmount || 0) / total;
//   // clamp between 6% and 100% so tiny values still show
//   return Math.max(6, Math.min(100, Math.round(ratio * 100)));
// }
// }

