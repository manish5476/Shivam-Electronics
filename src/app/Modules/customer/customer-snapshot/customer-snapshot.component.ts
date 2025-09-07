import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CustomerService } from '../../../core/services/customer.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TabView, TabPanel } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { AppMessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-customer-snapshot',
  standalone: true,
  imports: [FormsModule, CommonModule, TabView, TabPanel, TableModule, Tag],
  templateUrl: './customer-snapshot.component.html',
  styleUrls: ['./customer-snapshot.component.css'],
})
export class CustomerSnapshotComponent implements OnInit, OnChanges {
  @Input() customerID!: string;
  customerData: any = null;
  loading = false;

  activeTab: 'activity' | 'overdue' | 'details' = 'activity';

  constructor(
    private customerService: CustomerService,
    private messageService: AppMessageService
  ) {}

  ngOnInit() {
    if (this.customerID) {
      this.fetchCustomer();
    }
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
    if (!this.customerID) return;

    this.loading = true;
    this.customerService.getCustomerSnapShot(this.customerID).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (!res.error) {
          this.customerData = res.data;
          this.messageService.showSuccessMessage(
            'Customer Loaded',
            `${this.customerData.customer.fullname}'s data loaded successfully`
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

  getTypeSeverity(type?: string) {
    switch ((type || '').toLowerCase()) {
      case 'sale':
        return 'info';
      case 'payment':
        return 'success';
      case 'refund':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  getStatusSeverity(status?: string) {
    switch ((status || '').toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warn';
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
