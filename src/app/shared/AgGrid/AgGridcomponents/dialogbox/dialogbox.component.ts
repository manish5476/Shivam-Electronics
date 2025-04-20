// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-dialogbox',
//   imports: [],
//   templateUrl: './dialogbox.component.html',
//   styleUrl: './dialogbox.component.css'
// })
// export class DialogboxComponent {

// }

import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ApiService } from '../../../../core/services/api.service';

interface CustomCellRendererParams extends ICellRendererParams {
  id?: string;
  dynamicComponent?: any; // Add dynamicComponent to CustomCellRendererParams
}

@Component({
  selector: 'app-dialogbox',
  templateUrl: './dialogbox.component.html',
  styleUrls: ['./dialogbox.component.css'],
  imports: [Dialog, CommonModule, FormsModule],
})
export class DialogboxComponent implements ICellRendererAngularComp {

  @Input() id!: string;
  @Input() dynamicComponent: any; // Input to receive the dynamic component
  value: any;
  display: boolean = false;
  invoiceDetailData: any;
  params: any;
  constructor(private cdr: ChangeDetectorRef, private apiService: ApiService) { }
  agInit(params: CustomCellRendererParams): void {
    this.params = params

    console.log(this.params,this.id);
  }

  refresh(params: CustomCellRendererParams): boolean {
    return false;
  }

  openDialog(): void {
    this.display = true;
    this.value = this.params.value;
    this.id = this.params.id || '';
    this.dynamicComponent = this.params.dynamicComponent || null;
    // if (this.id) {
    //   this.apiService.getinvoiceDataWithId(this.id).subscribe((res: any) => {
    //     this.invoiceDetailData = res.data;
    //     this.cdr.detectChanges();
    //   });
    // }
    this.cdr.detectChanges();
  }
}