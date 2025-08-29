import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';

// Services
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { PurchaseorderService } from '../../../../core/services/purchaseorder.service';

@Component({
  selector: 'app-product-incoming',
  standalone: true,
  providers: [CurrencyPipe],
  templateUrl: './product-incoming.component.html',
  styleUrls: ['./product-incoming.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    Select
  ]
})
export class PurchaseOrderDashboardComponent implements OnInit {

  purchaseForm!: FormGroup;
  purchaseList: any[] = [];
  activeTab = signal('create');
  // --- NEW: Signal to track the ID of the PO being edited ---
  editingPurchaseOrderId = signal<string | null>(null);

  public dropdownOptions = {
    products: [] as any[],
    sellers: [] as any[],
  };

  // --- NEW: Status options for the dropdown ---
  public statusOptions = ["pending", "completed", "cancelled"]

  toast = signal({ visible: false, severity: 'success', summary: '', detail: '' });
  confirmation = signal({ visible: false, header: '', message: '', accept: () => { }, reject: () => { } });

  private fb = inject(FormBuilder);
  private purchaseService = inject(PurchaseorderService);
  private autoPopulate = inject(AutopopulateService);
  expandedRows = signal<{[key: string]: boolean}>({});

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
  }

  initializeForm() {
    this.purchaseForm = this.fb.group({
      seller: ['', Validators.required],
      // --- MODIFIED: Added status FormControl ---
      status: ['Pending', Validators.required],
      products: this.fb.array([]),
    });
    this.addProduct();
  }

  get products(): FormArray {
    return this.purchaseForm.get('products') as FormArray;
  }

  loadInitialData() {
    this.autoPopulate.getModuleData('products').subscribe((data: any) => this.dropdownOptions.products = data);
    this.autoPopulate.getModuleData('sellers').subscribe((data: any) => this.dropdownOptions.sellers = data);
  }
  // --- Data Loading ---
  // loadInitialData(): void {
  //   forkJoin({
  //     products: this.autoPopulate.getModuleData('products'),
  //     sellers: this.autoPopulate.getModuleData('sellers')
  //   }).subscribe({
  //     next: ({ products, sellers }) => {
  //       this.dropdownOptions.products = products || [];
  //       this.dropdownOptions.sellers = sellers || [];
  //       this.loadPurchases();
  //     },
  //     error: (err) => {
  //       console.error('Failed to load dropdown data', err);
  //       this.showToast('error', 'Load Error', 'Could not load sellers or products.');
  //     }
  //   });
  // }

  // loadPurchases() {
  //   this.purchaseService.getPurchaseOrders().subscribe((res: any) => {
  //     const purchases = res.data || [];
  //     this.purchaseList = purchases.map((p: any) => ({
  //       ...p,
  //       sellerName: this.dropdownOptions.sellers.find(s => s._id === p.seller)?.name || 'N/A',
  //     }));
  //   });
  // }
loadPurchases() {
  this.purchaseService.getPurchaseOrders().subscribe((res: any) => {
    const purchases = res.data || [];
    this.purchaseList = purchases.map((order: any) => {
      // Map over the items to add the product name
      const mappedItems = order.items.map((item: any) => ({
        ...item,
        productName: this.dropdownOptions.products.find(p => p._id === item.product)?.title || 'Unknown Product'
      }));

      return {
        ...order,
        items: mappedItems, // Replace original items with mapped ones
        sellerName: this.dropdownOptions.sellers.find(s => s._id === order.seller)?.name || 'Unknown Seller',
      };
    });
  });
}

  // --- NEW: Method to toggle the visibility of the detail row ---
  toggleRow(poId: string) {
    this.expandedRows.update(current => {
        const newState = {...current};
        // Toggle the boolean value for the given purchase order ID
        newState[poId] = !newState[poId];
        return newState;
    });
  }
  // --- Form Management ---
  createProductRow(): FormGroup {
    return this.fb.group({
      product: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      costPrice: [0, [Validators.required, Validators.min(0)]],
      total: [{ value: 0, disabled: true }],
    });
  }

  addProduct() {
    this.products.push(this.createProductRow());
  }

  removeProduct(index: number) {
    this.products.removeAt(index);
  }

  onProductChange(index: number) {
    const selectedProductId = this.products.at(index).get('product')?.value;
    const product = this.dropdownOptions.products.find(p => p._id === selectedProductId);
    if (product) {
      this.products.at(index).patchValue({ costPrice: product.price || 0 });
      this.updateItemTotal(index);
    }
  }

  updateItemTotal(index: number) {
    const item = this.products.at(index).value;
    const total = (item.quantity || 0) * (item.costPrice || 0);
    this.products.at(index).patchValue({ total }, { emitEvent: false });
  }

  getTotalAmount(): number {
    return this.products.controls.reduce((sum, item) => sum + (item.get('total')?.value || 0), 0);
  }

  resetForm() {
    // --- MODIFIED: Also reset the editing state ---
    this.editingPurchaseOrderId.set(null);
    this.purchaseForm.reset();
    this.products.clear();
    this.addProduct();
    // Set default status after reset
    this.purchaseForm.patchValue({ status: 'Pending' });
  }

  // --- NEW: Method to cancel editing and return to the view tab ---
  cancelEdit() {
    this.resetForm();
    this.activeTab.set('view');
  }


  // --- CRUD Actions ---

  // --- MODIFIED: savePurchase now handles both CREATE and UPDATE (Upsert) ---
  savePurchase() {
    if (this.purchaseForm.invalid) {
      this.showToast('warn', 'Validation Error', 'Please fill all required fields.');
      return;
    }
    
    const formValue = this.purchaseForm.getRawValue(); // Use getRawValue to include disabled controls
    const payload = {
      seller: formValue.seller,
      status: formValue.status, // Get status from the form
      items: formValue.products.map((p: any) => ({
        product: p.product,
        quantity: p.quantity,
        purchasePrice: p.costPrice // Map frontend 'costPrice' to backend 'purchasePrice'
      })),
    };

    const id = this.editingPurchaseOrderId();

    if (id) {
      // --- UPDATE LOGIC ---
      this.purchaseService.updatePurchaseOrder(id, payload).subscribe({
        next: () => {
          this.showToast('success', 'Success', 'Purchase order updated successfully!');
          this.resetForm();
          this.loadPurchases();
          this.activeTab.set('view');
        },
        error: (err) => {
          console.error("Update Purchase Error:", err);
          this.showToast('error', 'Error', 'Could not update purchase order.');
        }
      });
    } else {
      // --- CREATE LOGIC ---
      this.purchaseService.createPurchaseOrder(payload).subscribe({
        next: () => {
          this.showToast('success', 'Success', 'Purchase order created successfully!');
          this.resetForm();
          this.loadPurchases();
          this.activeTab.set('view');
        },
        error: (err) => {
          console.error("Save Purchase Error:", err);
          this.showToast('error', 'Error', 'Could not create purchase order.');
        }
      });
    }
  }

  // --- NEW: Method to populate the form for editing a purchase order ---
  editPurchaseOrder(po: any) {
    this.editingPurchaseOrderId.set(po._id);
    this.activeTab.set('create');

    // Clear existing products before populating
    this.products.clear();

    po.items.forEach((item: any) => {
      this.products.push(this.fb.group({
        product: [item.product, [Validators.required]],
        quantity: [item.quantity, [Validators.required, Validators.min(1)]],
        costPrice: [item.purchasePrice, [Validators.required, Validators.min(0)]],
        total: [{ value: item.quantity * item.purchasePrice, disabled: true }],
      }));
    });

    this.purchaseForm.patchValue({
      seller: po.seller,
      status: po.status,
    });
  }

  receiveStock(po: any) {
    this.purchaseService.receiveStock(po._id).subscribe({
      next: () => {
        this.showToast('success', 'Success', 'Stock received and inventory updated!');
        this.loadPurchases();
      },
      error: (err) => {
        console.error("Receive Stock Error:", err);
        this.showToast('error', 'Error', 'Failed to update stock.');
      }
    });
  }

  cancelPurchaseOrder(po: any) {
    this.showConfirmation('Confirm Cancellation', `Are you sure you want to cancel PO #${po.poNumber}?`, () => {
      this.purchaseService.updatePurchaseOrder(po._id, { status: 'Cancelled' }).subscribe({
        next: () => {
          this.showToast('success', 'Cancelled', `PO #${po.poNumber} has been cancelled.`);
          this.loadPurchases();
        },
        error: (err) => {
          console.error("Cancel PO Error:", err);
          this.showToast('error', 'Error', 'Could not cancel the purchase order.');
        }
      });
    });
  }

  deletePurchaseOrder(po: any) {
    this.showConfirmation('Confirm Deletion', `Are you sure you want to permanently delete PO #${po.poNumber}? This cannot be undone.`, () => {
      this.purchaseService.deletePurchaseOrder(po._id).subscribe({
        next: () => {
          this.showToast('success', 'Deleted', `PO #${po.poNumber} has been deleted.`);
          this.loadPurchases();
        },
        error: (err) => {
          console.error("Delete PO Error:", err);
          this.showToast('error', 'Error', 'Could not delete the purchase order.');
        }
      });
    });
  }

  // --- UI Helpers ---
  showToast(severity: 'success' | 'error' | 'warn', summary: string, detail: string) {
    this.toast.set({ visible: true, severity, summary, detail });
    setTimeout(() => this.toast.set({ ...this.toast(), visible: false }), 4000);
  }

  showConfirmation(header: string, message: string, accept: () => void) {
    this.confirmation.set({
      visible: true, header, message, accept: () => {
        accept();
        this.confirmation.set({ ...this.confirmation(), visible: false });
      },
      reject: () => {
        this.confirmation.set({ ...this.confirmation(), visible: false });
      }
    });
  }
}
// import { Component, OnInit, inject, signal } from '@angular/core';
// import { CommonModule, CurrencyPipe } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
// import { forkJoin } from 'rxjs';

// // PrimeNG Modules
// import { ButtonModule } from 'primeng/button';
// import { Select } from 'primeng/select'; // Corrected import for p-select

// // Services
// import { AutopopulateService } from '../../../../core/services/autopopulate.service';
// import { PurchaseorderService } from '../../../../core/services/purchaseorder.service';

// @Component({
//   selector: 'app-product-incoming',
//   standalone: true,
//   providers: [CurrencyPipe],
//   templateUrl: './product-incoming.component.html',
//   styleUrls: ['./product-incoming.component.css'],
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     ButtonModule,
//     Select
//   ]
// })
// export class PurchaseOrderDashboardComponent implements OnInit {

//   purchaseForm!: FormGroup;
//   purchaseList: any[] = [];
//   activeTab = signal('create');

//   public dropdownOptions = {
//     products: [] as any[],
//     sellers: [] as any[],
//   };

//   public statusOptions = ['Pending', 'Received', 'Cancelled'];

//   toast = signal({ visible: false, severity: 'success', summary: '', detail: '' });
//   confirmation = signal({ visible: false, header: '', message: '', accept: () => { }, reject: () => { } });

//   private fb = inject(FormBuilder);
//   private purchaseService = inject(PurchaseorderService);
//   private autoPopulate = inject(AutopopulateService);

//   ngOnInit(): void {
//     this.initializeForm();
//     this.loadDropdownData()
//     this.loadInitialData();
//   }

//   initializeForm() {
//     this.purchaseForm = this.fb.group({
//       seller: ['', Validators.required],
//       products: this.fb.array([]),
//     });
//     this.addProduct();
//   }

//   loadDropdownData() {
//     this.autoPopulate.getModuleData('products').subscribe((data: any) => this.dropdownOptions.products = data);
//     this.autoPopulate.getModuleData('sellers').subscribe((data: any) => this.dropdownOptions.sellers = data);
//   }

//   get products(): FormArray {
//     return this.purchaseForm.get('products') as FormArray;
//   }

//   // --- Data Loading ---
//   loadInitialData(): void {
//     forkJoin({
//       products: this.autoPopulate.getModuleData('products'),
//       sellers: this.autoPopulate.getModuleData('sellers')
//     }).subscribe({
//       next: ({ products, sellers }) => {
//         this.dropdownOptions.products = products || [];
//         this.dropdownOptions.sellers = sellers || [];
//         this.loadPurchases(); // Now load purchases safely
//       },
//       error: (err) => {
//         console.error('Failed to load dropdown data', err);
//         this.showToast('error', 'Load Error', 'Could not load sellers or products.');
//       }
//     });
//   }

//   loadPurchases() {
//     this.purchaseService.getPurchaseOrders().subscribe((res: any) => {
//       const purchases = res.data || [];
//       this.purchaseList = purchases.map((p: any) => ({
//         ...p,
//         sellerName: this.dropdownOptions.sellers.find(s => s._id === p.seller)?.name || 'N/A',
//       }));
//     });
//   }

//   // --- Form Management ---
//   createProductRow(): FormGroup {
//     return this.fb.group({
//       product: ['', Validators.required],
//       quantity: [1, [Validators.required, Validators.min(1)]],
//       costPrice: [0, [Validators.required, Validators.min(0)]],
//       total: [{ value: 0, disabled: true }],
//     });
//   }

//   addProduct() {
//     this.products.push(this.createProductRow());
//   }

//   removeProduct(index: number) {
//     this.products.removeAt(index);
//   }

//   onProductChange(index: number) {
//     const selectedProductId = this.products.at(index).get('product')?.value;
//     const product = this.dropdownOptions.products.find(p => p._id === selectedProductId);
//     if (product) {
//       this.products.at(index).patchValue({ costPrice: product.costPrice || 0 });
//       this.updateItemTotal(index);
//     }
//   }

//   updateItemTotal(index: number) {
//     const item = this.products.at(index).value;
//     const total = (item.quantity || 0) * (item.costPrice || 0);
//     this.products.at(index).patchValue({ total }, { emitEvent: false });
//   }

//   getTotalAmount(): number {
//     return this.products.controls.reduce((sum, item) => sum + (item.get('total')?.value || 0), 0);
//   }

//   resetForm() {
//     this.purchaseForm.reset();
//     this.products.clear();
//     this.addProduct();
//   }

//   // --- CRUD Actions ---
//   // savePurchase() {
//   //   if (this.purchaseForm.invalid) {
//   //     this.showToast('warn', 'Validation Error', 'Please fill all required fields.');
//   //     return;
//   //   }
//   //   const formValue = this.purchaseForm.value;
//   //   const payload = {
//   //     seller: formValue.seller,
//   //     status: 'Pending', // Default status on creation
//   //     items: formValue.products.map((p: any) => ({
//   //       product: p.product,
//   //       quantity: p.quantity,
//   //       costPrice: p.costPrice
//   //     })),
//   //     totalAmount: this.getTotalAmount(),
//   //   };

//   //   this.purchaseService.createPurchaseOrder(payload).subscribe({
//   //     next: () => {
//   //       this.showToast('success', 'Success', 'Purchase order created successfully!');
//   //       this.resetForm();
//   //       this.loadPurchases();
//   //       this.activeTab.set('view');
//   //     },
//   //     error: (err) => {
//   //       console.error("Save Purchase Error:", err);
//   //       this.showToast('error', 'Error', 'Could not create purchase order.');
//   //     }
//   //   });
//   // }
// // in product-incoming.component.ts

// savePurchase() {
//     if (this.purchaseForm.invalid) {
//       this.showToast('warn', 'Validation Error', 'Please fill all required fields.');
//       return;
//     }
//     const formValue = this.purchaseForm.value;
//     const payload = {
//       seller: formValue.seller,
//       status: 'Pending', // Default status on creation
//       items: formValue.products.map((p: any) => ({
//         product: p.product,
//         quantity: p.quantity,
//         // CORRECTED: Changed 'costPrice' to 'purchasePrice' to match the backend
//         purchasePrice: p.costPrice
//       })),
//       // The totalAmount is calculated on the backend, so we don't need to send it.
//       // Your controller recalculates it anyway for security.
//     };

//     this.purchaseService.createPurchaseOrder(payload).subscribe({
//       next: () => {
//         this.showToast('success', 'Success', 'Purchase order created successfully!');
//         this.resetForm();
//         this.loadPurchases();
//         this.activeTab.set('view');
//       },
//       error: (err) => {
//         console.error("Save Purchase Error:", err);
//         this.showToast('error', 'Error', 'Could not create purchase order.');
//       }
//     });
//   }
//   receiveStock(po: any) {
//     this.purchaseService.receiveStock(po._id).subscribe({
//       next: () => {
//         this.showToast('success', 'Success', 'Stock received and inventory updated!');
//         this.loadPurchases();
//       },
//       error: (err) => {
//         console.error("Receive Stock Error:", err);
//         this.showToast('error', 'Error', 'Failed to update stock.');
//       }
//     });
//   }

//   cancelPurchaseOrder(po: any) {
//     this.showConfirmation('Confirm Cancellation', `Are you sure you want to cancel PO #${po.poNumber}?`, () => {
//       this.purchaseService.updatePurchaseOrder(po._id, { status: 'Cancelled' }).subscribe({
//         next: () => {
//           this.showToast('success', 'Cancelled', `PO #${po.poNumber} has been cancelled.`);
//           this.loadPurchases();
//         },
//         error: (err) => {
//           console.error("Cancel PO Error:", err);
//           this.showToast('error', 'Error', 'Could not cancel the purchase order.');
//         }
//       });
//     });
//   }

//   deletePurchaseOrder(po: any) {
//     this.showConfirmation('Confirm Deletion', `Are you sure you want to permanently delete PO #${po.poNumber}? This cannot be undone.`, () => {
//       this.purchaseService.deletePurchaseOrder(po._id).subscribe({
//         next: () => {
//           this.showToast('success', 'Deleted', `PO #${po.poNumber} has been deleted.`);
//           this.loadPurchases();
//         },
//         error: (err) => {
//           console.error("Delete PO Error:", err);
//           this.showToast('error', 'Error', 'Could not delete the purchase order.');
//         }
//       });
//     });
//   }

//   // --- UI Helpers ---
//   showToast(severity: 'success' | 'error' | 'warn', summary: string, detail: string) {
//     this.toast.set({ visible: true, severity, summary, detail });
//     setTimeout(() => this.toast.set({ ...this.toast(), visible: false }), 4000);
//   }

//   showConfirmation(header: string, message: string, accept: () => void) {
//     this.confirmation.set({
//       visible: true, header, message, accept: () => {
//         accept();
//         this.confirmation.set({ ...this.confirmation(), visible: false });
//       },
//       reject: () => {
//         this.confirmation.set({ ...this.confirmation(), visible: false });
//       }
//     });
//   }
// }