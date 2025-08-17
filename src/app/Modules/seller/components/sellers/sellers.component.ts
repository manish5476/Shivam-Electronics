import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { SellerService } from '../../../../core/services/seller.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FocusTrapModule } from 'primeng/focustrap';
import { RouterModule } from '@angular/router';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';

interface DropdownOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-seller-master',
  standalone: true,
  imports: [
    CardModule,
    RouterModule,
    FocusTrapModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TooltipModule,
    ToastModule,
    Select, // CORRECTED: Was SelectModule
    InputTextModule,
    ButtonModule,
  ],
  providers: [SellerService, MessageService],
  templateUrl: './sellers.component.html',
  styleUrl: './sellers.component.css'
})
export class SellersComponent implements OnInit {

  sellerForm: FormGroup;
  statuses: DropdownOption[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Blocked', value: 'blocked' },
  ];
  sellersForDropdown: any[] = [];
  selectedSellerId: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private sellerService: SellerService, // CORRECTED: Use lowercase for service instance
    private autoPopulate: AutopopulateService,
    private messageService: MessageService,
  ) {
    this.sellerForm = this.formBuilder.group({
      name: ['', Validators.required],
      shopName: ['', Validators.required],
      status: ['pending', Validators.required],
      address: this.formBuilder.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
      }),
      gstin: ['', [Validators.required, Validators.pattern(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]],
      pan: ['', [Validators.required, Validators.pattern(/^([A-Z]{5})([0-9]{4})([A-Z]{1})$/)]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      bankDetails: this.formBuilder.group({
        accountHolderName: ['', Validators.required],
        accountNumber: ['', [Validators.required, Validators.pattern(/^\d{9,18}$/)]],
        ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
        bankName: ['', Validators.required],
        branch: ['', Validators.required]
      })
    });
  }

  ngOnInit(): void {
    this.loadSellersForDropdown();
  }

  loadSellersForDropdown() {
    this.autoPopulate.getModuleData('sellers').subscribe((data: any) => {
      this.sellersForDropdown = data;
    });
  }

  fetchSellerDetails() {
    if (!this.selectedSellerId) {
      this.resetForm();
      return;
    }
    this.sellerService.getSellerDataWithId(this.selectedSellerId).subscribe({
      next: (response: any) => {
        // CORRECTED: Use patchValue to update the form, not replace it
        this.sellerForm.patchValue(response.data);
        this.messageService.add({ severity: 'info', summary: 'Loaded', detail: 'Seller details loaded successfully' });
      },
      error: (error: any) => {
        console.error('Error fetching seller:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load seller details' });
      }
    });
  }

  resetForm() {
    this.sellerForm.reset({
      status: 'pending' // Reset with default values
    });
    this.selectedSellerId = null; // Also clear the selected ID
  }

  saveSeller() {
    if (this.sellerForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all required fields correctly' });
      this.sellerForm.markAllAsTouched(); // Show validation on all fields
      return;
    }

    // CHANGED: Handle both Update and Create logic
    if (this.selectedSellerId) {
      // --- UPDATE EXISTING SELLER ---
      this.sellerService.updateSeller(this.selectedSellerId, this.sellerForm.value).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Seller updated successfully' });
          this.resetForm();
          this.loadSellersForDropdown(); // Refresh the dropdown with new data
        },
        error: (error) => {
          console.error('Error updating seller:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update seller' });
        }
      });
    } else {
      // --- CREATE NEW SELLER ---
      this.sellerService.createNewSeller(this.sellerForm.value).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Seller created successfully' });
          this.resetForm();
          this.loadSellersForDropdown(); // Refresh the dropdown
        },
        error: (error) => {
          console.error('Error creating seller:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create seller' });
        }
      });
    }
  }
}

// export class SellersComponent implements OnInit {
//   sellerForm: FormGroup;
//   isDarkMode: boolean = false;
//   statuses: DropdownOption[] = [
//     { label: 'Active', value: 'active' },
//     { label: 'Inactive', value: 'inactive' },
//     { label: 'Pending', value: 'pending' },
//     { label: 'Suspended', value: 'suspended' },
//     { label: 'Blocked', value: 'blocked' },
//   ];

//   constructor(
//     private formBuilder: FormBuilder,
//     private SellerService: SellerService,
//     private messageService: MessageService,
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) {
//     this.isDarkMode = (isPlatformBrowser(this.platformId)) && localStorage.getItem('darkMode') === 'true';
//     if (this.isDarkMode) {
//       document.body.classList.add('dark-mode');
//     }

//     this.sellerForm = this.formBuilder.group({
//       name: ['', Validators.required],
//       shopName: ['', Validators.required],
//       status: ['pending', Validators.required],
//       address: this.formBuilder.group({
//         street: ['', Validators.required],
//         city: ['', Validators.required],
//         state: ['', Validators.required],
//         pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]] // Indian pincode pattern
//       }),
//       gstin: ['', [Validators.required, Validators.pattern(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]], // GSTIN pattern
//       pan: ['', [Validators.required, Validators.pattern(/^([A-Z]{5})([0-9]{4})([A-Z]{1})$/)]], // PAN pattern
//       contactNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]], // Indian contact number pattern
//       bankDetails: this.formBuilder.group({
//         accountHolderName: ['', Validators.required],
//         accountNumber: ['', [Validators.required, Validators.pattern(/^\d{9,18}$/)]], // Bank account number pattern
//         ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]], // IFSC code pattern
//         bankName: ['', Validators.required],
//         branch: ['', Validators.required]
//       })
//     });
//   }

//   ngOnInit(): void {
//   }


//   toggleDarkMode() {
//     this.isDarkMode = !this.isDarkMode;
//     document.body.classList.toggle('dark-mode', this.isDarkMode);
//     if (isPlatformBrowser(this.platformId)) {
//       localStorage.setItem('darkMode', String(this.isDarkMode));
//     }
//   }

//   saveSeller() {
//     if (this.sellerForm.valid) {
//       this.SellerService.createNewSeller(this.sellerForm.value).subscribe({
//         next: (response: any) => {
//           this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Seller created successfully' });
//           this.sellerForm.reset(); // Reset the form after successful creation
//           this.sellerForm.patchValue({ status: 'pending' }); // Optionally reset status to default 'pending'
//         },
//         error: (error: any) => {
//           console.error('Error creating seller:', error);
//           this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create seller' });
//         }
//       });
//     } else {
//       this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all required fields correctly' });
//     }
//   }
// }