import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { CellValueChangedEvent } from 'ag-grid-community';
import { ProductService } from '../../../../core/services/product.service';
import { Dialog } from 'primeng/dialog';
import { ProductMasterComponent } from '../product-master/product-master.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Button } from "primeng/button";

@Component({
    selector: 'app-product-detail',
    imports: [SharedGridComponent, SelectModule, CommonModule, FormsModule, ProductMasterComponent, Dialog, Button],
    templateUrl: './product-detail.component.html',
    styleUrl: './product-detail.component.css'
})
export  class ProductDetailComponent {
  data: any;
  column: any
  rowSelectionMode: any
  productDialog: boolean = false
  redirectedProduct: any;

  // New property to hold the filter values
  productFilter = {
    title: '',
    category: null,
    brand: null
  };

  // Mock options for the dropdowns
  categoryOptions = [
    { name: 'Electronics', value: 'electronics' },
    { name: 'Apparel', value: 'apparel' },
    { name: 'Home Goods', value: 'home-goods' }
  ];
  brandOptions = [
    { name: 'Brand A', value: 'brand-a' },
    { name: 'Brand B', value: 'brand-b' },
    { name: 'Brand C', value: 'brand-c' }
  ];

  constructor(private cdr: ChangeDetectorRef, private ProductService: ProductService) { }

  ngOnInit(): void {
    this.getColumn()
    this.getData()
    this.rowSelectionMode = 'singleRow'
  }

  eventFromGrid(event: any) {
    console.log(event);
    if (event.eventType === 'onCellValueChanged') {
      const cellValueChangedEvent = event.event as CellValueChangedEvent;
      const rowNode = cellValueChangedEvent.node;
      const dataItem = rowNode.data;
      const field = cellValueChangedEvent.colDef.field;
      const newValue = cellValueChangedEvent.newValue;
      if (field) {
        dataItem[field] = newValue;
        this.ProductService.updateProduct(dataItem.id, dataItem).subscribe({
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

  editProduct(product: any) {
    this.redirectedProduct = { ...product };
    this.productDialog = true;
  }

  // Updated getData method to include filter parameters
  getData() {
    const filterParams = {
      title: this.productFilter.title,
      category: this.productFilter.category,
      brand: this.productFilter.brand,
      // Add other filter fields here as needed
    };

    this.ProductService.getAllProductData(filterParams).subscribe({
      next: (res: any) => {
        this.data = res.data;
        console.log(this.data);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('❌ Error fetching filtered products:', err);
      }
    });
  }

  // New method to clear the filters
  resetFilters() {
    this.productFilter = {
      title: '',
      category: null,
      brand: null
    };
    this.getData();
  }
}

//  class ProductDetailComponent {
//     data: any;
//     column: any
//     rowSelectionMode: any
//     productDialog: boolean = false
//     redirectedProduct: any;

//     constructor(private cdr: ChangeDetectorRef, private ProductService: ProductService) { }

//     ngOnInit(): void {
//         this.getColumn()
//         this.getData()
//         this.rowSelectionMode = 'singleRow'
//     }

//     eventFromGrid(event: any) {
//         console.log(event);
//         if (event.eventType === 'onCellValueChanged') {
//             const cellValueChangedEvent = event.event as CellValueChangedEvent;
//             const rowNode = cellValueChangedEvent.node;
//             const dataItem = rowNode.data;
//             const field = cellValueChangedEvent.colDef.field;
//             const newValue = cellValueChangedEvent.newValue;
//             if (field) {
//                 dataItem[field] = newValue;
//                 this.ProductService.updateProduct(dataItem.id, dataItem).subscribe({
//                     next: (res: any) => {
//                     },
//                     error: (err: any) => {
//                         console.error('❌ Error updating product:', err);
//                     }
//                 });
//             } else {
//                 console.error('❌ Error: Field is undefined in cellValueChangedEvent.colDef');
//             }
//         }
//     }


//     getColumn() {
//         this.column =
//             [
//                 { field: 'title', sortable: true, filter: true, resizable: true, editable: true },
//                 { field: 'description', sortable: true, filter: true, resizable: true, editable: true },
//                 { field: 'rate', sortable: true, filter: true, resizable: true, editable: true },
//                 { field: 'price', sortable: true, filter: true, resizable: true, editable: true },
//                 { field: 'stock', sortable: true, filter: true, resizable: true, editable: true },
//                 { field: 'category', sortable: true, filter: true, resizable: true, editable: true },
//                 { field: 'brand', sortable: true, filter: true, resizable: true, editable: true },
//                 { field: 'sku', sortable: true, filter: true, resizable: true, editable: true },
//                 { field: 'weight', sortable: true, filter: true, resizable: true, editable: true },
//                 { field: 'warrantyInformation', sortable: true, filter: true, resizable: true, editable: true },
//                 { field: 'shippingInformation', sortable: true, filter: true, resizable: true, editable: true },
//                 { field: 'availabilityStatus', sortable: true, filter: true, resizable: true, editable: true },
//                 { field: 'returnPolicy', sortable: true, filter: true, resizable: true, editable: true },
//                 { field: 'minimumOrderQuantity', sortable: true, filter: true, resizable: true, editable: true },
//                 { field: 'finalPrice', sortable: true, filter: true, resizable: true, editable: true }

//             ];
//     }

//     editProduct(product: any) {
//         this.redirectedProduct = { ...product };
//         this.productDialog = true;
//     }

//     getData() {
//         this.ProductService.getAllProductData().subscribe((res: any) => {
//             this.data = res.data;
//             this.cdr.markForCheck()
//         })
//     }
// }