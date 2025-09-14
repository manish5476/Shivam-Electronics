import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { CellValueChangedEvent, GridApi, GridReadyEvent } from 'ag-grid-community';
import { InvoicePrintComponent } from '../invoice-print/invoice-print.component';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogboxComponent } from '../../../../shared/AgGrid/AgGridcomponents/dialogbox/dialogbox.component';
import { InvoiceDetailCardComponent } from '../invoice-detailsview/invoice-detailsview.component';

@Component({
  selector: 'app-invoice-view',
  standalone: true, // 🔹 Set to standalone
  imports: [
    SharedGridComponent,
    FormsModule,
    SelectModule,
    Dialog,
    InvoicePrintComponent,
    CommonModule,
    Button,
    InputTextModule
  ], // 🔹 Add necessary imports
  providers: [InvoiceService, AutopopulateService], // 🔹 Provide services
  templateUrl: './invoice-view.component.html',
  styleUrl: './invoice-view.component.css'
})
export class InvoiceViewComponent implements OnInit { // 🔹 Implement OnInit
  public autoPopulate = inject(AutopopulateService);

  // 🔹--- Pagination & Grid State ---
  private gridApi!: GridApi;
  private currentPage = 1;
  private isLoading = false;
  private totalCount = 0;
  private pageSize = 20;
  data: any[] = [];
  column: any[] = [];
  rowSelectionMode: any = 'single';

  // 🔹--- Filter State ---
  customerIDDropdown: any[] = [];
  invoiceFilter: any = {
    invoiceNumber: null,
    buyer: null,
    status: null,
    createdFrom: null,
    createdTo: null,
  };
  statusOptions = [
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Paid', value: 'paid' },
    { label: 'Pending', value: 'pending' },
    { label: 'Overdue', value: 'overdue' }
  ];

  // 🔹--- Component Specific State ---
  showpdf: boolean = false;
  invoiceId: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private InvoiceService: InvoiceService
  ) { }

  ngOnInit(): void {
    this.getColumn();
    this.getData(true);
    this.autoPopulate.getModuleData('customers').subscribe((data: any) => {
      this.customerIDDropdown = data;
    });
  }

  // 🔹--- Core Data and Filter Methods ---

  // In your component.ts (e.g., InvoiceViewComponent)

  applyFiltersAndReset() {
    this.currentPage = 1;
    this.data = [];
    this.gridApi?.setGridOption('rowData', []);

    // ✅ Show the loading overlay here, right before you fetch new data
    this.gridApi?.showLoadingOverlay();

    this.getData(true);
  }

  resetFilters(): void {
    this.invoiceFilter = {
      invoiceNumber: null, buyer: null, status: null,
      createdFrom: null, createdTo: null,
    };
    this.applyFiltersAndReset();
  }

  getData(isReset: boolean = false): void {
    if (this.isLoading) return;
    this.isLoading = true;
    if (isReset) this.currentPage = 1;

    const filterParams: any = {
      page: this.currentPage,
      limit: this.pageSize,
    };

    // Handle standard filters
    if (this.invoiceFilter.invoiceNumber) filterParams.invoiceNumber = this.invoiceFilter.invoiceNumber;
    if (this.invoiceFilter.buyer) filterParams.buyer = this.invoiceFilter.buyer;
    if (this.invoiceFilter.status) filterParams.status = this.invoiceFilter.status;

    // Handle date range for backend
    const dateFilter: any = {};
    if (this.invoiceFilter.createdFrom) dateFilter.$gte = this.invoiceFilter.createdFrom;
    if (this.invoiceFilter.createdTo) dateFilter.$lte = this.invoiceFilter.createdTo;
    if (Object.keys(dateFilter).length > 0) filterParams.invoiceDate = dateFilter;

    this.InvoiceService.getAllInvoices(filterParams).subscribe((res: any) => {
      const newData = res.data || [];
      this.getColumn()
      this.totalCount = res.totalCount || 0;
      if (this.gridApi) {
        this.gridApi.applyTransaction({ add: newData });
      } else {
        this.data = newData;
      }
      this.currentPage++;
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  // 🔹--- Grid Event Handlers ---

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onScrolledToBottom(_: any) {
    const rowCount = this.gridApi?.getDisplayedRowCount() ?? this.data.length;
    if (!this.isLoading && rowCount < this.totalCount) {
      this.getData(false);
    }
  }

  eventFromGrid(event: any) {
    // This is for the print/view dialog from your custom cell renderer
    if (event.eventName === 'printDownload' || event.eventName === 'printDetail') {
      this.showpdf = true;
      this.invoiceId = event.id;
    }
  }

  // 🔹--- Column Definitions ---

  getColumn(): void {
    this.column = [
      // Core Invoice Details
      { field: 'invoiceNumber', headerName: 'Invoice #', sortable: true, filter: true, pinned: 'left', width: 180 },
      { field: 'status', headerName: 'Status', sortable: true, filter: true, width: 120, cellStyle: (params: any) => this.getStatusCellStyle(params.value) },
      { field: 'invoiceDate', headerName: 'Invoice Date', sortable: true, filter: true, width: 150, valueFormatter: (params: any) => new Date(params.value).toLocaleDateString() },
      { field: 'dueDate', headerName: 'Due Date', sortable: true, filter: true, width: 150, valueFormatter: (params: any) => new Date(params.value).toLocaleDateString() },

      // Financials
      { field: 'subTotal', headerName: 'Sub Total', sortable: true, filter: 'agNumberColumnFilter', width: 130, valueFormatter: (params: any) => this.formatCurrency(params.value) },
      { field: 'gst', headerName: 'GST', sortable: true, filter: 'agNumberColumnFilter', width: 120, valueFormatter: (params: any) => this.formatCurrency(params.value) },
      { field: 'totalAmount', headerName: 'Total Amount', sortable: true, filter: 'agNumberColumnFilter', width: 150, valueFormatter: (params: any) => this.formatCurrency(params.value), cellStyle: { fontWeight: 'bold' } },

      // Buyer Details
      { field: 'buyerDetails.fullname', headerName: 'Buyer Name', sortable: true, filter: true, width: 200 },
      { field: 'buyerDetails.phoneNumbers[0].number', headerName: 'Buyer Contact', sortable: false, filter: true, width: 150, valueGetter: (p: any) => p.data.buyerDetails?.phoneNumbers?.[0]?.number },
      { field: 'buyerDetails.addresses[0].city', headerName: 'Buyer City', sortable: true, filter: true, width: 150, valueGetter: (p: any) => p.data.buyerDetails?.addresses?.[0]?.city },

      // Seller Details
      { field: 'sellerDetails.shopName', headerName: 'Shop Name', sortable: true, filter: true, width: 200 },
      { field: 'sellerDetails.name', headerName: 'Seller Name', sortable: true, filter: true, width: 180 },

      // Items
      { field: 'items', headerName: 'Items', sortable: false, filter: false, width: 250, valueGetter: (params: any) => params.data.items?.map((i: any) => `${i.quantity} x ${i.customTitle}`).join(', ') },
      // Actions
      {
        headerName: 'View', field: 'view', width: 100, pinned: 'right', cellRenderer: DialogboxComponent,
        cellRendererParams: (params: any) => ({
          dynamicComponent: InvoicePrintComponent, id: params.data.id,
          icon: 'pi pi-print', tooltip: 'Print Invoice', eventName: 'printDownload',
          dialogEvent: (event: any) => this.eventFromGrid(event)
        })
      }
    ];
    this.cdr.detectChanges();
  }

  // 🔹--- Helper Functions ---

  private getStatusCellStyle(status: string) {
    switch (status) {
      case 'unpaid': return { backgroundColor: '#ffcccc', color: '#8b0000', fontWeight: 'bold' };
      case 'paid': return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' };
      case 'pending': return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' };
      case 'overdue': return { backgroundColor: '#f5cba7', color: '#8b4513', fontWeight: 'bold' };
      default: return {};
    }
  }

  private formatCurrency(value: number): string {
    return value?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || '';
  }
}


// import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
// import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
// import { InvoiceService } from '../../../../core/services/invoice.service';
// import { CellValueChangedEvent } from 'ag-grid-community';
// import { DialogboxComponent } from '../../../../shared/AgGrid/AgGridcomponents/dialogbox/dialogbox.component';
// import { InvoiceDetailCardComponent } from '../invoice-detailsview/invoice-detailsview.component';
// import { InvoicePrintComponent } from '../invoice-print/invoice-print.component';
// import { DynamicCellComponent } from '../../../../shared/AgGrid/AgGridcomponents/dynamic-cell/dynamic-cell.component';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { ReactiveFormsModule } from '@angular/forms';
// import { SellerService } from '../../../../core/services/seller.service';
// import { ProductService } from '../../../../core/services/product.service';
// import { CustomerService } from '../../../../core/services/customer.service';
// import { AutopopulateService } from '../../../../core/services/autopopulate.service';
// import { AppMessageService } from '../../../../core/services/message.service';
// import { SelectModule } from 'primeng/select';
// import { IftaLabel } from 'primeng/iftalabel';
// import { FormsModule } from '@angular/forms';
// import { DynamicAgGridColumn, DynamicAgGridColumnsComponent } from '../../../../shared/AgGrid/AgGridcomponents/dynamic-ag-grid-columns/dynamic-ag-grid-columns.component';
// import { Dialog } from 'primeng/dialog';
// @Component({
//   selector: 'app-invoice-view',
//   imports: [SharedGridComponent, FormsModule, SelectModule, Dialog, ReactiveFormsModule, InvoicePrintComponent],
//   templateUrl: './invoice-view.component.html',
//   styleUrl: './invoice-view.component.css'
// })
// export class InvoiceViewComponent {
//   public messageService = inject(AppMessageService)
//   // public invoiceService = inject(InvoiceService)
//   public autoPopulate = inject(AutopopulateService)
//   public customerService = inject(CustomerService)
//   public sellerService = inject(SellerService)
//   public productService = inject(ProductService)
//   // @Input() invoiceId: any
//   filterForm!: FormGroup;
//   data: any;
//   column: any
//   rowSelectionMode: any
//   customerIDDropdown: any
//   invoiceFilter: any = {
//     invoiceNumber: null,
//     buyer: null,
//     buyerEmail: null,
//     status: null,
//     createdFrom: null,
//     createdTo: null,
//     minRemainingAmount: null,
//     maxRemainingAmount: null
//   };

//   showpdf: any;
//   invoiceId: any
//   constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder, private InvoiceService: InvoiceService) { }
//   ngOnInit(): void {
//     this.rowSelectionMode = ' ';
//     this.getColumn();
//     this.getData();

//     this.autoPopulate.getModuleData('customers').subscribe((data: any) => {
//       this.customerIDDropdown = data;
//     });
//   }

//   statusOptions = [
//     { label: 'All Status', value: '' },
//     { label: 'Unpaid', value: 'unpaid' },
//     { label: 'Paid', value: 'paid' },
//     { label: 'Pending', value: 'pending' },
//     { label: 'Overdue', value: 'overdue' }
//   ];

//   rowClassrules = {
//     'red-row': (cell: any) => cell.data.status == 'unpaid'
//   }

//   eventFromGrid(event: any) {
//     if (event.eventType === 'onCellValueCHanged') {
//       const cellValueChangedEvent = event.event as CellValueChangedEvent;
//       const rowNode = cellValueChangedEvent.node;
//       const dataItem = rowNode.data;
//       const field = cellValueChangedEvent.colDef.field;
//       const newValue = cellValueChangedEvent.newValue;

//       if (field) {
//         dataItem[field] = newValue;
//         this.InvoiceService.updateInvoice(dataItem.id, dataItem).subscribe({
//           next: (res: any) => {
//           },
//           error: (err: any) => {
//             console.error('❌ Error updating invoice:', err);
//           }
//         });
//       } else {
//         console.error('❌ Error: Field is undefined in cellValueChangedEvent.colDef');
//       }
//     }
//   }

//   getColumn(): void {
//     this.column = [
//       // {
//       //   headerName: 'Status',
//       //   field: 'status',
//       //   cellRenderer: DynamicAgGridColumnsComponent,
//       //   cellRendererParams: {
//       //     typeOfCol: 'text',
//       //     handleAction: (event: any) => this.eventFromTheAgGrid(event)  // 👈 binding event
//       //   }
//       // },
//       {
//         field: 'invoiceNumber',
//         headerName: 'Invoice Number',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         cellRenderer: DialogboxComponent,
//         cellRendererParams: (params: any) => ({
//           dynamicComponent: InvoiceDetailCardComponent,
//           id: params.data.id,
//           rowData: params.data,
//           icon: 'pi pi-print',
//           tooltip: 'Print Invoice',
//           eventName: 'printDetail',
//           dialogEvent: (event: any) => this.eventFromTheAgGrid(event)  // 👈 binding event

//         })
//       },

//       {
//         headerName: 'buyerDetails.fullname',
//         field: 'buyerDetails.fullname',
//         sortable: true, filter: true, resizable: true
//       },
//       {
//         field: 'buyerDetails.phoneNumbers[0].number', valueGetter: (params: any) => {
//           if (params.data?.buyerDetails?.phoneNumbers?.length > 0) { return params.data.buyerDetails.phoneNumbers[0].number; }
//           return '';
//         }, headerName: 'Buyer Contact 1', sortable: true, filter: true, resizable: true
//       },
//       {
//         field: 'buyerDetails.phoneNumbers[1].number', // Buyer Contact 2
//         valueGetter: (params: any) => {
//           if (params.data?.buyerDetails?.phoneNumbers?.length > 1) {
//             return params.data.buyerDetails.phoneNumbers[1].number;
//           }
//           return '';
//         },
//         headerName: 'Buyer Contact 2', sortable: true, filter: true, resizable: true
//       },
//       { field: 'invoiceDate', headerName: 'Invoice Date', sortable: true, filter: true, resizable: true, valueFormatter: (params: any) => new Date(params.value).toLocaleDateString() },
//       { field: 'dueDate', headerName: 'Due Date', sortable: true, filter: true, resizable: true, valueFormatter: (params: any) => new Date(params.value).toLocaleDateString() },
//       {
//         field: 'status',
//         headerName: 'Status',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         cellStyle: (params: any) => {
//           switch (params.value) {
//             case 'unpaid':
//               return { backgroundColor: '#ffcccc', color: '#8b0000', fontWeight: 'bold' }; // Light red
//             case 'paid':
//               return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' }; // Light green
//             case 'pending':
//               return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' }; // Light orange
//             case 'overdue':
//               return { backgroundColor: '#ffffcc', color: '#8b8000', fontWeight: 'bold' }; // Light yellow
//             default:
//               return {};
//           }
//         },
//       }
//       ,
//       // Seller Details (Nested Object)
//       { field: 'sellerDetails.name', headerName: 'Seller Name', sortable: true, filter: true, resizable: true },
//       { field: 'sellerDetails.shopname', headerName: 'Shop Name', sortable: true, filter: true, resizable: true },
//       { field: 'sellerDetails.contactNumber', headerName: 'Seller Contact', sortable: true, filter: true, resizable: true },

//       // Buyer Details (Nested Object)

//       // Items (Array - Need Custom Formatting)
//       { field: 'items', headerName: 'Items', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.items?.map((i: any) => i.quantity + ' x ' + i.rate).join(', ') },

//       { field: 'payments', headerName: 'Payments', resizable: true },
//       // Financials
//       { field: 'subTotal', headerName: 'Sub Total', sortable: true, filter: true, resizable: true },
//       { field: 'totalDiscount', headerName: 'Total Discount', sortable: true, filter: true, resizable: true },
//       {
//         field: 'totalAmount', headerName: 'Total Amount', sortable: true, filter: true, resizable: true,
//       },

//       // Metadata (Nested)
//       { field: 'metadata.orderReference', headerName: 'Order Reference', sortable: true, filter: true, resizable: true },
//       { field: 'metadata.paymentMethod', headerName: 'Payment Method', sortable: true, filter: true, resizable: true },

//       { field: 'createdAt', headerName: 'Created At', sortable: true, filter: true, resizable: true, valueFormatter: (params: any) => new Date(params.value).toLocaleString() },
//       { field: 'updatedAt', headerName: 'Updated At', sortable: true, filter: true, resizable: true, valueFormatter: (params: any) => new Date(params.value).toLocaleString() },
//       {
//         field: 'view', cellRenderer: DialogboxComponent,
//         cellRendererParams: (params: any) => ({
//           dynamicComponent: InvoicePrintComponent,
//           id: params.data.id,
//           rowData: params.data,
//           icon: 'pi pi-print',
//           tooltip: 'Print Invoice',
//           eventName: 'printDownload',
//           dialogEvent: (event: any) => this.eventFromTheAgGrid(event)  // 👈 binding event

//         }), headerName: 'View'
//       }
//     ];
//     this.cdr.detectChanges();
//   }

//   eventFromTheAgGrid(event: any) {
//     this.showpdf = true
//     this.invoiceId = event.id
//   }

//   getData(): void {
//     const filterParams: any = {};
//     Object.entries(this.invoiceFilter).forEach(([key, value]) => {
//       if (value !== null && value !== '' && value !== undefined) {
//         filterParams[key] = value;
//       }
//     });


//     this.InvoiceService.getAllInvoices(filterParams).subscribe((res: any) => {
//       this.data = res.data;
//       this.cdr.markForCheck();
//     });
//   }

//   resetFilters(): void {
//     this.invoiceFilter = {
//       invoiceNumber: '',
//       buyer: '',
//       buyerEmail: '',
//       status: '',
//       createdFrom: '',
//       createdTo: '',
//       minRemainingAmount: '',
//       maxRemainingAmount: ''
//     };

//     this.getData();
//   }
// }
