import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SplitterModule } from 'primeng/splitter';
import { SelectModule } from 'primeng/select';
import { PaymentService } from '../../../../core/services/payment.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
// import lodash from 'lodash';  // You might not need lodash directly,  check usage
import { Card } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TimelineModule } from 'primeng/timeline';
import { Tag } from 'primeng/tag';
interface EventItem {
  status?: string;
  date?: string;
  icon?: string;
  color?: string;
  data?: any; 
}

@Component({
  selector: 'app-view-payment',
  standalone: true,
  imports: [FormsModule, Tag, ButtonModule, SelectModule, TimelineModule, SplitterModule, CommonModule],
  templateUrl: './view-payment.component.html',
  styleUrl: './view-payment.component.css'
})
export class ViewPaymentComponent implements OnInit {

  events: EventItem[] = [];

  selectedOption: string = '';
  customerId: any = null;
  customerIDDropdown: any;
  paymentsDropdown: any;
  paymentFilter: any = {
    _id: '',
    customerId: '',
    phoneNumbers: '',
    data: []
  };

  constructor(
    private http: HttpClient,
    private CustomerService: CustomerService,
    private autoPopulate: AutopopulateService,
    private PaymentService: PaymentService
  ) { }

  ngOnInit(): void {
    this.autopopulatedata();
  }

  autopopulatedata() {
    this.autoPopulate.getModuleData('customers').subscribe((customer: any) => {
      this.customerIDDropdown = customer.data;
    });

    this.autoPopulate.getModuleData('payments').subscribe((data: any) => {
      this.paymentsDropdown = data;
    });

    this.autoPopulate.getModuleData('customers').subscribe((data: any) => {
      this.customerIDDropdown = data;
    });
  }

  getPaymentData() {
    let filterParams = {
      _id: this.paymentFilter._id,
      customerId: this.paymentFilter.customerId,
      phoneNumbers: this.paymentFilter.phoneNumbers,
    };
  
    this.PaymentService.getAllpaymentData(filterParams).subscribe((res: any) => {
      this.paymentFilter.data = res.data;
      this.events = res.data.map((payment: any) => ({ // Map the payment data.
        status: payment.status,
        date: new Date(payment.createdAt).toLocaleDateString() + ' ' + new Date(payment.createdAt).toLocaleTimeString(),
        icon: this.getIconForStatus(payment.status)|| 'pending',
        color: this.getColorForStatus(payment.status)|| 'blue',
        data: this.paymentFilter.data,
      }));
    });
  }

    getIconForStatus(status: string): string {
    switch (status) {
      case 'pending':
        return 'pi pi-clock';
      case 'success':
        return 'pi pi-check-circle';
      case 'failed':
        return 'pi pi-times-circle';
      default:
        return 'pi pi-question-circle';
    }
  }

 getStatusSeverity(status: string) {
    switch (status) {
      case 'PENDING':
        return 'warn';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'danger';
        break
    }
  }
  getColorForStatus(status: string): string {
    switch (status) {
      case 'pending':
        return '#FFC107'; // Amber
      case 'success':
        return '#4CAF50'; // Green
      case 'failed':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  }
}
