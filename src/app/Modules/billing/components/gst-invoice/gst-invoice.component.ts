import { Component, OnInit, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown'; // FIXED: Was SelectModule
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Select } from 'primeng/select';

// --- SERVICES ---
import { InvoiceService } from '../../../../core/services/invoice.service';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-gst-invoice',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TableModule,
    DividerModule,
    InputTextModule,
    Select,
    ButtonModule,
    CommonModule,
    FormsModule,
    InputNumberModule,
    CalendarModule,
    CheckboxModule,
    ToastModule
  ],
  providers: [MessageService], // Services are usually provided in root, but this works
  templateUrl: './gst-invoice.component.html',
  styleUrl: './gst-invoice.component.css'
})
export class GstInvoiceComponent implements OnInit {
  // --- Dependency Injection ---
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private invoiceService = inject(InvoiceService);
  private autoPopulate = inject(AutopopulateService);
  private productService = inject(ProductService);

  public invoiceForm: FormGroup;
  public InvoiceObject = {
    customerIDDropdown: [] as any[],
    productdrop: [] as any[],
    sellersDrop: [] as any[],
  };

  constructor() {
    // --- Form Initialization ---
    this.invoiceForm = this.fb.group({
      invoiceNumber: [{ value: '', disabled: true }, Validators.required],
      invoiceDate: [{ value: '', disabled: true }, Validators.required],
      dueDate: [{ value: '', disabled: true }],
      seller: ['', Validators.required],
      buyer: ['', Validators.required],
      placeOfSupply: [''], // This can be auto-filled based on buyer selection
      items: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      // Calculation fields initialized
      subTotal: [0],
      totalDiscount: [0],
      gst: [0],
      cess: [0],
      totalAmount: [0],
      roundUp: [false],
      roundDown: [false]
    });
  }

  ngOnInit(): void {
  this.itemsFormArray.clear()
    this.initializeInvoice();
  }

  // --- FormArray Getters & Controls ---
  get itemsFormArray(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  createItemFormGroup(): FormGroup {
    return this.fb.group({
      product: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      discount: [0, [Validators.min(0), Validators.max(100)]],
      rate: [0, [Validators.required, Validators.min(0)]],
      gstRate: [0, [Validators.required, Validators.min(0)]],
      // Disabled fields that are calculated automatically
      taxableValue: [{ value: 0, disabled: true }],
      gstAmount: [{ value: 0, disabled: true }],
      amount: [{ value: 0, disabled: true }]
    });
  }

  addItem(): void {
    this.itemsFormArray.push(this.createItemFormGroup());
  }

  removeItem(index: number): void {
    if (this.itemsFormArray.length > 1) {
      this.itemsFormArray.removeAt(index);
      this.calculateInvoiceTotals(); // Recalculate after removing an item
    } else {
      // FIXED: PrimeNG MessageService requires an object
      this.messageService.add({ severity: 'warn', summary: 'Action Denied', detail: 'An invoice must have at least one item.' });
    }
  }

  // --- Initialization and Data Loading ---

  initializeInvoice(): void {
    this.loadDropdownData();
    this.setInitialInvoiceData();
    this.addItem(); // Start with one blank line item
  }

  loadDropdownData() {
    this.autoPopulate.getModuleData('products').subscribe(data => this.InvoiceObject.productdrop = data);
    this.autoPopulate.getModuleData('sellers').subscribe(data => this.InvoiceObject.sellersDrop = data);
    this.autoPopulate.getModuleData('customers').subscribe(data => this.InvoiceObject.customerIDDropdown = data);
  }

  // ADDED: Automatic field generation logic
  setInitialInvoiceData(): void {
    const today = new Date();
    const invoiceDate = today.toISOString().split('T')[0];
    const dueDate = new Date(new Date().setDate(today.getDate() + 30)).toISOString().split('T')[0];

    // This simulates getting the last count. Replace with a real API call.
    const lastInvoiceCount = 0; // await this.invoiceService.getLatestInvoiceCount();
    const newInvoiceNumber = this.generateInvoiceNumber();

    this.invoiceForm.patchValue({
      invoiceNumber: newInvoiceNumber,
      invoiceDate: invoiceDate,
      dueDate: dueDate,
    });
  }

  /**
   * Generates a unique, time-based invoice number that is readable.
   * Format: INV/YYYYMMDD-HHMMSS
   */
  generateInvoiceNumber(): string {
    const prefix = 'INV';
    const now = new Date();

    // --- Create Date and Time Parts ---
    const year = now.getFullYear();
    // Pad month, day, hours, etc., with a '0' if they are single-digit
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // --- Assemble the Unique ID ---
    // This creates a format like "20250819-211430"
    const uniqueId = `${year}${month}${day}-${hours}${minutes}${seconds}`;

    return `${prefix}/${uniqueId}`;
  }
  // --- Event Handlers & Calculations ---

  onProductChange(event: any, index: number) {
    const productId = event.value;
    const itemFormGroup = this.itemsFormArray.at(index) as FormGroup;

    if (productId) {
      this.productService.getProductDataWithId(productId).subscribe((res: any) => {
        const product = res.data;
        if (product) {
          itemFormGroup.patchValue({
            rate: product.rate || 0,
            gstRate: product.gstRate || 0
          });
          this.onItemValueChange(index); // Trigger calculation
        }
      });
    } else {
      // Reset if product is cleared
      itemFormGroup.patchValue({ rate: 0, gstRate: 0 });
      this.onItemValueChange(index);
    }
  }

  onItemValueChange(itemIndex: number): void {
    const itemForm = this.itemsFormArray.at(itemIndex) as FormGroup;
    if (!itemForm) return;

    const quantity = itemForm.get('quantity')?.value || 0;
    const rate = itemForm.get('rate')?.value || 0;
    const discount = itemForm.get('discount')?.value || 0;
    const gstRate = itemForm.get('gstRate')?.value || 0;

    const taxableValue = (quantity * rate) * (1 - (discount / 100));
    const gstAmount = taxableValue * (gstRate / 100);
    const amount = taxableValue + gstAmount;

    // Patch the calculated values into the current item row
    itemForm.patchValue({
      taxableValue: taxableValue,
      gstAmount: gstAmount,
      amount: amount
    }, { emitEvent: false }); // Prevent infinite loops

    this.calculateInvoiceTotals(); // Recalculate grand totals
  }

  calculateInvoiceTotals(): void {
    let subTotal = 0;
    let totalDiscount = 0;
    let totalGst = 0;

    this.itemsFormArray.controls.forEach(control => {
      const item = control.value;
      const grossAmount = (item.quantity || 0) * (item.rate || 0);
      subTotal += grossAmount;
      totalDiscount += grossAmount * ((item.discount || 0) / 100);
      totalGst += item.gstAmount || 0;
    });

    let totalAmount = (subTotal - totalDiscount) + totalGst;

    if (this.invoiceForm.get('roundUp')?.value) {
      totalAmount = Math.ceil(totalAmount);
    } else if (this.invoiceForm.get('roundDown')?.value) {
      totalAmount = Math.floor(totalAmount);
    }

    this.invoiceForm.patchValue({
      subTotal: subTotal,
      totalDiscount: totalDiscount,
      gst: totalGst,
      totalAmount: totalAmount
    });
  }

  // --- Form Submission ---
  saveInvoice(): void {
    if (this.invoiceForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Form', detail: 'Please fill all required fields.' });
      this.invoiceForm.markAllAsTouched();
      return;
    }
    // Use getRawValue() to include disabled fields like invoiceNumber and calculated totals
    const formData = this.invoiceForm.getRawValue();

    this.invoiceService.createInvoice(formData).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Invoice created successfully!' });
        this.resetForm();
        this.setInitialInvoiceData();
      },
      error: (err) => {
        this.setInitialInvoiceData();
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err});
      }
    });
  }

  resetForm(): void {
    this.invoiceForm.reset();
    this.itemsFormArray.clear();
  
    this.initializeInvoice();
  }
}