import { ChangeDetectorRef, Component } from '@angular/core';
import { SellerService } from '../../../../core/services/seller.service';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { CellValueChangedEvent } from 'ag-grid-community';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sellers-details',
  imports: [SharedGridComponent, CommonModule],
  templateUrl: './sellers-details.component.html',
  styleUrl: './sellers-details.component.css'
})
export class SellersDetailsComponent {
  data: any;
  column: any
  rowSelectionMode: any = 'singleRow';
  rowClassrules: any;

  constructor(private cdr: ChangeDetectorRef, private SellerService: SellerService) { }

  ngOnInit(): void {
    this.getColumn()
    this.getData()
    this.rowClassrules = this.getRowClassRules();
  }

  eventFromGrid(event: any) {
    if (event.eventType === 'onCellValueChanged') {
      const cellValueChangedEvent = event.event as CellValueChangedEvent;
      const rowNode = cellValueChangedEvent.node;
      const dataItem = rowNode.data;
      const field = cellValueChangedEvent.colDef.field;
      const newValue = cellValueChangedEvent.newValue;
      if (field) {
        if (field.startsWith('address.')) {
          const addressField = field.substring(8);
          dataItem.address[addressField] = newValue;
        } else if (field.startsWith('bankDetails.')) {
          const bankDetailsField = field.substring(12);
          dataItem.bankDetails[bankDetailsField] = newValue;
        }
        else {
          dataItem[field] = newValue;
        }
        this.SellerService.updateSellersdata(dataItem.id, dataItem).subscribe({
          next: (res: any) => {
          },
          error: (err: any) => {
            console.error('❌ Error updating seller:', err);
          }
        });
      } else {
        console.error('❌ Error: Field is undefined in cellValueChangedEvent.colDef');
      }
    }
  }

  getColumn() {
    this.column =
      [
        { field: 'name', header: 'Name', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'shopName', header: 'Shop Name', sortable: true, filter: true, resizable: true, editable: true },
        {
          field: 'status', header: 'Status', sortable: true, filter: true, resizable: true, editable: true, cellEditor: 'agSelectCellEditor',
          cellEditorParams: {
            values: ['active', 'inactive', 'pending', 'suspended', 'blocked']
          }
        },
        { field: 'address.street', header: 'Street', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'address.city', header: 'City', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'address.state', header: 'State', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'address.pincode', header: 'Pincode', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'gstin', header: 'GSTIN', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'pan', header: 'PAN', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'contactNumber', header: 'Contact Number', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'bankDetails.accountHolderName', header: 'Account Holder Name', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'bankDetails.accountNumber', header: 'Account Number', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'bankDetails.ifscCode', header: 'IFSC Code', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'bankDetails.bankName', header: 'Bank Name', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'bankDetails.branch', header: 'Branch', sortable: true, filter: true, resizable: true, editable: true }
      ];
  }

  getData() {
    this.SellerService.getAllSellersdata().subscribe((res: any) => {
      this.data = res.data;
      this.cdr.markForCheck()
    })
  }

  getRowClassRules() {
    return {
      'light-red': (params: any) => params.data.status === 'inactive',
      'light-green': (params: any) => params.data.status === 'active',
      'light-orange': (params: any) => params.data.status === 'suspended' || params.data.status === 'blocked',
      'light-yellow': (params: any) => params.data.status === 'pending',
      'red-row': (params: any) => params.data.name === 'Test Seller' // Example for red-row class, adjust condition as needed
    };
  }
}