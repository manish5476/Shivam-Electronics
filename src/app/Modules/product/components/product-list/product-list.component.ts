
import { ProductService } from '../../../../core/services/product.service';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { Ripple } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { FileUpload } from 'primeng/fileupload';
import { SelectModule } from 'primeng/select';
import { Tag } from 'primeng/tag';
// import { RadioButton } from 'primeng/radiobutton';
import { Rating } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
// import { InputNumber } from 'primeng/inputnumber';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Table } from 'primeng/table';
import { RatingModule } from 'primeng/rating';
import { ProductMasterComponent } from "../product-master/product-master.component";
import { AppMessageService } from '../../../../core/services/message.service';
import { DrawerModule } from 'primeng/drawer';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}
@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrl: './product-list.component.css',
    imports: [TableModule, Dialog, DrawerModule, RatingModule, ButtonModule, SelectModule, ToastModule, ToolbarModule, ConfirmDialog, InputTextModule, TextareaModule, CommonModule, FileUpload, Tag, Rating, InputTextModule, FormsModule, IconFieldModule, InputIconModule, ProductMasterComponent],
    providers: [MessageService, ConfirmationService, ProductService],
})
export class ProductListComponent implements OnInit {

    @ViewChild('dt') dt!: Table;
    productDialog: boolean = false;
    products: any[] = [];
    product: any = [];
    selectedProducts: any[] = [];
    submitted: boolean = false;
    statuses: any[] = [];
    cols: Column[] = [];
    exportColumns: ExportColumn[] = [];
    redirectedProduct: any;
    visible: boolean = false;

    constructor(
        // private productService: ProductService,
        private ProductService: ProductService,
        private message: AppMessageService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadDemoData()
        this.statuses = [
            { label: 'INSTOCK', value: 'instock' },
            { label: 'LOWSTOCK', value: 'lowstock' },
            { label: 'OUTOFSTOCK', value: 'outofstock' }
        ];

        this.cols = [
            { field: 'code', header: 'Code', customExportHeader: 'Product Code' },
            { field: 'name', header: 'Name' },
            { field: 'image', header: 'Image' },
            { field: 'price', header: 'Price' },
            { field: 'category', header: 'Category' }
        ];
    }

    filterSearch(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.dt.filterGlobal(input.value, 'contains');
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    loadDemoData() {
        const filterOptions = {
            page: 1,        // Pagination: Page number
            limit: 50,       // Pagination: Number of results per page
            sort: 'price,-name',  // Sorting: Sort by price ascending, then name descending
            // fields: 'name,price,category,ratingsAverage', // Field Limiting: Select specific fields
            // category: 'manish', // Filtering: Products in 'Electronics' OR 'Clothing' categories (using $in operator on backend)
            // ratingsAverage: { gte: '4.5' }, // Filtering: Products with ratingsAverage greater than or equal to 4.5 (using $gte operator on backend)
            // rate: { lt: '100' } // Filtering: Products with price less than 100 (using $lt operator on backend)
        };

        this.ProductService.getAllProductData(filterOptions).subscribe(
            (res: any) => {
                if (res && res.data) {
                    this.products = res.data;
                    this.cd.markForCheck();
                }
            },
            (error: any) => {
                console.error('API Error:', error);
            }
        );
    }

    loadAllData() {
        this.ProductService.getAllProductData().subscribe((res: any) => {
            if (res && res.data) {
                this.products = res.data;
                this.cd.markForCheck();
            } else {
                console.error('Error loading all product data: Invalid response format', res);
            }
        }, (error: any) => {
            console.error('Error loading all product data:', error);
        });


        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    openNew() {
        this.product = {};
        this.submitted = false;
        this.productDialog = true;
    }

    editProduct(product: any) {
        this.product = { ...product };
        this.redirectedProduct = { ...product };
        this.productDialog = true;
    }

    deleteSelectedProducts() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected products?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const ids = this.selectedProducts ? this.selectedProducts.map(product => product.id) : []; // Extract IDs
                this.ProductService.deleteProduct(ids).subscribe(
                    (res: any) => {
                        this.products = this.products.filter(product => !ids.includes(product.id));
                    },
                    (err: any) => console.error('Deletion Error:', err)
                );
                this.selectedProducts = [];
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Products Deleted',
                    life: 3000
                });
            }
        });
    }

    hideDialog() {
        this.productDialog = false;
        this.submitted = false;
    }

    deleteProduct(product: any) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + product.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.ProductService.deleteSingleProduct(product).subscribe((res: any) => {
                    this.message.showInfo('delete', res.message)
                })
            }
        });
    }


    getSeverity(status: string) {
        switch (status) {
            case 'INSTOCK':
                return 'success';
            case 'LOWSTOCK':
                return 'warn';
            case 'OUTOFSTOCK':
                return 'danger';
            default:
                return 'success';
        }
    }

    isFirstPage(): unknown {
        throw new Error('Method not implemented.');
    }
    prev() {
        throw new Error('Method not implemented.');
    }
    reset() {
        throw new Error('Method not implemented.');
    }
    isLastPage(): unknown {
        throw new Error('Method not implemented.');
    }
    next() {
        throw new Error('Method not implemented.');
    }
    saveProduct() {
        throw new Error('Method not implemented.');
    }
}