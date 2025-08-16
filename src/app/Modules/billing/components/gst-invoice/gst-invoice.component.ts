
import { Component, OnInit, SimpleChanges, OnChanges, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { SellerService } from '../../../../core/services/seller.service';
import { ProductService } from '../../../../core/services/product.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { AppMessageService } from '../../../../core/services/message.service';
import { DividerModule } from 'primeng/divider';
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
  fullname: string;
  address: string;
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
  imports: [ReactiveFormsModule, TableModule, DividerModule, InputTextModule, SelectModule, ButtonModule, CommonModule, FormsModule, InputNumberModule, CalendarModule, CheckboxModule],
  templateUrl: './gst-invoice.component.html',
  styleUrl: './gst-invoice.component.css'
})
export class GstInvoiceComponent implements OnInit, OnChanges {
  public messageService = inject(AppMessageService)
  public invoiceService = inject(InvoiceService)
  public autoPopulate = inject(AutopopulateService)
  public customerService = inject(CustomerService)
  public sellerService = inject(SellerService)
  public productService = inject(ProductService)
  public invoiceForm: FormGroup;

  public InvoiceObject = {
    customerIDDropdown: [],
    buyerdetailsdropdown: '',
    productdrop: [],
    sellersDrop: [],
    sellersselec: '',
    buyerselect: '',
    selectedproduct: '',
    invoiceData: '',
  }
  constructor(private fb: FormBuilder) {
    this.invoiceForm = this.fb.group({
      invoiceNumber: [''],
      invoiceDate: [new Date()],
      dueDate: [new Date()],
      seller: [''],
      buyer: [''],
      placeOfSupply: [{ value: '', disabled: true }],
      items: this.fb.array([this.createItemFormGroup()]),
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
    this.autoPopulate.getModuleData('products').subscribe((data: any) => {
      this.InvoiceObject.productdrop = data;
    });
    this.autoPopulate.getModuleData('sellers').subscribe((data: any) => {
      this.InvoiceObject.sellersDrop = data;
    });
    this.autoPopulate.getModuleData('customers').subscribe((data: any) => {
      this.InvoiceObject.customerIDDropdown = data;
    });
  }

createInvoice() {
  const customerId: string = this.invoiceForm.get('buyer')?.value;

  if (!customerId) {
    this.messageService.showError('Buyer is required.');
    return;
  }

  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  const invoiceNumber = `${customerId.substring(0, 5)}_${datePart}_${timePart}`;

  this.invoiceForm.patchValue({ invoiceNumber });

  this.invoiceService.createNewinvoice(this.invoiceForm.getRawValue()).subscribe({
    next: (res: any) => {
      if (res) {
        this.messageService.showSuccessMessage('Invoice created successfully!');
      } else {
        this.messageService.showError('Failed to create invoice.');
      }
    },
    error: (err) => {
      console.error(err);
      this.messageService.showError('Server error while creating invoice.');
    }
  });
}

  addItem(): void {
    this.itemsFormArray.push(this.createItemFormGroup());
    this.calculateInvoiceTotals();
  }

  removeItem(index: number): void {
    this.itemsFormArray.length > 1 ? this.itemsFormArray.removeAt(index) : this.messageService.showInfo('info', 'one data require')
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
          this.messageService.showError('Product data not found for ID:', productId);
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