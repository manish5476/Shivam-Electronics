import { Select } from 'primeng/select';
// src/app/Modules/PurchaseOrder/product-incoming.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';

// Services
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { PurchaseorderService } from '../../../../core/services/purchaseorder.service';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-product-incoming',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, DropdownModule, Select, DatePicker, FormsModule,
    TableModule, TagModule, TooltipModule, CalendarModule, InputTextModule
  ],
  providers: [CurrencyPipe],
  templateUrl: './product-incoming.component.html',
  styleUrls: ['./product-incoming.component.css']
})
export class PurchaseOrderDashboardComponent implements OnInit {
  purchaseForm!: FormGroup;
  purchaseList: any[] = [];
  loading = false;
  activeTab = signal<'create' | 'view'>('create');
  editingPurchaseOrderId = signal<string | null>(null);

  dropdownOptions = { products: [] as any[], sellers: [] as any[] };
  statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Received', value: 'received' },
    { label: 'Cancelled', value: 'cancelled' }
  ];
  statusFilterOptions = [
    { label: 'All', value: '' },
    ...this.statusOptions
  ];

  // FILTERS
  filters = {
    poNumber: '',
    seller: null as string | null,
    status: '' as string,
    startDate: null as Date | null,
    endDate: null as Date | null
  };

  toast = signal({ visible: false, severity: 'success' as 'success' | 'error' | 'warn', summary: '', detail: '' });
  confirmation = signal({ visible: false, header: '', message: '', accept: () => { }, reject: () => { } });

  private fb = inject(FormBuilder);
  private purchaseService = inject(PurchaseorderService);
  private autoPopulate = inject(AutopopulateService);

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
  }

  initializeForm() {
    this.purchaseForm = this.fb.group({
      seller: ['', Validators.required],
      status: ['pending', Validators.required],
      products: this.fb.array([])
    });
    this.addProduct();
  }

  get products(): FormArray {
    return this.purchaseForm.get('products') as FormArray;
  }

  loadInitialData() {
    this.autoPopulate.getModuleData('sellers').subscribe(data => this.dropdownOptions.sellers = data);
    this.autoPopulate.getModuleData('products').subscribe(data => this.dropdownOptions.products = data);
  }
  
  // loadInitialData() {
  //   forkJoin({
  //     products: this.autoPopulate.getModuleData('products'),
  //     sellers: this.autoPopulate.getModuleData('sellers')
  //   }).subscribe({
  //     next: ({ products, sellers }) => {
  //       this.dropdownOptions.products = products || [];
  //       this.dropdownOptions.sellers = sellers || [];
  //     }
  //   });
  // }

  applyFilters() {
    this.loading = true;
    const params: any = {};

    if (this.filters.poNumber) params.poNumber = this.filters.poNumber;
    if (this.filters.seller) params.seller = this.filters.seller;
    if (this.filters.status) params.status = this.filters.status;
    if (this.filters.startDate) params['orderDate[gte]'] = this.filters.startDate.toISOString().split('T')[0];
    if (this.filters.endDate) params['orderDate[lte]'] = this.filters.endDate.toISOString().split('T')[0];

    this.purchaseService.getPurchaseOrders(params).subscribe({
      next: (res: any) => {
        this.purchaseList = (res.data || []).map((po: any) => ({
          ...po,
          poNumber: po.poNumber || po._id.slice(-6)
        }));
        this.loading = false;
      },
      error: () => {
        this.showToast('error', 'Error', 'Failed to load orders.');
        this.loading = false;
      }
    });
  }

  resetFilters() {
    this.filters = { poNumber: '', seller: null, status: '', startDate: null, endDate: null };
    this.applyFilters();
  }

  getProductName(id: string): string {
    return this.dropdownOptions.products.find(p => p._id === id)?.title || 'Unknown';
  }

  // CRUD & Form
  createProductRow(): FormGroup {
    return this.fb.group({
      product: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      costPrice: [0, [Validators.required, Validators.min(0)]],
      total: [{ value: 0, disabled: true }]
    });
  }

  addProduct() { this.products.push(this.createProductRow()); }
  removeProduct(i: number) { this.products.removeAt(i); }

  onProductChange(i: number) {
    const id = this.products.at(i).get('product')?.value;
    const product = this.dropdownOptions.products.find(p => p._id === id);
    if (product) {
      this.products.at(i).patchValue({ costPrice: product.price || 0 });
      this.updateItemTotal(i);
    }
  }

  updateItemTotal(i: number) {
    const item = this.products.at(i).value;
    const total = (item.quantity || 0) * (item.costPrice || 0);
    this.products.at(i).patchValue({ total }, { emitEvent: false });
  }

  getTotalAmount(): number {
    return this.products.controls.reduce((sum, c) => sum + (c.get('total')?.value || 0), 0);
  }

  resetForm() {
    this.editingPurchaseOrderId.set(null);
    this.purchaseForm.reset({ status: 'pending' });
    this.products.clear();
    this.addProduct();
  }

  cancelEdit() {
    this.resetForm();
    this.activeTab.set('view');
  }

  savePurchase() {
    if (this.purchaseForm.invalid) return this.showToast('warn', 'Invalid', 'Fill all fields.');

    const payload = {
      seller: this.purchaseForm.value.seller,
      status: this.purchaseForm.value.status,
      items: this.purchaseForm.value.products.map((p: any) => ({
        product: p.product,
        quantity: p.quantity,
        purchasePrice: p.costPrice
      }))
    };

    const id = this.editingPurchaseOrderId();
    const action$ = id
      ? this.purchaseService.updatePurchaseOrder(id, payload)
      : this.purchaseService.createPurchaseOrder(payload);

    action$.subscribe({
      next: () => {
        this.showToast('success', 'Success', id ? 'Updated!' : 'Created!');
        this.resetForm();
        this.activeTab.set('view');
        this.applyFilters();
      },
      error: () => this.showToast('error', 'Error', 'Failed.')
    });
  }

  editPurchaseOrder(po: any) {
    this.editingPurchaseOrderId.set(po._id);
    this.activeTab.set('create');
    this.products.clear();
    po.items.forEach((item: any) => {
      this.products.push(this.fb.group({
        product: [item.product, Validators.required],
        quantity: [item.quantity, [Validators.required, Validators.min(1)]],
        costPrice: [item.purchasePrice, [Validators.required, Validators.min(0)]],
        total: [{ value: item.quantity * item.purchasePrice, disabled: true }]
      }));
    });
    this.purchaseForm.patchValue({ seller: po.seller, status: po.status });
  }

  receiveStock(po: any) { this.runAction('Receive', () => this.purchaseService.receiveStock(po._id)); }
  cancelPurchaseOrder(po: any) { this.runAction('Cancel', () => this.purchaseService.updatePurchaseOrder(po._id, { status: 'cancelled' })); }
  deletePurchaseOrder(po: any) { this.runAction('Delete', () => this.purchaseService.deletePurchaseOrder(po._id)); }

  private runAction(action: string, apiCall: () => any) {
    this.showConfirmation(`Confirm ${action}`, `Are you sure?`, () => {
      apiCall().subscribe({
        next: () => { this.showToast('success', 'Success', `${action}d!`); this.applyFilters(); },
        error: () => this.showToast('error', 'Error', 'Failed.')
      });
    });
  }

  getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    return status === 'received' ? 'success' : status === 'pending' ? 'warning' : 'danger';
  }

  toastClass() {
    return {
      'toast-success': this.toast().severity === 'success',
      'toast-error': this.toast().severity === 'error',
      'toast-warn': this.toast().severity === 'warn'
    };
  }

  toastIcon() {
    return this.toast().severity === 'success' ? 'pi pi-check-circle' :
      this.toast().severity === 'error' ? 'pi pi-times-circle' : 'pi pi-exclamation-triangle';
  }

  showToast(severity: 'success' | 'error' | 'warn', summary: string, detail: string) {
    this.toast.set({ visible: true, severity, summary, detail });
    setTimeout(() => this.toast.set({ ...this.toast(), visible: false }), 4000);
  }

  showConfirmation(header: string, message: string, accept: () => void) {
    this.confirmation.set({
      visible: true, header, message,
      accept: () => { accept(); this.confirmation.set({ ...this.confirmation(), visible: false }); },
      reject: () => this.confirmation.set({ ...this.confirmation(), visible: false })
    });
  }
}

// // src/app/Modules/PurchaseOrder/product-incoming.component.ts
// import { Component, OnInit, inject, signal } from '@angular/core';
// import { CommonModule, CurrencyPipe } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
// import { forkJoin } from 'rxjs';

// // PrimeNG
// import { ButtonModule } from 'primeng/button';
// import { DropdownModule } from 'primeng/dropdown';
// import { TableModule } from 'primeng/table';
// import { TagModule } from 'primeng/tag';
// import { TooltipModule } from 'primeng/tooltip';
// import { ToastModule } from 'primeng/toast';
// import { ConfirmDialogModule } from 'primeng/confirmdialog';

// // Services
// import { AutopopulateService } from '../../../../core/services/autopopulate.service';
// import { PurchaseorderService } from '../../../../core/services/purchaseorder.service';
// import { Select } from 'primeng/select';

// @Component({
//   selector: 'app-product-incoming',
//   standalone: true,
//   providers: [CurrencyPipe],
//   imports: [
//     CommonModule,Select,
//     ReactiveFormsModule,
//     ButtonModule,
//     DropdownModule,
//     TableModule,
//     TagModule,
//     TooltipModule,
//     ToastModule,
//     ConfirmDialogModule
//   ],
//   templateUrl: './product-incoming.component.html',
//   styleUrls: ['./product-incoming.component.css']
// })
// export class PurchaseOrderDashboardComponent implements OnInit {
//   purchaseForm!: FormGroup;
//   purchaseList: any[] = [];
//   loading = false;
//   activeTab = signal<'create' | 'view'>('create');
//   editingPurchaseOrderId = signal<string | null>(null);

//   dropdownOptions = { products: [] as any[], sellers: [] as any[] };
//   statusOptions = [
//     { label: 'Pending', value: 'Pending' },
//     { label: 'Received', value: 'Received' },
//     { label: 'Cancelled', value: 'Cancelled' }
//   ];

//   toast = signal({ visible: false, severity: 'success' as 'success'|'error'|'warn', summary: '', detail: '' });
//   confirmation = signal({ visible: false, header: '', message: '', accept: () => {}, reject: () => {} });

//   private fb = inject(FormBuilder);
//   private purchaseService = inject(PurchaseorderService);
//   private autoPopulate = inject(AutopopulateService);

//   ngOnInit(): void {
//     this.initializeForm();
//     this.loadInitialData();
//   }

//   initializeForm() {
//     this.purchaseForm = this.fb.group({
//       seller: ['', Validators.required],
//       status: ['Pending', Validators.required],
//       products: this.fb.array([]),
//     });
//     this.addProduct();
//   }

//   get products(): FormArray {
//     return this.purchaseForm.get('products') as FormArray;
//   }

//   loadInitialData() {
//         this.autoPopulate.getModuleData('sellers').subscribe(data => this.dropdownOptions.sellers = data);
//             this.autoPopulate.getModuleData('products').subscribe(data =>this.dropdownOptions.products  = data);
//   }

//   loadPurchases() {
//     this.loading = true;
//     this.purchaseService.getPurchaseOrders().subscribe({
//       next: (res: any) => {
//         const purchases = res.data || [];
//         this.purchaseList = purchases.map((order: any) => {
//           const mappedItems = order.items.map((item: any) => ({
//             ...item,
//             productName: this.dropdownOptions.products.find(p => p._id === item.product)?.title || 'Unknown'
//           }));
//           return {
//             ...order,
//             items: mappedItems,
//             sellerName: this.dropdownOptions.sellers.find(s => s._id === order.seller)?.name || 'Unknown',
//           };
//         });
//         this.loading = false;
//       },
//       error: () => {
//         this.showToast('error', 'Error', 'Failed to load purchase orders.');
//         this.loading = false;
//       }
//     });
//   }

//   createProductRow(): FormGroup {
//     return this.fb.group({
//       product: ['', Validators.required],
//       quantity: [1, [Validators.required, Validators.min(1)]],
//       costPrice: [0, [Validators.required, Validators.min(0)]],
//       total: [{ value: 0, disabled: true }],
//     });
//   }

//   addProduct() { this.products.push(this.createProductRow()); }
//   removeProduct(i: number) { this.products.removeAt(i); }

//   onProductChange(i: number) {
//     const id = this.products.at(i).get('product')?.value;
//     const product = this.dropdownOptions.products.find(p => p._id === id);
//     if (product) {
//       this.products.at(i).patchValue({ costPrice: product.price || 0 });
//       this.updateItemTotal(i);
//     }
//   }

//   updateItemTotal(i: number) {
//     const item = this.products.at(i).value;
//     const total = (item.quantity || 0) * (item.costPrice || 0);
//     this.products.at(i).patchValue({ total }, { emitEvent: false });
//   }

//   getTotalAmount(): number {
//     return this.products.controls.reduce((sum, ctrl) => sum + (ctrl.get('total')?.value || 0), 0);
//   }

//   resetForm() {
//     this.editingPurchaseOrderId.set(null);
//     this.purchaseForm.reset({ status: 'Pending' });
//     this.products.clear();
//     this.addProduct();
//   }

//   cancelEdit() {
//     this.resetForm();
//     this.activeTab.set('view');
//   }

//   savePurchase() {
//     if (this.purchaseForm.invalid) return this.showToast('warn', 'Invalid', 'Please fill all required fields.');

//     const payload = {
//       seller: this.purchaseForm.value.seller,
//       status: this.purchaseForm.value.status,
//       items: this.purchaseForm.value.products.map((p: any) => ({
//         product: p.product,
//         quantity: p.quantity,
//         purchasePrice: p.costPrice
//       }))
//     };

//     const id = this.editingPurchaseOrderId();
//     const action$ = id
//       ? this.purchaseService.updatePurchaseOrder(id, payload)
//       : this.purchaseService.createPurchaseOrder(payload);

//     action$.subscribe({
//       next: () => {
//         this.showToast('success', 'Success', id ? 'Updated!' : 'Created!');
//         this.resetForm();
//         this.activeTab.set('view');
//         this.loadPurchases();
//       },
//       error: () => this.showToast('error', 'Error', 'Operation failed.')
//     });
//   }

//   editPurchaseOrder(po: any) {
//     this.editingPurchaseOrderId.set(po._id);
//     this.activeTab.set('create');
//     this.products.clear();
//     po.items.forEach((item: any) => {
//       this.products.push(this.fb.group({
//         product: [item.product, Validators.required],
//         quantity: [item.quantity, [Validators.required, Validators.min(1)]],
//         costPrice: [item.purchasePrice, [Validators.required, Validators.min(0)]],
//         total: [{ value: item.quantity * item.purchasePrice, disabled: true }]
//       }));
//     });
//     this.purchaseForm.patchValue({ seller: po.seller, status: po.status });
//   }

//   receiveStock(po: any) { this.runWithConfirm('Receive Stock', `Receive PO #${po.poNumber}?`, () => this.purchaseService.receiveStock(po._id)); }
//   cancelPurchaseOrder(po: any) { this.runWithConfirm('Cancel Order', `Cancel PO #${po.poNumber}?`, () => this.purchaseService.updatePurchaseOrder(po._id, { status: 'Cancelled' })); }
//   deletePurchaseOrder(po: any) { this.runWithConfirm('Delete Order', `Delete PO #${po.poNumber} permanently?`, () => this.purchaseService.deletePurchaseOrder(po._id)); }

//   private runWithConfirm(header: string, message: string, action: () => any) {
//     this.showConfirmation(header, message, () => {
//       action().subscribe({
//         next: () => { this.showToast('success', 'Success', 'Done!'); this.loadPurchases(); },
//         error: () => this.showToast('error', 'Error', 'Failed.')
//       });
//     });
//   }

//   getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
//     return status === 'Received' ? 'success' : status === 'Pending' ? 'warning' : 'danger';
//   }

//   toastIcon() {
//     return this.toast().severity === 'success' ? 'pi pi-check-circle' :
//            this.toast().severity === 'error' ? 'pi pi-times-circle' : 'pi pi-exclamation-triangle';
//   }

//   showToast(severity: 'success'|'error'|'warn', summary: string, detail: string) {
//     this.toast.set({ visible: true, severity, summary, detail });
//     setTimeout(() => this.toast.set({ ...this.toast(), visible: false }), 4000);
//   }

//   showConfirmation(header: string, message: string, accept: () => void) {
//     this.confirmation.set({
//       visible: true, header, message,
//       accept: () => { accept(); this.confirmation.set({ ...this.confirmation(), visible: false }); },
//       reject: () => this.confirmation.set({ ...this.confirmation(), visible: false })
//     });
//   }
// }