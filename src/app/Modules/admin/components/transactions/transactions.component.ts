import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { TransactionService } from '../../../../core/services/transaction.service';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { TagCellRendererComponent } from '../../../../shared/AgGrid/AgGridcomponents/tagCellRenderer/tagcellRenderer.component';


@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    SharedGridComponent,
    FormsModule,
    CommonModule,
    SelectModule,
    ButtonModule,
    InputTextModule,
  ],
  providers: [TransactionService],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
eventFromGrid($event: any) {
throw new Error('Method not implemented.');
}
  // 🔹--- Pagination & Grid State ---
  private gridApi!: GridApi;
  private currentPage = 1;
  private isLoading = false;
  private totalCount = 0;
  private pageSize = 50;
  public data: any[] = [];
  public column: any[] = [];
  public rowSelectionMode = 'single';

  // 🔹--- Filter State ---
  public transactionFilter = {
    startDate: '',
    endDate: '',
    type: null,
    status: null,
    description: ''
  };
  public typeOptions =  [
    { label: 'All', value: '' },
    { label: "Sales", value: "sales" },
    { label: "Payments", value: "payments" },
    { label: "Products", value: "products" },
    { label: "Customers", value: "customers" },
    { label: "Sellers", value: "sellers" },
  ];

  public statusOptions = [
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' },
    { label: 'Active', value: 'active' },
    { label: 'Unpaid', value: 'unpaid' },
  ];

  constructor(
    private transactionService: TransactionService,
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
    this.transactionFilter = {
      startDate: '', endDate: '', type: null,
      status: null, description: ''
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

    if (this.transactionFilter.description) filterParams.description = this.transactionFilter.description;
    if (this.transactionFilter.type) filterParams.type = this.transactionFilter.type;
    if (this.transactionFilter.status) filterParams.status = this.transactionFilter.status;

    const dateFilter: any = {};
    if (this.transactionFilter.startDate) dateFilter.$gte = this.transactionFilter.startDate;
    if (this.transactionFilter.endDate) dateFilter.$lte = this.transactionFilter.endDate;
    if (Object.keys(dateFilter).length > 0) filterParams.date = dateFilter;

    this.transactionService.getTransactions(filterParams).subscribe({
      next: (res: any) => {
        const newData = res.data || [];
        // ✅ FIX: Use 'totalCount' from the API for correct pagination
        this.totalCount = res.totalCount || 0;

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
        console.error('Error loading transactions', err);
        this.isLoading = false;
        this.gridApi?.hideOverlay();
      }
    });
  }

  // 🔹--- Grid Event Handlers ---

  public onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.getData(true);
  }

  public onScrolledToBottom(_: any): void {
    const rowCount = this.gridApi?.getDisplayedRowCount() ?? this.data.length;
    if (!this.isLoading && rowCount < this.totalCount) {
      this.getData(false);
    }
  }

  // 🔹--- Column Definitions (UPDATED) ---

  private getColumn(): void {
    this.column = [
      { field: 'date', headerName: 'Date & Time', sortable: true, filter: 'agDateColumnFilter', width: 220, valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleString() : '' },
      { field: 'type', headerName: 'Type', sortable: true, filter: true, width: 120, cellRenderer: TagCellRendererComponent },
      { field: 'description', headerName: 'Description', sortable: true, filter: true, flex: 1, minWidth: 250, tooltipField: 'description' },
      { field: 'customer', headerName: 'Customer', sortable: true, filter: true, width: 180, valueGetter: (p: any) => p.data.customer || 'N/A' },
      { field: 'seller', headerName: 'Seller', sortable: true, filter: true, width: 180, valueGetter: (p: any) => p.data.seller || 'N/A' },
      { field: 'amount', headerName: 'Amount', sortable: true, filter: 'agNumberColumnFilter', width: 150, valueFormatter: (p: any) => this.formatCurrency(p.value) },
      { field: 'status', headerName: 'Status', sortable: true, filter: true, width: 120, cellRenderer: TagCellRendererComponent },
      { field: 'reference', headerName: 'Reference ID', sortable: true, filter: true, width: 200, tooltipField: 'reference' }
    ];
  }

  // 🔹--- Helper Functions ---

  private formatCurrency(value: number): string {
    if (value == null) return '';
    return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  }
}





// import { Component } from '@angular/core';
// import { TransactionService } from '../../../../core/services/transaction.service';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { SelectModule } from 'primeng/select';
// import { Card } from "primeng/card";
// import { Table } from 'primeng/table';
// import { TableModule } from 'primeng/table';
// import { TagModule } from 'primeng/tag';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { IconFieldModule } from 'primeng/iconfield';
// import { InputIconModule } from 'primeng/inputicon';


// @Component({
//   selector: 'app-transactions',
//   standalone: true,
//   imports: [FormsModule, CommonModule, SelectModule, TableModule,TagModule,ButtonModule,InputTextModule,IconFieldModule,InputIconModule],
//   templateUrl: './transactions.component.html',
//   styleUrls: ['./transactions.component.css']
// })
// export class TransactionsComponent {
//   transactions: any[];
//   filters: { startDate: string; endDate: string; type: string; };

  // type: any[] = [
  //   { label: 'All', value: '' },
  //   { label: "Sales", value: "sales" },
  //   { label: "Payments", value: "payments" },
  //   { label: "Products", value: "products" },
  //   { label: "Customers", value: "customers" },
  //   { label: "Sellers", value: "sellers" },
  // ];

//   constructor(private transactionService: TransactionService) {
//     this.transactions = [];
//     this.filters = { startDate: '', endDate: '', type: '' };
//   }


//   ngOnInit() {
//     this.fetchTransactions();
//   }


//   // state for table
//   loading = false;
//   searchValue?: string;

//   // clear search/filters in table
//   clear(table: Table) {
//     table.clear();
//     this.searchValue = '';
//   }

// // chi((p :any):any)colors for Type
// getTypeSeverity(type?: string) {
//   switch ((type || '').toLowerCase()) {
//     case 'sale': return 'info';
//     case 'payment': return 'success';
//     case 'refund': return 'warn';   // ✅ instead of "warning"
//     default: return 'secondary';
//   }
// }

// // chip colors for Status
// getStatusSeverity(status?: string) {
//   switch ((status || '').toLowerCase()) {
//     case 'completed': return 'success';
//     case 'pending':   return 'warn';   // ✅ instead of "warning"
//     case 'failed':    return 'danger';
//     default:          return 'secondary';
//   }
// }


//   fetchTransactions() {
//     this.transactionService.getTransactions(this.filters).subscribe(res => {
//       if (!res.error) this.transactions = res.data;
//     });
//   }
// }
