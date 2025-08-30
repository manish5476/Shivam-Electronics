import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown'; // FIXED: Was SelectModule
import { Select } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast'; // FIXED: Required for <p-toast>
import { MessageService } from 'primeng/api';

// --- SERVICES ---
import { PaymentService } from '../../../../core/services/payment.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    FormsModule, CommonModule, DropdownModule, ButtonModule, Select, InputNumberModule, ToastModule
],
  providers: [MessageService], // Ensures MessageService is available
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  // --- Dependency Injection ---
  private customerService = inject(CustomerService);
  private autoPopulate = inject(AutopopulateService);
  private paymentService = inject(PaymentService);
  private messageService = inject(MessageService);

  // --- Component State ---
  public customerId: string | null = null;
  public customer: any;
  public customerIDDropdown: any[] = [];
  public paymentData = {
    amount: null as number | null,
    paymentMethod: 'credit_card',
    status: 'completed',
    description: '',
    metadata: '{}',
  };
// UPDATED: Added labels and icons for the new UI
  public paymentMethods = [
    { label: 'Credit Card', value: 'credit_card', icon: 'pi-credit-card' },
    { label: 'UPI', value: 'upi', icon: 'pi-mobile' },
    { label: 'Bank Transfer', value: 'bank_transfer', icon: 'pi-building' }
  ];
  public statuses = ['pending', 'completed', 'failed', 'refunded'];
  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData() {
    this.autoPopulate.getModuleData('customers').subscribe((data: any) => {
      // Assuming 'data' is the array of customers
      this.customerIDDropdown = data.map((cust: any) => ({
        label: `${cust.fullname} (${cust.mobileNumber || 'No Phone'})`,
        _id: cust._id
      }));
    });
  }

  fetchCustomerData() {
    if (!this.customerId) {
      this.customer = null;
      return;
    }
    this.customerService.getCustomerDataWithId(this.customerId).subscribe({
      next: (response: { data: any }) => {
        this.customer = response.data;
      },
      error: (error: any) => {
        console.error('Error fetching customer data:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not fetch customer data.' });
      }
    });
  }

  isValidJson(input: string): boolean {
    try {
      if (!input || input.trim() === '') return true; // Allow empty metadata
      JSON.parse(input);
      return true;
    } catch {
      return false;
    }
  }

    // ADDED: New function to handle clicking on payment method chips
  selectPaymentMethod(method: string): void {
    this.paymentData.paymentMethod = method;
  }


  // --- Form Submission ---
  onSubmit() {
    // Basic validation
    if (!this.customerId || !this.customer) {
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please select a customer.' });
      return;
    }
    if (!this.paymentData.amount || this.paymentData.amount <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Amount must be greater than 0.' });
      return;
    }
    if (this.customer.remainingAmount != null && this.paymentData.amount > this.customer.remainingAmount) {
        this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: `Amount cannot be greater than remaining balance (₹${this.customer.remainingAmount}).` });
        return;
    }
    if (!this.isValidJson(this.paymentData.metadata)) {
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Metadata contains invalid JSON.' });
      return;
    }

    const finalPaymentPayload = {
      customerId: this.customerId,
      amount: this.paymentData.amount,
      paymentMethod: this.paymentData.paymentMethod,
      status: this.paymentData.status,
      description: this.paymentData.description,
      metadata: this.paymentData.metadata ? JSON.parse(this.paymentData.metadata) : {},
      // Add other fields your service expects
      customerName: this.customer?.fullname,
      phoneNumbers: this.customer?.phoneNumbers?.[0]?.number
    };

    this.paymentService.createNewpayment([finalPaymentPayload]).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payment processed successfully!' });
        this.fetchCustomerData(); // Refresh customer info to show updated balance
        // Reset form
        this.paymentData.amount = null;
        this.paymentData.description = '';
        this.paymentData.metadata = '{}';
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error processing payment.' });
      }
    });
  }
}
