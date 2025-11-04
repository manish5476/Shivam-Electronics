import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { PurchaseorderService } from '../../../../core/services/purchaseorder.service';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { TagCellRendererComponent } from '../../../../shared/AgGrid/AgGridcomponents/tagCellRenderer/tagcellRenderer.component';

@Component({
  selector: 'app-product-incoming',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    Select,
    DatePicker,
    SharedGridComponent
  ],
  providers: [CurrencyPipe],
  templateUrl: './product-incoming.component.html',
  styleUrls: ['./product-incoming.component.css']
})
export class PurchaseOrderDashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cd = inject(ChangeDetectorRef);
  private purchaseService = inject(PurchaseorderService);
  private autoPopulate = inject(AutopopulateService);

  purchaseForm!: FormGroup;
  data: any[] = [];
  column: any[] = [];
  totalCount = 0;
  currentPage = 1;
  pageSize = 50;
  loading = false;

  dropdownOptions = { products: [] as any[], sellers: [] as any[] };
  activeTab = signal<'create' | 'view'>('view');
  editingPurchaseOrderId = signal<string | null>(null);

  // Dialog
  confirmDialogVisible = false;
  selectedPurchaseOrder: any = null;

  filters = {
    poNumber: '',
    seller: null as string | null,
    status: '',
    startDate: '',
    endDate: ''
  };

  statusOptions = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Received', value: 'received' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
    this.initColumns();
  }

  // ✅ Form initialization
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

  addProduct() {
    this.products.push(
      this.fb.group({
        product: ['', Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
        costPrice: [0, [Validators.required, Validators.min(0)]],
        total: [{ value: 0, disabled: true }]
      })
    );
  }

  removeProduct(i: number) {
    this.products.removeAt(i);
  }

  updateItemTotal(i: number): void {
    const control = this.products.at(i);
    const q = control.get('quantity')?.value || 0;
    const p = control.get('costPrice')?.value || 0;
    control.patchValue({ total: q * p }, { emitEvent: false });
  }

  getTotalAmount(): number {
    return this.products.controls.reduce((sum, c) => sum + (c.get('total')?.value || 0), 0);
  }

  loadInitialData() {
    this.autoPopulate.getModuleData('sellers').subscribe(data => (this.dropdownOptions.sellers = data));
    this.autoPopulate.getModuleData('products').subscribe(data => (this.dropdownOptions.products = data));
  }

  // ✅ Filter & fetch
  applyFiltersAndReset() {
    this.currentPage = 1;
    this.data = [];
    this.getPurchaseOrders(true);
  }

  resetFilters() {
    this.filters = { poNumber: '', seller: null, status: '', startDate: '', endDate: '' };
    this.applyFiltersAndReset();
  }

  getPurchaseOrders(isReset = false) {
    if (this.loading) return;
    this.loading = true;
    if (isReset) this.currentPage = 1;

    const params: any = { page: this.currentPage, limit: this.pageSize };

    if (this.filters.poNumber) params.poNumber = this.filters.poNumber;
    if (this.filters.seller) params.seller = this.filters.seller;
    if (this.filters.status) params.status = this.filters.status;

    this.purchaseService.getPurchaseOrders(params).subscribe({
      next: (res: any) => {
        const newData = res.data || [];
        this.totalCount = res.totalCount || newData.length;
        this.data = isReset ? newData : [...this.data, ...newData];
        this.currentPage++;
        this.loading = false;
        this.cd.markForCheck();
      },
      error: err => {
        console.error('Error loading purchase orders', err);
        this.loading = false;
      }
    });
  }

  onGridReady() {
    this.getPurchaseOrders(true);
  }

  onScrolledToBottom() {
    if (!this.loading && this.data.length < this.totalCount) this.getPurchaseOrders(false);
  }

  private initColumns() {
    this.column = [
      { field: 'poNumber', headerName: 'PO Number', width: 150 },
      { field: 'seller.name', headerName: 'Seller', width: 180, valueGetter: (p: any) => p.data.seller?.name || 'N/A' },
      { field: 'seller.shopName', headerName: 'Shop', width: 200, valueGetter: (p: any) => p.data.seller?.shopName || 'N/A' },
      { field: 'totalAmount', headerName: 'Total', width: 150, valueFormatter: (p: any) => this.formatCurrency(p.value) },
      { field: 'status', headerName: 'Status', width: 140, cellRenderer: TagCellRendererComponent },
      { field: 'orderDate', headerName: 'Date', width: 200, valueFormatter: (p: any) => new Date(p.value).toLocaleString() }
    ];
  }

  private formatCurrency(value: number): string {
    if (value == null) return '';
    return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  }

  // ✅ Main grid event handler
  eventFromGrid(event: any) {
    const eventType = event?.type || event?.eventType;
    const action = event?.action || event?.event?.action;
    const data = event?.data || event?.event?.data;

    if (eventType === 'edit' || action === 'edit') {
      this.openConfirmDialog(data);
    } else if (eventType === 'delete' || action === 'delete') {
      this.deletePurchaseOrder(data);
    }
  }

  // ✅ Dialog actions
  openConfirmDialog(po: any) {
    this.selectedPurchaseOrder = po;
    this.confirmDialogVisible = true;
  }

  confirmPurchaseOrder() {
    if (!this.selectedPurchaseOrder?._id) return;
    this.purchaseService
      .updatePurchaseOrder(this.selectedPurchaseOrder._id, { status: 'received' })
      .subscribe(() => {
        this.confirmDialogVisible = false;
        this.selectedPurchaseOrder = null;
        this.getPurchaseOrders(true);
      });
  }

  // ✅ Restore savePurchase
  savePurchase() {
    if (this.purchaseForm.invalid) return;

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

    action$.subscribe(() => {
      this.resetForm();
      this.activeTab.set('view');
      this.getPurchaseOrders(true);
    });
  }

  // ✅ Restore resetForm
  resetForm() {
    this.editingPurchaseOrderId.set(null);
    this.purchaseForm.reset({ status: 'pending' });
    this.products.clear();
    this.addProduct();
  }

  deletePurchaseOrder(po: any) {
    this.purchaseService.deletePurchaseOrder(po._id).subscribe(() => this.getPurchaseOrders(true));
  }
}


// import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
// import { CommonModule, CurrencyPipe } from '@angular/common';
// import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { ButtonModule } from 'primeng/button';
// import { Select } from 'primeng/select';
// import { DatePicker } from 'primeng/datepicker';
// import { DialogModule } from 'primeng/dialog';
// import { AutopopulateService } from '../../../../core/services/autopopulate.service';
// import { PurchaseorderService } from '../../../../core/services/purchaseorder.service';
// import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
// import { TagCellRendererComponent } from '../../../../shared/AgGrid/AgGridcomponents/tagCellRenderer/tagcellRenderer.component';

// @Component({
//   selector: 'app-product-incoming',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     ButtonModule,
//     DialogModule,
//     Select,
//     DatePicker,
//     SharedGridComponent
//   ],
//   providers: [CurrencyPipe],
//   templateUrl: './product-incoming.component.html',
//   styleUrls: ['./product-incoming.component.css']
// })
// export class PurchaseOrderDashboardComponent implements OnInit {
//   private fb = inject(FormBuilder);
//   private cd = inject(ChangeDetectorRef);
//   private purchaseService = inject(PurchaseorderService);
//   private autoPopulate = inject(AutopopulateService);

//   purchaseForm!: FormGroup;
//   data: any[] = [];
//   column: any[] = [];
//   totalCount = 0;
//   currentPage = 1;
//   pageSize = 50;
//   loading = false;

//   dropdownOptions = { products: [] as any[], sellers: [] as any[] };
//   activeTab = signal<'create' | 'view'>('view');
//   editingPurchaseOrderId = signal<string | null>(null);

//   // Confirmation Dialog
//   confirmDialogVisible = false;
//   selectedPurchaseOrder: any = null;

//   filters = {
//     poNumber: '',
//     seller: null as string | null,
//     status: '',
//     startDate: '',
//     endDate: ''
//   };

//   statusOptions = [
//     { label: 'All', value: '' },
//     { label: 'Pending', value: 'pending' },
//     { label: 'Received', value: 'received' },
//     { label: 'Cancelled', value: 'cancelled' }
//   ];

//   ngOnInit(): void {
//     this.initializeForm();
//     this.loadInitialData();
//     this.initColumns();
//   }

//   initializeForm() {
//     this.purchaseForm = this.fb.group({
//       seller: ['', Validators.required],
//       status: ['pending', Validators.required],
//       products: this.fb.array([])
//     });
//     this.addProduct();
//   }

//   get products(): FormArray {
//     return this.purchaseForm.get('products') as FormArray;
//   }

//   addProduct() {
//     this.products.push(
//       this.fb.group({
//         product: ['', Validators.required],
//         quantity: [1, [Validators.required, Validators.min(1)]],
//         costPrice: [0, [Validators.required, Validators.min(0)]],
//         total: [{ value: 0, disabled: true }]
//       })
//     );
//   }

//   removeProduct(i: number) {
//     this.products.removeAt(i);
//   }

//   updateItemTotal(i: number): void {
//     const control = this.products.at(i);
//     const q = control.get('quantity')?.value || 0;
//     const p = control.get('costPrice')?.value || 0;
//     control.patchValue({ total: q * p }, { emitEvent: false });
//   }

//   getTotalAmount(): number {
//     return this.products.controls.reduce((sum, c) => sum + (c.get('total')?.value || 0), 0);
//   }

//   loadInitialData() {
//     this.autoPopulate.getModuleData('sellers').subscribe(data => this.dropdownOptions.sellers = data);
//     this.autoPopulate.getModuleData('products').subscribe(data => this.dropdownOptions.products = data);
//   }

//   applyFiltersAndReset() {
//     this.currentPage = 1;
//     this.data = [];
//     this.getPurchaseOrders(true);
//   }

//   resetFilters() {
//     this.filters = { poNumber: '', seller: null, status: '', startDate: '', endDate: '' };
//     this.applyFiltersAndReset();
//   }

//   getPurchaseOrders(isReset = false) {
//     if (this.loading) return;
//     this.loading = true;
//     if (isReset) this.currentPage = 1;

//     const params: any = {
//       page: this.currentPage,
//       limit: this.pageSize
//     };

//     if (this.filters.poNumber) params.poNumber = this.filters.poNumber;
//     if (this.filters.seller) params.seller = this.filters.seller;
//     if (this.filters.status) params.status = this.filters.status;

//     this.purchaseService.getPurchaseOrders(params).subscribe({
//       next: (res: any) => {
//         const newData = res.data || [];
//         this.totalCount = res.totalCount || newData.length;
//         this.data = isReset ? newData : [...this.data, ...newData];
//         this.currentPage++;
//         this.loading = false;
//         this.cd.markForCheck();
//       },
//       error: err => {
//         console.error('Error loading purchase orders', err);
//         this.loading = false;
//       }
//     });
//   }

//   onGridReady() {
//     this.getPurchaseOrders(true);
//   }

//   onScrolledToBottom() {
//     if (!this.loading && this.data.length < this.totalCount) this.getPurchaseOrders(false);
//   }

//   private initColumns() {
//     this.column = [
//       { field: 'poNumber', headerName: 'PO Number', width: 150 },
//       { field: 'seller.name', headerName: 'Seller', width: 180, valueGetter: (p: any) => p.data.seller?.name || 'N/A' },
//       { field: 'seller.shopName', headerName: 'Shop', width: 200, valueGetter: (p: any) => p.data.seller?.shopName || 'N/A' },
//       { field: 'totalAmount', headerName: 'Total', width: 150, valueFormatter: (p: any) => this.formatCurrency(p.value) },
//       { field: 'status', headerName: 'Status', width: 140, cellRenderer: TagCellRendererComponent },
//       { field: 'orderDate', headerName: 'Date', width: 200, valueFormatter: (p: any) => new Date(p.value).toLocaleString() }
//     ];
//   }

//   private formatCurrency(value: number): string {
//     if (value == null) return '';
//     return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
//   }

//   eventFromGrid(event: any) {
//     const { type, data } = event;
//     if (type === 'edit') {
//       this.openConfirmDialog(data);
//     } else if (type === 'delete') {
//       this.deletePurchaseOrder(data);
//     }
//   }

//   openConfirmDialog(po: any) {
//     this.selectedPurchaseOrder = po;
//     this.confirmDialogVisible = true;
//   }

//   confirmPurchaseOrder() {
//     if (!this.selectedPurchaseOrder?._id) return;

//     this.purchaseService.updatePurchaseOrder(this.selectedPurchaseOrder._id, { status: 'received' }).subscribe(() => {
//       this.confirmDialogVisible = false;
//       this.selectedPurchaseOrder = null;
//       this.getPurchaseOrders(true);
//     });
//   }

//   deletePurchaseOrder(po: any) {
//     this.purchaseService.deletePurchaseOrder(po._id).subscribe(() => this.getPurchaseOrders(true));
//   }
// }


// // import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
// // import { CommonModule, CurrencyPipe } from '@angular/common';
// // import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
// // import { ButtonModule } from 'primeng/button';
// // import { Select } from 'primeng/select';
// // import { DatePicker } from 'primeng/datepicker';
// // import { AutopopulateService } from '../../../../core/services/autopopulate.service';
// // import { PurchaseorderService } from '../../../../core/services/purchaseorder.service';
// // import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
// // import { TagCellRendererComponent } from '../../../../shared/AgGrid/AgGridcomponents/tagCellRenderer/tagcellRenderer.component';

// // @Component({
// //   selector: 'app-product-incoming',
// //   standalone: true,
// //   imports: [
// //     CommonModule,
// //     FormsModule,
// //     ReactiveFormsModule,
// //     ButtonModule,
// //     Select,
// //     DatePicker,
// //     SharedGridComponent
// //   ],
// //   providers: [CurrencyPipe],
// //   templateUrl: './product-incoming.component.html',
// //   styleUrls: ['./product-incoming.component.css']
// // })
// // export class PurchaseOrderDashboardComponent implements OnInit {
// //   private fb = inject(FormBuilder);
// //   private cd = inject(ChangeDetectorRef);
// //   private purchaseService = inject(PurchaseorderService);
// //   private autoPopulate = inject(AutopopulateService);

// //   purchaseForm!: FormGroup;
// //   data: any[] = [];
// //   column: any[] = [];
// //   totalCount = 0;
// //   currentPage = 1;
// //   pageSize = 50;
// //   loading = false;

// //   dropdownOptions = { products: [] as any[], sellers: [] as any[] };
// //   activeTab = signal<'create' | 'view'>('create');
// //   editingPurchaseOrderId = signal<string | null>(null);

// //   filters = {
// //     poNumber: '',
// //     seller: null as string | null,
// //     status: '',
// //     startDate: '',
// //     endDate: ''
// //   };

// //   statusOptions = [
// //     { label: 'All', value: '' },
// //     { label: 'Pending', value: 'pending' },
// //     { label: 'Received', value: 'received' },
// //     { label: 'Cancelled', value: 'cancelled' }
// //   ];

// //   ngOnInit(): void {
// //     this.initializeForm();
// //     this.loadInitialData();
// //     this.initColumns();
// //   }

// //   initializeForm() {
// //     this.purchaseForm = this.fb.group({
// //       seller: ['', Validators.required],
// //       status: ['pending', Validators.required],
// //       products: this.fb.array([])
// //     });
// //     this.addProduct();
// //   }

// //   get products(): FormArray {
// //     return this.purchaseForm.get('products') as FormArray;
// //   }

// //   addProduct() {
// //     this.products.push(
// //       this.fb.group({
// //         product: ['', Validators.required],
// //         quantity: [1, [Validators.required, Validators.min(1)]],
// //         costPrice: [0, [Validators.required, Validators.min(0)]],
// //         total: [{ value: 0, disabled: true }]
// //       })
// //     );
// //   }

// //   removeProduct(i: number) {
// //     this.products.removeAt(i);
// //   }

// //   // ✅ Fix: Add updateItemTotal function
// //   updateItemTotal(i: number): void {
// //     const productControl = this.products.at(i);
// //     const quantity = productControl.get('quantity')?.value || 0;
// //     const costPrice = productControl.get('costPrice')?.value || 0;
// //     const total = quantity * costPrice;
// //     productControl.patchValue({ total }, { emitEvent: false });
// //   }

// //   // ✅ Utility: Compute grand total
// //   getTotalAmount(): number {
// //     return this.products.controls.reduce((sum, control) => {
// //       const total = control.get('total')?.value || 0;
// //       return sum + total;
// //     }, 0);
// //   }

// //   loadInitialData() {
// //     this.autoPopulate.getModuleData('sellers').subscribe(data => this.dropdownOptions.sellers = data);
// //     this.autoPopulate.getModuleData('products').subscribe(data => this.dropdownOptions.products = data);
// //   }

// //   applyFiltersAndReset() {
// //     this.currentPage = 1;
// //     this.data = [];
// //     this.getPurchaseOrders(true);
// //   }

// //   resetFilters() {
// //     this.filters = { poNumber: '', seller: null, status: '', startDate: '', endDate: '' };
// //     this.applyFiltersAndReset();
// //   }

// //   getPurchaseOrders(isReset = false) {
// //     if (this.loading) return;
// //     this.loading = true;
// //     if (isReset) this.currentPage = 1;

// //     const params: any = {
// //       page: this.currentPage,
// //       limit: this.pageSize
// //     };

// //     if (this.filters.poNumber) params.poNumber = this.filters.poNumber;
// //     if (this.filters.seller) params.seller = this.filters.seller;
// //     if (this.filters.status) params.status = this.filters.status;
// //     if (this.filters.startDate) params.startDate = this.filters.startDate;
// //     if (this.filters.endDate) params.endDate = this.filters.endDate;

// //     this.purchaseService.getPurchaseOrders(params).subscribe({
// //       next: (res: any) => {
// //         const newData = res.data || [];
// //         this.totalCount = res.totalCount || newData.length;
// //         this.data = isReset ? newData : [...this.data, ...newData];
// //         this.currentPage++;
// //         this.loading = false;
// //         this.cd.markForCheck();
// //       },
// //       error: err => {
// //         console.error('Error loading purchase orders', err);
// //         this.loading = false;
// //       }
// //     });
// //   }

// //   onGridReady() {
// //     this.getPurchaseOrders(true);
// //   }

// //   onScrolledToBottom() {
// //     if (!this.loading && this.data.length < this.totalCount) this.getPurchaseOrders(false);
// //   }

// //   private initColumns() {
// //     this.column = [
// //       {
// //         field: 'poNumber',
// //         headerName: 'PO Number',
// //         width: 150,
// //         sortable: true,
// //       },
// //       {
// //         field: 'seller.name',
// //         headerName: 'Seller',
// //         width: 180,
// //         valueGetter: (p: any) => p.data.seller?.name || 'N/A',
// //       },
// //       {
// //         field: 'seller.shopName',
// //         headerName: 'Shop',
// //         width: 200,
// //         valueGetter: (p: any) => p.data.seller?.shopName || 'N/A',
// //       },
// //       {
// //         field: 'seller.gstin',
// //         headerName: 'GSTIN',
// //         width: 160,
// //         cellClass: 'font-mono text-xs',
// //       },
// //       {
// //         field: 'totalAmount',
// //         headerName: 'Total',
// //         width: 150,
// //         valueFormatter: (p: any) => this.formatCurrency(p.value),
// //       },
// //       {
// //         field: 'status',
// //         headerName: 'Status',
// //         width: 140,
// //         cellRenderer: TagCellRendererComponent,
// //       },
// //       {
// //         field: 'orderDate',
// //         headerName: 'Date',
// //         width: 200,
// //         valueFormatter: (p: any) => new Date(p.value).toLocaleString(),
// //       }
// //     ];
// //   }

// //   private formatCurrency(value: number): string {
// //     if (value == null) return '';
// //     return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
// //   }

// //   eventFromGrid(event: any) {
// //     const { type, data } = event;
// //     console.log(event);
// //     switch (type) {
// //       case 'save':
// //         this.saveEditedRow(data);
// //         break;
// //       case 'delete':
// //         this.deletePurchaseOrder(data);
// //         break;
// //       case 'cancel':
// //         this.cancelEdit(data);
// //         break;
// //       case 'edit':
// //         this.editPurchaseOrder(data);
// //         break;
// //     }
// //   }

// //   editPurchaseOrder(po: any) {

// //     this.activeTab.set('create');
// //     this.editingPurchaseOrderId.set(po._id);
// //     this.products.clear();
// //     po.items.forEach((item: any) => {
// //       this.products.push(
// //         this.fb.group({
// //           product: [item.product, Validators.required],
// //           quantity: [item.quantity, Validators.required],
// //           costPrice: [item.purchasePrice, Validators.required],
// //           total: [{ value: item.quantity * item.purchasePrice, disabled: true }]
// //         })
// //       );
// //     });

// //     this.purchaseForm.patchValue({
// //       seller: po.seller?._id || po.seller,
// //       status: po.status
// //     });
// //   }

// //   saveEditedRow(data: any) {
// //     if (!data || !data._id) return;
// //     this.purchaseService.updatePurchaseOrder(data._id, data).subscribe(() => {
// //       this.getPurchaseOrders(true);
// //     });
// //   }

// //   cancelEdit(_: any) {
// //     this.editingPurchaseOrderId.set(null);
// //     this.activeTab.set('view');
// //   }

// //   deletePurchaseOrder(po: any) {
// //     this.purchaseService.deletePurchaseOrder(po._id).subscribe(() => this.getPurchaseOrders(true));
// //   }

// //   savePurchase() {
// //     if (this.purchaseForm.invalid) return;

// //     const payload = {
// //       seller: this.purchaseForm.value.seller,
// //       status: this.purchaseForm.value.status,
// //       items: this.purchaseForm.value.products.map((p: any) => ({
// //         product: p.product,
// //         quantity: p.quantity,
// //         purchasePrice: p.costPrice
// //       }))
// //     };

// //     const id = this.editingPurchaseOrderId();
// //     const action$ = id
// //       ? this.purchaseService.updatePurchaseOrder(id, payload)
// //       : this.purchaseService.createPurchaseOrder(payload);

// //     action$.subscribe(() => {
// //       this.resetForm();
// //       this.activeTab.set('view');
// //       this.getPurchaseOrders(true);
// //     });
// //   }

// //   resetForm() {
// //     this.editingPurchaseOrderId.set(null);
// //     this.purchaseForm.reset({ status: 'pending' });
// //     this.products.clear();
// //     this.addProduct();
// //   }
// // }

