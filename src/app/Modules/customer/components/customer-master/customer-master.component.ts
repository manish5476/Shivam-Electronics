// 1. The Component TypeScript - Corrected and adapted for the new UI
// File: src/app/Modules/customer/components/customer-master/customer-master.component.ts

import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

// App Services & Utilities
import { CustomerService } from '../../../../core/services/customer.service';
import { CommonMethodService } from '../../../../core/Utils/common-method.service';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { AppMessageService } from '../../../../core/services/message.service';
import { Tag } from "primeng/tag";

// Interfaces
interface Location {
  type: 'Point';
  coordinates: [number | null, number | null];
}
interface Address {
  street: string; city: string; state: string; zipCode: string; country: string; type: string; isDefault: boolean; location: Location;
}
interface Phone {
  number: string; type: string; primary: boolean;
}
interface Customer {
  _id?: string; fullname: string; profileImg: string; email: string; status: string; mobileNumber: string; phoneNumbers: Phone[]; addresses: Address[]; cart: { items: any[] }; guaranteerId?: string; totalPurchasedAmount: number; remainingAmount: number; paymentHistory: any[]; metadata: any;
}
interface DropdownOption {
  label: string; value: any;
}
interface CustomerDropdownOption {
  fullname: string; _id: any; phoneNumbers: Phone[];
}

@Component({
  selector: 'app-customer-master',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule, SelectModule,
    FileUploadModule, ToastModule, DialogModule, TableModule, CheckboxModule,
    AvatarModule, CardModule, SkeletonModule, TooltipModule,
    Tag
],
  templateUrl: './customer-master.component.html',
  styleUrls: ['./customer-master.component.css'],
  providers: [MessageService]
})
export class CustomerMasterComponent implements OnInit {
  @Input() customerId!: string;
  @ViewChild('customerForm') customerForm!: NgForm;

  customer: Customer = this.getInitialCustomer();
  isLoading = true;
  
  phoneDialogVisible = false;
  addressDialogVisible = false;
  newPhoneNumber: Phone = { number: '', type: 'mobile', primary: false };
  newAddress: Address = this.getInitialAddress();
  editingPhoneIndex = -1;
  editingAddressIndex = -1;
  
  statuses: DropdownOption[] = [ { label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }, { label: 'Pending', value: 'pending' }, { label: 'Suspended', value: 'suspended' }, { label: 'Blocked', value: 'blocked' }];
  phoneTypes: DropdownOption[] = [ { label: 'Mobile', value: 'mobile' }, { label: 'Work', value: 'work' }, { label: 'Home', value: 'home' }];
  addressTypes: DropdownOption[] = [ { label: 'Shipping', value: 'shipping' }, { label: 'Billing', value: 'billing' }, { label: 'Work', value: 'work' }, { label: 'Home', value: 'home' }];
  
  customerIDDropdown: CustomerDropdownOption[] = [];
  selectedGuaranter: any;
  selectedCustomerId: string | null = null;

  @ViewChild('fileUploader') fileUploader!: FileUpload;

  constructor(
    private customerService: CustomerService,
    private autoPopulate: AutopopulateService,
    private messageService: AppMessageService,
    public commonMethodService: CommonMethodService,
  ) {}

  ngOnInit(): void {
    this.loadCustomerDropdown();
    if (this.customerId) {
      this.selectedCustomerId = this.customerId;
    } else {
      this.isLoading = false;
    }
  }
  
  getInitialCustomer(): Customer {
    return { fullname: '', profileImg: '', mobileNumber: '', email: '', status: 'active', phoneNumbers: [], addresses: [], cart: { items: [] }, totalPurchasedAmount: 0, remainingAmount: 0, paymentHistory: [], metadata: {} };
  }
  
  getInitialAddress(): Address {
    return { street: '', city: '', state: '', zipCode: '', country: '', type: 'home', isDefault: false, location: { type: 'Point', coordinates: [null, null] } };
  }

  loadCustomerData(): void {
    if (!this.customerId) {
        this.customer = this.getInitialCustomer();
        this.selectedGuaranter = null;
        this.isLoading = false;
        return;
    };
    this.isLoading = true;
    this.customerService.getCustomerDataWithId(this.customerId).subscribe({
        next: (res) => {
            // if (res.success) {
                this.customer = res.data;
                this.customer.fullname=res.data.fullname
                this.setSelectedGuarantor();
            // }
            this.isLoading = false;
        },
        error: () => this.isLoading = false
    });
  }

  loadCustomerDropdown(): void {
      this.autoPopulate.getModuleData('customers').subscribe((data: any) => {
          this.customerIDDropdown = data;
          if (this.customerId) {
            this.loadCustomerData();
          }
      });
  }
  
  private setSelectedGuarantor(): void {
      if (this.customer && this.customer.guaranteerId && this.customerIDDropdown.length > 0) {
          this.selectedGuaranter = this.customerIDDropdown.find(c => c._id === this.customer.guaranteerId);
      }
  }

 onCustomerSelect(event: any): void {
      const selectedId = event.value; 
      this.customerId = selectedId;
      
      if (this.customerId) {
        this.loadCustomerData();
      } else {
        // Handle case where the user clears the selection
        this.customer = this.getInitialCustomer();
        this.selectedGuaranter = null;
      }
  }

  saveCustomer(): void {
    if (this.customerForm.invalid) {
        this.messageService.showError('Validation Error', 'Please fill in all required fields.');
        return;
    }
    this.customer.guaranteerId = this.selectedGuaranter?._id;
    const operation = this.customerId 
        ? this.customerService.updateCustomer(this.customerId, this.customer)
        : this.customerService.createNewCustomer(this.customer);

    operation.subscribe(res => {
      if (res.success) {
        this.messageService.showSuccess('Success', `Customer ${this.customerId ? 'updated' : 'created'} successfully`);
        if (!this.customerId && res.data?._id) {
            this.customerId = res.data._id;
            this.selectedCustomerId = res.data._id;
        }
        this.loadCustomerDropdown(); // Refresh dropdown and then customer data
      }
    });
  }

  // --- Phone Number Management ---
  showPhoneDialog(index?: number): void {
    if (index !== undefined) {
      this.editingPhoneIndex = index;
      this.newPhoneNumber = { ...this.customer.phoneNumbers[index] };
    } else {
      this.editingPhoneIndex = -1;
      this.newPhoneNumber = { number: '', type: 'mobile', primary: false };
    }
    this.phoneDialogVisible = true;
  }

  addPhoneNumber(): void {
    if (this.editingPhoneIndex > -1) {
      this.customer.phoneNumbers[this.editingPhoneIndex] = this.newPhoneNumber;
    } else {
      this.customer.phoneNumbers.push(this.newPhoneNumber);
    }
    this.phoneDialogVisible = false;
  }

  deletePhone(index: number): void {
    this.customer.phoneNumbers.splice(index, 1);
  }

  // --- Address Management ---
  showAddressDialog(index?: number): void {
    if (index !== undefined) {
      this.editingAddressIndex = index;
      this.newAddress = { ...this.customer.addresses[index] };
    } else {
      this.editingAddressIndex = -1;
      this.newAddress = this.getInitialAddress();
    }
    this.addressDialogVisible = true;
  }

  addAddress(): void {
    if (this.editingAddressIndex > -1) {
      this.customer.addresses[this.editingAddressIndex] = this.newAddress;
    } else {
      this.customer.addresses.push(this.newAddress);
    }
    this.addressDialogVisible = false;
  }

  removeAddress(index: number): void {
    this.customer.addresses.splice(index, 1);
  }

  setDefaultAddress(index: number): void {
    this.customer.addresses.forEach((addr, i) => addr.isDefault = i === index);
  }
  
  handleFileUpload(event: { files: File[] }): void {
      const file = event.files[0];
      if (file && this.customerId) {
          const formData = new FormData();
          formData.append('image', file);
          this.customerService.uploadProfileImage(formData, this.customerId).subscribe(res => {
              if(res.success) {
                  this.customer.profileImg = res.data.imageUrl;
                  this.messageService.showSuccess('Success', 'Profile image updated!');
              }
          });
      } else if (!this.customerId) {
          this.messageService.showWarn('Save Customer First', 'Please save the new customer before uploading an image.');
          this.fileUploader.clear();
      }
  }
}