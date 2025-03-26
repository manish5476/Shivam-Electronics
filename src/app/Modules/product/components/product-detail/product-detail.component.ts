// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-product-detail',
//   imports: [],
//   templateUrl: './product-detail.component.html',
//   styleUrl: './product-detail.component.css'
// })
// export class ProductDetailComponent {

// }
import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
// import { ToolbarComponent } from "../../../../shared/Components/toolbar/toolbar.component";
import { ApiService } from '../../../../core/services/api.service';
import { CellValueChangedEvent } from 'ag-grid-community';
@Component({
    selector: 'app-product-detail',
    imports: [SharedGridComponent],
    templateUrl: './product-detail.component.html',
    styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent {
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
        if (event.eventType === 'onCellValueCHanged') {
            const cellValueChangedEvent = event.event as CellValueChangedEvent;
            const rowNode = cellValueChangedEvent.node;
            const dataItem = rowNode.data;
            const field = cellValueChangedEvent.colDef.field;
            const newValue = cellValueChangedEvent.newValue;

            if (field) {
                dataItem[field] = newValue;


                // Call API to update product
                this.apiService.updateProduct(dataItem.id, dataItem).subscribe({
                    next: (res: any) => {
                    },
                    error: (err: any) => {
                        console.error('❌ Error updating product:', err);
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
                { field: 'title', sortable: true, filter: true, resizable: true, editable: true },
                { field: 'description', sortable: true, filter: true, resizable: true, editable: true },
                { field: 'rate', sortable: true, filter: true, resizable: true, editable: true },
                { field: 'price', sortable: true, filter: true, resizable: true, editable: true },
                { field: 'stock', sortable: true, filter: true, resizable: true, editable: true },
                { field: 'category', sortable: true, filter: true, resizable: true, editable: true },
                { field: 'brand', sortable: true, filter: true, resizable: true, editable: true },
                { field: 'sku', sortable: true, filter: true, resizable: true, editable: true },
                { field: 'weight', sortable: true, filter: true, resizable: true, editable: true },
                { field: 'warrantyInformation', sortable: true, filter: true, resizable: true, editable: true },
                { field: 'shippingInformation', sortable: true, filter: true, resizable: true, editable: true },
                { field: 'availabilityStatus', sortable: true, filter: true, resizable: true, editable: true },
                { field: 'returnPolicy', sortable: true, filter: true, resizable: true, editable: true },
                { field: 'minimumOrderQuantity', sortable: true, filter: true, resizable: true, editable: true },
                { field: 'finalPrice', sortable: true, filter: true, resizable: true, editable: true }

            ];
    }

    getData() {
        this.apiService.getAllProductData().subscribe((res: any) => {
            this.data = res.data;
            this.cdr.markForCheck()
        })
    }
}