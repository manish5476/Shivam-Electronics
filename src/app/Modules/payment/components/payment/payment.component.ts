import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SplitterModule } from 'primeng/splitter';
import { SelectModule } from 'primeng/select';
import { PaymentService } from '../../../../core/services/payment.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { AppMessageService } from '../../../../core/services/message.service';
import { Toast } from "primeng/toast";

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [FormsModule, SelectModule, SplitterModule, CommonModule, Toast],
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
  customer: any;
  customerIDDropdown: any;

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

  constructor(
    private http: HttpClient,
    private CustomerService: CustomerService,
    private autoPopulate: AutopopulateService,
    private PaymentService: PaymentService,
    private messageService: AppMessageService
  ) { }

  ngOnInit(): void {
    this.autopopulatedata();
  }

  // autopopulatedata() {
  //   this.autoPopulate.getModuleData('customers').subscribe((customer: any) => {
  //     console.log(customer);
  //     this.customerIDDropdown = customer.data;
  //     console.log(this.customerIDDropdown);
  //   });
  // }

  autopopulatedata() {
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
    this.paymentData.customerId = this.customerId;
    this.CustomerService.getCustomerDataWithId(this.customerId).subscribe(
      (response: { data: any }) => {
        this.customer = response.data;
      },
      (error: any) => {
        console.error('Error fetching customer data:', error);
      }
    );
  }

  isValidJson(input: string): boolean {
    try {
      if (!input) return true; // allow empty metadata
      JSON.parse(input);
      return true;
    } catch {
      return false;
    }
  }

  validateForm(): string | null {
    if (!this.paymentData.customerId) {
      return 'Please select a customer.';
    }

    if (!this.customer) {
      return 'Customer data not loaded.';
    }

    if (this.paymentData.amount <= 0) {
      return 'Amount must be greater than 0.';
    }

    if (this.customer.remainingAmount != null &&
      this.paymentData.amount > this.customer.remainingAmount) {
      return `Amount cannot be greater than remaining balance (₹${this.customer.remainingAmount}).`;
    }

    if (!this.paymentData.paymentMethod) {
      return 'Please select a payment method.';
    }

    if (!this.paymentData.status) {
      return 'Please select a payment status.';
    }

    if (!this.isValidJson(this.paymentData.metadata)) {
      return 'Invalid JSON in metadata.';
    }

    return null; // valid
  }

  onSubmit() {
    const error = this.validateForm();
    if (error) {
      this.messageService.showInfo(error)
      return;
    }

    this.paymentData.customerName = this.customer?.fullname ?? '';
    this.paymentData.phoneNumbers = this.customer?.phoneNumbers?.[0]?.number ?? '';
    this.paymentData.updatedAt = new Date().toISOString();

    const formData = [{
      ...this.paymentData,
      amount: parseFloat(String(this.paymentData.amount)),
      metadata: this.paymentData.metadata ? JSON.parse(this.paymentData.metadata) : {}
    }];

    this.PaymentService.createNewpayment(formData).subscribe(
      (res: any) => {
        this.fetchCustomerData(); // refresh customer info
                this.messageService.showSuccess('Payment processed successfully!')

        
        this.paymentData.amount = 0;
        this.paymentData.description = '';
        this.paymentData.metadata = '{}';
      },
      (err: any) => {
        this.messageService.showInfo('Error processing payment:', err)
      }
    );
  }

  // UI Hover Effects
  onDetailBoxHover(event: MouseEvent, isHovering: boolean) {
    const element = event.currentTarget as HTMLElement;
    if (isHovering) {
      element.style.boxShadow = '0 10px 40px 0 rgba(13, 148, 136, 0.3)';
    } else {
      element.style.boxShadow = '0 1px 3px 0 var(--theme-shadow-color), 0 1px 2px -1px var(--theme-shadow-color)';
    }
  }

  onProcessPaymentButtonHover(event: MouseEvent, isHovering: boolean) {
    const button = event.currentTarget as HTMLElement;
    button.style.background = isHovering
      ? 'var(--theme-button-hover-bg-primary)'
      : 'var(--theme-button-bg-primary)';
  }
}



// import { Component } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { SplitterModule } from 'primeng/splitter';
// import { SelectModule } from 'primeng/select';
// import { PaymentService } from '../../../../core/services/payment.service';
// import { CustomerService } from '../../../../core/services/customer.service';
// import { AutopopulateService } from '../../../../core/services/autopopulate.service';
// import { Card } from 'primeng/card';
// // import lodash from 'lodash';
// @Component({
//   selector: 'app-payment',
//   standalone: true,
//   imports: [FormsModule, SelectModule, SplitterModule, CommonModule],
//   templateUrl: './payment.component.html',
//   styleUrl: './payment.component.css'
// })
// export class PaymentComponent {
//   selectedOption: string = '';
//   dropdownOptions = [
//     { label: 'View Users', value: 'view_users' },
//     { label: 'View Payments', value: 'view_payments' },
//     { label: 'Settings', value: 'settings' }
//   ];
//   customerId: any = null;
//   paymentData = {
//     amount: 0,
//     paymentMethod: 'credit_card',
//     status: 'pending',
//     transactionId: '',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//     customerId: this.customerId,
//     metadata: '{}',
//     description: '',
//     customerName: '',
//     phoneNumbers: '',
//   };
//   paymentMethods = ['credit_card', 'debit_card', 'upi', 'crypto', 'bank_transfer'];
//   statuses = ['pending', 'completed', 'failed', 'refunded'];
//   customerIDDropdown: any;
//   messageService: any;
//   customer: any;

//   constructor(private http: HttpClient, private CustomerService: CustomerService, private autoPopulate: AutopopulateService, private PaymentService: PaymentService) { }
//   ngOnInit(): void {
//     this.autopopulatedata()
//   }

// autopopulatedata() {
//   this.autoPopulate.getModuleData('customers').subscribe((customer: any) => {
//     this.customerIDDropdown = customer.data
//   })
//   // this.autoPopulate.getModuleData('products').subscribe((data:any) => {
//   //   this.productdrop = data;
//   // });
//   // this.autoPopulate.getModuleData('sellers').subscribe((data:any) => {
//   //   this.sellersDrop = data;
//   // });
//   this.autoPopulate.getModuleData('customers').subscribe((data: any) => {
//     this.customerIDDropdown = data;
//   });
// }


//   fetchCustomerData() {
//     this.paymentData.customerId = this.customerId
//     this.CustomerService.getCustomerDataWithId(this.customerId).subscribe(
//       (response: { data: any; }) => {
//         this.customer = response.data;
//       },
//       (error: any) => {
//         console.error('Error fetching customer data:', error);
//       }
//     );
//   }

//   isValidJson(input: string): boolean {
//     try {
//       JSON.parse(input);
//       return true;
//     } catch {
//       return false;
//     }
//   }

//   onSubmit() {
//     this.paymentData.customerName = this.customer.fullname ? this.customer?.fullname : null
//     this.paymentData.phoneNumbers = this.customer?.phoneNumbers[0]?.number ? this.customer?.phoneNumbers[0]?.number : null
//     if (!this.paymentData.customerId || this.paymentData.amount <= 0) {
//       return;
//     }

//     const formData = [{
//       ...this.paymentData,
//       amount: parseFloat(String(this.paymentData.amount)),
//       // metadata: JSON.parse(this.paymentData.metadata),
//       updatedAt: new Date().toISOString()
//     }];

//     this.PaymentService.createNewpayment(formData).subscribe((res: any) => {
//       this.fetchCustomerData()
//     })
//   }


//   onDetailBoxHover(event: MouseEvent, isHovering: boolean) {
//     const element = event.currentTarget as HTMLElement; // Use currentTarget for event delegation

//     if (isHovering) {
//       // Apply hover styles
//       element.style.boxShadow = '0 10px 40px 0 rgba(13, 148, 136, 0.3)'; // Example: a subtle teal shadow
//       // You might also want to change background color slightly, e.g.:
//       // element.style.backgroundColor = 'var(--theme-hover-bg)';
//     } else {
//       // Revert to default styles
//       element.style.boxShadow = '0 1px 3px 0 var(--theme-shadow-color), 0 1px 2px -1px var(--theme-shadow-color)'; // Revert to default shadow from styles.css .card
//       // element.style.backgroundColor = 'var(--theme-bg-tertiary)'; // Revert background
//     }
//   }

//   onProcessPaymentButtonHover(event: MouseEvent, isHovering: boolean) {
//     const button = event.currentTarget as HTMLElement;

//     if (isHovering) {
//       button.style.background = 'var(--theme-button-hover-bg-primary)'; // Use the hover background variable
//     } else {
//       button.style.background = 'var(--theme-button-bg-primary)';
//     }
//   }

// }


