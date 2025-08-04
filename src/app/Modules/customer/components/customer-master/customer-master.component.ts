import { IftaLabelModule } from 'primeng/iftalabel';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { FileUploadModule, UploadEvent } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';
import { KeyFilterModule } from 'primeng/keyfilter';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ConfirmationService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { FileUpload } from 'primeng/fileupload';
import { CustomerService } from '../../../../core/services/customer.service';
import { FocusTrapModule } from 'primeng/focustrap';// import { SupabaseService } from '../../../core/services/supabase.service';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { AppMessageService } from '../../../../core/services/message.service';
interface Customer {
  fullname: string;
  profileImg: string;
  email: string;
  status: string;
  mobileNumber: number;
  phoneNumbers: Phone[];
  addresses: Address[];
  cart: { items: any[] };
  guaranteerId: string;
  totalPurchasedAmount: number;
  remainingAmount: number;
  paymentHistory: any[];
  metadata: any;
}

interface Phone {
  number: string;
  type: string;
  primary: boolean;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type: string;
  isDefault: boolean;
}

interface DropdownOption {
  label: string;
  value: any;
}

interface CustomerDropdownOption {
  fullname: string;
  _id: any;
  phoneNumbers: Phone[];
}

@Component({
  selector: 'app-customer-master',
  templateUrl: './customer-master.component.html',
  styleUrls: ['./customer-master.component.css'],
  imports: [CardModule, RouterModule, FocusTrapModule, FormsModule, CommonModule, TagModule, DialogModule, KeyFilterModule, TableModule, RadioButtonModule, InputTextModule, ButtonModule, SelectModule, FileUploadModule, ImageModule,],
  providers: [CustomerService, IftaLabelModule, ConfirmationService, AppMessageService],
})

export class CustomerMasterComponent implements OnInit {
  selectedFile: File | null = null;
  imageUrl: string | null = null;
  bucketName = 'manish';
  phoneDialogVisible = false;
  addressDialogVisible = false;
  newPhoneNumber: Phone = { number: '', type: 'mobile', primary: false };
  newAddress: Address = { street: '', city: '', state: '', zipCode: '', country: '', type: 'home', isDefault: false };
  customerId: string = '12345';
  uploadStatus: string = '';
  customerIDDropdown: CustomerDropdownOption[] = [];
  selectedGuaranter: CustomerDropdownOption | any = {};
  isDarkMode: boolean = false;
  editingPhoneIndex: number = -1;
  editingAddressIndex: number = -1;

  statuses: DropdownOption[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Blocked', value: 'blocked' },
  ];

  phoneTypes: DropdownOption[] = [
    { label: 'Home', value: 'home' },
    { label: 'Mobile', value: 'mobile' },
    { label: 'Work', value: 'work' },
  ];

  addressTypes: DropdownOption[] = [
    { label: 'Billing', value: 'billing' },
    { label: 'Shipping', value: 'shipping' },
    { label: 'Home', value: 'home' },
    { label: 'Work', value: 'work' }
  ];


  customer: Customer = {
    fullname: '',
    profileImg: '',
    mobileNumber: 0,
    email: '',
    status: '',
    phoneNumbers: [],
    addresses: [],
    cart: { items: [] },
    guaranteerId: this.selectedGuaranter._id,
    totalPurchasedAmount: 0,
    remainingAmount: 0,
    paymentHistory: [],
    metadata: {},
  };

  @ViewChild('fileUploader') fileUploader!: FileUpload;

  uploadedFiles: any[] = [];
  onUpload(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.fileUploader.clear();
  }


  constructor(
    // private supabase: SupabaseService,
    private CustomerService: CustomerService,
    private http: HttpClient,
    private autoPopulate: AutopopulateService,
    private messageService: AppMessageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isDarkMode = (isPlatformBrowser(this.platformId)) && localStorage.getItem('darkMode') === 'true';
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }

  ngOnInit() {
    this.autopopulatedata()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.autopopulatedata();
  }


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

  selectedGuaranterevent(event: any) {
    this.selectedGuaranter = event.value;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('darkMode', String(this.isDarkMode));
    }
  }

  getCustomerID() {
    const customerId = 'your-customer-id';
    this.CustomerService.getCustomerDataWithId(customerId)
      .subscribe({
        next: (customer) => {
          this.customer = customer;
        },
        error: (err) => {
          console.error('Error fetching customer:', err);
          this.messageService.showError('Failed to load customer data.');
        }
      });
  }


  handleFileSelect(event?: any) {
    const file = event.files[0];
    if (file) {
      this.uploadStatus = 'Preparing to upload...';
      const formData = new FormData();
      formData.append('image', file);
      this.CustomerService.uploadProfileImage(formData, this.customerId).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.uploadStatus = 'Image uploaded successfully!';
            this.messageService.showSuccess('Success', 'Profile image uploaded successfully.');
          } else {
            this.uploadStatus = 'Error uploading image.';
            this.messageService.showError('Error', response.message || 'Failed to upload image.');
          }
        },
        (error: any) => {
          this.uploadStatus = 'Error uploading image.';
          const errorMessage = error.error?.message || 'An error occurred while uploading the image.';
          this.messageService.showError('Error', errorMessage);
        }
      );
    } else {
      this.messageService.showWarn('Warning', 'No file selected.');
    }
  }

  handleFileUpload(event: any) {
  }



  saveCustomer() {
    if (this.validateCustomer()) {
      this.customer.guaranteerId = this.selectedGuaranter._id;
      this.customer.mobileNumber = Number(this.customer.phoneNumbers[0].number); // Convert string to number
      this.CustomerService.createNewCustomer(this.customer).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.messageService.showSuccess('Success', 'Customer created successfully.');
            const customerId = response.data._id;
            this.customerId = customerId;
          } else {
            this.messageService.showError('Error', response.message || 'Failed to create customer.');
          }
        },
        (error) => {
          // Handle HTTP errors
          const errorMessage = error.error?.message || 'An unexpected error occurred.';
          this.messageService.showError('Error', errorMessage);
        }
      );
    } else {
      this.messageService.showError('Validation Error', 'Please fill in all required fields.');
    }
  }

  validateCustomer(): boolean {
    if (!this.customer.fullname) {
      this.messageService.showError('Fullname is required.')
      return false;
    }

    if (!this.customer.email || !this.customer.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
      this.messageService.showError('Please enter a valid email address.')
      return false;
    }

    return true;
  }

  showPhoneDialog() {
    this.editingPhoneIndex = -1; // Reset to add new phone number
    this.newPhoneNumber = { number: '', type: 'mobile', primary: false }; // Reset newPhoneNumber
    this.phoneDialogVisible = true;
  }
  showAddressDialog() {
    this.editingAddressIndex = -1; // Reset to add new address
    this.newAddress = { street: '', city: '', state: '', zipCode: '', country: '', type: 'home', isDefault: false }; // Reset newAddress
    this.addressDialogVisible = true
  }

  addPhoneNumber() {
    if (this.newPhoneNumber.number && this.newPhoneNumber.type) {
      if (this.editingPhoneIndex > -1) {
        this.customer.phoneNumbers[this.editingPhoneIndex] = { ...this.newPhoneNumber };
        this.messageService.showSuccess('Success', 'Phone number updated successfully.');
      } else {
        this.customer.phoneNumbers.push({ ...this.newPhoneNumber });
        this.messageService.showSuccess('Success', 'Phone number added successfully.');
      }
      this.phoneDialogVisible = false;
      this.newPhoneNumber = { number: '', type: 'mobile', primary: false };
      this.editingPhoneIndex = -1;
    } else {
      this.messageService.showError('Error', 'Please enter phone number and type.');
    }
  }

  deletePhone(index: number) {
    this.customer.phoneNumbers.splice(index, 1);
  }


  addAddress() {
    if (this.newAddress.street && this.newAddress.city) {
      if (this.editingAddressIndex > -1) {
        this.customer.addresses[this.editingAddressIndex] = { ...this.newAddress };
        this.messageService.showSuccess('Success', 'Address updated successfully.');
      } else {
        this.customer.addresses.push({ ...this.newAddress });
        this.messageService.showSuccess('Success', 'Address added successfully.');
      }
      this.addressDialogVisible = false;
      this.newAddress = {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        type: 'home',
        isDefault: false,
      };
      this.editingAddressIndex = -1;
    } else {
      this.messageService.showError('Error', 'Please enter street and city.');
    }
  }

  setDefaultAddress(index: number) {
    this.customer.addresses.forEach((address: { isDefault: boolean; }, i: any) => address.isDefault = i === index);
  }

  editAddress(index: number) {
    this.editingAddressIndex = index;
    this.newAddress = { ...this.customer.addresses[index] };
    this.addressDialogVisible = true;
  }

  editPhone(index: number) {
    this.editingPhoneIndex = index;
    this.newPhoneNumber = { ...this.customer.phoneNumbers[index] };
    this.phoneDialogVisible = true;
  }

  removeAddress(index: number) {
    this.customer.addresses.splice(index, 1);
  }
}
