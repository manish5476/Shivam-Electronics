// // // import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
// // // import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
// // // import { CellValueChangedEvent } from 'ag-grid-community';
// // // import { ToolbarComponent } from "../../../../shared/Components/toolbar/toolbar.component";
// // // import { CustomerService } from '../../../../core/services/customer.service';
// // // import { InvoiceService } from '../../../../core/services/invoice.service';
// // // import { DynamicCellComponent } from '../../../../shared/AgGrid/AgGridcomponents/dynamic-cell/dynamic-cell.component';
// // // import { GridContext } from '../../../../shared/AgGrid/AgGridcomponents/ag-grid-reference/ag-grid-reference.component';
// // // @Component({
// // //     selector: 'app-customer-list',
// // //     standalone: true,
// // //     imports: [SharedGridComponent, ToolbarComponent, ToolbarComponent],
// // //     providers: [CustomerService],
// // //     templateUrl: './customer-list.component.html',
// // //     styleUrl: './customer-list.component.css'
// // // })
// // // export class CustomerListComponent implements OnInit {
// // //     data: any = [];
// // //     column: any = [];
// // //     rowSelectionMode: any = 'singleRow';

// // //     constructor(private cdr: ChangeDetectorRef,private InvoiceService:InvoiceService, private CustomerService: CustomerService) { }

// // //     ngOnInit(): void {
// // //         this.getColumn();
// // //         this.getData();
// // //     }
// // //     private getGridContext(): GridContext {
// // //         return {
// // //           isRowEditing: (id: string) => false, // Will be overridden by SharedGridComponent
// // //           startEditingRow: () => {},
// // //           saveRow: () => {},
// // //           cancelEditingRow: () => {},
// // //           deleteRow: () => {},
// // //         };
// // //       }

// // //     getColumn(): void {
// // //         this.column = [
// // //             { field: '_id', headerName: 'ID', sortable: true, filter: true, resizable: true },
// // //             {
// // //                 field: 'status', headerName: 'Status', sortable: true, filter: true, resizable: true,
// // //                 cellStyle: (params: any) => {
// // //                     switch (params.value) {
// // //                         case 'active': return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' };
// // //                         case 'inactive': return { backgroundColor: '#ffcccc', color: '#8b0000', fontWeight: 'bold' };
// // //                         case 'pending': return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' };
// // //                         case 'suspended': return { backgroundColor: '#f0f0f0', color: '#808080', fontWeight: 'bold' };
// // //                         case 'blocked': return { backgroundColor: '#e0e0e0', color: '#555555', fontWeight: 'bold' };
// // //                         default: return {};
// // //                     }
// // //                 },
// // //             },
// // //             {
// // //                 headerName: 'Number',
// // //                 field: 'phoneNumbers[0].number',
// // //                 cellRenderer: DynamicCellComponent,
// // //                 cellRendererParams: { type: 'number', inputConfig: { min: 0, max: 150 }, context: this.getGridContext() }
// // //               },
// // //             { field: 'profileImg', headerName: 'Profile Image', sortable: true, filter: true, resizable: true },
// // //             { field: 'email', headerName: 'Email', sortable: true, filter: true, resizable: true },
// // //             { field: 'fullname', headerName: 'Full Name', sortable: true, filter: true, resizable: true },
// // //             { field: 'phoneNumbers[0].number', headerName: 'Contact Number', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.phoneNumbers?.[0]?.number },
// // //             { field: 'addresses[0].street', headerName: 'Street', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.addresses?.[0]?.street },
// // //             { field: 'addresses[0].city', headerName: 'City', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.addresses?.[0]?.city },
// // //             { field: 'addresses[0].state', headerName: 'State', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.addresses?.[0]?.state },
// // //             { field: 'addresses[0].zipCode', headerName: 'Zip Code', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.addresses?.[0]?.zipCode },
// // //             { field: 'addresses[0].country', headerName: 'Country', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.addresses?.[0]?.country },
// // //             { field: 'totalPurchasedAmount', headerName: 'Total Purchased Amount', sortable: true, filter: true, resizable: true },
// // //             { field: 'remainingAmount', headerName: 'Remaining Amount', sortable: true, filter: true, resizable: true, cellStyle: (params: any) => {
// // //                 // console.log(params); // Keep for debugging if needed
// // //                 const remaining = params.data.remainingAmount;
// // //                 if (typeof remaining !== 'number' || isNaN(remaining)) {
// // //                     return {}; // Return default style if not a valid number
// // //                 }
// // //                 if (remaining === 0) {
// // //                     return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' }; // Green
// // //                 } else if (remaining > 0 && remaining<3000) {
// // //                     return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' }; // Orange (like your 'pending' style)
// // //                 } else if (remaining < 0) {
// // //                     return { backgroundColor: '#cce0ff', color: '#00008b', fontWeight: 'bold' }; // Example: Blueish for overpayment
// // //                 }
// // //                 else if (remaining > 3000) {
// // //                     return { backgroundColor: '#FCB045', color: '#d35400', fontWeight: 'bold' }; // Orange (like your 'pending' style)
// // //                 }
// // //                 else {
// // //                     return {};
// // //                 }
// // //             }
// // //          },
// // //             {
// // //                 field: 'paymentHistory',
// // //                 headerName: 'Payment History',
// // //                 sortable: true,
// // //                 filter: true,
// // //                 resizable: true,
// // //                 valueGetter: (params: any) => params.data.paymentHistory?.length > 0 ? params.data.paymentHistory.map((p: any) => p.amount + ' ' + p.currency).join(', ') : 'No History',
// // //                 cellStyle: (params: any) => {
// // //                     switch (params.data.remainingAmount) {
// // //                         case '0': return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' };
// // //                         case 'inactive': return { backgroundColor: '#ffcccc', color: '#8b0000', fontWeight: 'bold' };
// // //                         case 'pending': return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' };
// // //                         case 'suspended': return { backgroundColor: '#f0f0f0', color: '#808080', fontWeight: 'bold' };
// // //                         case 'blocked': return { backgroundColor: '#e0e0e0', color: '#555555', fontWeight: 'bold' };
// // //                         default: return {};
// // //                     }
// // //                 },
// // //             },
// // //             {
// // //                 headerName: 'metadata',
// // //                 field: 'metadata',
// // //                 cellRenderer: DynamicCellComponent,
// // //                 cellRendererParams: {
// // //                     type: 'colorpicker',
// // //                     // options: [ // Provide options for the dropdown
// // //                     //     { label: 'United States', value: 'USA' },
// // //                     //     { label: 'Canada', value: 'CAN' },
// // //                     //     { label: 'Mexico', value: 'MEX' }
// // //                     // ]
// // //                 }
// // //             },
// // //             { field: 'metadata', headerName: 'Metadata', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => JSON.stringify(params.data.metadata) },
// // //             { field: 'createdAt', headerName: 'Created At', sortable: true, filter: true, resizable: true, valueFormatter: (params: any) => new Date(params.value).toLocaleString() },
// // //             { field: 'updatedAt', headerName: 'Updated At', sortable: true, filter: true, resizable: true, valueFormatter: (params: any) => new Date(params.value).toLocaleString() },
// // //             { field: '__v', headerName: 'Version', sortable: true, filter: true, resizable: true },
// // //             {
// // //                 field: 'cart',
// // //                 headerName: 'Cart Items',
// // //                 sortable: true,
// // //                 filter: true,
// // //                 resizable: true,
// // //                 valueGetter: (params: any) => params.data.cart?.items?.length
// // //             }
// // //         ];
// // //         this.cdr.detectChanges();
// // //     }

// // //     getData() {
// // //         this.CustomerService.getAllCustomerData().subscribe((res: any) => {
// // //             this.data = res.data;
// // //             this.cdr.markForCheck();
// // //         });
// // //     }

// // //     eventFromGrid(event: any) {
// // //         if (event.eventType === 'onCellValueCHanged') {
// // //             const cellValueChangedEvent = event.event as CellValueChangedEvent;
// // //             const rowNode = cellValueChangedEvent.node;
// // //             const dataItem = rowNode.data;
// // //             const field = cellValueChangedEvent.colDef.field;
// // //             const newValue = cellValueChangedEvent.newValue;

// // //             if (field) {
// // //                 dataItem[field] = newValue;
// // //                 this.InvoiceService.updateinvoice(dataItem.id, dataItem).subscribe({
// // //                     next: (res: any) => {
// // //                     },
// // //                     error: (err: any) => {
// // //                         console.error('❌ Error updating invoice:', err);
// // //                     }
// // //                 });
// // //             } else {
// // //                 console.error('❌ Error: Field is undefined in cellValueChangedEvent.colDef');
// // //             }
// // //         }

// // //     }
// // // }
// // import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
// // import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
// // import { CellStyle, CellValueChangedEvent, ColDef } from 'ag-grid-community';
// // import { ToolbarComponent } from '../../../../shared/Components/toolbar/toolbar.component';
// // import { DynamicCellComponent } from '../../../../shared/AgGrid/AgGridcomponents/dynamic-cell/dynamic-cell.component';
// // import { CustomerService } from '../../../../core/services/customer.service';
// // import { InvoiceService } from '../../../../core/services/invoice.service';
// // import { GridContext } from '../../../../interfaces/grid-context.interface';
// // @Component({
// //   selector: 'app-customer-list',
// //   standalone: true,
// //   imports: [SharedGridComponent, ToolbarComponent],
// //   providers: [CustomerService, ToolbarComponent,InvoiceService],
// //   template: `
// // <div class="h-[calc(100vh-56px)] flex flex-col overflow-hidden">
// //   <!-- Your app-level header -->
// //   <app-common-header class="h-14" [gridWidth]="'100%'"></app-common-header>

// //   <!-- Grid: fill remaining height minus internal grid footer -->
// //   <app-shared-grid class="flex-1 overflow-auto" [gridHeight]="'calc(100vh - 56px - 56px - 48px)'" [gridWidth]="'100%'"
// //     [padding]="'0'" [data]="data" [rowSelectionMode]="rowSelectionMode" [column]="column"
// //     (eventFromGrid)="eventFromGrid($event)">
// //   </app-shared-grid>
// // </div>
// //   `,
// //   styleUrls: ['./customer-list.component.css']
// // })
// // export class CustomerListComponent implements OnInit {
// //   data: any[] = [];
// //   column: ColDef[] = [];
// //   rowSelectionMode: string = 'single';

// //   constructor(
// //     private cdr: ChangeDetectorRef,
// //     private invoiceService: InvoiceService,
// //     private customerService: CustomerService
// //   ) {}

// //   ngOnInit(): void {
// //     this.getColumn();
// //     this.getData();
// //   }

// //   private getGridContext(): GridContext {
// //     return {
// //       isRowEditing: (id: string) => false, // Will be overridden by SharedGridComponent
// //       startEditingRow: () => {},
// //       saveRow: () => {},
// //       cancelEditingRow: () => {},
// //       deleteRow: () => {},
// //     };
// //   }
// //   getColumn(): void {
// //     const context = this.getGridContext();
// //     this.column = [
// //       { field: '_id', headerName: 'ID', sortable: true, filter: true, resizable: true },
// //       {
// //         field: 'status',
// //         headerName: 'Status',
// //         sortable: true,
// //         filter: true,
// //         resizable: true,
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: {
// //           type: 'select',
// //           options: [
// //             { label: 'Active', value: 'active' },
// //             { label: 'Inactive', value: 'inactive' },
// //             { label: 'Pending', value: 'pending' },
// //             { label: 'Suspended', value: 'suspended' },
// //             { label: 'Blocked', value: 'blocked' }
// //           ],
// //           context
// //         },
// //         cellEditorParams: {
// //           type: 'select',
// //           options: [
// //             { label: 'Active', value: 'active' },
// //             { label: 'Inactive', value: 'inactive' },
// //             { label: 'Pending', value: 'pending' },
// //             { label: 'Suspended', value: 'suspended' },
// //             { label: 'Blocked', value: 'blocked' }
// //           ],
// //           context
// //         },
// //         cellStyle: (params: any): CellStyle => {
// //           switch (params.value) {
// //             case 'active': return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' };
// //             case 'inactive': return { backgroundColor: '#ffcccc', color: '#8b0000', fontWeight: 'bold' };
// //             case 'pending': return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' };
// //             case 'suspended': return { backgroundColor: '#f0f0f0', color: '#808080', fontWeight: 'bold' };
// //             case 'blocked': return { backgroundColor: '#e0e0e0', color: '#555555', fontWeight: 'bold' };
// //             default: return {};
// //           }
// //         },
// //       },
// //       {
// //         headerName: 'Number',
// //         field: 'phoneNumbers[0].number',
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: { type: 'number', inputConfig: { min: 0, max: 150 }, context },
// //         cellEditorParams: { type: 'number', inputConfig: { min: 0, max: 150 }, context }
// //       },
// //       { field: 'profileImg', headerName: 'Profile Image', sortable: true, filter: true, resizable: true },
// //       {
// //         field: 'email',
// //         headerName: 'Email',
// //         sortable: true,
// //         filter: true,
// //         resizable: true,
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: { type: 'text', context },
// //         cellEditorParams: { type: 'text', context }
// //       },
// //       {
// //         field: 'fullname',
// //         headerName: 'Full Name',
// //         sortable: true,
// //         filter: true,
// //         resizable: true,
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: { type: 'text', context },
// //         cellEditorParams: { type: 'text', context }
// //       },
// //       {
// //         field: 'phoneNumbers[0].number',
// //         headerName: 'Contact Number',
// //         sortable: true,
// //         filter: true,
// //         resizable: true,
// //         valueGetter: (params: any) => params.data.phoneNumbers?.[0]?.number,
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: { type: 'text', context },
// //         cellEditorParams: { type: 'text', context }
// //       },
// //       {
// //         field: 'addresses[0].street',
// //         headerName: 'Street',
// //         sortable: true,
// //         filter: true,
// //         resizable: true,
// //         valueGetter: (params: any) => params.data.addresses?.[0]?.street,
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: { type: 'text', context },
// //         cellEditorParams: { type: 'text', context }
// //       },
// //       {
// //         field: 'addresses[0].city',
// //         headerName: 'City',
// //         sortable: true,
// //         filter: true,
// //         resizable: true,
// //         valueGetter: (params: any) => params.data.addresses?.[0]?.city,
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: { type: 'text', context },
// //         cellEditorParams: { type: 'text', context }
// //       },
// //       {
// //         field: 'addresses[0].state',
// //         headerName: 'State',
// //         sortable: true,
// //         filter: true,
// //         resizable: true,
// //         valueGetter: (params: any) => params.data.addresses?.[0]?.state,
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: { type: 'text', context },
// //         cellEditorParams: { type: 'text', context }
// //       },
// //       {
// //         field: 'addresses[0].zipCode',
// //         headerName: 'Zip Code',
// //         sortable: true,
// //         filter: true,
// //         resizable: true,
// //         valueGetter: (params: any) => params.data.addresses?.[0]?.zipCode,
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: { type: 'text', context },
// //         cellEditorParams: { type: 'text', context }
// //       },
// //       {
// //         field: 'addresses[0].country',
// //         headerName: 'Country',
// //         sortable: true,
// //         filter: true,
// //         resizable: true,
// //         valueGetter: (params: any) => params.data.addresses?.[0]?.country,
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: {
// //           type: 'select',
// //           options: [
// //             { label: 'United States', value: 'USA' },
// //             { label: 'Canada', value: 'CAN' },
// //             { label: 'Mexico', value: 'MEX' }
// //           ],
// //           context
// //         },
// //         cellEditorParams: {
// //           type: 'select',
// //           options: [
// //             { label: 'United States', value: 'USA' },
// //             { label: 'Canada', value: 'CAN' },
// //             { label: 'Mexico', value: 'MEX' }
// //           ],
// //           context
// //         }
// //       },
// //       {
// //         field: 'totalPurchasedAmount',
// //         headerName: 'Total Purchased Amount',
// //         sortable: true,
// //         filter: true,
// //         resizable: true,
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: { type: 'number', context },
// //         cellEditorParams: { type: 'number', context }
// //       },
// //       {
// //         field: 'remainingAmount',
// //         headerName: 'Remaining Amount',
// //         sortable: true,
// //         filter: true,
// //         resizable: true,
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: { type: 'number', context },
// //         cellEditorParams: { type: 'number', context },
// //         cellStyle: (params: any): CellStyle => {
// //           const remaining = params.data.remainingAmount;
// //           if (typeof remaining !== 'number' || isNaN(remaining)) {
// //             return {};
// //           }
// //           if (remaining === 0) {
// //             return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' };
// //           } else if (remaining > 0 && remaining < 3000) {
// //             return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' };
// //           } else if (remaining < 0) {
// //             return { backgroundColor: '#cce0ff', color: '#00008b', fontWeight: 'bold' };
// //           } else if (remaining > 3000) {
// //             return { backgroundColor: '#FCB045', color: '#d35400', fontWeight: 'bold' };
// //           }
// //           return {};
// //         }
// //       },
// //       {
// //         field: 'paymentHistory',
// //         headerName: 'Payment History',
// //         sortable: true,
// //         filter: true,
// //         resizable: true,
// //         valueGetter: (params: any) => params.data.paymentHistory?.length > 0 ? params.data.paymentHistory.map((p: any) => p.amount + ' ' + p.currency).join(', ') : 'No History',
// //       },
// //       {
// //         headerName: 'Metadata',
// //         field: 'metadata',
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: { type: 'colorpicker', context },
// //         cellEditorParams: { type: 'colorpicker', context }
// //       },
// //       {
// //         field: 'metadata',
// //         headerName: 'Metadata JSON',
// //         sortable: true,
// //         filter: true,
// //         resizable: true,
// //         valueGetter: (params: any) => JSON.stringify(params.data.metadata)
// //       },
// //       {
// //         field: 'createdAt',
// //         headerName: 'Created At',
// //         sortable: true,
// //         filter: true,
// //         resizable: true,
// //         valueFormatter: (params: any) => new Date(params.value).toLocaleString(),
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: { type: 'datepicker', context },
// //         cellEditorParams: { type: 'datepicker', context }
// //       },
// //       {
// //         field: 'updatedAt',
// //         headerName: 'Updated At',
// //         sortable: true,
// //         filter: true,
// //         resizable: true,
// //         valueFormatter: (params: any) => new Date(params.value).toLocaleString(),
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: { type: 'datepicker', context },
// //         cellEditorParams: { type: 'datepicker', context }
// //       },
// //       { field: '__v', headerName: 'Version', sortable: true, filter: true, resizable: true },
// //       {
// //         field: 'cart',
// //         headerName: 'Cart Items',
// //         sortable: true,
// //         filter: true,
// //         resizable: true,
// //         valueGetter: (params: any) => params.data.cart?.items?.length
// //       }
// //     ];
// //     this.cdr.detectChanges();
// //   }
// // //   getColumn(): void {
// // //     const context = this.getGridContext();
// // //     this.column = [
// // //       { field: '_id', headerName: 'ID', sortable: true, filter: true, resizable: true },
// // //       {
// // //         field: 'status',
// // //         headerName: 'Status',
// // //         sortable: true,
// // //         filter: true,
// // //         resizable: true,
// // //         cellRenderer: DynamicCellComponent,
// // //         cellEditor: DynamicCellComponent,
// // //         cellRendererParams: {
// // //           type: 'select',
// // //           options: [
// // //             { label: 'Active', value: 'active' },
// // //             { label: 'Inactive', value: 'inactive' },
// // //             { label: 'Pending', value: 'pending' },
// // //             { label: 'Suspended', value: 'suspended' },
// // //             { label: 'Blocked', value: 'blocked' }
// // //           ],
// // //           context
// // //         },
// // //         cellEditorParams: {
// // //           type: 'select',
// // //           options: [
// // //             { label: 'Active', value: 'active' },
// // //             { label: 'Inactive', value: 'inactive' },
// // //             { label: 'Pending', value: 'pending' },
// // //             { label: 'Suspended', value: 'suspended' },
// // //             { label: 'Blocked', value: 'blocked' }
// // //           ],
// // //           context
// // //         },
// // //         cellStyle: (params: any) => {
// // //           switch (params.value) {
// // //             case 'active': return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' };
// // //             case 'inactive': return { backgroundColor: '#ffcccc', color: '#8b0000', fontWeight: 'bold' };
// // //             case 'pending': return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' };
// // //             case 'suspended': return { backgroundColor: '#f0f0f0', color: '#808080', fontWeight: 'bold' };
// // //             case 'blocked': return { backgroundColor: '#e0e0e0', color: '#555555', fontWeight: 'bold' };
// // //             default: return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' };

// // //           }
// // //         },
// // //       },
// // //       {
// // //         headerName: 'Number',
// // //         field: 'phoneNumbers[0].number',
// // //         cellRenderer: DynamicCellComponent,
// // //         cellEditor: DynamicCellComponent,
// // //         cellRendererParams: { type: 'number', inputConfig: { min: 0, max: 150 }, context },
// // //         cellEditorParams: { type: 'number', inputConfig: { min: 0, max: 150 }, context }
// // //       },
// // //       { field: 'profileImg', headerName: 'Profile Image', sortable: true, filter: true, resizable: true },
// // //       {
// // //         field: 'email',
// // //         headerName: 'Email',
// // //         sortable: true,
// // //         filter: true,
// // //         resizable: true,
// // //         cellRenderer: DynamicCellComponent,
// // //         cellEditor: DynamicCellComponent,
// // //         cellRendererParams: { type: 'text', context },
// // //         cellEditorParams: { type: 'text', context }
// // //       },
// // //       {
// // //         field: 'fullname',
// // //         headerName: 'Full Name',
// // //         sortable: true,
// // //         filter: true,
// // //         resizable: true,
// // //         cellRenderer: DynamicCellComponent,
// // //         cellEditor: DynamicCellComponent,
// // //         cellRendererParams: { type: 'text', context },
// // //         cellEditorParams: { type: 'text', context }
// // //       },
// // //       {
// // //         field: 'phoneNumbers[0].number',
// // //         headerName: 'Contact Number',
// // //         sortable: true,
// // //         filter: true,
// // //         resizable: true,
// // //         valueGetter: (params: any) => params.data.phoneNumbers?.[0]?.number,
// // //         cellRenderer: DynamicCellComponent,
// // //         cellEditor: DynamicCellComponent,
// // //         cellRendererParams: { type: 'text', context },
// // //         cellEditorParams: { type: 'text', context }
// // //       },
// // //       {
// // //         field: 'addresses[0].street',
// // //         headerName: 'Street',
// // //         sortable: true,
// // //         filter: true,
// // //         resizable: true,
// // //         valueGetter: (params: any) => params.data.addresses?.[0]?.street,
// // //         cellRenderer: DynamicCellComponent,
// // //         cellEditor: DynamicCellComponent,
// // //         cellRendererParams: { type: 'text', context },
// // //         cellEditorParams: { type: 'text', context }
// // //       },
// // //       {
// // //         field: 'addresses[0].city',
// // //         headerName: 'City',
// // //         sortable: true,
// // //         filter: true,
// // //         resizable: true,
// // //         valueGetter: (params: any) => params.data.addresses?.[0]?.city,
// // //         cellRenderer: DynamicCellComponent,
// // //         cellEditor: DynamicCellComponent,
// // //         cellRendererParams: { type: 'text', context },
// // //         cellEditorParams: { type: 'text', context }
// // //       },
// // //       {
// // //         field: 'addresses[0].state',
// // //         headerName: 'State',
// // //         sortable: true,
// // //         filter: true,
// // //         resizable: true,
// // //         valueGetter: (params: any) => params.data.addresses?.[0]?.state,
// // //         cellRenderer: DynamicCellComponent,
// // //         cellEditor: DynamicCellComponent,
// // //         cellRendererParams: { type: 'text', context },
// // //         cellEditorParams: { type: 'text', context }
// // //       },
// // //       {
// // //         field: 'addresses[0].zipCode',
// // //         headerName: 'Zip Code',
// // //         sortable: true,
// // //         filter: true,
// // //         resizable: true,
// // //         valueGetter: (params: any) => params.data.addresses?.[0]?.zipCode,
// // //         cellRenderer: DynamicCellComponent,
// // //         cellEditor: DynamicCellComponent,
// // //         cellRendererParams: { type: 'text', context },
// // //         cellEditorParams: { type: 'text', context }
// // //       },
// // //       {
// // //         field: 'addresses[0].country',
// // //         headerName: 'Country',
// // //         sortable: true,
// // //         filter: true,
// // //         resizable: true,
// // //         valueGetter: (params: any) => params.data.addresses?.[0]?.country,
// // //         cellRenderer: DynamicCellComponent,
// // //         cellEditor: DynamicCellComponent,
// // //         cellRendererParams: {
// // //           type: 'select',
// // //           options: [
// // //             { label: 'United States', value: 'USA' },
// // //             { label: 'Canada', value: 'CAN' },
// // //             { label: 'Mexico', value: 'MEX' }
// // //           ],
// // //           context
// // //         },
// // //         cellEditorParams: {
// // //           type: 'select',
// // //           options: [
// // //             { label: 'United States', value: 'USA' },
// // //             { label: 'Canada', value: 'CAN' },
// // //             { label: 'Mexico', value: 'MEX' }
// // //           ],
// // //           context
// // //         }
// // //       },
// // //       {
// // //         field: 'totalPurchasedAmount',
// // //         headerName: 'Total Purchased Amount',
// // //         sortable: true,
// // //         filter: true,
// // //         resizable: true,
// // //         cellRenderer: DynamicCellComponent,
// // //         cellEditor: DynamicCellComponent,
// // //         cellRendererParams: { type: 'number', context },
// // //         cellEditorParams: { type: 'number', context }
// // //       },
// // //       {
// // //         field: 'remainingAmount',
// // //         headerName: 'Remaining Amount',
// // //         sortable: true,
// // //         filter: true,
// // //         resizable: true,
// // //         cellRenderer: DynamicCellComponent,
// // //         cellEditor: DynamicCellComponent,
// // //         cellRendererParams: { type: 'number', context },
// // //         cellEditorParams: { type: 'number', context },
        
// // //         cellStyle: (params: any) => {
// // //           const remaining = params.data.remainingAmount;
// // //           if (typeof remaining !== 'number' || isNaN(remaining)) {return {} }
// // //           if (remaining === 0) {
// // //             return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' };
// // //           } else if (remaining > 0 && remaining < 3000) {
// // //             return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' };
// // //           } else if (remaining < 0) {
// // //             return { backgroundColor: '#cce0ff', color: '#00008b', fontWeight: 'bold' };
// // //           } else if (remaining > 3000) {
// // //             return { backgroundColor: '#FCB045', color: '#d35400', fontWeight: 'bold' };
// // //           }
// // //           else
// // //           return {backgroundColor: '#FCB045', color: '#d35400', fontWeight: 'bold'};
// // //         }
// // //       },
// // //       {
// // //         field: 'paymentHistory',
// // //         headerName: 'Payment History',
// // //         sortable: true,
// // //         filter: true,
// // //         resizable: true,
// // //         valueGetter: (params: any) => params.data.paymentHistory?.length > 0 ? params.data.paymentHistory.map((p: any) => p.amount + ' ' + p.currency).join(', ') : 'No History',
// // //       },
// // //       {
// // //         headerName: 'Metadata',
// // //         field: 'metadata',
// // //         cellRenderer: DynamicCellComponent,
// // //         cellEditor: DynamicCellComponent,
// // //         cellRendererParams: { type: 'colorpicker', context },
// // //         cellEditorParams: { type: 'colorpicker', context }
// // //       },
// // //       {
// // //         field: 'metadata',
// // //         headerName: 'Metadata JSON',
// // //         sortable: true,
// // //         filter: true,
// // //         resizable: true,
// // //         valueGetter: (params: any) => JSON.stringify(params.data.metadata)
// // //       },
// // //       {
// // //         field: 'createdAt',
// // //         headerName: 'Created At',
// // //         sortable: true,
// // //         filter: true,
// // //         resizable: true,
// // //         valueFormatter: (params: any) => new Date(params.value).toLocaleString(),
// // //         cellRenderer: DynamicCellComponent,
// // //         cellEditor: DynamicCellComponent,
// // //         cellRendererParams: { type: 'datepicker', context },
// // //         cellEditorParams: { type: 'datepicker', context }
// // //       },
// // //       {
// // //         field: 'updatedAt',
// // //         headerName: 'Updated At',
// // //         sortable: true,
// // //         filter: true,
// // //         resizable: true,
// // //         valueFormatter: (params: any) => new Date(params.value).toLocaleString(),
// // //         cellRenderer: DynamicCellComponent,
// // //         cellEditor: DynamicCellComponent,
// // //         cellRendererParams: { type: 'datepicker', context },
// // //         cellEditorParams: { type: 'datepicker', context }
// // //       },
// // //       { field: '__v', headerName: 'Version', sortable: true, filter: true, resizable: true },
// // //       {
// // //         field: 'cart',
// // //         headerName: 'Cart Items',
// // //         sortable: true,
// // //         filter: true,
// // //         resizable: true,
// // //         valueGetter: (params: any) => params.data.cart?.items?.length
// // //       }
// // //     ];
// // //     this.cdr.detectChanges();
// // //   }

// //   getData() {
// //     this.customerService.getAllCustomerData().subscribe((res: any) => {
// //       this.data = res.data;
// //       this.cdr.markForCheck();
// //     });
// //   }

// //   eventFromGrid(event: any) {
// //     if (event.eventType === 'onCellValueChanged') {
// //       const cellValueChangedEvent = event.event as CellValueChangedEvent;
// //       const rowNode = cellValueChangedEvent.node;
// //       const dataItem = rowNode.data;
// //       const field = cellValueChangedEvent.colDef.field;
// //       const newValue = cellValueChangedEvent.newValue;

// //       if (field) {
// //         dataItem[field] = newValue;
// //         this.invoiceService.updateinvoice(dataItem._id, dataItem).subscribe({
// //           next: (res: any) => {
// //             console.log('Invoice updated:', res);
// //           },
// //           error: (err: any) => {
// //             console.error('❌ Error updating invoice:', err);
// //           }
// //         });
// //       } else {
// //         console.error('❌ Error: Field is undefined in cellValueChangedEvent.colDef');
// //       }
// //     }
// //   }

// //   handleDataChanged(event: any) {
// //     console.log('Data changed:', event);
// //   }

// //   onGridReady(event: any) {
// //     console.log('Grid ready:', event);
// //   }
// // }
// // import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
// // import { SharedGridComponent } from '../grid/shared-grid/shared-grid.component';
// // import { CellValueChangedEvent, ColDef, CellStyle } from 'ag-grid-community';
// // import { ToolbarComponent } from '../../../Components/toolbar/toolbar.component';
// // import { CustomerService } from '../../../../core/services/customer.service';
// // import { InvoiceService } from '../../../../core/services/invoice.service';
// // import { DynamicCellComponent } from '../AgGridcomponents/dynamic-cell/dynamic-cell.component';
// // import { GridContext } from '../AgGridcomponents/ag-grid-reference/ag-grid-reference.component';


// import { ChangeDetectorRef, Component,ViewChild, OnInit } from '@angular/core';
// import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
// import { CellValueChangedEvent, ColDef, CellStyle  } from 'ag-grid-community';
// import { ToolbarComponent } from "../../../../shared/Components/toolbar/toolbar.component";
// import { CustomerService } from '../../../../core/services/customer.service';
// import { InvoiceService } from '../../../../core/services/invoice.service';
// import { DynamicCellComponent } from '../../../../shared/AgGrid/AgGridcomponents/dynamic-cell/dynamic-cell.component';
// import { GridContext } from '../../../../interfaces/grid-context.interface';
// @Component({
//   selector: 'app-customer-list',
//   standalone: true,
//   imports: [SharedGridComponent],
//   providers: [CustomerService, InvoiceService],
//   template: `
//     <app-shared-grid
//       #grid
//       [data]="data"
//       [column]="column"
//       [rowSelectionMode]="rowSelectionMode"
//       [gridHeight]="'600px'"
//       (dataChanged)="handleDataChanged($event)"
//       (eventFromGrid)="eventFromGrid($event)"
//       (gridReady)="onGridReady($event)"
//     ></app-shared-grid>
//   `,
//   styleUrls: ['./customer-list.component.css']
// })
// export class CustomerListComponent implements OnInit {
//   data: any[] = [];
//   column: ColDef[] = [];
//   rowSelectionMode: string = 'single';
//   @ViewChild('grid') grid!: SharedGridComponent;

//   constructor(
//     private cdr: ChangeDetectorRef,
//     private invoiceService: InvoiceService,
//     private customerService: CustomerService
//   ) {}

//   ngOnInit(): void {
//     this.getColumn();
//     this.getData();
//   }

//   private getGridContext(): GridContext {
//     return {
//       isRowEditing: (id: string) => this.grid?.editingRowId === id,
//       startEditingRow: (rowData: any) => this.grid?.startEditingRow(rowData),
//       saveRow: (rowData: any) => this.grid?.saveRow(rowData),
//       cancelEditingRow: (rowData: any) => this.grid?.cancelEditingRow(rowData),
//       deleteRow: (rowData: any) => this.grid?.deleteRow(rowData),
//     };
//   }

//   getColumn(): void {
//     const context = this.getGridContext();
//     this.column = [
//       { field: '_id', headerName: 'ID', sortable: true, filter: true, resizable: true },
//       {
//         field: 'status',
//         headerName: 'Status',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         cellRenderer: DynamicCellComponent,
//         cellEditor: DynamicCellComponent,
//         cellRendererParams: {
//           type: 'select',
//           options: [
//             { label: 'Active', value: 'active' },
//             { label: 'Inactive', value: 'inactive' },
//             { label: 'Pending', value: 'pending' },
//             { label: 'Suspended', value: 'suspended' },
//             { label: 'Blocked', value: 'blocked' }
//           ],
//           context
//         },
//         cellEditorParams: {
//           type: 'select',
//           options: [
//             { label: 'Active', value: 'active' },
//             { label: 'Inactive', value: 'inactive' },
//             { label: 'Pending', value: 'pending' },
//             { label: 'Suspended', value: 'suspended' },
//             { label: 'Blocked', value: 'blocked' }
//           ],
//           context
//         },
//         cellStyle: (params: any): CellStyle => {
//           switch (params.value) {
//             case 'active': return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' };
//             case 'inactive': return { backgroundColor: '#ffcccc', color: '#8b0000', fontWeight: 'bold' };
//             case 'pending': return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' };
//             case 'suspended': return { backgroundColor: '#f0f0f0', color: '#808080', fontWeight: 'bold' };
//             case 'blocked': return { backgroundColor: '#e0e0e0', color: '#555555', fontWeight: 'bold' };
//             default: return {};
//           }
//         },
//       },
//       {
//         headerName: 'Number',
//         field: 'phoneNumbers[0].number',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         cellRenderer: DynamicCellComponent,
//         cellEditor: DynamicCellComponent,
//         cellRendererParams: { type: 'number', inputConfig: { min: 0, max: 150 }, context },
//         cellEditorParams: { type: 'number', inputConfig: { min: 0, max: 150 }, context }
//       },
//       { field: 'profileImg', headerName: 'Profile Image', sortable: true, filter: true, resizable: true },
//       {
//         field: 'email',
//         headerName: 'Email',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         cellRenderer: DynamicCellComponent,
//         cellEditor: DynamicCellComponent,
//         cellRendererParams: { type: 'text', context },
//         cellEditorParams: { type: 'text', context }
//       },
//       {
//         field: 'fullname',
//         headerName: 'Full Name',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         cellRenderer: DynamicCellComponent,
//         cellEditor: DynamicCellComponent,
//         cellRendererParams: { type: 'text', context },
//         cellEditorParams: { type: 'text', context }
//       },
//       {
//         field: 'phoneNumbers[0].number',
//         headerName: 'Contact Number',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         valueGetter: (params: any) => params.data.phoneNumbers?.[0]?.number,
//         cellRenderer: DynamicCellComponent,
//         cellEditor: DynamicCellComponent,
//         cellRendererParams: { type: 'text', context },
//         cellEditorParams: { type: 'text', context }
//       },
//       {
//         field: 'addresses[0].street',
//         headerName: 'Street',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         valueGetter: (params: any) => params.data.addresses?.[0]?.street,
//         cellRenderer: DynamicCellComponent,
//         cellEditor: DynamicCellComponent,
//         cellRendererParams: { type: 'text', context },
//         cellEditorParams: { type: 'text', context }
//       },
//       {
//         field: 'addresses[0].city',
//         headerName: 'City',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         valueGetter: (params: any) => params.data.addresses?.[0]?.city,
//         cellRenderer: DynamicCellComponent,
//         cellEditor: DynamicCellComponent,
//         cellRendererParams: { type: 'text', context },
//         cellEditorParams: { type: 'text', context }
//       },
//       {
//         field: 'addresses[0].state',
//         headerName: 'State',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         valueGetter: (params: any) => params.data.addresses?.[0]?.state,
//         cellRenderer: DynamicCellComponent,
//         cellEditor: DynamicCellComponent,
//         cellRendererParams: { type: 'text', context },
//         cellEditorParams: { type: 'text', context }
//       },
//       {
//         field: 'addresses[0].zipCode',
//         headerName: 'Zip Code',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         valueGetter: (params: any) => params.data.addresses?.[0]?.zipCode,
//         cellRenderer: DynamicCellComponent,
//         cellEditor: DynamicCellComponent,
//         cellRendererParams: { type: 'text', context },
//         cellEditorParams: { type: 'text', context }
//       },
//       {
//         field: 'addresses[0].country',
//         headerName: 'Country',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         valueGetter: (params: any) => params.data.addresses?.[0]?.country,
//         cellRenderer: DynamicCellComponent,
//         cellEditor: DynamicCellComponent,
//         cellRendererParams: {
//           type: 'select',
//           options: [
//             { label: 'United States', value: 'USA' },
//             { label: 'Canada', value: 'CAN' },
//             { label: 'Mexico', value: 'MEX' }
//           ],
//           context
//         },
//         cellEditorParams: {
//           type: 'select',
//           options: [
//             { label: 'United States', value: 'USA' },
//             { label: 'Canada', value: 'CAN' },
//             { label: 'Mexico', value: 'MEX' }
//           ],
//           context
//         }
//       },
//       {
//         field: 'totalPurchasedAmount',
//         headerName: 'Total Purchased Amount',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         cellRenderer: DynamicCellComponent,
//         cellEditor: DynamicCellComponent,
//         cellRendererParams: { type: 'number', context },
//         cellEditorParams: { type: 'number', context }
//       },
//       {
//         field: 'remainingAmount',
//         headerName: 'Remaining Amount',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         cellRenderer: DynamicCellComponent,
//         cellEditor: DynamicCellComponent,
//         cellRendererParams: { type: 'number', context },
//         cellEditorParams: { type: 'number', context },
//         cellStyle: (params: any): CellStyle => {
//           const remaining = params.data.remainingAmount;
//           if (typeof remaining !== 'number' || isNaN(remaining)) {
//             return {};
//           }
//           if (remaining === 0) {
//             return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' };
//           } else if (remaining > 0 && remaining < 3000) {
//             return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' };
//           } else if (remaining < 0) {
//             return { backgroundColor: '#cce0ff', color: '#00008b', fontWeight: 'bold' };
//           } else if (remaining > 3000) {
//             return { backgroundColor: '#FCB045', color: '#d35400', fontWeight: 'bold' };
//           }
//           return {};
//         }
//       },
//       {
//         field: 'paymentHistory',
//         headerName: 'Payment History',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         valueGetter: (params: any) => params.data.paymentHistory?.length > 0 ? params.data.paymentHistory.map((p: any) => p.amount + ' ' + p.currency).join(', ') : 'No History',
//       },
//       {
//         headerName: 'Metadata',
//         field: 'metadata',
//         cellRenderer: DynamicCellComponent,
//         cellEditor: DynamicCellComponent,
//         cellRendererParams: { type: 'colorpicker', context },
//         cellEditorParams: { type: 'colorpicker', context }
//       },
//       {
//         field: 'metadata',
//         headerName: 'Metadata JSON',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         valueGetter: (params: any) => JSON.stringify(params.data.metadata)
//       },
//       {
//         field: 'createdAt',
//         headerName: 'Created At',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         valueFormatter: (params: any) => new Date(params.value).toLocaleString(),
//         cellRenderer: DynamicCellComponent,
//         cellEditor: DynamicCellComponent,
//         cellRendererParams: { type: 'datepicker', context },
//         cellEditorParams: { type: 'datepicker', context }
//       },
//       {
//         field: 'updatedAt',
//         headerName: 'Updated At',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         valueFormatter: (params: any) => new Date(params.value).toLocaleString(),
//         cellRenderer: DynamicCellComponent,
//         cellEditor: DynamicCellComponent,
//         cellRendererParams: { type: 'datepicker', context },
//         cellEditorParams: { type: 'datepicker', context }
//       },
//       { field: '__v', headerName: 'Version', sortable: true, filter: true, resizable: true },
//       {
//         field: 'cart',
//         headerName: 'Cart Items',
//         sortable: true,
//         filter: true,
//         resizable: true,
//         valueGetter: (params: any) => params.data.cart?.items?.length
//       }
//     ];
//     console.log('Column definitions:', this.column);
//     // Removed cdr.detectChanges() to avoid unnecessary re-renders
//   }

//   getData() {
//     console.time('Data fetch');
//     this.customerService.getAllCustomerData().subscribe((res: any) => {
//       this.data = res.data;
//       console.timeEnd('Data fetch');
//       // Removed cdr.markForCheck() to optimize rendering
//     });
//   }

//   eventFromGrid(event: any) {
//     if (event.eventType === 'onCellValueChanged') {
//       const cellValueChangedEvent = event.event as CellValueChangedEvent;
//       const rowNode = cellValueChangedEvent.node;
//       const dataItem = rowNode.data;
//       const field = cellValueChangedEvent.colDef.field;
//       const newValue = cellValueChangedEvent.newValue;

//       if (field) {
//         dataItem[field] = newValue;
//         this.invoiceService.updateinvoice(dataItem._id, dataItem).subscribe({
//           next: (res: any) => {
//             console.log('Invoice updated:', res);
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

//   handleDataChanged(event: any) {
//     console.log('Data changed:', event);
//   }

//   onGridReady(event: any) {
//     console.log('Grid ready:', event);
//   }
// }

import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { CellStyle, CellValueChangedEvent, ColDef, GridReadyEvent } from 'ag-grid-community';
import { ToolbarComponent } from '../../../../shared/Components/toolbar/toolbar.component';
import { DynamicCellComponent } from '../../../../shared/AgGrid/AgGridcomponents/dynamic-cell/dynamic-cell.component';
import { CustomerService } from '../../../../core/services/customer.service';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { GridContext } from '../../../../interfaces/grid-context.interface';
@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [SharedGridComponent],
  providers: [CustomerService, InvoiceService],
  template: `
    <app-shared-grid
      #grid
      [data]="data"
      [column]="column"
      [rowSelectionMode]="rowSelectionMode"
      [gridHeight]="'600px'"
      (dataChanged)="handleDataChanged($event)"
      (eventFromGrid)="eventFromGrid($event)"
      (gridReady)="onGridReady($event)"
    ></app-shared-grid>
  `,
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  data: any[] = [];
  column: ColDef[] = [];
  rowSelectionMode: string = 'single';
  @ViewChild('grid') grid!: SharedGridComponent;
  private gridContext!: GridContext;

  constructor(
    private cdr: ChangeDetectorRef,
    private invoiceService: InvoiceService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.gridContext = this.getGridContext();
    this.getColumn();
    this.getData();
  }

  private getGridContext(): GridContext {
    return {
      isRowEditing: (id: string) => {
        const isEditing = this.grid?.editingRowId === id;
        return isEditing ?? false;
      },
      startEditingRow: (rowData: any) => this.grid?.startEditingRow(rowData),
      saveRow: (rowData: any) => this.grid?.saveRow(rowData),
      cancelEditingRow: (rowData: any) => this.grid?.cancelEditingRow(rowData),
      deleteRow: (rowData: any) => this.grid?.deleteRow(rowData),
    };
  }

  getColumn(): void {
    this.column = [
      { field: '_id', headerName: 'ID', sortable: true, filter: true, resizable: true, minWidth: 200, flex: 1 },
      {
        field: 'status',
        headerName: 'Status',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 150,
        flex: 1,
        cellRenderer: DynamicCellComponent,
        cellEditor: DynamicCellComponent,
        cellRendererParams: {
          type: 'select',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Pending', value: 'pending' },
            { label: 'Suspended', value: 'suspended' },
            { label: 'Blocked', value: 'blocked' }
          ],
          context: this.gridContext,
        },
        cellEditorParams: {
          type: 'select',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Pending', value: 'pending' },
            { label: 'Suspended', value: 'suspended' },
            { label: 'Blocked', value: 'blocked' }
          ],
          context: this.gridContext,
        },
        cellStyle: (params: any): CellStyle => {
          switch (params.value) {
            case 'active': return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' };
            case 'inactive': return { backgroundColor: '#ffcccc', color: '#8b0000', fontWeight: 'bold' };
            case 'pending': return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' };
            case 'suspended': return { backgroundColor: '#f0f0f0', color: '#808080', fontWeight: 'bold' };
            case 'blocked': return { backgroundColor: '#e0e0e0', color: '#555555', fontWeight: 'bold' };
            default: return {};
          }
        },
      },
      {
        headerName: 'Number',
        field: 'phoneNumbers[0].number',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 150,
        flex: 1,
        cellRenderer: DynamicCellComponent,
        cellEditor: DynamicCellComponent,
        cellRendererParams: { type: 'number', inputConfig: { min: 0, max: 150 }, context: this.gridContext },
        cellEditorParams: { type: 'number', inputConfig: { min: 0, max: 150 }, context: this.gridContext },
      },
      { field: 'profileImg', headerName: 'Profile Image', sortable: true, filter: true, resizable: true, minWidth: 150, flex: 1 },
      {
        field: 'email',
        headerName: 'Email',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 250,
        flex: 2,
        cellRenderer: DynamicCellComponent,
        cellEditor: DynamicCellComponent,
        cellRendererParams: { type: 'text', context: this.gridContext },
        cellEditorParams: { type: 'text', context: this.gridContext },
      },
      {
        field: 'fullname',
        headerName: 'Full Name',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 200,
        flex: 2,
        cellRenderer: DynamicCellComponent,
        cellEditor: DynamicCellComponent,
        cellRendererParams: { type: 'text', context: this.gridContext },
        cellEditorParams: { type: 'text', context: this.gridContext },
      },
      {
        field: 'phoneNumbers[0].number',
        headerName: 'Contact Number',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 150,
        flex: 1,
        valueGetter: (params: any) => params.data.phoneNumbers?.[0]?.number,
        cellRenderer: DynamicCellComponent,
        cellEditor: DynamicCellComponent,
        cellRendererParams: { type: 'text', context: this.gridContext },
        cellEditorParams: { type: 'text', context: this.gridContext },
      },
      {
        field: 'addresses[0].street',
        headerName: 'Street',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 200,
        flex: 1,
        valueGetter: (params: any) => params.data.addresses?.[0]?.street,
        cellRenderer: DynamicCellComponent,
        cellEditor: DynamicCellComponent,
        cellRendererParams: { type: 'text', context: this.gridContext },
        cellEditorParams: { type: 'text', context: this.gridContext },
      },
      {
        field: 'addresses[0].city',
        headerName: 'City',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 150,
        flex: 1,
        valueGetter: (params: any) => params.data.addresses?.[0]?.city,
        cellRenderer: DynamicCellComponent,
        cellEditor: DynamicCellComponent,
        cellRendererParams: { type: 'text', context: this.gridContext },
        cellEditorParams: { type: 'text', context: this.gridContext },
      },
      {
        field: 'addresses[0].state',
        headerName: 'State',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 150,
        flex: 1,
        valueGetter: (params: any) => params.data.addresses?.[0]?.state,
        cellRenderer: DynamicCellComponent,
        cellEditor: DynamicCellComponent,
        cellRendererParams: { type: 'text', context: this.gridContext },
        cellEditorParams: { type: 'text', context: this.gridContext },
      },
      {
        field: 'addresses[0].zipCode',
        headerName: 'Zip Code',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 150,
        flex: 1,
        valueGetter: (params: any) => params.data.addresses?.[0]?.zipCode,
        cellRenderer: DynamicCellComponent,
        cellEditor: DynamicCellComponent,
        cellRendererParams: { type: 'text', context: this.gridContext },
        cellEditorParams: { type: 'text', context: this.gridContext },
      },
      {
        field: 'addresses[0].country',
        headerName: 'Country',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 150,
        flex: 1,
        valueGetter: (params: any) => params.data.addresses?.[0]?.country,
        cellRenderer: DynamicCellComponent,
        cellEditor: DynamicCellComponent,
        cellRendererParams: {
          type: 'select',
          options: [
            { label: 'United States', value: 'USA' },
            { label: 'Canada', value: 'CAN' },
            { label: 'Mexico', value: 'MEX' }
          ],
          context: this.gridContext,
        },
        cellEditorParams: {
          type: 'select',
          options: [
            { label: 'United States', value: 'USA' },
            { label: 'Canada', value: 'CAN' },
            { label: 'Mexico', value: 'MEX' }
          ],
          context: this.gridContext,
        },
      },
      {
        field: 'totalPurchasedAmount',
        headerName: 'Total Purchased Amount',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 200,
        flex: 1,
        cellRenderer: DynamicCellComponent,
        cellEditor: DynamicCellComponent,
        cellRendererParams: { type: 'number', context: this.gridContext },
        cellEditorParams: { type: 'number', context: this.gridContext },
      },
      {
        field: 'remainingAmount',
        headerName: 'Remaining Amount',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 200,
        flex: 1,
        cellRenderer: DynamicCellComponent,
        cellEditor: DynamicCellComponent,
        cellRendererParams: { type: 'number', context: this.gridContext },
        cellEditorParams: { type: 'number', context: this.gridContext },
        cellStyle: (params: any): CellStyle => {
          const remaining = params.data.remainingAmount;
          if (typeof remaining !== 'number' || isNaN(remaining)) {
            return {};
          }
          if (remaining === 0) {
            return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' };
          } else if (remaining > 0 && remaining < 3000) {
            return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' };
          } else if (remaining < 0) {
            return { backgroundColor: '#cce0ff', color: '#00008b', fontWeight: 'bold' };
          } else if (remaining > 3000) {
            return { backgroundColor: '#FCB045', color: '#d35400', fontWeight: 'bold' };
          }
          return {};
        },
      },
      {
        field: 'paymentHistory',
        headerName: 'Payment History',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 200,
        flex: 1,
        valueGetter: (params: any) => params.data.paymentHistory?.length > 0 ? params.data.paymentHistory.map((p: any) => p.amount + ' ' + p.currency).join(', ') : 'No History',
      },
      {
        headerName: 'Metadata',
        field: 'metadata',
        cellRenderer: DynamicCellComponent,
        cellEditor: DynamicCellComponent,
        cellRendererParams: { type: 'colorpicker', context: this.gridContext },
        cellEditorParams: { type: 'colorpicker', context: this.gridContext },
        minWidth: 150,
        flex: 1,
      },
      {
        field: 'metadata',
        headerName: 'Metadata JSON',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 200,
        flex: 1,
        valueGetter: (params: any) => JSON.stringify(params.data.metadata),
      },
      {
        field: 'createdAt',
        headerName: 'Created At',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 200,
        flex: 1,
        valueFormatter: (params: any) => new Date(params.value).toLocaleString(),
        cellRenderer: DynamicCellComponent,
        cellEditor: DynamicCellComponent,
        cellRendererParams: { type: 'datepicker', context: this.gridContext },
        cellEditorParams: { type: 'datepicker', context: this.gridContext },
      },
      {
        field: 'updatedAt',
        headerName: 'Updated At',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 200,
        flex: 1,
        valueFormatter: (params: any) => new Date(params.value).toLocaleString(),
        cellRenderer: DynamicCellComponent,
        cellEditor: DynamicCellComponent,
        cellRendererParams: { type: 'datepicker', context: this.gridContext },
        cellEditorParams: { type: 'datepicker', context: this.gridContext },
      },
      {
        field: '__v',
        headerName: 'Version',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'cart',
        headerName: 'Cart Items',
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 100,
        flex: 1,
        valueGetter: (params: any) => params.data.cart?.items?.length,
      },
    ];
  }

  getData() {
    console.time('Data fetch');
    this.customerService.getAllCustomerData().subscribe((res: any) => {
      this.data = res.data;
      console.timeEnd('Data fetch');
    });
  }

  onGridReady(event: GridReadyEvent) {
    console.log('Grid ready:', event);
  }

  eventFromGrid(event: any) {
    if (event.eventType === 'onCellValueChanged') {
      const cellValueChangedEvent = event.event as CellValueChangedEvent;
      const rowNode = cellValueChangedEvent.node;
      const dataItem = rowNode.data;
      const field = cellValueChangedEvent.colDef.field;
      const newValue = cellValueChangedEvent.newValue;

      if (field) {
        dataItem[field] = newValue;
        this.invoiceService.updateinvoice(dataItem._id, dataItem).subscribe({
          next: (res: any) => {
            console.log('Invoice updated:', res);
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

  handleDataChanged(event: any) {
    console.log('Data changed:', event);
  }
}