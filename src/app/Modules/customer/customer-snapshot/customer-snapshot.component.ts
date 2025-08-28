import { Component, Input } from '@angular/core';
import { CustomerService } from '../../../core/services/customer.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TabView, TabPanel } from "primeng/tabview";
import { TableModule } from "primeng/table";
import { Tag } from "primeng/tag";

@Component({
  selector: 'app-customer-snapshot',
  imports: [FormsModule, CommonModule, TabView, TabPanel, TableModule, Tag],
  templateUrl: './customer-snapshot.component.html',
  styleUrl: './customer-snapshot.component.css'
})
export class CustomerSnapshotComponent {
  customerData: any
  @Input() customerID!: any;
  activeTab: 'activity' | 'overdue' | 'details' = 'activity';
  selectTab(tabName: 'activity' | 'overdue' | 'details'): void {
    this.activeTab = tabName;
  }
  constructor(private customerService: CustomerService) {
    this.customerData = [];
  }

  ngOnInit() {
    this.fetchCustomer();
  }

  getTypeSeverity(type?: string) {
    switch ((type || '').toLowerCase()) {
      case 'sale': return 'info';
      case 'payment': return 'success';
      case 'refund': return 'warn';
      default: return 'secondary';
    }
  }

  getStatusSeverity(status?: string) {
    switch ((status || '').toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warn';
      case 'failed': return 'danger';
      default: return 'secondary';
    }
  }

  fetchCustomer() {  
    this.customerService.getCustomerSnapShot('6890cb646c41b0332f226f77').subscribe((res: any) => {
      if (!res.error) this.customerData = res.data;
    });
  }
}