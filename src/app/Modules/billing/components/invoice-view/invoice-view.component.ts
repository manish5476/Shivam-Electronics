// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-invoice-view',
//   imports: [],
//   templateUrl: './invoice-view.component.html',
//   styleUrl: './invoice-view.component.css'
// })
// export class InvoiceViewComponent {

// }

import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
// import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';

import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';

import { ApiService } from  '../../../../core/services/api.service';
import { CellValueChangedEvent } from 'ag-grid-community';
import { DialogboxComponent } from '../../../../shared/AgGrid/AgGridcomponents/dialogbox/dialogbox.component';
import { InvoiceDetailCardComponent } from '../invoice-detailsview/invoice-detailsview.component';
import { InvoicePrintComponent } from '../invoice-print/invoice-print.component';
import { ToolbarComponent } from "../../../../shared/Components/toolbar/toolbar.component";

@Component({
  selector: 'app-invoice-view',
  imports: [SharedGridComponent, ToolbarComponent, ToolbarComponent],
  templateUrl: './invoice-view.component.html',
  styleUrl: './invoice-view.component.css'
})
export class InvoiceViewComponent {
  data: any;
  column: any
  rowSelectionMode: any

  constructor(private cdr: ChangeDetectorRef, private apiService: ApiService) { }

  ngOnInit(): void {
    this.getColumn()
    this.getData()
    this.rowSelectionMode = 'singleRow'
  }

  rowClassrules = {
    'red-row': (cell: any) => cell.data.status == 'unpaid'
  }

  eventFromGrid(event: any) {
    if (event.eventType === 'onCellValueCHanged') {
      const cellValueChangedEvent = event.event as CellValueChangedEvent;
      const rowNode = cellValueChangedEvent.node;
      const dataItem = rowNode.data;
      const field = cellValueChangedEvent.colDef.field;
      const newValue = cellValueChangedEvent.newValue;

      if (field) {
        dataItem[field] = newValue;
        this.apiService.updateinvoice(dataItem.id, dataItem).subscribe({
          next: (res: any) => {
            // console.log('✅ invoice updated successfully:', res);
          },
          error: (err: any) => {
            console.error('❌ Error updating invoice:', err);
          }
        });
      } else {
        console.error('❌ Error: Field is undefined in cellValueChangedEvent.colDef');
      }
    }

  }

  getColumn(): void {
    this.column = [
      {
        field: 'invoiceNumber',
        headerName: 'Invoice Number',
        sortable: true,
        filter: true,
        resizable: true,
        cellRenderer: DialogboxComponent,
        cellRendererParams: (params: any) => ({
          dynamicComponent: InvoiceDetailCardComponent, id: params.data.id,
        })
      },

      { field: 'buyerDetails.fullname', headerName: 'Buyer Name', sortable: true, filter: true, resizable: true },
      { field: 'buyerDetails.email', headerName: 'Buyer Email', sortable: true, filter: true, resizable: true },
      { field: 'buyerDetails.phoneNumbers[0].number', headerName: 'Buyer Contact 1', sortable: true, filter: true, resizable: true },
      { field: 'buyerDetails.phoneNumbers[1].number', headerName: 'Buyer Contact 2', sortable: true, filter: true, resizable: true },
      { field: 'invoiceDate', headerName: 'Invoice Date', sortable: true, filter: true, resizable: true, valueFormatter: (params: any) => new Date(params.value).toLocaleDateString() },
      { field: 'dueDate', headerName: 'Due Date', sortable: true, filter: true, resizable: true, valueFormatter: (params: any) => new Date(params.value).toLocaleDateString() },
      {
        field: 'status',
        headerName: 'Status',
        sortable: true,
        filter: true,
        resizable: true,
        cellStyle: (params: any) => {
          switch (params.value) {
            case 'unpaid':
              return { backgroundColor: '#ffcccc', color: '#8b0000', fontWeight: 'bold' }; // Light red
            case 'paid':
              return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' }; // Light green
            case 'pending':
              return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' }; // Light orange
            case 'overdue':
              return { backgroundColor: '#ffffcc', color: '#8b8000', fontWeight: 'bold' }; // Light yellow
            default:
              return {};
          }
        },
      }
      ,
      // Seller Details (Nested Object)
      { field: 'sellerDetails.name', headerName: 'Seller Name', sortable: true, filter: true, resizable: true },
      { field: 'sellerDetails.shopname', headerName: 'Shop Name', sortable: true, filter: true, resizable: true },
      { field: 'sellerDetails.contactNumber', headerName: 'Seller Contact', sortable: true, filter: true, resizable: true },

      // Buyer Details (Nested Object)

      // Items (Array - Need Custom Formatting)
      { field: 'items', headerName: 'Items', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.items?.map((i: any) => i.quantity + ' x ' + i.rate).join(', ') },

      { field: 'payments', headerName: 'Payments', resizable: true },
      // Financials
      { field: 'subTotal', headerName: 'Sub Total', sortable: true, filter: true, resizable: true },
      { field: 'totalDiscount', headerName: 'Total Discount', sortable: true, filter: true, resizable: true },
      {
        field: 'totalAmount', headerName: 'Total Amount', sortable: true, filter: true, resizable: true,
      },

      // Metadata (Nested)
      { field: 'metadata.orderReference', headerName: 'Order Reference', sortable: true, filter: true, resizable: true },
      { field: 'metadata.paymentMethod', headerName: 'Payment Method', sortable: true, filter: true, resizable: true },

      { field: 'createdAt', headerName: 'Created At', sortable: true, filter: true, resizable: true, valueFormatter: (params: any) => new Date(params.value).toLocaleString() },
      { field: 'updatedAt', headerName: 'Updated At', sortable: true, filter: true, resizable: true, valueFormatter: (params: any) => new Date(params.value).toLocaleString() },
      {
        field: 'view', cellRenderer: DialogboxComponent,
        cellRendererParams: (params: any) => ({
          dynamicComponent: InvoicePrintComponent,
          id: params.data.id,
        }), headerName: 'View'
      }
    ];

    this.cdr.detectChanges();
  }

  getData() {
    this.apiService.getAllinvoiceData().subscribe((res: any) => {
      this.data = res.data;
      this.cdr.markForCheck()
    })
  }
}
