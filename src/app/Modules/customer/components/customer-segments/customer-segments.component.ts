

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CustomerService } from '../../../../core/services/customer.service';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TabView, TabPanel } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { AppMessageService } from '../../../../core/services/message.service';

@Component({
  selector: 'app-customer-segments',
  imports: [FormsModule, CommonModule, TabView, TabPanel, TableModule, Tag],
  templateUrl: './customer-segments.component.html',
  styleUrl: './customer-segments.component.css'
})
export class CustomerSegmentsComponent implements OnInit, OnChanges {
  customerSegments: any;
  salesForecast:any
  loading = false;

  activeTab: 'activity' | 'overdue' | 'details' = 'activity';

  constructor(
    private AnalyticsService: AnalyticsService,
    private messageService: AppMessageService
  ) { }

  ngOnInit() {
    this.fetchCustomer();
    this.getsalesForcast()
  }

  formatCurrency(amount: number | null | undefined): string {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerID'] && !changes['customerID'].firstChange) {
      this.fetchCustomer();
    }
  }

  selectTab(tabName: 'activity' | 'overdue' | 'details'): void {
    this.activeTab = tabName;
  }

  fetchCustomer(): void {
    this.loading = true;
    this.AnalyticsService.getcustomerSegment().subscribe({
      next: (res: any) => {
        this.loading = false;
        if (!res.error) {
          this.customerSegments = res.data;
          this.messageService.showSuccessMessage(
            'Customer Loaded',
            ` data loaded successfully`
          );
        } else {
          this.messageService.handleError(res, 'Fetching Customer');
        }
      },
      error: (err) => {
        this.loading = false;
        this.messageService.handleHttpError(err, 'Fetching Customer');
      },
    });
  }

  getsalesForcast(): void {
    this.loading = true;
    this.AnalyticsService.getsalesForcast().subscribe({
      next: (res: any) => {
        this.loading = false;
        if (!res.error) {
          this.salesForecast = res.data;
          this.messageService.showSuccessMessage(
            'Customer Loaded',
            ` data loaded successfully`
          );
        } else {
          this.messageService.handleError(res, 'Fetching Customer');
        }
      },
      error: (err) => {
        this.loading = false;
        this.messageService.handleHttpError(err, 'Fetching Customer');
      },
    });
  }

getSpendingSeverity(amount: number): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
  if (amount > 100000) {
    return 'success';   // High spender
  } else if (amount > 50000) {
    return 'info';      // Medium spender
  } else if (amount > 10000) {
    return 'warn';      // Low spender
  } else if (amount > 0) {
    return 'secondary'; // Very small
  }
  return 'contrast';    // Default / no spending
}

}
