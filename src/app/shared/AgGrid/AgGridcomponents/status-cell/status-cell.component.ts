
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

export interface StatusColumnConfig extends ICellRendererParams {
  field: string | undefined;
  severityMap: (value: any) => 'success' | 'warning' | 'danger' | 'info' | 'secondary';
}

@Component({
  selector: 'app-status-cell',
  standalone: true,
  imports: [CommonModule, TagModule],
  template: `
    <p-tag *ngIf="params.value" [value]="params.value" ></p-tag>
  `,
})
export class StatusCellComponent implements ICellRendererAngularComp {
  public params!: any;
  public severity: 'success' | 'warning' | 'danger' | 'info' | 'secondary' = 'info';

  agInit(params: any): void {
    this.params = params;
    if (this.params.value) {
      this.severity = this.params.severityMap(this.params.value);
    }
    this.severity='info'
  }

  refresh(params: any): boolean {
    this.params = params;
    if (this.params.value) {
      this.severity = this.params.severityMap(this.params.value);
    }
    return true;
  }
}
