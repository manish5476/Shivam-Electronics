// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-sellers',
//   imports: [],
//   templateUrl: './sellers.component.html',
//   styleUrl: './sellers.component.css'
// })
// export class SellersComponent {

// }
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ApiService } from '../../../../core/services/api.service';
// import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
// import { ToolbarComponent } from "../../../../shared/Components/toolbar/toolbar.component";
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FocusTrapModule } from 'primeng/focustrap';
import { RouterModule } from '@angular/router';

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
    SelectModule,
    InputTextModule,
    ButtonModule,
  ],
  providers: [ApiService, MessageService],

  templateUrl: './sellers.component.html',
  styleUrl: './sellers.component.css'
})
export class SellersComponent implements OnInit {
  sellerForm: FormGroup;
  isDarkMode: boolean = false;
  statuses: DropdownOption[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Blocked', value: 'blocked' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isDarkMode = (isPlatformBrowser(this.platformId)) && localStorage.getItem('darkMode') === 'true';
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    }

    this.sellerForm = this.formBuilder.group({
      name: ['', Validators.required],
      shopName: ['', Validators.required],
      status: ['pending', Validators.required],
      address: this.formBuilder.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]] // Indian pincode pattern
      }),
      gstin: ['', [Validators.required, Validators.pattern(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]], // GSTIN pattern
      pan: ['', [Validators.required, Validators.pattern(/^([A-Z]{5})([0-9]{4})([A-Z]{1})$/)]], // PAN pattern
      contactNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]], // Indian contact number pattern
      bankDetails: this.formBuilder.group({
        accountHolderName: ['', Validators.required],
        accountNumber: ['', [Validators.required, Validators.pattern(/^\d{9,18}$/)]], // Bank account number pattern
        ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]], // IFSC code pattern
        bankName: ['', Validators.required],
        branch: ['', Validators.required]
      })
    });
  }

  ngOnInit(): void {
  }


  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('darkMode', String(this.isDarkMode));
    }
  }

  saveSeller() {
    if (this.sellerForm.valid) {
      this.apiService.createNewSeller(this.sellerForm.value).subscribe({
        next: (response: any) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Seller created successfully' });
          this.sellerForm.reset(); // Reset the form after successful creation
          this.sellerForm.patchValue({ status: 'pending' }); // Optionally reset status to default 'pending'
        },
        error: (error: any) => {
          console.error('Error creating seller:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create seller' });
        }
      });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all required fields correctly' });
    }
  }
}