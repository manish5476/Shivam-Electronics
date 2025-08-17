import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { CheckboxModule } from 'primeng/checkbox';
// Import any other PrimeNG modules you use, like InputTextModule, DropdownModule, etc.
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
export type DynamicAgGridColumn = ICellRendererParams & {
  typeOfCol: 'text' | 'dropdown' | 'checkbox' | 'dialog' | 'icon';
  field?: string;
  isEditable?: boolean | ((rowData: any) => boolean); // Allow function for conditional logic
  options?: any[];
  icon?: string;
  tooltip?: string;
  // This is the key: the handler function passed from the parent.
  handleAction?: (event: any) => void;
  eventName?: string;
  [key: string]: any;
};

@Component({
  selector: 'app-dynamic-ag-grid-columns',
  standalone: true, // Making it a standalone component is easier for imports
  imports: [FormsModule, CommonModule,ButtonModule,SelectModule, CheckboxModule /*, ...other PrimeNG modules */],
  templateUrl: './dynamic-ag-grid-columns.component.html',
  styleUrls: ['./dynamic-ag-grid-columns.component.css']
})
export class DynamicAgGridColumnsComponent implements ICellRendererAngularComp {
  
  params!: DynamicAgGridColumn;
  cellValue: any;

  agInit(params: DynamicAgGridColumn): void {
    this.params = params;
    this.cellValue = this.getValueFromRow();
  }

  refresh(params: DynamicAgGridColumn): boolean {
    this.params = params;
    this.cellValue = this.getValueFromRow();
    return true;
  }

  private getValueFromRow(): any {
    return this.params.field && this.params.data ? this.params.data[this.params.field] : null;
  }

  // This is the function that will be called by your template (e.g., on change or click)
  onAction(actionType: string, payload?: any): void {
    // 1. UPDATE THE GRID'S DATA MODEL
    // This is the critical step to make sure the change is saved in the grid
    if (this.params.field && this.params.data && payload !== undefined) {
      this.params.data[this.params.field] = payload;
      this.cellValue = payload;
    }

    // 2. CALL THE PARENT'S HANDLER FUNCTION
    // Check if the handleAction function was passed in the params
    if (this.params.handleAction) {
      this.params.handleAction({
        action: actionType,
        eventName: this.params.eventName, // Pass the eventName if it exists
        rowData: this.params.data,
        value: payload ?? this.cellValue
      });
    }
  }

  // Helper to evaluate if the cell should be in an editable state
  isEditable(): boolean {
      if (typeof this.params.isEditable === 'function') {
          return this.params.isEditable(this.params.data);
      }
      // For icons/buttons, we consider them "editable" to make them visible and clickable
      if (this.params.typeOfCol === 'dialog' || this.params.typeOfCol === 'icon') {
          return true;
      }
      return !!this.params.isEditable;
  }
}

// import { CommonModule } from '@angular/common';
// import { Component, EventEmitter, Output } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { ICellRendererAngularComp } from 'ag-grid-angular';
// import { ICellRendererParams } from 'ag-grid-community';
// import { CheckboxModule } from 'primeng/checkbox';

// export type DynamicAgGridColumn = ICellRendererParams & {
//   typeOfCol: string;         // "text" | "dropdown" | "checkbox" | "dialog"
//   field?: string;            // key for row data binding
//   columnHeaderName?: string; // display name
//   options?: any[];           // for dropdown/radio
//   isEditable?: boolean;      // whether editable or not
//   icon?: string;             // for dialog/button
//   tooltip?: string;          // tooltip text
//   eventName?: string;        // event identifier
//   dialogEvent?: (row: any) => void; // callback fn
//   [key: string]: any;        // future-proof catch all
// };

// @Component({
//   selector: 'app-dynamic-ag-grid-columns',
//   imports:[FormsModule,CommonModule,CheckboxModule],
//   templateUrl: './dynamic-ag-grid-columns.component.html',
//   styleUrls: ['./dynamic-ag-grid-columns.component.css']
// })
// export class DynamicAgGridColumnsComponent implements ICellRendererAngularComp {
  
//   @Output() eventFromAgGrid = new EventEmitter<any>();

//   params!: DynamicAgGridColumn;  // store incoming params
//   cellValue: any;                // for local cell data

//   // Called once when cell is created
//   agInit(params: DynamicAgGridColumn): void {
//     this.params = params;
//     this.cellValue = this.getValueFromRow();
//   }

//   // Refresh on data change
//   refresh(params: DynamicAgGridColumn): boolean {
//     this.params = params;
//     this.cellValue = this.getValueFromRow();
//     return true;
//   }

//   // Helper → safely fetch value from row data
//   private getValueFromRow(): any {
//     if (this.params.field && this.params.data) {
//       return this.params.data[this.params.field];
//     }
//     return null;
//   }

//   // Emit event when something happens
//   handleAction(action: string, payload?: any) {
//     this.eventFromAgGrid.emit({
//       event: action,
//       column: this.params.field,
//       rowData: this.params.data,
//       value: payload ?? this.cellValue
//     });
//   }
// }