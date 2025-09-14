import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SellerService } from '../../../../core/services/seller.service';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { CellValueChangedEvent, GridApi, GridReadyEvent } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from "primeng/button";
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-sellers-details',
  standalone: true, // 🔹 Set to standalone
  imports: [
    SharedGridComponent,
    CommonModule,
    FormsModule,
    Button,
    SelectModule,
    InputTextModule
  ], // 🔹 Add necessary imports
  providers: [SellerService], // 🔹 Provide the service
  templateUrl: './sellers-details.component.html',
  styleUrl: './sellers-details.component.css'
})
export class SellersDetailsComponent implements OnInit { // 🔹 Implement OnInit
  // 🔹--- Pagination & Grid State ---
  private gridApi!: GridApi;
  private currentPage = 1;
  private isLoading = false;
  private totalCount = 0;
  private pageSize = 20;
  data: any[] = []; // 🔹 Initialize as empty array
  column: any[] = [];
  rowSelectionMode: any = 'singleRow';
  rowClassrules: any;

  // 🔹--- Filter State ---
  sellerFilter = {
    name: '',
    shopName: '',
    status: null,
    city: ''
  };
  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Blocked', value: 'blocked' }
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private SellerService: SellerService
  ) { }

  ngOnInit(): void {
    this.getColumn();
    this.getData(true);
    this.rowClassrules = this.getRowClassRules();
  }

  // 🔹 Resets data and fetches from page 1, used by filter controls
  applyFiltersAndReset() {
    this.currentPage = 1;
    this.data = [];
    this.gridApi?.setGridOption('rowData', []);
    this.getData(true);
  }

  resetFilters() {
    this.sellerFilter = { name: '', shopName: '', status: null, city: '' };
    this.applyFiltersAndReset();
  }

  getData(isReset: boolean = false) {
    if (this.isLoading) return;
    this.isLoading = true;

    if (isReset) {
      this.currentPage = 1;
      this.data = [];
    }

    const filterParams: any = {
      page: this.currentPage,
      limit: this.pageSize,
    };

    // Add filters to params if they have a value
    if (this.sellerFilter.name) filterParams.name = this.sellerFilter.name;
    if (this.sellerFilter.shopName) filterParams.shopName = this.sellerFilter.shopName;
    if (this.sellerFilter.status) filterParams.status = this.sellerFilter.status;
    if (this.sellerFilter.city) filterParams['address.city'] = this.sellerFilter.city; // For nested fields

    this.SellerService.getAllSellersdata(filterParams).subscribe({
      next: (res: any) => {
        const newData = res.data || [];
        this.totalCount = res.totalCount || 0;

        if (this.gridApi) {
          this.gridApi.applyTransaction({ add: newData });
        } else {
          this.data = newData; // For initial load if grid isn't ready
        }

        this.currentPage++;
        this.isLoading = false;
        this.getColumn()
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('❌ Error fetching sellers:', err);
      }
    });
  }

  // 🔹 Captures grid API instance when grid is ready
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  // 🔹 Fetches next page when user scrolls to the bottom
  onScrolledToBottom(_: any) {
    const rowCount = this.gridApi?.getDisplayedRowCount() ?? this.data.length;
    if (!this.isLoading && rowCount < this.totalCount) {
      this.getData(false);
    }
  }

  // eventFromGrid logic is unchanged and correct for handling nested objects
  eventFromGrid(event: any) {
    if (event.eventType === 'onCellValueChanged') {
      const cellValueChangedEvent = event.event as CellValueChangedEvent;
      const dataItem = cellValueChangedEvent.node.data;
      const field = cellValueChangedEvent.colDef.field;
      if (field) {
        if (field.startsWith('address.')) {
          const addressField = field.substring(8);
          dataItem.address[addressField] = cellValueChangedEvent.newValue;
        } else if (field.startsWith('bankDetails.')) {
          const bankDetailsField = field.substring(12);
          dataItem.bankDetails[bankDetailsField] = cellValueChangedEvent.newValue;
        } else {
          dataItem[field] = cellValueChangedEvent.newValue;
        }
        this.SellerService.updateSeller(dataItem.id, dataItem).subscribe({
          error: (err: any) => console.error('❌ Error updating seller:', err)
        });
      }
    }
  }

  getColumn() {
    this.column = [
      { field: 'name', headerName: 'Name', sortable: true, filter: true, resizable: true, editable: true },
      { field: 'shopName', headerName: 'Shop Name', sortable: true, filter: true, resizable: true, editable: true },
      {
        field: 'status', headerName: 'Status', sortable: true, filter: true, resizable: true, editable: true, cellEditor: 'agSelectCellEditor', cellEditorParams: {
          values: ['active', 'inactive', 'pending', 'suspended', 'blocked']
        }
      },
      { field: 'address.city', headerName: 'City', sortable: true, filter: true, resizable: true, editable: true },
      { field: 'address.state', headerName: 'State', sortable: true, filter: true, resizable: true, editable: true },
      { field: 'gstin', headerName: 'GSTIN', sortable: true, filter: true, resizable: true, editable: true },
      { field: 'contactNumber', headerName: 'Contact Number', sortable: true, filter: true, resizable: true, editable: true },
      { field: 'bankDetails.accountNumber', headerName: 'Account Number', sortable: true, filter: true, resizable: true, editable: true },
      { field: 'bankDetails.bankName', headerName: 'Bank Name', sortable: true, filter: true, resizable: true, editable: true },
    ];
  }

  getRowClassRules() {
    return {
      'light-red': (params: any) => params.data.status === 'inactive',
      'light-green': (params: any) => params.data.status === 'active',
      'light-orange': (params: any) => params.data.status === 'suspended' || params.data.status === 'blocked',
      'light-yellow': (params: any) => params.data.status === 'pending',
    };
  }
}
// import { ChangeDetectorRef, Component } from '@angular/core';
// import { SellerService } from '../../../../core/services/seller.service';
// import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
// import { CellValueChangedEvent } from 'ag-grid-community';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-sellers-details',
//   imports: [SharedGridComponent, CommonModule],
//   templateUrl: './sellers-details.component.html',
//   styleUrl: './sellers-details.component.css'
// })
// export class SellersDetailsComponent {
//   data: any;
//   column: any
//   rowSelectionMode: any = 'singleRow';
//   rowClassrules: any;

//   constructor(private cdr: ChangeDetectorRef, private SellerService: SellerService) { }

//   ngOnInit(): void {
//     this.getColumn()
//     this.getData()
//     this.rowClassrules = this.getRowClassRules();
//   }

//   eventFromGrid(event: any) {
//     if (event.eventType === 'onCellValueChanged') {
//       const cellValueChangedEvent = event.event as CellValueChangedEvent;
//       const rowNode = cellValueChangedEvent.node;
//       const dataItem = rowNode.data;
//       const field = cellValueChangedEvent.colDef.field;
//       const newValue = cellValueChangedEvent.newValue;
//       if (field) {
//         if (field.startsWith('address.')) {
//           const addressField = field.substring(8);
//           dataItem.address[addressField] = newValue;
//         } else if (field.startsWith('bankDetails.')) {
//           const bankDetailsField = field.substring(12);
//           dataItem.bankDetails[bankDetailsField] = newValue;
//         }
//         else {
//           dataItem[field] = newValue;
//         }
//         this.SellerService.updateSeller(dataItem.id, dataItem).subscribe({
//           next: (res: any) => {
//           },
//           error: (err: any) => {
//             console.error('❌ Error updating seller:', err);
//           }
//         });
//       } else {
//         console.error('❌ Error: Field is undefined in cellValueChangedEvent.colDef');
//       }
//     }
//   }

//   getColumn() {
//     this.column =
//       [
//         { field: 'name', header: 'Name', sortable: true, filter: true, resizable: true, editable: true },
//         { field: 'shopName', header: 'Shop Name', sortable: true, filter: true, resizable: true, editable: true },
//         {
//           field: 'status', header: 'Status', sortable: true, filter: true, resizable: true, editable: true, cellEditor: 'agSelectCellEditor', cellEditorParams: {
//             values: ['active', 'inactive', 'pending', 'suspended', 'blocked']
//           }
//         },
//         { field: 'address.street', header: 'Street', sortable: true, filter: true, resizable: true, editable: true },
//         { field: 'address.city', header: 'City', sortable: true, filter: true, resizable: true, editable: true },
//         { field: 'address.state', header: 'State', sortable: true, filter: true, resizable: true, editable: true },
//         { field: 'address.pincode', header: 'Pincode', sortable: true, filter: true, resizable: true, editable: true },
//         { field: 'gstin', header: 'GSTIN', sortable: true, filter: true, resizable: true, editable: true },
//         { field: 'pan', header: 'PAN', sortable: true, filter: true, resizable: true, editable: true },
//         { field: 'contactNumber', header: 'Contact Number', sortable: true, filter: true, resizable: true, editable: true },
//         { field: 'bankDetails.accountHolderName', header: 'Account Holder Name', sortable: true, filter: true, resizable: true, editable: true },
//         { field: 'bankDetails.accountNumber', header: 'Account Number', sortable: true, filter: true, resizable: true, editable: true },
//         { field: 'bankDetails.ifscCode', header: 'IFSC Code', sortable: true, filter: true, resizable: true, editable: true },
//         { field: 'bankDetails.bankName', header: 'Bank Name', sortable: true, filter: true, resizable: true, editable: true },
//         { field: 'bankDetails.branch', header: 'Branch', sortable: true, filter: true, resizable: true, editable: true }
//       ];
//   }

//   getData() {
//     this.SellerService.getAllSellersdata().subscribe((res: any) => {
//       this.data = res.data;
//       this.cdr.markForCheck()
//     })
//   }

//   getRowClassRules() {
//     return {
//       'light-red': (params: any) => params.data.status === 'inactive',
//       'light-green': (params: any) => params.data.status === 'active',
//       'light-orange': (params: any) => params.data.status === 'suspended' || params.data.status === 'blocked',
//       'light-yellow': (params: any) => params.data.status === 'pending',
//       'red-row': (params: any) => params.data.name === 'Test Seller' // Example for red-row class, adjust condition as needed
//     };
//   }
// }