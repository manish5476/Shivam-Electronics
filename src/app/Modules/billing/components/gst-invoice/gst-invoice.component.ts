// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-gst-invoice',
//   imports: [],
//   templateUrl: './gst-invoice.component.html',
//   styleUrl: './gst-invoice.component.css'
// })
// export class GstInvoiceComponent {

// }

import { Component, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
// import lodash from 'lodash';
import { SelectModule } from 'primeng/select';

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
  imports: [ReactiveFormsModule, InputTextModule, SelectModule, ButtonModule, CommonModule, FormsModule, InputNumberModule, CalendarModule, CheckboxModule],
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


  constructor(private apiService: ApiService, private fb: FormBuilder) {
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
    const autopopulate: any = JSON.parse(sessionStorage.getItem('autopopulate') || '{}');
    if (autopopulate && Array.isArray(autopopulate.customersdrop)) {
      // this.customerIDDropdown = lodash.cloneDeep(autopopulate.customersdrop);
      // this.buyerdetailsdropdown = lodash.cloneDeep(autopopulate.customersdrop);
      // this.productdrop = lodash.cloneDeep(autopopulate.productsdrop);
      // this.sellersDrop = lodash.cloneDeep(autopopulate.sellersdrop);
    } else {
      this.customerIDDropdown = [];
      if (this.messageService) { // Check if messageService is injected before using
        this.messageService.add({
          severity: 'info',
          summary: 'Info',
          detail: 'No valid customer data found',
          life: 3000
        });
      }
    }
  }

  getCustomerData() {
    this.apiService.getCustomerDataWithId(this.buyerselect).subscribe((res: any) => {
      console.log(res);
    });
  }

  getsellerData() {
    this.apiService.getSellerDataWithId(this.sellersselec).subscribe((res: any) => {
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

    this.apiService.createNewinvoice(this.invoiceForm.getRawValue()).subscribe((res: any) => { // Use getRawValue to get all values including disabled ones
      console.log(res);
      if (res) {
        alert('Invoice created successfully!');
        // Optionally reset the form or navigate to invoice list
      } else {
        alert('Failed to create invoice.');
      }
    });

    console.log('Invoice Data to Save:', this.invoiceForm.getRawValue());
  }


  addItem(): void {
    this.itemsFormArray.push(this.createItemFormGroup());
    this.calculateInvoiceTotals();
  }

  removeItem(index: number): void {
    this.itemsFormArray.removeAt(index);
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
      this.apiService.getProductDataWithId(productId).subscribe((res: any) => {
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

// import { Component, OnInit, SimpleChanges } from '@angular/core';
// import { ApiService } from '../../../../core/services/api.service';
// import { InputTextModule } from 'primeng/inputtext';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ButtonModule } from 'primeng/button';
// import { InputNumberModule } from 'primeng/inputnumber';
// import { CalendarModule } from 'primeng/calendar';
// import { CheckboxModule } from 'primeng/checkbox';
// import lodash from 'lodash';
// import { SelectModule } from 'primeng/select';

// interface InvoiceItem {
//   product: string; // type: Schema.Types.ObjectId, ref: 'Product'
//   quantity: number; // type: Number
//   discount?: number; // type: Number
//   rate: number; // type: Number, base rate (ex-GST)
//   taxableValue: number; // type: Number
//   gstRate: number; // type: Number, item-level GST rate
//   gstAmount: number; // type: Number, item-level total GST amount
//   amount: number; // type: Number, total amount (taxableValue + gstAmount)
// }

// interface Invoice {
//   invoiceNumber: string; // type: String
//   invoiceDate: Date; // type: Date
//   dueDate?: Date; // type: Date
//   seller: string; // type: Schema.Types.ObjectId, ref: 'Seller'
//   buyer: string; // type: Schema.Types.ObjectId, ref: 'Customer'
//   items: InvoiceItem[]; // [invoiceItemSchema]
//   subTotal: number; // type: Number, Subtotal of taxable values
//   totalDiscount?: number; // type: Number
//   gst?: number; // type: Number, Invoice-level total GST
//   cess?: number; // type: Number
//   totalAmount: number; // type: Number, Total invoice amount
//   paymentTerms?: string; // type: String
//   notes?: string; // type: String
//   placeOfSupply: string; // type: String
//   status: 'paid' | 'unpaid' | 'partially paid' | 'cancelled'; // type: String, enum
//   metadata?: Record<string, any>; // type: Map
// }

// @Component({
//   selector: 'app-gst-invoice',
//   standalone: true,
//   imports: [InputTextModule, SelectModule, ButtonModule, CommonModule, FormsModule, InputNumberModule, CalendarModule, CheckboxModule],
//   templateUrl: './gst-invoice.component.html',
//   styleUrl: './gst-invoice.component.css'
// })
// export class GstInvoiceComponent implements OnInit {

//   gstData: Invoice = {
//     invoiceNumber: '',
//     invoiceDate: new Date(),
//     dueDate: new Date(),
//     seller: '',
//     buyer: '',
//     items: [
//       {
//         product: '',
//         quantity: 1,
//         discount: 0,
//         rate: 0,
//         taxableValue: 0,
//         gstRate: 0,
//         gstAmount: 0,
//         amount: 0
//       }
//     ],
//     subTotal: 0,
//     totalDiscount: 0,
//     gst: 0,
//     cess: 0,
//     totalAmount: 0,
//     paymentTerms: '',
//     notes: '',
//     placeOfSupply: '',
//     status: 'unpaid',
//     metadata: {}
//   };

//   customerIDDropdown: any;
//   buyerdetailsdropdown: any;
//   productdrop: any;
//   messageService: any;
//   sellersDrop: any;
//   sellersselec: any;
//   buyerselect: any;
//   selectedproduct: any;
//   invoiceData: any;

//   constructor(private apiService: ApiService) { }

//   ngOnInit(): void {
//     this.calculateInvoiceTotals();
//     this.autopopulatedata();
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     this.autopopulatedata();
//   }

//   autopopulatedata() {
//     const autopopulate: any = JSON.parse(sessionStorage.getItem('autopopulate') || '{}');
//     if (autopopulate && Array.isArray(autopopulate.customersdrop)) {
//       this.customerIDDropdown = lodash.cloneDeep(autopopulate.customersdrop);
//       this.buyerdetailsdropdown = lodash.cloneDeep(autopopulate.customersdrop);
//       this.productdrop = lodash.cloneDeep(autopopulate.productsdrop);
//       this.sellersDrop = lodash.cloneDeep(autopopulate.sellersdrop);
//     } else {
//       this.customerIDDropdown = [];
//       this.messageService.add({
//         severity: 'info',
//         summary: 'Info',
//         detail: 'No valid customer data found',
//         life: 3000
//       });
//     }
//   }

//   getCustomerData() {
//     this.apiService.getCustomerDataWithId(this.buyerselect).subscribe((res: any) => {
//       console.log(res);
//     });
//   }

//   getsellerData() {
//     this.apiService.getSellerDataWithId(this.sellersselec).subscribe((res: any) => {
//       console.log(res.data);
//     });
//   }

//   createInvoice() {
//     // Generate Invoice Number
//     const customerId = this.gstData.buyer; // Assuming buyer is customer ID
//     const now = new Date();
//     const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
//     const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
//     this.gstData.invoiceNumber = `${customerId}-${datePart}-${timePart}`; // Format: CustomerID-YYYYMMDD-HHMMSS

//     this.apiService.createNewinvoice(this.gstData).subscribe((res: any) => {
//       console.log(res);
//       if (res) {
//         alert('Invoice created successfully!'); // Or use messageService for better UI feedback
//         // Optionally reset the form or navigate to invoice list
//       } else {
//         alert('Failed to create invoice.');
//       }
//     });

//     console.log('Invoice Data to Save:', this.gstData);
//     // Remove or comment out the alert below as we are now showing alert based on API response
//     // alert('Invoice data logged to console (Create Invoice action)');
//   }

//   // createInvoice() {
//   //   this.apiService.createNewinvoice(this.gstData).subscribe((res: any) => {
//   //     console.log(res);
//   //   });

//   //   console.log('Invoice Data to Save:', this.gstData);
//   //   alert('Invoice data logged to console (Create Invoice action)');
//   // }

//   addItem(): void {
//     this.gstData.items.push({
//       product: '',
//       quantity: 1,
//       rate: 0,
//       taxableValue: 0,
//       gstRate: 0,
//       gstAmount: 0,
//       amount: 0
//     });
//     this.calculateInvoiceTotals();
//   }

//   removeItem(index: number): void {
//     this.gstData.items.splice(index, 1);
//     this.calculateInvoiceTotals();
//   }

//   // calculateItemAmount(item: InvoiceItem): number {
//   //   let taxableValue = item.quantity * item.rate;
//   //   item.taxableValue = taxableValue;
//   //   item.gstAmount = (taxableValue * item.gstRate) / 100;
//   //   item.amount = taxableValue + item.gstAmount;
//   //   return item.amount;
//   // }
//   calculateItemAmount(item: InvoiceItem): number {
//     // Calculate taxable value (considering discount if applicable)
//     let taxableValue = item.quantity * item.rate;
//     if (item.discount && item.discount > 0) {
//       taxableValue -= (taxableValue * item.discount) / 100; // Assuming discount is percentage
//     }
//     item.taxableValue = taxableValue;

//     // Calculate GST amount
//     item.gstAmount = (taxableValue * item.gstRate) / 100;

//     // Calculate total amount
//     item.amount = taxableValue + item.gstAmount;
//     return item.amount;
//   }

//   // calculateInvoiceTotals(): void {
//   //   this.gstData.subTotal = 0;
//   //   this.gstData.totalAmount = 0;
//   //   this.gstData.gst = 0;

//   //   for (const item of this.gstData.items) {
//   //     this.calculateItemAmount(item);
//   //     this.gstData.subTotal += item.taxableValue;
//   //     this.gstData.gst += item.gstAmount;
//   //     this.gstData.totalAmount += item.amount;
//   //   }
//   // }
//   calculateInvoiceTotals(): void {
//     this.gstData.subTotal = 0;
//     this.gstData.totalAmount = 0;
//     this.gstData.gst = 0; // Reset total GST
//     this.gstData.totalDiscount = this.gstData.totalDiscount || 0; // Ensure totalDiscount is initialized

//     for (const item of this.gstData.items) {
//       this.calculateItemAmount(item);
//       this.gstData.subTotal += item.taxableValue;
//       this.gstData.gst += item.gstAmount; // Sum GST from each item
//       this.gstData.totalAmount += item.amount;
//     }

//     // Apply invoice level discount if needed, after calculating subtotal and GST - verify your discount logic
//     if (this.gstData.totalDiscount && this.gstData.totalDiscount > 0) {
//       this.gstData.totalAmount -= this.gstData.totalDiscount; // Deduct total discount from total amount
//     }
//   }

//   onItemValueChange(item: InvoiceItem) {
//     this.calculateItemAmount(item);
//     this.calculateInvoiceTotals();
//   }
//   onProductChange(event: any, index: number) {
//     const productId = event.value; // Get product ID from event.value
//     if (productId) {
//       this.apiService.getProductDataWithId(productId).subscribe((res: any) => {
//         if (res.data) {
//           const product = res.data;
//           this.gstData.items[index].product = productId; // Store product ID in items array
//           this.gstData.items[index].rate = product.rate || 0;
//           this.gstData.items[index].gstRate = product.gstRate || 0;
//           this.onItemValueChange(this.gstData.items[index]);
//         } else {
//           console.error('Product data not found for ID:', productId);
//         }
//       });
//     } else {
//       this.gstData.items[index].product = ''; // Clear product ID if no product selected
//       this.gstData.items[index].rate = 0;
//       this.gstData.items[index].gstRate = 0;
//       this.onItemValueChange(this.gstData.items[index]);
//     }
//   }

//   saveInvoice(): void {
//     this.createInvoice();
//   }
// }
// // onProductChange(event: any, index: number) {
// //   const productId = event.value;
// //   if (productId) {
// //     this.apiService.getProductDataWithId(productId).subscribe((res: any) => {
// //       if (res.data) {
// //         const product = res.data;
// //         this.gstData.items[index].rate = product.rate || 0; // Set rate from product data
// //         this.gstData.items[index].gstRate = product.gstRate || 0; // Set gstRate from product data
// //         this.gstData.items[index].discount = this.gstData.items[index].discount || 0; // Keep existing discount or default to 0
// //         this.onItemValueChange(this.gstData.items[index]); // Recalculate item amounts and totals
// //       } else {
// //         console.error('Product data not found for ID:', productId);
// //       }
// //     });
// //   } else {
// //     // Handle case where no product is selected or product is unselected
// //     this.gstData.items[index].rate = 0;
// //     this.gstData.items[index].gstRate = 0;
// //     this.gstData.items[index].discount = 0;
// //     this.onItemValueChange(this.gstData.items[index]);
// //   }
// // }

