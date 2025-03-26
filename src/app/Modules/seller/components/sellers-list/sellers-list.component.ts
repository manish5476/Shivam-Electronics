// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-sellers-list',
//   imports: [],
//   templateUrl: './sellers-list.component.html',
//   styleUrl: './sellers-list.component.css'
// })
// export class SellersListComponent {

// }
import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
// import { ToolbarComponent } from "../../../../shared/Components/toolbar/toolbar.component";
import { CellValueChangedEvent } from 'ag-grid-community';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sellers-lists',
  imports: [SharedGridComponent, CommonModule],
  templateUrl: './sellers-list.component.html',
  styleUrl: './sellers-list.component.css'
})
export class SellersListsComponent {
  data: any;
  column: any
  rowSelectionMode: any
  constructor(private cdr: ChangeDetectorRef, private apiService: ApiService) { }

  ngOnInit(): void {
    this.getColumn()
    this.getData()
    this.rowSelectionMode = 'singleRow'
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

        // Call API to update seller
        this.apiService.updateSellersdata(dataItem.id, dataItem).subscribe({
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
        { field: 'shopname', header: 'Shop Name', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'status', header: 'Status', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'address', header: 'Address', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'gstin', header: 'GSTIN', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'pan', header: 'PAN', sortable: true, filter: true, resizable: true, editable: true },
        { field: 'contactNumber', header: 'Contact Number', sortable: true, filter: true, resizable: true, editable: true }
      ];
  }

  getData() {
    this.apiService.getAllSellersdata().subscribe((res: any) => {
      this.data = res.data;
      this.cdr.markForCheck()
    })
  }
}