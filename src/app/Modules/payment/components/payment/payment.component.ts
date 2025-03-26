import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SplitterModule } from 'primeng/splitter';
import { SelectModule } from 'primeng/select';
import { ApiService } from '../../../../core/services/api.service';
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
    customerName: "",
    phoneNumbers: ''
  };
  paymentMethods = ['credit_card', 'debit_card', 'upi', 'crypto', 'bank_transfer'];
  statuses = ['pending', 'completed', 'failed', 'refunded'];
  customerIDDropdown: any;
  messageService: any;
  customer: any;

  constructor(private http: HttpClient, private ApiService: ApiService) { }
  ngOnInit(): void {
    this.autopopulatedata()
  }

  autopopulatedata() {
    const autopopulate: any = JSON.parse(sessionStorage.getItem('autopopulate') || '{}');
    if (autopopulate && Array.isArray(autopopulate.customersdrop)) {
      // this.customerIDDropdown = lodash.cloneDeep(autopopulate.customersdrop)
    } else {
      this.customerIDDropdown = [];
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'No valid customer data found',
        life: 3000
      });
    }
  }


  fetchCustomerData() {
    this.paymentData.customerId = this.customerId
    this.ApiService.getCustomerDataWithId(this.customerId).subscribe(
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

    this.ApiService.createNewpayment(formData).subscribe((res: any) => {
    })
  }
}
