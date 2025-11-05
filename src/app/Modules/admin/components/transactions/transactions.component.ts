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
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    SharedGridComponent,
    FormsModule,
    CommonModule,
    DatePicker,
    SelectModule,
    ButtonModule,
    InputTextModule,
  ],
  providers: [TransactionService],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
})
export class TransactionsComponent implements OnInit {
  private gridApi!: GridApi;
  private currentPage = 1;
  private isLoading = false;
  private totalCount = 0;
  private pageSize = 50;

  public data: any[] = [];
  public column: any[] = [];
  public rowSelectionMode = 'single';

  // 🔹 Filters
  // public transactionFilter = {
  //   period: 'last30days',
  //   type: '',
  //   status: '',
  //   paymentMethod: '',
  //   description: '',
  // };

  public transactionFilter = {
    period: 'last30days',
    startDate: '',
    endDate: '',
    type: '',
    status: '',
    paymentMethod: '',
    description: ''
  };

  public typeOptions = [
    { label: 'All', value: '' },
    { label: 'Sales', value: 'sales' },
    { label: 'Payments', value: 'payments' },
    { label: 'COGS', value: 'cogs' },
  ];

  public statusOptions = [
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' },
    { label: 'Active', value: 'active' },
    { label: 'Unpaid', value: 'unpaid' },
  ];

  public periodOptions = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'thisWeek' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'This Year', value: 'thisYear' },
  ];

  constructor(
    private transactionService: TransactionService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getColumn();
  }

  // 🔹 Apply and reset filters
  public applyFiltersAndReset(): void {
    this.currentPage = 1;
    this.data = [];
    this.gridApi?.setGridOption('rowData', []);
    this.gridApi?.showLoadingOverlay();
    this.getData(true);
  }

  public resetFilters(): void {
    this.transactionFilter = {
      period: 'last30days',
      startDate: '',
      endDate: '',
      type: '',
      status: '',
      paymentMethod: '',
      description: ''
    };
    this.applyFiltersAndReset();
  }

  public getData(isReset: boolean = false): void {
    if (this.isLoading) return;
    this.isLoading = true;
    if (isReset) this.currentPage = 1;

    const params: any = {
      page: this.currentPage,
      limit: this.pageSize,
    };

    // Apply filters
    if (this.transactionFilter.type) params.type = this.transactionFilter.type;
    if (this.transactionFilter.status) params.status = this.transactionFilter.status;
    if (this.transactionFilter.paymentMethod) params.paymentMethod = this.transactionFilter.paymentMethod;
    if (this.transactionFilter.description) params.description = this.transactionFilter.description;

    // ✅ Handle either custom date range or preset period
    if (this.transactionFilter.startDate && this.transactionFilter.endDate) {
      params.startDate = this.transactionFilter.startDate;
      params.endDate = this.transactionFilter.endDate;
    } else if (this.transactionFilter.period) {
      params.period = this.transactionFilter.period;
    }

    this.transactionService.getTransactions(params).subscribe({
      next: (res: any) => {
        const newData = res.data || res || [];
        this.totalCount = res.totalCount || newData.length;
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

  // 🔹 Grid setup
  public onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.getData(true);
  }

  public onScrolledToBottom(event: any): void {
    const rowCount = this.gridApi?.getDisplayedRowCount() ?? this.data.length;
    if (!this.isLoading && rowCount < this.totalCount) {
      this.getData(false);
    }
  }

  // 🔹 Columns
  private getColumn(): void {
    this.column = [
      {
        field: 'date',
        headerName: 'Date & Time',
        sortable: true,
        filter: 'agDateColumnFilter',
        width: 200,
        valueFormatter: (p: any) =>
          p.value ? new Date(p.value).toLocaleString() : '',
      },
      {
        field: 'type',
        headerName: 'Type',
        sortable: true,
        filter: true,
        width: 120,
        cellRenderer: TagCellRendererComponent,
      },
      {
        field: 'description',
        headerName: 'Description',
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 250,
        tooltipField: 'description',
      },
      {
        field: 'customer',
        headerName: 'Customer',
        sortable: true,
        filter: true,
        width: 180,
        valueGetter: (p: any) => p.data.customer || 'N/A',
      },
      {
        field: 'amount',
        headerName: 'Amount',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 150,
        valueFormatter: (p: any) => this.formatCurrency(p.value),
      },
      {
        field: 'status',
        headerName: 'Status',
        sortable: true,
        filter: true,
        width: 120,
        cellRenderer: TagCellRendererComponent,
      },
      {
        field: 'reference',
        headerName: 'Reference ID',
        sortable: true,
        filter: true,
        width: 200,
        tooltipField: 'reference',
      },
    ];
  }

  // 🔹 Currency formatter
  private formatCurrency(value: number): string {
    if (value == null) return '';
    return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  }

  eventFromGrid(_: any) { }
}
