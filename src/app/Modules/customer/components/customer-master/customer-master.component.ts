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
    TagModule
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

  // --- File Upload ---
  handleFileUpload(event: { files: File[] }): void {
    const file = event.files[0];
    if (file && this.customerId) {
      const formData = new FormData();
      formData.append('image', file);
      this.customerService.uploadProfileImage(formData, this.customerId).subscribe(res => {
        if (res.success) {
          this.customerForm.patchValue({ profileImg: res.data.imageUrl });
          this.messageService.showSuccess('Success', 'Profile image updated!');
        }
      });
    } else if (!this.customerId) {
      this.messageService.showWarn('Save Customer First', 'Please save the new customer before uploading an image.');
      this.fileUploader.clear();
    }
  }
  
  getSeverityForType(status: string) {
    switch (status?.toLowerCase()) {
      case 'home': return 'warn';
      case 'work': case 'paid': return 'success';
      case 'cancelled': return 'danger';
      default: return 'info';
    }
  }
  // getSeverityForType(type: string): string {
  //   switch (type?.toLowerCase()) {
  //     case 'home': return 'warning';
  //     case 'work': return 'success';
  //     case 'billing': return 'info';
  //     case 'shipping': return 'primary';
  //     default: return 'secondary';
  //   }
  // }
}
// import { Component, Input, OnInit, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// // Import ReactiveFormsModule and related classes
// import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { SelectModule } from 'primeng/select';
// import { FileUploadModule, FileUpload } from 'primeng/fileupload';
// import { ToastModule } from 'primeng/toast';
// import { MessageService } from 'primeng/api';
// import { DialogModule } from 'primeng/dialog';
// import { TableModule } from 'primeng/table';
// import { CheckboxModule } from 'primeng/checkbox';
// import { AvatarModule } from 'primeng/avatar';
// import { CardModule } from 'primeng/card';
// import { SkeletonModule } from 'primeng/skeleton';
// import { TooltipModule } from 'primeng/tooltip';
// import { Tag } from "primeng/tag";

// // App Services & Utilities
// import { CustomerService } from '../../../../core/services/customer.service';
// import { CommonMethodService } from '../../../../core/Utils/common-method.service';
// import { AutopopulateService } from '../../../../core/services/autopopulate.service';
// import { AppMessageService } from '../../../../core/services/message.service';

// // Interfaces (assuming they are in a separate file or defined here)
// interface Location {
//   type: 'Point';
//   coordinates: [number | null, number | null];
// }
// interface Address {
//   street: string; city: string; state: string; zipCode: string; country: string; type: string; isDefault: boolean; location: Location;
// }
// interface Phone {
//   number: string; type: string; primary: boolean;
// }
// interface Customer {
//   _id?: string; fullname: string; profileImg: string; email: string; status: string; mobileNumber: string; phoneNumbers: Phone[]; addresses: Address[]; cart: { items: any[] }; guaranteerId?: string; totalPurchasedAmount: number; remainingAmount: number; paymentHistory: any[]; metadata: any;
// }
// interface DropdownOption {
//   label: string; value: any;
// }
// interface CustomerDropdownOption {
//   fullname: string; _id: any; phoneNumbers: Phone[];
// }

// @Component({
//   selector: 'app-customer-master',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule, // Add ReactiveFormsModule
//     ButtonModule, InputTextModule, SelectModule,
//     FileUploadModule, ToastModule, DialogModule, TableModule, CheckboxModule,
//     AvatarModule, CardModule, SkeletonModule, TooltipModule,
//     Tag
//   ],
//   templateUrl: './customer-master.component.html',
//   styleUrls: ['./customer-master.component.css'],
//   providers: [MessageService]
// })
// export class CustomerMasterComponent implements OnInit {
//   @Input() customerId!: string;
//   // customerForm is now a FormGroup
//   customerForm!: FormGroup;
//   isLoading = true;

//   // These will be used for the dialogs' own forms
//   phoneDialogForm!: FormGroup;
//   addressDialogForm!: FormGroup;

//   phoneDialogVisible = false;
//   addressDialogVisible = false;
//   editingPhoneIndex = -1;
//   editingAddressIndex = -1;

//   statuses: DropdownOption[] = [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }, { label: 'Pending', value: 'pending' }, { label: 'Suspended', value: 'suspended' }, { label: 'Blocked', value: 'blocked' }];
//   phoneTypes: DropdownOption[] = [{ label: 'Mobile', value: 'mobile' }, { label: 'Work', value: 'work' }, { label: 'Home', value: 'home' }];
//   addressTypes: DropdownOption[] = [{ label: 'Shipping', value: 'shipping' }, { label: 'Billing', value: 'billing' }, { label: 'Work', value: 'work' }, { label: 'Home', value: 'home' }];
//   customerIDDropdown: CustomerDropdownOption[] = [];
//   selectedCustomerId: string | null = null;

//   // This property is used to display customer info in the header
//   displayCustomer: Partial<Customer> = {};

//   @ViewChild('fileUploader') fileUploader!: FileUpload;

//   constructor(
//     private fb: FormBuilder, // Inject FormBuilder
//     private customerService: CustomerService,
//     private autoPopulate: AutopopulateService,
//     private messageService: AppMessageService,
//     public commonMethodService: CommonMethodService,
//   ) { }

//   ngOnInit(): void {
//     this.initCustomerForm();
//     this.initDialogForms();
//     this.loadCustomerDropdown();

//     if (this.customerId) {
//       this.selectedCustomerId = this.customerId;
//     } else {
//       this.isLoading = false;
//       this.displayCustomer = { fullname: 'New Customer' };
//     }
//   }

//   // Initialize the main customer form structure
//   initCustomerForm(): void {
//     this.customerForm = this.fb.group({
//       _id: [null],
//       fullname: ['', Validators.required],
//       email: [''], // Email is not required as requested
//       status: ['active', Validators.required],
//       guaranteerId: [null],
//       phoneNumbers: this.fb.array([]),
//       addresses: this.fb.array([]),
//       // Add other fields that need to be part of the form value
//       profileImg: ['']
//     });

//     // Update display data when form values change
//     this.customerForm.valueChanges.subscribe(value => {
//       this.displayCustomer = {
//         ...this.displayCustomer,
//         ...value
//       };
//     });
//   }

//   // Initialize forms for the phone and address dialogs
//   initDialogForms(): void {
//     this.phoneDialogForm = this.fb.group({
//       number: ['', Validators.required],
//       type: ['mobile', Validators.required],
//       primary: [false]
//     });

//     this.addressDialogForm = this.fb.group({
//       street: ['', Validators.required],
//       city: ['', Validators.required],
//       state: ['', Validators.required],
//       zipCode: ['', Validators.required],
//       country: [''],
//       type: ['home', Validators.required],
//       isDefault: [false],
//       location: this.fb.group({
//         type: ['Point'],
//         coordinates: this.fb.array([null, null])
//       })
//     });
//   }

//   // Getters for easy access to FormArrays in the template
//   get phoneNumbers(): FormArray {
//     return this.customerForm.get('phoneNumbers') as FormArray;
//   }

//   get addresses(): FormArray {
//     return this.customerForm.get('addresses') as FormArray;
//   }

//   loadCustomerData(): void {
//     if (!this.customerId) {
//       this.customerForm.reset({
//         fullname: '',
//         email: '',
//         status: 'active',
//         guaranteerId: null,
//         profileImg: ''
//       });
//       this.phoneNumbers.clear();
//       this.addresses.clear();
//       this.displayCustomer = { fullname: 'New Customer' };
//       this.isLoading = false;
//       return;
//     }

//     this.isLoading = true;
//     this.customerService.getCustomerDataWithId(this.customerId).subscribe({
//       next: (res) => {
//         const customer = res.data;
//         this.customerForm.patchValue(customer);
//         this.displayCustomer = customer; // Update header display
//         // Repopulate phone numbers FormArray
//         this.phoneNumbers.clear();
//         customer.phoneNumbers.forEach((phone:any) => {
//           this.phoneNumbers.push(this.fb.group(phone));
//         });

//         // Repopulate addresses FormArray
//         this.addresses.clear();
//         customer.addresses.forEach((address:any) => {
//           this.addresses.push(this.fb.group({
//             ...address,
//             location: this.fb.group({
//               type: 'Point',
//               coordinates: this.fb.array(address.location?.coordinates || [null, null])
//             })
//           }));
//         });

//         this.isLoading = false;
//       },
//       error: () => this.isLoading = false
//     });
//   }

//   loadCustomerDropdown(): void {
//     this.autoPopulate.getModuleData('customers').subscribe((data: any) => {
//       this.customerIDDropdown = data;
//       if (this.customerId) {
//         this.loadCustomerData();
//       }
//     });
//   }

//   onCustomerSelect(event: any): void {
//     this.customerId = event.value;
//     this.loadCustomerData();
//   }

//   saveCustomer(): void {
//     if (this.customerForm.invalid) {
//       this.messageService.showError('Validation Error', 'Please fill in all required fields.');
//       // Mark all fields as touched to display validation errors
//       this.customerForm.markAllAsTouched();
//       return;
//     }

//     const formData = this.customerForm.value;
//     const mobileNumber = formData.phoneNumbers.find((p: Phone) => p.primary)?.number || formData.phoneNumbers[0]?.number;
//     const finalData = { ...formData, mobileNumber };

//     const operation = this.customerId
//       ? this.customerService.updateCustomer(this.customerId, finalData)
//       : this.customerService.createNewCustomer(finalData);

//     operation.subscribe(res => {
//       if (res.success) {
//         this.messageService.showSuccess('Success', `Customer ${this.customerId ? 'updated' : 'created'} successfully`);
//         if (!this.customerId && res.data?._id) {
//           this.customerId = res.data._id;
//           this.selectedCustomerId = res.data._id;
//           this.customerForm.patchValue({ _id: res.data._id });
//         }
//         this.loadCustomerDropdown();
//       }
//     });
//   }

//   // --- Phone Number Management ---
//   showPhoneDialog(index?: number): void {
//     if (index !== undefined) {
//       this.editingPhoneIndex = index;
//       // Load data from the main form's FormArray into the dialog form
//       this.phoneDialogForm.setValue(this.phoneNumbers.at(index).value);
//     } else {
//       this.editingPhoneIndex = -1;
//       this.phoneDialogForm.reset({ number: '', type: 'mobile', primary: false });
//     }
//     this.phoneDialogVisible = true;
//   }

//   addPhoneNumber(): void {
//     if (this.phoneDialogForm.invalid) return;

//     if (this.editingPhoneIndex > -1) {
//       // Update existing phone group in the FormArray
//       this.phoneNumbers.at(this.editingPhoneIndex).setValue(this.phoneDialogForm.value);
//     } else {
//       // Add a new phone group to the FormArray
//       this.phoneNumbers.push(this.fb.group(this.phoneDialogForm.value));
//     }
//     this.phoneDialogVisible = false;
//   }

//   deletePhone(index: number): void {
//     this.phoneNumbers.removeAt(index);
//   }

//   // --- Address Management ---
//   showAddressDialog(index?: number): void {
//     if (index !== undefined) {
//       this.editingAddressIndex = index;
//       this.addressDialogForm.setValue(this.addresses.at(index).value);
//     } else {
//       this.editingAddressIndex = -1;
//       this.addressDialogForm.reset({
//         street: '', city: '', state: '', zipCode: '', country: '',
//         type: 'home', isDefault: false,
//         location: { type: 'Point', coordinates: [null, null] }
//       });
//     }
//     this.addressDialogVisible = true;
//   }

//   addAddress(): void {
//     if (this.addressDialogForm.invalid) return;
//     if (this.editingAddressIndex > -1) {
//       this.addresses.at(this.editingAddressIndex).setValue(this.addressDialogForm.value);
//     } else {
//       // Create a form group with the structure matching the dialog form
//       const newAddressGroup = this.fb.group({
//         street: [this.addressDialogForm.value.street, Validators.required],
//         city: [this.addressDialogForm.value.city, Validators.required],
//         state: [this.addressDialogForm.value.state, Validators.required],
//         zipCode: [this.addressDialogForm.value.zipCode, Validators.required],
//         country: [this.addressDialogForm.value.country],
//         type: [this.addressDialogForm.value.type, Validators.required],
//         isDefault: [this.addressDialogForm.value.isDefault],
//         location: this.fb.group({
//           type: ['Point'],
//           coordinates: this.fb.array(this.addressDialogForm.value.location.coordinates)
//         })
//       });
//       this.addresses.push(newAddressGroup);
//     }
//     this.addressDialogVisible = false;
//   }

//   removeAddress(index: number): void {
//     this.addresses.removeAt(index);
//   }

//   // --- File Upload ---
//   handleFileUpload(event: { files: File[] }): void {
//     const file = event.files[0];
//     if (file && this.customerId) {
//       const formData = new FormData();
//       formData.append('image', file);
//       this.customerService.uploadProfileImage(formData, this.customerId).subscribe(res => {
//         if (res.success) {
//           this.customerForm.patchValue({ profileImg: res.data.imageUrl });
//           this.messageService.showSuccess('Success', 'Profile image updated!');
//         }
//       });
//     } else if (!this.customerId) {
//       this.messageService.showWarn('Save Customer First', 'Please save the new customer before uploading an image.');
//       this.fileUploader.clear();
//     }
//   }

// getSeverityForType(status: string) {
//   switch (status?.toLowerCase()) {
//     case 'home': return 'warn';
//     case 'work': case 'paid': return 'success';
//     case 'cancelled': return 'danger';
//     default: return 'info';
//   }
// }
// }

// // import { Component, Input, OnInit, ViewChild } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { FormsModule, NgForm } from '@angular/forms';
// // import { ButtonModule } from 'primeng/button';
// // import { InputTextModule } from 'primeng/inputtext';
// // import { SelectModule } from 'primeng/select';
// // import { FileUploadModule, FileUpload } from 'primeng/fileupload';
// // import { ToastModule } from 'primeng/toast';
// // import { MessageService } from 'primeng/api';
// // import { DialogModule } from 'primeng/dialog';
// // import { TableModule } from 'primeng/table';
// // import { CheckboxModule } from 'primeng/checkbox';
// // import { AvatarModule } from 'primeng/avatar';
// // import { CardModule } from 'primeng/card';
// // import { SkeletonModule } from 'primeng/skeleton';
// // import { TooltipModule } from 'primeng/tooltip';
// // // App Services & Utilities
// // import { CustomerService } from '../../../../core/services/customer.service';
// // import { CommonMethodService } from '../../../../core/Utils/common-method.service';
// // import { AutopopulateService } from '../../../../core/services/autopopulate.service';
// // import { AppMessageService } from '../../../../core/services/message.service';
// // import { Tag } from "primeng/tag";

// // // Interfaces
// // interface Location {
// //   type: 'Point';
// //   coordinates: [number | null, number | null];
// // }
// // interface Address {
// //   street: string; city: string; state: string; zipCode: string; country: string; type: string; isDefault: boolean; location: Location;
// // }
// // interface Phone {
// //   number: string; type: string; primary: boolean;
// // }
// // interface Customer {
// //   _id?: string; fullname: string; profileImg: string; email: string; status: string; mobileNumber: string; phoneNumbers: Phone[]; addresses: Address[]; cart: { items: any[] }; guaranteerId?: string; totalPurchasedAmount: number; remainingAmount: number; paymentHistory: any[]; metadata: any;
// // }
// // interface DropdownOption {
// //   label: string; value: any;
// // }
// // interface CustomerDropdownOption {
// //   fullname: string; _id: any; phoneNumbers: Phone[];
// // }

// // @Component({
// //   selector: 'app-customer-master',
// //   standalone: true,
// //   imports: [
// //     CommonModule, FormsModule, ButtonModule, InputTextModule, SelectModule,
// //     FileUploadModule, ToastModule, DialogModule, TableModule, CheckboxModule,
// //     AvatarModule, CardModule, SkeletonModule, TooltipModule,
// //     Tag
// //   ],
// //   templateUrl: './customer-master.component.html',
// //   styleUrls: ['./customer-master.component.css'],
// //   providers: [MessageService]
// // })
// // export class CustomerMasterComponent implements OnInit {
// //   @Input() customerId!: string;
// //   @ViewChild('customerForm') customerForm!: NgForm;

// //   customer: Customer = this.getInitialCustomer();
// //   isLoading = true;

// //   phoneDialogVisible = false;
// //   addressDialogVisible = false;
// //   newPhoneNumber: Phone = { number: '', type: 'mobile', primary: false };
// //   newAddress: Address = this.getInitialAddress();
// //   editingPhoneIndex = -1;
// //   editingAddressIndex = -1;
// //   statuses: DropdownOption[] = [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }, { label: 'Pending', value: 'pending' }, { label: 'Suspended', value: 'suspended' }, { label: 'Blocked', value: 'blocked' }];
// //   phoneTypes: DropdownOption[] = [{ label: 'Mobile', value: 'mobile' }, { label: 'Work', value: 'work' }, { label: 'Home', value: 'home' }];
// //   addressTypes: DropdownOption[] = [{ label: 'Shipping', value: 'shipping' }, { label: 'Billing', value: 'billing' }, { label: 'Work', value: 'work' }, { label: 'Home', value: 'home' }];

// //   customerIDDropdown: CustomerDropdownOption[] = [];
// //   selectedGuaranter: any;
// //   selectedCustomerId: string | null = null;

// //   @ViewChild('fileUploader') fileUploader!: FileUpload;

// //   constructor(
// //     private customerService: CustomerService,
// //     private autoPopulate: AutopopulateService,
// //     private messageService: AppMessageService,
// //     public commonMethodService: CommonMethodService,
// //   ) { }

// //   ngOnInit(): void {
// //     this.loadCustomerDropdown();
// //     if (this.customerId) {
// //       this.selectedCustomerId = this.customerId;
// //     } else {
// //       this.isLoading = false;
// //     }
// //   }

// //   getInitialCustomer(): Customer {
// //     return { fullname: '', profileImg: '', mobileNumber: '', email: '', status: 'active', phoneNumbers: [], addresses: [], cart: { items: [] }, totalPurchasedAmount: 0, remainingAmount: 0, paymentHistory: [], metadata: {} };
// //   }

// //   getInitialAddress(): Address {
// //     return { street: '', city: '', state: '', zipCode: '', country: '', type: 'home', isDefault: false, location: { type: 'Point', coordinates: [0, 0] } };
// //   }

// //   loadCustomerData(): void {
// //     if (!this.customerId) {
// //       this.customer = this.getInitialCustomer();
// //       this.selectedGuaranter = null;
// //       this.isLoading = false;
// //       return;
// //     };
// //     this.isLoading = true;
// //     this.customerService.getCustomerDataWithId(this.customerId).subscribe({
// //       next: (res) => {
// //         // if (res.success) {
// //         this.customer = res.data;
// //         this.customer.fullname = res.data.fullname
// //         this.setSelectedGuarantor();
// //         // }
// //         this.isLoading = false;
// //       },
// //       error: () => this.isLoading = false
// //     });
// //   }

// //   loadCustomerDropdown(): void {
// //     this.autoPopulate.getModuleData('customers').subscribe((data: any) => {
// //       this.customerIDDropdown = data;
// //       if (this.customerId) {
// //         this.loadCustomerData();
// //       }
// //     });
// //   }

// //   private setSelectedGuarantor(): void {
// //     if (this.customer && this.customer.guaranteerId && this.customerIDDropdown.length > 0) {
// //       this.selectedGuaranter = this.customerIDDropdown.find(c => c._id === this.customer.guaranteerId);
// //     }
// //   }

// //   onCustomerSelect(event: any): void {
// //     const selectedId = event.value;
// //     this.customerId = selectedId;

// //     if (this.customerId) {
// //       this.loadCustomerData();
// //     } else {
// //       // Handle case where the user clears the selection
// //       this.customer = this.getInitialCustomer();
// //       this.selectedGuaranter = null;
// //     }
// //   }

// //   saveCustomer(): void {
// //     if (this.customerForm.invalid) {
// //       this.messageService.showError('Validation Error', 'Please fill in all required fields.');
// //       return;
// //     }
// //     this.customer.guaranteerId = this.selectedGuaranter?._id;
// //     // this.customer.guaranteerId = this.selectedGuaranter._id;
// //     this.customer.mobileNumber = this.customer.phoneNumbers[0].number // Convert string to number
// //     const operation = this.customerId
// //       ? this.customerService.updateCustomer(this.customerId, this.customer)
// //       : this.customerService.createNewCustomer(this.customer);

// //     operation.subscribe(res => {
// //       if (res.success) {
// //         this.messageService.showSuccess('Success', `Customer ${this.customerId ? 'updated' : 'created'} successfully`);
// //         if (!this.customerId && res.data?._id) {
// //           this.customerId = res.data._id;
// //           this.selectedCustomerId = res.data._id;
// //         }
// //         this.loadCustomerDropdown();
// //       }
// //     });
// //   }

// //   // --- Phone Number Management ---
// //   showPhoneDialog(index?: number): void {
// //     if (index !== undefined) {
// //       this.editingPhoneIndex = index;
// //       this.newPhoneNumber = { ...this.customer.phoneNumbers[index] };
// //     } else {
// //       this.editingPhoneIndex = -1;
// //       this.newPhoneNumber = { number: '', type: 'mobile', primary: false };
// //     }
// //     this.phoneDialogVisible = true;
// //   }

// //   addPhoneNumber(): void {
// //     if (this.editingPhoneIndex > -1) {
// //       this.customer.phoneNumbers[this.editingPhoneIndex] = this.newPhoneNumber;
// //     } else {
// //       this.customer.phoneNumbers.push(this.newPhoneNumber);
// //     }
// //     this.phoneDialogVisible = false;
// //   }

// //   deletePhone(index: number): void {
// //     this.customer.phoneNumbers.splice(index, 1);
// //   }

// //   // --- Address Management ---
// //   showAddressDialog(index?: number): void {
// //     if (index !== undefined) {
// //       this.editingAddressIndex = index;
// //       this.newAddress = { ...this.customer.addresses[index] };
// //     } else {
// //       this.editingAddressIndex = -1;
// //       this.newAddress = this.getInitialAddress();
// //     }
// //     this.addressDialogVisible = true;
// //   }

// //   addAddress(): void {
// //     if (this.editingAddressIndex > -1) {
// //       this.customer.addresses[this.editingAddressIndex] = this.newAddress;
// //     } else {
// //       this.customer.addresses.push(this.newAddress);
// //     }
// //     this.addressDialogVisible = false;
// //   }

// //   removeAddress(index: number): void {
// //     this.customer.addresses.splice(index, 1);
// //   }

// //   setDefaultAddress(index: number): void {
// //     this.customer.addresses.forEach((addr, i) => addr.isDefault = i === index);
// //   }

// //   handleFileUpload(event: { files: File[] }): void {
// //     const file = event.files[0];
// //     if (file && this.customerId) {
// //       const formData = new FormData();
// //       formData.append('image', file);
// //       this.customerService.uploadProfileImage(formData, this.customerId).subscribe(res => {
// //         if (res.success) {
// //           this.customer.profileImg = res.data.imageUrl;
// //           this.messageService.showSuccess('Success', 'Profile image updated!');
// //         }
// //       });
// //     } else if (!this.customerId) {
// //       this.messageService.showWarn('Save Customer First', 'Please save the new customer before uploading an image.');
// //       this.fileUploader.clear();
// //     }
// //   }

// //   getSeverityForType(status: string) {
// //     switch (status?.toLowerCase()) {
// //       case 'Home': return 'warn';
// //       case 'Work':
// //       case 'paid':
// //         return 'success';
// //       case 'cancelled': return 'danger';
// //       default: return 'info';
// //     }
// //   }
// // }