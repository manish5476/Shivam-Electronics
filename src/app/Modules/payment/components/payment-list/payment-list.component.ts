import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GridApi, GridReadyEvent, CellValueChangedEvent } from 'ag-grid-community';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { PaymentService } from '../../../../core/services/payment.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from "primeng/button";
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    SharedGridComponent,
    CommonModule,
    FormsModule,
    Button,
    SelectModule,
    InputTextModule
  ], // 🔹 Add necessary imports
  providers: [PaymentService], // 🔹 Provide the service
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit {
  // 🔹--- Pagination & Grid State ---
  private gridApi!: GridApi;
  private currentPage = 1;
  private isLoading = false;
  private totalCount = 0;
  private pageSize = 20;
  public data: any[] = [];
  public column: any[] = [];
  public rowSelectionMode = 'single';

  // 🔹--- Filter State ---
  public paymentFilter = {
    transactionId: null,
    customerName: null,
    status: null,
    paymentMethod: null,
    createdFrom: null,
    createdTo: null
  };
  public statusOptions = [
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' },
  ];
  public methodOptions = [
    { label: 'Card', value: 'card' },
    { label: 'Cash', value: 'cash' },
    { label: 'UPI', value: 'upi' },
    { label: 'Net Banking', value: 'net_banking' },
  ];

  constructor(
    private paymentService: PaymentService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getColumn();
  }

  // 🔹--- Core Data and Filter Methods ---

  public applyFiltersAndReset(): void {
    this.currentPage = 1;
    this.data = [];
    this.gridApi?.setGridOption('rowData', []);
    this.gridApi?.showLoadingOverlay();
    this.getData(true);
  }

  public resetFilters(): void {
    this.paymentFilter = {
      transactionId: null, customerName: null, status: null,
      paymentMethod: null, createdFrom: null, createdTo: null
    };
    this.applyFiltersAndReset();
  }

  public getData(isReset: boolean = false): void {
    if (this.isLoading) return;
    this.isLoading = true;
    if (isReset) this.currentPage = 1;

    const filterParams: any = {
      page: this.currentPage,
      limit: this.pageSize,
    };

    // Add filters if they have a value
    if (this.paymentFilter.transactionId) filterParams.transactionId = this.paymentFilter.transactionId;
    if (this.paymentFilter.customerName) filterParams['customer.name'] = this.paymentFilter.customerName; // Assuming nested path
    if (this.paymentFilter.status) filterParams.status = this.paymentFilter.status;
    if (this.paymentFilter.paymentMethod) filterParams.paymentMethod = this.paymentFilter.paymentMethod;

    // Handle date range for backend
    const dateFilter: any = {};
    if (this.paymentFilter.createdFrom) dateFilter.$gte = this.paymentFilter.createdFrom;
    if (this.paymentFilter.createdTo) dateFilter.$lte = this.paymentFilter.createdTo;
    if (Object.keys(dateFilter).length > 0) filterParams.createdAt = dateFilter;


    this.paymentService.getAllpaymentData(filterParams).subscribe({
      next: (res: any) => {
        const newData = res.data || [];
        this.totalCount = res.totalCount || 0;
        this.getColumn()
        if (this.gridApi) {
          this.gridApi.applyTransaction({ add: newData });
          const totalRows = this.gridApi.getDisplayedRowCount();
          totalRows > 0 ? this.gridApi.hideOverlay() : this.gridApi.showNoRowsOverlay();
        } else {
          this.data = newData;
        }

        this.currentPage++;
        this.isLoading = false;
        this.cd.markForCheck();
      },
      error: err => {
        console.error('Error loading payments', err);
        this.isLoading = false;
        this.gridApi?.hideOverlay();
      }
    });
  }

  // 🔹--- Grid Event Handlers ---

  public onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.getData(true); // Initial data load
  }

  public onScrolledToBottom(_: any): void {
    const rowCount = this.gridApi?.getDisplayedRowCount() ?? this.data.length;
    if (!this.isLoading && rowCount < this.totalCount) {
      this.getData(false);
    }
  }

  public eventFromGrid(event: any): void {
    if (event.eventType === 'onCellValueChanged') {
      const e: CellValueChangedEvent = event.event;
      const updatedData = { ...e.data };
      this.paymentService.updatepayment(updatedData._id, updatedData).subscribe({
        error: err => console.error('Error updating payment', err)
      });
    }
  }

  // 🔹--- Column Definitions ---

  // getColumn(): void {
  //   this.column = [
  //     { field: 'transactionId', headerName: 'Transaction ID', sortable: true, filter: true, resizable: true },
  //     { field: 'customerName', headerName: 'Customer Name', sortable: true, filter: true, resizable: true, valueGetter: (p: any) => p.data.customer?.name },
  //     { field: 'phoneNumbers', headerName: 'Customer Phone', sortable: true, filter: true, resizable: true, valueGetter: (p: any) => p.data.customer?.phone },
  //     { field: 'amount', headerName: 'Amount', sortable: true, filter: 'agNumberColumnFilter', resizable: true, valueFormatter: (p: any) => this.formatCurrency(p.value) },
  //     { field: 'paymentMethod', headerName: 'Method', sortable: true, filter: true, resizable: true },
  //     { field: 'status', headerName: 'Status', sortable: true, filter: true, resizable: true, cellStyle: (p: any) => this.getStatusCellStyle(p.value) },
  //     { field: 'createdAt', headerName: 'Date', sortable: true, filter: 'agDateColumnFilter', resizable: true, valueFormatter: (p: any) => new Date(p.value).toLocaleDateString() }
  //   ];
  // }
  // In your payment-list.component.ts

  private getColumn(): void {
    this.column = [
      { field: 'transactionId', headerName: 'Transaction ID', sortable: true, filter: true, resizable: true },

      // ✅ UPDATED: Now points to the top-level 'customerName' property
      { field: 'customerName', headerName: 'Customer Name', sortable: true, filter: true, resizable: true },

      // ✅ UPDATED: Now points to the top-level 'phoneNumbers' property
      { field: 'phoneNumbers', headerName: 'Customer Phone', sortable: true, filter: true, resizable: true },

      {
        field: 'amount', headerName: 'Amount', sortable: true, filter: 'agNumberColumnFilter', resizable: true,
        valueFormatter: (p:any) => this.formatCurrency(p.value)
      },
      { field: 'paymentMethod', headerName: 'Method', sortable: true, filter: true, resizable: true },
      {
        field: 'status', headerName: 'Status', sortable: true, filter: true, resizable: true,
        cellStyle: (p:any)=> this.getStatusCellStyle(p.value)
      },
      {
        field: 'createdAt', headerName: 'Date', sortable: true, filter: 'agDateColumnFilter', resizable: true,
        valueFormatter: (p:any)=> new Date(p.value).toLocaleDateString()
      }
    ];
  }
  // 🔹--- Helper Functions ---

  private getStatusCellStyle(status: string): any {
    switch (status) {
      case 'completed': return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' };
      case 'pending': return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' };
      case 'failed': return { backgroundColor: '#ffcccc', color: '#8b0000', fontWeight: 'bold' };
      default: return {};
    }
  }

  private formatCurrency(value: number): string {
    return value?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || '';
  }
}

// import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
// import { CellValueChangedEvent } from 'ag-grid-community';
// import { ApiService } from '../../../../core/services/api.service';
// import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
// import { PaymentService } from '../../../../core/services/payment.service';

// @Component({
//   selector: 'app-payment-list',
//   standalone: true,
//   imports: [SharedGridComponent],
//   templateUrl: './payment-list.component.html',
//   styleUrls: ['./payment-list.component.css']
// })
// export class PaymentListComponent implements OnInit {
//   public columnDefs = [
//     { field: 'transactionId', headerName: 'Transaction ID', sortable: true, filter: true, resizable: true, flex: 1 },
//     { field: 'customerName', headerName: 'Customer Name', sortable: true, filter: true, resizable: true, flex: 1 },
//     { field: 'phoneNumbers', headerName: 'phoneNumbers', sortable: true, filter: true, resizable: true, flex: 1 },
//     { field: 'amount', headerName: 'Amount', sortable: true, filter: 'agNumberColumnFilter', resizable: true, flex: 1 },
//     { field: 'paymentMethod', headerName: 'Method', sortable: true, filter: true, resizable: true, flex: 1 },
//     { field: 'status', headerName: 'Status', sortable: true, filter: true, resizable: true, flex: 1,
//       cellRenderer: (params: { value: string; }) => {
//         const sev = this.getStatusSeverity(params.value);
//         return `<p-tag value="${params.value}" severity="${sev}"></p-tag>`;
//       }
//     },
//     { field: 'createdAt', headerName: 'Date', sortable: true, filter: 'agDateColumnFilter', resizable: true, flex: 1,
//       valueFormatter: (params: { value: string | number | Date; }) => (new Date(params.value)).toLocaleDateString()
//     }
//   ];

//   public rowData: any[] = [];
//   public rowSelectionMode = 'singleRow';

//   constructor(
//     private apiService: PaymentService,
//     private cd: ChangeDetectorRef
//   ) {}

//   ngOnInit(): void {
//     this.loadPayments();
//   }

//   private loadPayments(): void {
//     this.apiService.getAllpaymentData().subscribe({
//       next: (res:any) => {
//         this.rowData = res.data;
//         this.cd.markForCheck();
//       },
//       error: err => console.error('Error loading payments', err)
//     });
//   }

//   /** Fired whenever a cell is edited inline in the grid */
//   public eventFromGrid(event: any): void {
//     if (event.eventType === 'onCellValueChanged') {
//       const e: CellValueChangedEvent = event.event;
//       const updated = { ...e.data, [e.colDef.field!]: e.newValue };
//       this.apiService.updatepayment(updated._id, updated).subscribe({
//         next: () =>
//         error: err => console.error('Error updating payment', err)
//       });
//     }
//   }

//   /** Map your status strings to PrimeNG tag severities */
//   private getStatusSeverity(status: string): string {
//     switch (status) {
//       case 'completed': return 'success';
//       case 'pending':   return 'warning';
//       case 'failed':    return 'danger';
//       default:          return 'info';
//     }
//   }
// }
