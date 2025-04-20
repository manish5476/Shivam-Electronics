// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-dynamic-cell',
//   imports: [],
//   templateUrl: './dynamic-cell.component.html',
//   styleUrl: './dynamic-cell.component.css'
// })
// export class DynamicCellComponent {

// }




import { Component, Input } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { ICellRendererParams } from "ag-grid-community";
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
@Component({
  selector: 'app-dynamic-cell',
  imports: [InputNumberModule, CommonModule, FormsModule, SelectModule, InputTextModule],
  templateUrl: './dynamic-cell.component.html',
  styleUrl: './dynamic-cell.component.css'
})
export class DynamicCellComponent implements ICellRendererAngularComp {
  refresh(params: ICellRendererParams<any, any, any>): boolean {
    throw new Error("Method not implemented.");
  }
  @Input() params: any;
  @Input() type: string | undefined;  // The column type (text, number, date)
  @Input() data: any;     // The row data
  @Input() key: string | undefined;   
  value: any;

  agInit(params: any): void {
    this.params = params;
    this.value = params.value;
    this.type = params.colDef.cellRendererParams?.type || 'text';
    console.log(this.params, this.value, this.type);
  }

  isEditing(): boolean {
    return this.params.context?.componentParent?.isRowEditing(this.params.node);
  }

  onValueChange(newValue: any) {
    this.value = newValue;
    this.params.data[this.params.colDef.field] = newValue;
  }
}
