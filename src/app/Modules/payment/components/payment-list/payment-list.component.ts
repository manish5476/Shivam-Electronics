import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CellValueChangedEvent } from 'ag-grid-community';
import { ApiService } from '../../../../core/services/api.service';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { ToolbarComponent } from '../../../../shared/Components/toolbar/toolbar.component';
import { PaymentService } from '../../../../core/services/payment.service';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [SharedGridComponent, ToolbarComponent],
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit {
  public columnDefs = [
    { field: 'transactionId', headerName: 'Transaction ID', sortable: true, filter: true, resizable: true, flex: 1 },
    { field: 'customerName', headerName: 'Customer Name', sortable: true, filter: true, resizable: true, flex: 1 },
    { field: 'phoneNumbers', headerName: 'phoneNumbers', sortable: true, filter: true, resizable: true, flex: 1 },
    { field: 'amount', headerName: 'Amount', sortable: true, filter: 'agNumberColumnFilter', resizable: true, flex: 1 },
    { field: 'paymentMethod', headerName: 'Method', sortable: true, filter: true, resizable: true, flex: 1 },
    { field: 'status', headerName: 'Status', sortable: true, filter: true, resizable: true, flex: 1,
      cellRenderer: (params: { value: string; }) => {
        const sev = this.getStatusSeverity(params.value);
        return `<p-tag value="${params.value}" severity="${sev}"></p-tag>`;
      }
    },
    { field: 'createdAt', headerName: 'Date', sortable: true, filter: 'agDateColumnFilter', resizable: true, flex: 1,
      valueFormatter: (params: { value: string | number | Date; }) => (new Date(params.value)).toLocaleDateString()
    }
  ];

  public rowData: any[] = [];
  public rowSelectionMode = 'singleRow';

  constructor(
    private apiService: PaymentService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  private loadPayments(): void {
    this.apiService.getAllpaymentData().subscribe({
      next: (res:any) => {
        this.rowData = res.data;
        this.cd.markForCheck();
      },
      error: err => console.error('Error loading payments', err)
    });
  }

  /** Fired whenever a cell is edited inline in the grid */
  public eventFromGrid(event: any): void {
    if (event.eventType === 'onCellValueChanged') {
      const e: CellValueChangedEvent = event.event;
      const updated = { ...e.data, [e.colDef.field!]: e.newValue };
      this.apiService.updatepayment(updated._id, updated).subscribe({
        next: () => console.log('Payment updated'),
        error: err => console.error('Error updating payment', err)
      });
    }
  }

  /** Map your status strings to PrimeNG tag severities */
  private getStatusSeverity(status: string): string {
    switch (status) {
      case 'completed': return 'success';
      case 'pending':   return 'warning';
      case 'failed':    return 'danger';
      default:          return 'info';
    }
  }
}
