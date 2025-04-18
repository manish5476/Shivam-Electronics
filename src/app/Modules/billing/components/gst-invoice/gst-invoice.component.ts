
import { Component, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
// import lodash from 'lodash';
import { TableModule } from 'primeng/table';

import { SelectModule } from 'primeng/select';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { SellerService } from '../../../../core/services/seller.service';
import { ProductService } from '../../../../core/services/product.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';

interface InvoiceItem {
  product: string;
  quantity: number;
  discount?: number;
  rate: number;
  taxableValue: number;
  gstRate: number;
  gstAmount: number;
  amount: number;
}

interface Invoice {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate?: Date;
  seller: string;
  buyer: string;
  items: InvoiceItem[];
  subTotal: number;
  totalDiscount?: number;
  gst?: number;
  cess?: number;
  totalAmount: number;
  paymentTerms?: string;
  notes?: string;
  placeOfSupply: string;
  status: 'paid' | 'unpaid' | 'partially paid' | 'cancelled';
  metadata?: Record<string, any>;
}

@Component({
  selector: 'app-gst-invoice',
  standalone: true,
  imports: [ReactiveFormsModule,TableModule, InputTextModule, SelectModule, ButtonModule, CommonModule, FormsModule, InputNumberModule, CalendarModule, CheckboxModule],
  templateUrl: './gst-invoice.component.html',
  styleUrl: './gst-invoice.component.css'
})
export class GstInvoiceComponent implements OnInit, OnChanges {

  invoiceForm: FormGroup;

  customerIDDropdown: any;
  buyerdetailsdropdown: any;
  productdrop: any;
  messageService: any; // Assuming you have a message service, you might need to inject it
  sellersDrop: any;
  sellersselec: any;
  buyerselect: any;
  selectedproduct: any;
  invoiceData: any;


  constructor(private invoiceService: InvoiceService, private autoPopulate: AutopopulateService,
    private customerService: CustomerService, private sellerService: SellerService, private productService: ProductService, private fb: FormBuilder) {
    this.invoiceForm = this.fb.group({
      invoiceNumber: [''],
      invoiceDate: [new Date()],
      dueDate: [new Date()],
      seller: [''],
      buyer: [''],
      placeOfSupply: [{ value: '', disabled: true }],
      items: this.fb.array([this.createItemFormGroup()]), // Initialize with one item
      subTotal: [{ value: 0, disabled: true }],
      totalDiscount: [0],
      gst: [{ value: 0, disabled: true }],
      cess: [{ value: 0, disabled: true }],
      totalAmount: [{ value: 0, disabled: true }],
      roundUp: [false],
      roundDown: [false]
    });
  }

  ngOnInit(): void {
    this.calculateInvoiceTotals();
    this.autopopulatedata();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.autopopulatedata();
  }


  createItemFormGroup(): FormGroup {
    return this.fb.group({
      product: [''],
      quantity: [1],
      discount: [0],
      rate: [0],
      taxableValue: [{ value: 0, disabled: true }],
      gstRate: [0],
      gstAmount: [{ value: 0, disabled: true }],
      amount: [{ value: 0, disabled: true }]
    });
  }

  get itemsFormArray(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  autopopulatedata() {
    this.autoPopulate.getModuleData('products').subscribe((data:any) => {
      this.productdrop = data;
    });
    this.autoPopulate.getModuleData('sellers').subscribe((data:any) => {
      this.sellersDrop = data;
    });
    this.autoPopulate.getModuleData('customers').subscribe((data:any) => {
      this.customerIDDropdown = data;
    });
  }

  getCustomerData() {
    this.customerService.getCustomerDataWithId(this.buyerselect).subscribe((res: any) => {
      console.log(res);
    });
  }

  getsellerData() {
    this.sellerService.getSellerDataWithId(this.sellersselec).subscribe((res: any) => {
      console.log(res.data);
    });
  }

  createInvoice() {
    // Generate Invoice Number
    const customerId = this.invoiceForm.get('buyer')?.value;
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    this.invoiceForm.patchValue({ invoiceNumber: `${customerId.substring(0, 5)}_${datePart}_${timePart}` });

    this.invoiceService.createNewinvoice(this.invoiceForm.getRawValue()).subscribe((res: any) => {
      if (res) {
        alert('Invoice created successfully!');
      } else {
        alert('Failed to create invoice.');
      }
    });
  }


  addItem(): void {
    this.itemsFormArray.push(this.createItemFormGroup());
    this.calculateInvoiceTotals();
  }

  removeItem(index: number): void {
    this.itemsFormArray.length>1   ?this.itemsFormArray.removeAt(index):this.messageService.showInfo('one data require')
    this.calculateInvoiceTotals();
  }


  calculateItemAmount(itemForm: FormGroup): number {
    let quantity = itemForm.get('quantity')?.value || 0;
    let rate = itemForm.get('rate')?.value || 0;
    let discount = itemForm.get('discount')?.value || 0;
    let gstRate = itemForm.get('gstRate')?.value || 0;

    let taxableValue = quantity * rate;
    if (discount && discount > 0) {
      taxableValue -= (taxableValue * discount) / 100;
    }

    let gstAmount = (taxableValue * gstRate) / 100;
    let amount = taxableValue + gstAmount;

    itemForm.patchValue({
      taxableValue: taxableValue,
      gstAmount: gstAmount,
      amount: amount
    });
    return amount;
  }


  calculateInvoiceTotals(): void {
    let subTotal = 0;
    let totalAmount = 0;
    let gst = 0;
    let totalDiscount = this.invoiceForm.get('totalDiscount')?.value || 0;


    this.itemsFormArray.controls.forEach((itemFormGroup) => {
      let itemAmount = this.calculateItemAmount(itemFormGroup as FormGroup);
      subTotal += itemFormGroup.get('taxableValue')?.value || 0;
      gst += itemFormGroup.get('gstAmount')?.value || 0;
      totalAmount += itemAmount;
    });


    if (totalDiscount && totalDiscount > 0) {
      totalAmount -= totalDiscount;
    }

    if (this.invoiceForm.get('roundUp')?.value) {
      totalAmount = Math.ceil(totalAmount);
    } else if (this.invoiceForm.get('roundDown')?.value) {
      totalAmount = Math.floor(totalAmount);
    }


    this.invoiceForm.patchValue({
      subTotal: subTotal,
      gst: gst,
      totalAmount: totalAmount
    });
  }

  onItemValueChange(itemIndex: number) {
    const itemFormGroup = this.itemsFormArray.controls[itemIndex] as FormGroup;
    if (itemFormGroup) {
      this.calculateItemAmount(itemFormGroup);
      this.calculateInvoiceTotals();
    }
  }

  onProductChange(event: any, index: number) {
    const productId = event.value;
    if (productId) {
      this.productService.getProductDataWithId(productId).subscribe((res: any) => {
        if (res.data) {
          const product = res.data;
          const itemFormGroup = this.itemsFormArray.controls[index] as FormGroup;
          itemFormGroup.patchValue({
            product: productId,
            rate: product.rate || 0,
            gstRate: product.gstRate || 0
          });
          this.calculateItemAmount(itemFormGroup);
          this.calculateInvoiceTotals();
        } else {
          console.error('Product data not found for ID:', productId);
        }
      });
    } else {
      const itemFormGroup = this.itemsFormArray.controls[index] as FormGroup;
      itemFormGroup.patchValue({
        product: '',
        rate: 0,
        gstRate: 0
      });
      this.calculateItemAmount(itemFormGroup);
      this.calculateInvoiceTotals();
    }
  }

  saveInvoice(): void {
    this.createInvoice();
  }
}

// ////////////////////////////////////////////////////
/**
 *import { Component, OnInit, OnDestroy } from '@angular/core'; // Removed SimpleChanges, OnChanges as ngOnChanges wasn't really used effectively here
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton'; // Assuming SelectModule was meant to be SelectButtonModule or DropdownModule
import { DropdownModule } from 'primeng/dropdown';         // Use DropdownModule for dropdowns
import { ToastModule } from 'primeng/toast';               // Import ToastModule
import { MessageService } from 'primeng/api';              // Import PrimeNG MessageService for provider

import { InvoiceService } from '../../../../core/services/invoice.service';
import { SellerService } from '../../../../core/services/seller.service';
import { ProductService } from '../../../../core/services/product.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { AppMessageService } from '../../../../core/services/message.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

// Keep your interfaces (InvoiceItem, Invoice) as they are

@Component({
  selector: 'app-gst-invoice',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    // SelectModule, // Replace with DropdownModule if using dropdowns
    DropdownModule, // Added for dropdowns
    ButtonModule,
    CommonModule,
    FormsModule,
    InputNumberModule,
    CalendarModule,
    CheckboxModule,
    ToastModule // Add ToastModule here
  ],
  templateUrl: './gst-invoice.component.html',
  styleUrls: ['./gst-invoice.component.css'], // Corrected styleUrl to styleUrls
  providers: [MessageService] // Provide MessageService for p-toast
})
export class GstInvoiceComponent implements OnInit, OnDestroy {

  invoiceForm: FormGroup;

  // Dropdown options - Initialize as empty arrays
  customerDropdown: any[] = [];
  sellerDropdown: any[] = [];
  productDropdown: any[] = [];

  // Selected values (if needed outside the form) - often not necessary with Reactive Forms
  // sellersselec: any;
  // buyerselect: any;

  isLoading: boolean = false; // Flag for loading states
  private destroy$ = new Subject<void>(); // For unsubscribing

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private customerService: CustomerService,
    private sellerService: SellerService,
    private productService: ProductService,
    private appMessageService: AppMessageService // Inject AppMessageService
  ) {
    this.invoiceForm = this.fb.group({
      invoiceNumber: [''], // Will be generated on save
      invoiceDate: [new Date()],
      dueDate: [new Date()], // Consider setting a default offset, e.g., +30 days
      seller: [null], // Use null for dropdowns, add Validators if needed
      buyer: [null], // Use null for dropdowns, add Validators if needed
      placeOfSupply: [{ value: '', disabled: true }],
      items: this.fb.array([this.createItemFormGroup()]),
      subTotal: [{ value: 0, disabled: true }],
      totalDiscount: [0], // Overall invoice discount
      gst: [{ value: 0, disabled: true }],
      cess: [0], // Keep cess if needed, otherwise remove. Make it non-disabled if user can input.
      totalAmount: [{ value: 0, disabled: true }],
      roundUp: [false],
      roundDown: [false]
      // Add other fields like paymentTerms, notes, status if they are part of the form
      // paymentTerms: [''],
      // notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadDropdownData(); // Load dropdown data on init
    this.setupValueChangeListeners(); // Setup listeners for calculations
    this.calculateInvoiceTotals(); // Initial calculation
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete(); // Clean up subscriptions
  }

  // --- Form Setup ---

  createItemFormGroup(): FormGroup {
    return this.fb.group({
      product: [null], // Use null for dropdowns
      quantity: [1],
      discount: [0], // Item-level discount percentage
      rate: [0],
      taxableValue: [{ value: 0, disabled: true }],
      gstRate: [0], // Will be fetched from product
      gstAmount: [{ value: 0, disabled: true }],
      amount: [{ value: 0, disabled: true }]
    });
  }

  get itemsFormArray(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  // --- Data Loading ---

  loadDropdownData() {
    this.isLoading = true;
    // Example: Fetch all dropdown data - replace with actual API calls or cached data logic
    // You might want separate loading flags if calls are independent

    // Using simplified placeholder logic. Replace with actual calls.
    // Ideally, fetch these from dedicated endpoints or use cached data.
    this.customerService.getCustomerDropDown()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customers) => {
          this.customerDropdown = customers; // Assuming API returns { label: 'Name', value: 'id' } format
        },
        error: (err) => this.appMessageService.handleError(err, 'Error loading customers')
      });

    this.sellerService.getAllSellersdata() // Assuming an endpoint like this exists or create one
       .pipe(takeUntil(this.destroy$))
       .subscribe({
           next: (sellers) => {
             // Transform sellers data if necessary to { label: '...', value: '...' }
             this.sellerDropdown = sellers.map(s => ({ label: s.name, value: s._id })); // Example transform
           },
           error: (err) => this.appMessageService.handleError(err, 'Error loading sellers')
       });

    this.productService.getAllProductData() // Assuming endpoint returns products suitable for dropdown
       .pipe(takeUntil(this.destroy$), finalize(() => this.isLoading = false)) // Stop loading indicator on completion/error
       .subscribe({
           next: (products) => {
             // Transform products data if necessary
             this.productDropdown = products.map(p => ({ label: p.name, value: p._id })); // Example transform
           },
           error: (err) => this.appMessageService.handleError(err, 'Error loading products')
       });

    // --- Remove Autopopulate Logic or Refine It ---
    // this.autopopulatedata(); // Remove this if fetching fresh data above
  }

  // Remove or Refactor: Relying on sessionStorage can lead to stale data. Fetching is preferred.
  // autopopulatedata() {
  //   const autopopulate: any = JSON.parse(sessionStorage.getItem('autopopulate') || '{}');
  //   // ... existing logic ...
  //   if (!autopopulate || !Array.isArray(autopopulate.customersdrop)) {
  //      this.appMessageService.showInfo('Info', 'No cached dropdown data found.', 3000);
  //   }
  // }

  // --- Form Actions ---

  addItem(): void {
    this.itemsFormArray.push(this.createItemFormGroup());
    // No need to call calculateInvoiceTotals here if using valueChanges listeners
  }

  removeItem(index: number): void {
    if (this.itemsFormArray.length > 1) { // Prevent removing the last item
      this.itemsFormArray.removeAt(index);
    } else {
      this.appMessageService.showWarn('Warning', 'Cannot remove the last item row.', 3000);
    }
    // No need to call calculateInvoiceTotals here if using valueChanges listeners
  }

  saveInvoice(): void {
    if (this.invoiceForm.invalid) {
      this.appMessageService.showError('Error', 'Please fill all required fields correctly.');
      this.invoiceForm.markAllAsTouched(); // Highlight invalid fields
      return;
    }

    this.isLoading = true;
    // Generate Invoice Number just before saving
    this.generateInvoiceNumber();

    const invoiceData = this.invoiceForm.getRawValue(); // Get all values, including disabled

    console.log('Invoice Data to Save:', invoiceData);

    this.invoiceService.createNewinvoice(invoiceData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false) // Ensure loading stops
      )
      .subscribe({
        next: (res:any) => {
          // Use handleResponse for standardized messages
          this.appMessageService.handleResponse(res, 'Invoice Created', `Invoice ${invoiceData.invoiceNumber} saved successfully.`);
          this.invoiceForm.reset(); // Reset form after successful save
          this.itemsFormArray.clear(); // Clear items
          this.addItem(); // Add back one empty item row
          this.invoiceForm.patchValue({ invoiceDate: new Date(), dueDate: new Date() }); // Reset dates
          this.calculateInvoiceTotals(); // Recalculate totals for the fresh form
        },
        error: (err) => {
          // Use handleError for standardized error messages
          this.appMessageService.handleError(err, 'Invoice Creation Failed');
        }
      });
  }

  generateInvoiceNumber() {
    const buyerControl = this.invoiceForm.get('buyer');
    const sellerControl = this.invoiceForm.get('seller'); // Or use seller if relevant

    // Ensure buyer or seller ID is available for the prefix
    const prefix = buyerControl?.value?.substring(0, 5) || sellerControl?.value?.substring(0,5) || 'INV'; // Fallback prefix

    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    this.invoiceForm.patchValue({ invoiceNumber: `${prefix}_${datePart}_${timePart}` });
  }

  // --- Calculations and Listeners ---

  setupValueChangeListeners(): void {
    // Listen to changes in the items array
    this.itemsFormArray.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.calculateInvoiceTotals();
    });

    // Listen to changes in overall discount or rounding options
    this.invoiceForm.get('totalDiscount')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.calculateInvoiceTotals();
    });
    this.invoiceForm.get('roundUp')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.calculateInvoiceTotals();
    });
    this.invoiceForm.get('roundDown')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.calculateInvoiceTotals();
    });
     // Listen for buyer changes to update place of supply (example)
    this.invoiceForm.get('buyer')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(buyerId => {
       if (buyerId) {
         this.fetchBuyerDetailsAndUpdateSupply(buyerId);
       } else {
         this.invoiceForm.get('placeOfSupply')?.patchValue('');
       }
     });
  }

   fetchBuyerDetailsAndUpdateSupply(buyerId: string) {
     this.isLoading = true;
     this.customerService.getCustomerDataWithId(buyerId)
       .pipe(
         takeUntil(this.destroy$),
         finalize(() => this.isLoading = false)
       )
       .subscribe({
         next: (res:any) => {
           if (res && res.data && res.data.state) { // Adjust based on actual response structure
             this.invoiceForm.get('placeOfSupply')?.patchValue(res.data.state);
           } else {
                this.invoiceForm.get('placeOfSupply')?.patchValue('N/A'); // Default if not found
           }
         },
         error: (err) => {
           this.appMessageService.handleError(err, 'Error fetching buyer details');
           this.invoiceForm.get('placeOfSupply')?.patchValue('Error');
         }
       });
   }


  calculateItemAmount(itemForm: FormGroup): void { // No need to return, just patch values
    const quantity = itemForm.get('quantity')?.value || 0;
    const rate = itemForm.get('rate')?.value || 0;
    const discountPercent = itemForm.get('discount')?.value || 0; // Item discount %
    const gstRate = itemForm.get('gstRate')?.value || 0;

    let taxableValue = quantity * rate;
    if (discountPercent > 0) {
      taxableValue -= (taxableValue * discountPercent) / 100;
    }

    const gstAmount = (taxableValue * gstRate) / 100;
    const amount = taxableValue + gstAmount;

    // Patch values without emitting event to prevent infinite loops if subscribed to valueChanges
    itemForm.patchValue({
      taxableValue: taxableValue,
      gstAmount: gstAmount,
      amount: amount
    }, { emitEvent: false }); // Important: Prevent re-triggering valueChanges
  }

  calculateInvoiceTotals(): void {
    let subTotal = 0;
    let totalGst = 0;
    let grossTotal = 0; // Total before overall discount

    this.itemsFormArray.controls.forEach((control) => {
      const itemForm = control as FormGroup;
      this.calculateItemAmount(itemForm); // Ensure item amounts are up-to-date
      subTotal += itemForm.get('taxableValue')?.value || 0;
      totalGst += itemForm.get('gstAmount')?.value || 0;
      grossTotal += itemForm.get('amount')?.value || 0;
    });

    let finalTotalAmount = grossTotal;
    const overallDiscount = this.invoiceForm.get('totalDiscount')?.value || 0;
    if (overallDiscount > 0) {
      finalTotalAmount -= overallDiscount; // Apply overall discount
    }

    // Apply Rounding
    if (this.invoiceForm.get('roundUp')?.value) {
      finalTotalAmount = Math.ceil(finalTotalAmount);
    } else if (this.invoiceForm.get('roundDown')?.value) {
      finalTotalAmount = Math.floor(finalTotalAmount);
    }

    // Patch the main form totals
    this.invoiceForm.patchValue({
      subTotal: subTotal,
      gst: totalGst,
      totalAmount: finalTotalAmount
    }, { emitEvent: false }); // Prevent re-triggering valueChanges
  }

  // --- Event Handlers for Dropdowns ---

  onProductChange(event: any, index: number) {
    const productId = event.value; // Assuming PrimeNG dropdown event
    const itemFormGroup = this.itemsFormArray.at(index) as FormGroup;

    if (productId && itemFormGroup) {
      this.isLoading = true;
      this.productService.getProductDataWithId(productId)
      .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
       )
      .subscribe({
          next: (res:any) => {
            if (res && res.data) {
              const product = res.data;
              itemFormGroup.patchValue({
                // product: productId, // Already set by dropdown binding
                rate: product.rate || 0,
                gstRate: product.gstRate || 0
              }, { emitEvent: false }); // Prevent triggering recalculation via valueChanges here
              this.calculateItemAmount(itemFormGroup); // Manually calculate this item
              this.calculateInvoiceTotals(); // Recalculate overall totals
            } else {
              this.appMessageService.showError('Error', `Product data not found for ID: ${productId}`);
               itemFormGroup.patchValue({ rate: 0, gstRate: 0 }, { emitEvent: false }); // Reset if product not found
               this.calculateItemAmount(itemFormGroup);
               this.calculateInvoiceTotals();
            }
          },
          error: (err) => {
               this.appMessageService.handleError(err, 'Error fetching product details');
               itemFormGroup.patchValue({ rate: 0, gstRate: 0 }, { emitEvent: false }); // Reset on error
               this.calculateItemAmount(itemFormGroup);
               this.calculateInvoiceTotals();
          }
      });
    } else if (itemFormGroup) {
      // Clear fields if product is deselected
      itemFormGroup.patchValue({
        product: null,
        rate: 0,
        gstRate: 0
      }, { emitEvent: false });
       this.calculateItemAmount(itemFormGroup);
       this.calculateInvoiceTotals();
    }
  }

   // Add similar handlers for onSellerChange, onBuyerChange if needed for specific actions
    // onBuyerChange(event: any) {
    //    const buyerId = event.value;
    //    if(buyerId) {
    //        // Maybe fetch buyer's default address/state for PlaceOfSupply?
    //        // See fetchBuyerDetailsAndUpdateSupply - already triggered by valueChanges
    //    } else {
    //       this.invoiceForm.get('placeOfSupply')?.patchValue('');
    //    }
    // }

     // --- Helper Methods ---
    // Add any other helper methods needed
}
 */