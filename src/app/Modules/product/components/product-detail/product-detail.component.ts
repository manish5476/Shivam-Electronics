import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { CellValueChangedEvent, GridApi, GridReadyEvent } from 'ag-grid-community';
import { ProductService } from '../../../../core/services/product.service';
import { Dialog } from 'primeng/dialog';
import { ProductMasterComponent } from '../product-master/product-master.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Button } from "primeng/button";
import { ImageCellRendererComponent } from '../../../../shared/AgGrid/AgGridcomponents/image-cell-renderer/image-cell-renderer.component';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { Badge } from "primeng/badge";

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [SharedGridComponent, SelectModule, CommonModule, FormsModule, ProductMasterComponent, Dialog, Button],
  providers: [ProductService, AutopopulateService],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  private gridApi!: GridApi;
  private currentPage = 1;
  private isLoading = false;
  private totalCount = 0;
  private pageSize = 20;
  data: any
  column: any[] = [];
  rowSelectionMode: any = 'single';

  productDialog: boolean = false;
  redirectedProduct: any;

  productFilter = {
    title: '',
    category: null,
    brand: null,
    minPrice: null,
    maxPrice: null,
    minRate: null,
    maxRate: null,
    sku: null,
  };
  categoryOptions: any[] = [];
  brandOptions: any[] = [];
  skuOptions: any[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private ProductService: ProductService,
    private autoPopulate: AutopopulateService
  ) { }

  ngOnInit(): void {
    this.getColumn();
    this.autopopulateFilters();
    this.getData(true);
  }

  // 🔹 UPDATED to correctly parse your API response
  autopopulateFilters() {
    this.autoPopulate.getModuleData('products').subscribe({
      next: (response: any) => {
        const products = response.data;
        if (!products) return;

        const allCategories = products.flatMap((product: any) =>
          product.category ? product.category.split(',').map((cat: string) => cat.trim()) : []
        );
        const uniqueCategories = [...new Set(allCategories)].filter(Boolean);
        this.categoryOptions = uniqueCategories.map(cat => ({ label: cat, value: cat }));

        const uniqueBrands = [...new Set(products.map((p: any) => p.brand).filter(Boolean))];
        this.brandOptions = uniqueBrands.map(brand => ({ label: brand, value: brand }));

        const uniqueSkus = [...new Set(products.map((p: any) => p.sku).filter(Boolean))];
        this.skuOptions = uniqueSkus.map(sku => ({ label: sku, value: sku }));

        this.cdr.markForCheck();
      },
      error: (err) => console.error("Error fetching data for filters:", err)
    });
  }

  applyFiltersAndReset() {
    this.currentPage = 1;
    this.data = [];
    this.gridApi?.setGridOption('rowData', []);
    this.getData(true);
  }

  resetFilters() {
    this.productFilter = {
      title: '', category: null, brand: null, minPrice: null,
      maxPrice: null, minRate: null, maxRate: null, sku: null,
    };
    this.applyFiltersAndReset();
  }

  // 🔹 UPDATED to format filters for a Node.js/MongoDB backend
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

    if (this.productFilter.title) filterParams.title = this.productFilter.title;
    if (this.productFilter.category) filterParams.category = this.productFilter.category;
    if (this.productFilter.brand) filterParams.brand = this.productFilter.brand;
    if (this.productFilter.sku) filterParams.sku = this.productFilter.sku;

    const priceFilter: any = {};
    if (this.productFilter.minPrice) priceFilter.$gte = this.productFilter.minPrice;
    if (this.productFilter.maxPrice) priceFilter.$lte = this.productFilter.maxPrice;
    if (Object.keys(priceFilter).length > 0) filterParams.price = priceFilter;

    const rateFilter: any = {};
    if (this.productFilter.minRate) rateFilter.$gte = this.productFilter.minRate;
    if (this.productFilter.maxRate) rateFilter.$lte = this.productFilter.maxRate;
    if (Object.keys(rateFilter).length > 0) filterParams.rate = rateFilter;

    this.ProductService.getAllProductData(filterParams).subscribe({
      next: (res: any) => {
        const newData = res.data || [];
        this.totalCount = res.totalCount || 0;

        if (this.gridApi) {
          this.gridApi.applyTransaction({ add: newData });
        } else {
          this.data = newData;
        }

        this.currentPage++;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('❌ Error fetching products:', err);
      }
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onScrolledToBottom(_: any) {
    const rowCount = this.gridApi?.getDisplayedRowCount() ?? this.data.length;
    if (!this.isLoading && rowCount < this.totalCount) {
      this.getData(false);
    }
  }

  eventFromGrid(event: any) {
    if (event.eventType === 'onCellValueChanged') {
      const cellValueChangedEvent = event.event as CellValueChangedEvent;
      const dataItem = cellValueChangedEvent.node.data;
      const field = cellValueChangedEvent.colDef.field;
      if (field) {
        this.ProductService.updateProduct(dataItem.id, dataItem).subscribe({
          error: (err: any) => console.error('❌ Error updating product:', err)
        });
      }
    }
  }

  getColumn() {
    this.column = [
      { field: 'title', sortable: true, filter: true, resizable: true, editable: true },
      { field: 'description', sortable: true, filter: true, resizable: true, editable: true },
      { headerName: 'Photo', field: 'thumbnail', cellRenderer: ImageCellRendererComponent, width: 120, autoHeight: true, filter: false, sortable: false },
      { field: 'price', headerName: 'Price ($)', sortable: true, filter: true, resizable: true, editable: true },
      { field: 'rate', headerName: 'Rating', sortable: true, filter: true, resizable: true, editable: true },
      { field: 'stock', sortable: true, filter: true, resizable: true, editable: true },
      { field: 'category', sortable: true, filter: true, resizable: true, editable: true },
      { field: 'brand', sortable: true, filter: true, resizable: true, editable: true },
      { field: 'sku', sortable: true, filter: true, resizable: true, editable: true },
      { field: 'availabilityStatus', sortable: true, filter: true, resizable: true, editable: true },
    ];
  }

  editProduct(product: any) {
    this.redirectedProduct = { ...product };
    this.productDialog = true;
  }
}