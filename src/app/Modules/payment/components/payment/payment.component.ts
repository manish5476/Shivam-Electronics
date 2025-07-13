

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SplitterModule } from 'primeng/splitter';
import { SelectModule } from 'primeng/select';
import { PaymentService } from '../../../../core/services/payment.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { Card } from 'primeng/card';
// import lodash from 'lodash';
@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [FormsModule, SelectModule, SplitterModule, CommonModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent {
  selectedOption: string = '';
  dropdownOptions = [
    { label: 'View Users', value: 'view_users' },
    { label: 'View Payments', value: 'view_payments' },
    { label: 'Settings', value: 'settings' }
  ];
  customerId: any = null;
  paymentData = {
    amount: 0,
    paymentMethod: 'credit_card',
    status: 'pending',
    transactionId: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customerId: this.customerId,
    metadata: '{}',
    description: '',
    customerName: '',
    phoneNumbers: '',
  };
  paymentMethods = ['credit_card', 'debit_card', 'upi', 'crypto', 'bank_transfer'];
  statuses = ['pending', 'completed', 'failed', 'refunded'];
  customerIDDropdown: any;
  messageService: any;
  customer: any;

  constructor(private http: HttpClient, private CustomerService: CustomerService, private autoPopulate: AutopopulateService, private PaymentService: PaymentService) { }
  ngOnInit(): void {
    this.autopopulatedata()
  }

  autopopulatedata() {
    this.autoPopulate.getModuleData('customers').subscribe((customer: any) => {
      this.customerIDDropdown = customer.data
    })
    // this.autoPopulate.getModuleData('products').subscribe((data:any) => {
    //   this.productdrop = data;
    // });
    // this.autoPopulate.getModuleData('sellers').subscribe((data:any) => {
    //   this.sellersDrop = data;
    // });
    this.autoPopulate.getModuleData('customers').subscribe((data: any) => {
      this.customerIDDropdown = data;
    });
  }


  fetchCustomerData() {
    this.paymentData.customerId = this.customerId
    this.CustomerService.getCustomerDataWithId(this.customerId).subscribe(
      (response: { data: any; }) => {
        this.customer = response.data;
      },
      (error: any) => {
        console.error('Error fetching customer data:', error);
      }
    );
  }

  isValidJson(input: string): boolean {
    try {
      JSON.parse(input);
      return true;
    } catch {
      return false;
    }
  }

  onSubmit() {
    this.paymentData.customerName=this.customer.fullname?this.customer?.fullname:null
    this.paymentData.phoneNumbers=this.customer?.phoneNumbers[0]?.number?this.customer?.phoneNumbers[0]?.number:null
    if (!this.paymentData.customerId || this.paymentData.amount <= 0) {
      alert('Please fill all required fields correctly.');
      return;
    }

    const formData = {
      ...this.paymentData,
      amount: parseFloat(String(this.paymentData.amount)),
      // metadata: JSON.parse(this.paymentData.metadata),
      updatedAt: new Date().toISOString()
    };

    this.PaymentService.createNewpayment(formData).subscribe((res: any) => {
      this.fetchCustomerData()
    })
  }


    onDetailBoxHover(event: MouseEvent, isHovering: boolean) {
    const element = event.currentTarget as HTMLElement; // Use currentTarget for event delegation

    if (isHovering) {
      // Apply hover styles
      element.style.boxShadow = '0 10px 40px 0 rgba(13, 148, 136, 0.3)'; // Example: a subtle teal shadow
      // You might also want to change background color slightly, e.g.:
      // element.style.backgroundColor = 'var(--theme-hover-bg)';
    } else {
      // Revert to default styles
      element.style.boxShadow = '0 1px 3px 0 var(--theme-shadow-color), 0 1px 2px -1px var(--theme-shadow-color)'; // Revert to default shadow from styles.css .card
      // element.style.backgroundColor = 'var(--theme-bg-tertiary)'; // Revert background
    }
  }

  onProcessPaymentButtonHover(event: MouseEvent, isHovering: boolean) {
    const button = event.currentTarget as HTMLElement;

    if (isHovering) {
      button.style.background = 'var(--theme-button-hover-bg-primary)'; // Use the hover background variable
    } else {
      button.style.background = 'var(--theme-button-bg-primary)'; 
    }
  }

}


