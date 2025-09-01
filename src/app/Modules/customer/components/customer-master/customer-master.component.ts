
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

// App Services & Utilities
import { CustomerService } from '../../../../core/services/customer.service';
import { CommonMethodService } from '../../../../core/Utils/common-method.service';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { AppMessageService } from '../../../../core/services/message.service';

// Interfaces
interface Location {
  type: 'Point';
  coordinates: [number, number];
}

interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type: string;
  isDefault: boolean;
  location: Location;
}

interface Phone {
  _id?: string;
  number: string;
  type: string;
  primary: boolean;
}

interface Customer {
  _id?: string;
  fullname: string;
  profileImg: string;
  email: string;
  status: string;
  mobileNumber: string;
  phoneNumbers: Phone[];
  addresses: Address[];
  cart: { items: any[] };
  guaranteerId?: string;
  totalPurchasedAmount: number;
  remainingAmount: number;
  paymentHistory: any[];
  metadata: any;
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
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    FileUploadModule,
    ToastModule,
    DialogModule,
    TableModule,
    CheckboxModule,
    AvatarModule,
    CardModule,
    SkeletonModule,
    TooltipModule,
    TagModule,
  ],
  templateUrl: './customer-master.component.html',
  styleUrls: ['./customer-master.component.css'],
  providers: [MessageService]
})
export class CustomerMasterComponent implements OnInit {
  @Input() customerId!: string;
  customerForm!: FormGroup;
  isLoading = true;

  phoneDialogForm!: FormGroup;
  addressDialogForm!: FormGroup;

  phoneDialogVisible = false;
  addressDialogVisible = false;
  editingPhoneIndex: number | null = null;
  editingAddressIndex: number | null = null;

  statuses: DropdownOption[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Blocked', value: 'blocked' }
  ];
  phoneTypes: DropdownOption[] = [
    { label: 'Mobile', value: 'mobile' },
    { label: 'Work', value: 'work' },
    { label: 'Home', value: 'home' }
  ];
  addressTypes: DropdownOption[] = [
    { label: 'Shipping', value: 'shipping' },
    { label: 'Billing', value: 'billing' },
    { label: 'Work', value: 'work' },
    { label: 'Home', value: 'home' }
  ];
  customerIDDropdown: CustomerDropdownOption[] = [];
  selectedCustomerId: string | null = null;
  displayCustomer: Partial<Customer> = {};

  @ViewChild('fileUploader') fileUploader!: FileUpload;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private autoPopulate: AutopopulateService,
    private messageService: AppMessageService,
    public commonMethodService: CommonMethodService,
  ) { }

  ngOnInit(): void {
    this.initCustomerForm();
    this.initDialogForms();
    this.loadCustomerDropdown();

    if (this.customerId) {
      this.selectedCustomerId = this.customerId;
    } else {
      this.isLoading = false;
      this.displayCustomer = { fullname: 'New Customer' };
    }
  }

  initCustomerForm(): void {
    this.customerForm = this.fb.group({
      _id: [null],
      fullname: ['', Validators.required],
      email: ['', Validators.email],
      status: ['active', Validators.required],
      guaranteerId: [null],
      phoneNumbers: this.fb.array([]),
      addresses: this.fb.array([]),
      profileImg: ['']
    });

    this.customerForm.valueChanges.subscribe(value => {
      this.displayCustomer = { ...this.displayCustomer, ...value };
    });
  }

  initDialogForms(): void {
    this.phoneDialogForm = this.fb.group({
      number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      type: ['mobile', Validators.required],
      primary: [false]
    });

    this.addressDialogForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: [''],
      type: ['home', Validators.required],
      isDefault: [false],
      location: this.fb.group({
        type: ['Point'],
        coordinates: this.fb.array([0, 0])
      })
    });
  }

  get phoneNumbers(): FormArray {
    return this.customerForm.get('phoneNumbers') as FormArray;
  }

  get addresses(): FormArray {
    return this.customerForm.get('addresses') as FormArray;
  }

  createPhoneGroup(phone: Partial<Phone> = {}): FormGroup {
    return this.fb.group({
      number: [phone.number || '', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      type: [phone.type || 'mobile', Validators.required],
      primary: [phone.primary || false]
    });
  }

  createAddressGroup(address: Partial<Address> = {}): FormGroup {
    const coordinates = (Array.isArray(address.location?.coordinates) && address.location.coordinates.length === 2)
      ? address.location.coordinates
      : [0, 0];

    return this.fb.group({
      street: [address.street || '', Validators.required],
      city: [address.city || '', Validators.required],
      state: [address.state || '', Validators.required],
      zipCode: [address.zipCode || '', Validators.required],
      country: [address.country || ''],
      type: [address.type || 'home', Validators.required],
      isDefault: [address.isDefault || false],
      location: this.fb.group({
        type: ['Point'],
        coordinates: this.fb.array(coordinates)
      })
    });
  }

  loadCustomerData(): void {
    if (!this.customerId) {
      this.customerForm.reset({
        fullname: '',
        email: '',
        status: 'active',
        guaranteerId: null,
        profileImg: ''
      });
      this.phoneNumbers.clear();
      this.addresses.clear();
      this.displayCustomer = { fullname: 'New Customer' };
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.customerService.getCustomerDataWithId(this.customerId).subscribe({
      next: (res) => {
        const customer = res.data;
        this.customerForm.patchValue(customer);
        this.displayCustomer = customer;

        this.phoneNumbers.clear();
        if (customer.phoneNumbers && customer.phoneNumbers.length > 0) {
          customer.phoneNumbers.forEach((phone: Phone) => {
            this.phoneNumbers.push(this.createPhoneGroup(phone));
          });
        }

        this.addresses.clear();
        if (customer.addresses && customer.addresses.length > 0) {
          customer.addresses.forEach((address: Address) => {
            this.addresses.push(this.createAddressGroup(address));
          });
        }

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

  onCustomerSelect(event: any): void {
    this.customerId = event.value;
    this.loadCustomerData();
  }

  saveCustomer(): void {
    this.customerForm.markAllAsTouched();
    if (this.customerForm.invalid) {
      this.messageService.showError('Validation Error', 'Please fill in all required fields.');
      return;
    }

    const formData = this.customerForm.getRawValue();
    const primaryPhone = formData.phoneNumbers.find((p: Phone) => p.primary);
    const mobileNumber = primaryPhone ? primaryPhone.number : (formData.phoneNumbers[0]?.number || '');
    const finalData = { ...formData, mobileNumber };

    finalData.addresses.forEach((address: Address) => {
      if (address.location && Array.isArray(address.location.coordinates)) {
        address.location.coordinates = [
          Number(address.location.coordinates[0]) || 0,
          Number(address.location.coordinates[1]) || 0
        ];
      }
    });

    const operation = this.customerId
      ? this.customerService.updateCustomer(this.customerId, finalData)
      : this.customerService.createNewCustomer(finalData);

    operation.subscribe(res => {
      if (res.success) {
        this.messageService.showSuccess('Success', `Customer ${this.customerId ? 'updated' : 'created'} successfully`);
        if (!this.customerId && res.data?._id) {
          this.customerId = res.data._id;
          this.selectedCustomerId = res.data._id;
          this.customerForm.patchValue({ _id: res.data._id });
        }
        this.loadCustomerDropdown();
      }
    });
  }

  // --- Phone Number Management ---
  showPhoneDialog(index?: number): void {
    if (index !== undefined && index !== null) {
      this.editingPhoneIndex = index;
      this.phoneDialogForm.patchValue(this.phoneNumbers.at(index).value);
    } else {
      this.editingPhoneIndex = null;
      this.phoneDialogForm.reset({ number: '', type: 'mobile', primary: false });
    }
    this.phoneDialogVisible = true;
  }

  savePhone(): void {
    if (this.phoneDialogForm.invalid) return;

    if (this.editingPhoneIndex !== null) {
      this.phoneNumbers.at(this.editingPhoneIndex).patchValue(this.phoneDialogForm.value);
    } else {
      this.phoneNumbers.push(this.createPhoneGroup(this.phoneDialogForm.value));
    }
    this.phoneDialogVisible = false;
  }

  deletePhone(index: number): void {
    this.phoneNumbers.removeAt(index);
  }

  // --- Address Management ---
  showAddressDialog(index?: number): void {
    if (index !== undefined && index !== null) {
      this.editingAddressIndex = index;
      this.addressDialogForm.patchValue(this.addresses.at(index).value);
    } else {
      this.editingAddressIndex = null;
      this.addressDialogForm.reset({
        street: '', city: '', state: '', zipCode: '', country: '',
        type: 'home', isDefault: false,
        location: { type: 'Point', coordinates: [0, 0] }
      });
    }
    this.addressDialogVisible = true;
  }

  saveAddress(): void {
    if (this.addressDialogForm.invalid) return;

    if (this.editingAddressIndex !== null) {
      this.addresses.at(this.editingAddressIndex).patchValue(this.addressDialogForm.value);
    } else {
      this.addresses.push(this.createAddressGroup(this.addressDialogForm.value));
    }
    this.addressDialogVisible = false;
  }

  removeAddress(index: number): void {
    this.addresses.removeAt(index);
  }


    handleFileUpload(event: { files: File[] }): void {
      const file = event.files[0];
      if (file && this.customerId) {
        const formData = new FormData();
        formData.append('profileImg', file);

        // 3. Call the method from the INJECTED service
        this.customerService.uploadProfileImage(formData, this.customerId).subscribe(res => {
          if (res.status === 'success') {
            const newImageUrl = res.data.customer.profileImg;
            this.customerForm.patchValue({ profileImg: newImageUrl });
            this.messageService.showSuccess('Success', 'Profile image updated!');
          }
        });
      }
      // ...
    }
  }
  // handleFileUpload(event: { files: File[] }): void {
  //   const file = event.files[0];

  //   // Ensure we have a file and a customerId before proceeding
  //   if (file && this.customerId) {
  //     const formData = new FormData();

  //     // *** FIX 1: The key must match the backend's multer configuration ***
  //     // Backend expects 'profileImg', so we use that here.
  //     formData.append('profileImg', file);

  //     this.customerService.uploadProfileImage(formData, this.customerId).subscribe(res => {
  //       if (res.status === 'success') {

  //         // *** FIX 2: The response structure from the backend has changed ***
  //         // The URL is now located at res.data.customer.profileImg
  //         const newImageUrl = res.data.customer.profileImg;

  //         // Patch the form with the new URL returned from the server
  //         this.customerForm.patchValue({ profileImg: newImageUrl });

  //         // Notify the user of the success
  //         this.messageService.showSuccess('Success', 'Profile image updated!');
  //       }
  //     });
  //   } else if (!this.customerId) {
  //     // Handle case where a customer hasn't been saved yet
  //     this.messageService.showWarn('Save Customer First', 'Please save the new customer before uploading an image.');
  //     if (this.fileUploader) {
  //       this.fileUploader.clear();
  //     }
  //   }
  // }
  
  getSeverityForType(status: string) {
    switch (status?.toLowerCase()) {
      case 'home': return 'warn';
      case 'work': case 'paid': return 'success';
      case 'cancelled': return 'danger';
      default: return 'info';
    }
  }
}



// import { Component, Input, OnInit, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { SelectModule } from 'primeng/select';
// import { FileUpload, FileUploadModule } from 'primeng/fileupload';
// import { ToastModule } from 'primeng/toast';
// import { MessageService } from 'primeng/api';
// import { DialogModule } from 'primeng/dialog';
// import { TableModule } from 'primeng/table';
// import { CheckboxModule } from 'primeng/checkbox';
// import { AvatarModule } from 'primeng/avatar';
// import { CardModule } from 'primeng/card';
// import { SkeletonModule } from 'primeng/skeleton';
// import { TooltipModule } from 'primeng/tooltip';
// import { TagModule } from 'primeng/tag';
// import { filter } from 'rxjs/operators';

// // App Services & Utilities
// import { CustomerService } from '../../../../core/services/customer.service';
// import { CommonMethodService } from '../../../../core/Utils/common-method.service';
// import { AutopopulateService } from '../../../../core/services/autopopulate.service';
// import { AppMessageService } from '../../../../core/services/message.service';
// import { ConfirmationService } from '../../../../core/services/confirmationService'; 

// // ... (interfaces remain the same) ...

// interface Location {
//     type: 'Point';
//     coordinates: [number, number];
// }

// interface Address {
//     _id?: string;
//     street: string;
//     city: string;
//     state: string;
//     zipCode: string;
//     country: string;
//     type: string;
//     isDefault: boolean;
//     location: Location;
// }

// interface Phone {
//     _id?: string;
//     number: string;
//     type: string;
//     primary: boolean;
// }

// interface Customer {
//     _id?: string;
//     fullname: string;
//     profileImg: string;
//     email: string;
//     status: string;
//     mobileNumber: string;
//     phoneNumbers: Phone[];
//     addresses: Address[];
//     cart: { items: any[] };
//     guaranteerId?: string;
//     totalPurchasedAmount: number;
//     remainingAmount: number;
//     paymentHistory: any[];
//     metadata: any;
// }

// interface DropdownOption {
//     label: string;
//     value: any;
// }

// interface CustomerDropdownOption {
//     fullname: string;
//     _id: any;
//     phoneNumbers: Phone[];
// }


// @Component({
//     selector: 'app-customer-master',
//     standalone: true,
//     imports: [
//         CommonModule,
//         FormsModule,
//         ReactiveFormsModule,
//         ButtonModule,
//         InputTextModule,
//         SelectModule,
//         FileUploadModule,
//         ToastModule,
//         DialogModule,
//         TableModule,
//         CheckboxModule,
//         AvatarModule,
//         CardModule,
//         SkeletonModule,
//         TooltipModule,
//         TagModule
//     ],
//     templateUrl: './customer-master.component.html',
//     styleUrls: ['./customer-master.component.css'],
//     providers: [MessageService]
// })
// export class CustomerMasterComponent implements OnInit {
//     @Input() customerId!: string;
//     customerForm!: FormGroup;
//     isLoading = true;

//     phoneDialogForm!: FormGroup;
//     addressDialogForm!: FormGroup;

//     phoneDialogVisible = false;
//     addressDialogVisible = false;
//     editingPhoneIndex: number | null = null;
//     editingAddressIndex: number | null = null;

//     statuses: DropdownOption[] = [
//         { label: 'Active', value: 'active' },
//         { label: 'Inactive', value: 'inactive' },
//         { label: 'Pending', value: 'pending' },
//         { label: 'Suspended', value: 'suspended' },
//         { label: 'Blocked', value: 'blocked' }
//     ];
//     phoneTypes: DropdownOption[] = [
//         { label: 'Mobile', value: 'mobile' },
//         { label: 'Work', value: 'work' },
//         { label: 'Home', value: 'home' }
//     ];
//     addressTypes: DropdownOption[] = [
//         { label: 'Shipping', value: 'shipping' },
//         { label: 'Billing', value: 'billing' },
//         { label: 'Work', value: 'work' },
//         { label: 'Home', value: 'home' }
//     ];
//     customerIDDropdown: CustomerDropdownOption[] = [];
//     selectedCustomerId: string | null = null;
//     displayCustomer: Partial<Customer> = {};

//     @ViewChild('fileUploader') fileUploader!: FileUpload;

//     constructor(
//         private fb: FormBuilder,
//         private customerService: CustomerService,
//         private autoPopulate: AutopopulateService,
//         private messageService: AppMessageService,
//         public commonMethodService: CommonMethodService,
//         private confirmationService: ConfirmationService // 2. Inject the service
//     ) { }

//     ngOnInit(): void {
//         this.initCustomerForm();
//         this.initDialogForms();
//         this.loadCustomerDropdown();

//         if (this.customerId) {
//             this.selectedCustomerId = this.customerId;
//         } else {
//             this.isLoading = false;
//             this.displayCustomer = { fullname: 'New Customer' };
//         }
//     }

//     initCustomerForm(): void {
//         this.customerForm = this.fb.group({
//             _id: [null],
//             fullname: ['', Validators.required],
//             email: ['', Validators.email],
//             status: ['active', Validators.required],
//             guaranteerId: [null],
//             phoneNumbers: this.fb.array([]),
//             addresses: this.fb.array([]),
//             profileImg: ['']
//         });

//         this.customerForm.valueChanges.subscribe(value => {
//             this.displayCustomer = { ...this.displayCustomer, ...value };
//         });
//     }

//     initDialogForms(): void {
//         this.phoneDialogForm = this.fb.group({
//             number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
//             type: ['mobile', Validators.required],
//             primary: [false]
//         });

//         this.addressDialogForm = this.fb.group({
//             street: ['', Validators.required],
//             city: ['', Validators.required],
//             state: ['', Validators.required],
//             zipCode: ['', Validators.required],
//             country: [''],
//             type: ['home', Validators.required],
//             isDefault: [false],
//             location: this.fb.group({
//                 type: ['Point'],
//                 coordinates: this.fb.array([0, 0])
//             })
//         });
//     }

//     get phoneNumbers(): FormArray {
//         return this.customerForm.get('phoneNumbers') as FormArray;
//     }

//     get addresses(): FormArray {
//         return this.customerForm.get('addresses') as FormArray;
//     }

//     createPhoneGroup(phone: Partial<Phone> = {}): FormGroup {
//         return this.fb.group({
//             number: [phone.number || '', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
//             type: [phone.type || 'mobile', Validators.required],
//             primary: [phone.primary || false]
//         });
//     }

//     createAddressGroup(address: Partial<Address> = {}): FormGroup {
//         const coordinates = (Array.isArray(address.location?.coordinates) && address.location.coordinates.length === 2)
//             ? address.location.coordinates
//             : [0, 0];

//         return this.fb.group({
//             street: [address.street || '', Validators.required],
//             city: [address.city || '', Validators.required],
//             state: [address.state || '', Validators.required],
//             zipCode: [address.zipCode || '', Validators.required],
//             country: [address.country || ''],
//             type: [address.type || 'home', Validators.required],
//             isDefault: [address.isDefault || false],
//             location: this.fb.group({
//                 type: ['Point'],
//                 coordinates: this.fb.array(coordinates)
//             })
//         });
//     }

//     loadCustomerData(): void {
//         if (!this.customerId) {
//             this.customerForm.reset({
//                 fullname: '',
//                 email: '',
//                 status: 'active',
//                 guaranteerId: null,
//                 profileImg: ''
//             });
//             this.phoneNumbers.clear();
//             this.addresses.clear();
//             this.displayCustomer = { fullname: 'New Customer' };
//             this.isLoading = false;
//             return;
//         }

//         this.isLoading = true;
//         this.customerService.getCustomerDataWithId(this.customerId).subscribe({
//             next: (res) => {
//                 const customer = res.data;
//                 this.customerForm.patchValue(customer);
//                 this.displayCustomer = customer;

//                 this.phoneNumbers.clear();
//                 if (customer.phoneNumbers && customer.phoneNumbers.length > 0) {
//                     customer.phoneNumbers.forEach((phone: Phone) => {
//                         this.phoneNumbers.push(this.createPhoneGroup(phone));
//                     });
//                 }

//                 this.addresses.clear();
//                 if (customer.addresses && customer.addresses.length > 0) {
//                     customer.addresses.forEach((address: Address) => {
//                         this.addresses.push(this.createAddressGroup(address));
//                     });
//                 }

//                 this.isLoading = false;
//             },
//             error: () => this.isLoading = false
//         });
//     }

//     loadCustomerDropdown(): void {
//         this.autoPopulate.getModuleData('customers').subscribe((data: any) => {
//             this.customerIDDropdown = data;
//             if (this.customerId) {
//                 this.loadCustomerData();
//             }
//         });
//     }

//     onCustomerSelect(event: any): void {
//         this.customerId = event.value;
//         this.loadCustomerData();
//     }

//     saveCustomer(): void {
//         this.customerForm.markAllAsTouched();
//         if (this.customerForm.invalid) {
//             this.messageService.showError('Validation Error', 'Please fill in all required fields.');
//             return;
//         }

//         const formData = this.customerForm.getRawValue();
//         const primaryPhone = formData.phoneNumbers.find((p: Phone) => p.primary);
//         const mobileNumber = primaryPhone ? primaryPhone.number : (formData.phoneNumbers[0]?.number || '');
//         const finalData = { ...formData, mobileNumber };

//         finalData.addresses.forEach((address: Address) => {
//             if (address.location && Array.isArray(address.location.coordinates)) {
//                 address.location.coordinates = [
//                     Number(address.location.coordinates[0]) || 0,
//                     Number(address.location.coordinates[1]) || 0
//                 ];
//             }
//         });

//         const operation = this.customerId
//             ? this.customerService.updateCustomer(this.customerId, finalData)
//             : this.customerService.createNewCustomer(finalData);

//         operation.subscribe(res => {
//             if (res.success) {
//                 this.messageService.showSuccess('Success', `Customer ${this.customerId ? 'updated' : 'created'} successfully`);
//                 if (!this.customerId && res.data?._id) {
//                     this.customerId = res.data._id;
//                     this.selectedCustomerId = res.data._id;
//                     this.customerForm.patchValue({ _id: res.data._id });
//                 }
//                 this.loadCustomerDropdown();
//             }
//         });
//     }

//     // --- Phone Number Management ---
//     showPhoneDialog(index?: number): void {
//         if (index !== undefined && index !== null) {
//             this.editingPhoneIndex = index;
//             this.phoneDialogForm.patchValue(this.phoneNumbers.at(index).value);
//         } else {
//             this.editingPhoneIndex = null;
//             this.phoneDialogForm.reset({ number: '', type: 'mobile', primary: false });
//         }
//         this.phoneDialogVisible = true;
//     }

//     savePhone(): void {
//         if (this.phoneDialogForm.invalid) return;

//         if (this.editingPhoneIndex !== null) {
//             this.phoneNumbers.at(this.editingPhoneIndex).patchValue(this.phoneDialogForm.value);
//         } else {
//             this.phoneNumbers.push(this.createPhoneGroup(this.phoneDialogForm.value));
//         }
//         this.phoneDialogVisible = false;
//     }

//     // 3. This is the updated method using the service
//     deletePhone(index: number): void {
//         const phone = this.phoneNumbers.at(index).value;

//         this.confirmationService.confirm({
//             message: `Are you sure you want to delete the phone number ${phone.number}?`,
//             header: 'Delete Confirmation',
//             icon: 'pi pi-exclamation-triangle'
//         }).pipe(
//             filter(accepted => accepted) // Only proceed if the user clicked "Yes"
//         ).subscribe(() => {
//             this.phoneNumbers.removeAt(index);
//             this.messageService.showSuccess('Deleted', 'Phone number has been removed.');
//         });
//     }

//     // --- Address Management ---
//     showAddressDialog(index?: number): void {
//         if (index !== undefined && index !== null) {
//             this.editingAddressIndex = index;
//             this.addressDialogForm.patchValue(this.addresses.at(index).value);
//         } else {
//             this.editingAddressIndex = null;
//             this.addressDialogForm.reset({
//                 street: '', city: '', state: '', zipCode: '', country: '',
//                 type: 'home', isDefault: false,
//                 location: { type: 'Point', coordinates: [0, 0] }
//             });
//         }
//         this.addressDialogVisible = true;
//     }

//     saveAddress(): void {
//         if (this.addressDialogForm.invalid) return;

//         if (this.editingAddressIndex !== null) {
//             this.addresses.at(this.editingAddressIndex).patchValue(this.addressDialogForm.value);
//         } else {
//             this.addresses.push(this.createAddressGroup(this.addressDialogForm.value));
//         }
//         this.addressDialogVisible = false;
//     }

//     removeAddress(index: number): void {
//         this.addresses.removeAt(index);
//     }

//     // --- File Upload ---
//     handleFileUpload(event: { files: File[] }): void {
//         const file = event.files[0];
//         if (file && this.customerId) {
//             const formData = new FormData();
//             formData.append('image', file);
//             this.customerService.uploadProfileImage(formData, this.customerId).subscribe(res => {
//                 if (res.success) {
//                     this.customerForm.patchValue({ profileImg: res.data.imageUrl });
//                     this.messageService.showSuccess('Success', 'Profile image updated!');
//                 }
//             });
//         } else if (!this.customerId) {
//             this.messageService.showWarn('Save Customer First', 'Please save the new customer before uploading an image.');
//             this.fileUploader.clear();
//         }
//     }


// //   getSeverityForType(status: string) {
// //     switch (status?.toLowerCase()) {
// //       case 'home': return 'warn';
// //       case 'work': case 'paid': return 'success';
// //       case 'cancelled': return 'danger';
// //       default: return 'info';
// //     }
// //   }
//     // getSeverityForType(type: string): string {
//     //     switch (type?.toLowerCase()) {
//     //         case 'home': return 'warning';
//     //         case 'work': return 'success';
//     //         case 'billing': return 'info';
//     //         case 'shipping': return 'primary';
//     //         default: return 'secondary';
//     //     }
//     // }
// }
