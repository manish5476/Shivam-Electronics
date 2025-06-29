
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { CellValueChangedEvent } from 'ag-grid-community';
import { DialogboxComponent } from '../../../../shared/AgGrid/AgGridcomponents/dialogbox/dialogbox.component';
import { InvoiceDetailCardComponent } from '../invoice-detailsview/invoice-detailsview.component';
import { InvoicePrintComponent } from '../invoice-print/invoice-print.component';
import { ToolbarComponent } from "../../../../shared/Components/toolbar/toolbar.component";
import { DynamicCellComponent } from '../../../../shared/AgGrid/AgGridcomponents/dynamic-cell/dynamic-cell.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { SellerService } from '../../../../core/services/seller.service';
import { ProductService } from '../../../../core/services/product.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { AppMessageService } from '../../../../core/services/message.service';
import { SelectModule } from 'primeng/select';
import { IftaLabel } from 'primeng/iftalabel';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-invoice-view',
  imports: [SharedGridComponent, FormsModule, SelectModule, ReactiveFormsModule,],
  templateUrl: './invoice-view.component.html',
  styleUrl: './invoice-view.component.css'
})
export class InvoiceViewComponent {
  public messageService = inject(AppMessageService)
  // public invoiceService = inject(InvoiceService)
  public autoPopulate = inject(AutopopulateService)
  public customerService = inject(CustomerService)
  public sellerService = inject(SellerService)
  public productService = inject(ProductService)
  @Input() invoiceId:any
  filterForm!: FormGroup;
  data: any;
  column: any
  rowSelectionMode: any
  customerIDDropdown: any
  invoiceFilter: any = {
    invoiceNumber: '',
    buyer: '',
    buyerEmail: '',
    status: '',
    createdFrom: '',
    createdTo: '',
    minRemainingAmount: '',
    maxRemainingAmount: ''
  };

  constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder, private InvoiceService: InvoiceService) { }

  ngOnInit(): void {
    this.rowSelectionMode = 'singleRow';
    this.getColumn();
    this.getData();

    this.autoPopulate.getModuleData('customers').subscribe((data: any) => {
      this.customerIDDropdown = data;
    });
  }

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Paid', value: 'paid' },
    { label: 'Pending', value: 'pending' },
    { label: 'Overdue', value: 'overdue' }
  ];

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
        this.InvoiceService.updateinvoice(dataItem.id, dataItem).subscribe({
          next: (res: any) => {
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
      {
        headerName: 'buyerDetails.fullname',
        field: 'buyerDetails.fullname',
        sortable: true, filter: true, resizable: true
      },
      {
        field: 'buyerDetails.phoneNumbers[0].number', valueGetter: (params: any) => {
          if (params.data?.buyerDetails?.phoneNumbers?.length > 0) { return params.data.buyerDetails.phoneNumbers[0].number; }
          return '';
        }, headerName: 'Buyer Contact 1', sortable: true, filter: true, resizable: true
      },
      {
        field: 'buyerDetails.phoneNumbers[1].number', // Buyer Contact 2
        valueGetter: (params: any) => {
          if (params.data?.buyerDetails?.phoneNumbers?.length > 1) {
            return params.data.buyerDetails.phoneNumbers[1].number;
          }
          return '';
        },
        headerName: 'Buyer Contact 2', sortable: true, filter: true, resizable: true
      },
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



  // applyFilters(): void {
  //   const rawFilters = this.filterForm.value;

  //   // Clean up: remove empty/null/undefined fields
  //   const filters: any = {};
  //   Object.keys(rawFilters).forEach(key => {
  //     const value = rawFilters[key];
  //     if (value !== null && value !== '' && value !== undefined) {
  //       filters[key] = value;
  //     }
  //   });

  //   this.getData();
  // }

  getData(): void {
    const filterParams: any = {};
    Object.entries(this.invoiceFilter).forEach(([key, value]) => {
      if (value !== null && value !== '' && value !== undefined) {
        filterParams[key] = value;
      }
    });


    this.InvoiceService.getAllinvoiceData(filterParams).subscribe((res: any) => {
      this.data = res.data;
      this.cdr.markForCheck();
    });
  }

  // getData(): void {
  //   // const filterParams: any = {
  //   //   filter: {}
  //   // };
  //   const { minRemainingAmount, maxRemainingAmount, ...rest } = this.invoiceFilter;
  //   for (const [key, value] of Object.entries(rest)) {
  //     if (value !== '' && value !== null && value !== undefined) {
  //       filterParams[key] = value;
  //     }
  //   }
  // if (minRemainingAmount || maxRemainingAmount) {
  //   filterParams.filter.totalAmount = {};
  //   if (minRemainingAmount) filterParams.filter.totalAmount.gt = minRemainingAmount;
  //   if (maxRemainingAmount) filterParams.filter.totalAmount.lt = maxRemainingAmount;
  // }
  //   this.InvoiceService.getAllinvoiceData(filterParams).subscribe((res: any) => {
  //     this.data = res.data;
  //     this.cdr.markForCheck();
  //   });
  // }


  resetFilters(): void {
    this.invoiceFilter = {
      invoiceNumber: '',
      buyer: '',
      buyerEmail: '',
      status: '',
      createdFrom: '',
      createdTo: '',
      minRemainingAmount: '',
      maxRemainingAmount: ''
    };

    this.getData();
  }
}
