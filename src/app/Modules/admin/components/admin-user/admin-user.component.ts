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
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Table } from 'primeng/table';
import { ApiService } from '../../../../core/services/api.service';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { ToolbarComponent } from '../../../../shared/Components/toolbar/toolbar.component';
import { CellValueChangedEvent } from 'ag-grid-community';
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
    selector: 'app-admin-user',
    imports: [TableModule, ButtonModule, SelectModule, ToastModule, ToolbarModule,  InputTextModule, TextareaModule, CommonModule, InputTextModule, FormsModule, IconFieldModule, InputIconModule, SharedGridComponent, ToolbarComponent], // Add SharedGridComponent to imports
    providers: [MessageService, ConfirmationService, ApiService],
    templateUrl: './admin-user.component.html',
    styleUrl: './admin-user.component.css'
})
export class AdminUserComponent implements OnInit {
    userDialog: boolean = false;
    users: any = [];
    user: any;
    selectedProducts: any | null = [];
    submitted: boolean = false;
    statuses: any = [];
    @ViewChild('dt') dt!: Table; // Potentially remove if you don't need direct access to p-table
    cols: any = []; // Adjusted type
    exportColumns!: ExportColumn;
    columnDefs: any = []; // For SharedGridComponent
    rowSelectionMode: any = 'singleRow';

    constructor(
        private apiService: ApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadDemoData();
        this.columnDefs = this.cols.map((col: { field: any; header: any; }) => ({
            field: col.field,
            headerName: col.header,
            sortable: true,
            filter: true,
            resizable: true
        }));
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    filterSearch(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.dt.filterGlobal(input.value, 'contains');
    }

    loadDemoData() {
        this.apiService.getAllUserData().subscribe((res: any) => {
            this.users = res.data;
            this.cd.markForCheck();
        });

        this.statuses = [
            { label: 'INSTOCK', value: 'instock' },
            { label: 'LOWSTOCK', value: 'lowstock' },
            { label: 'OUTOFSTOCK', value: 'outofstock' }
        ];

        this.cols = [
            { field: 'name', header: 'Code', customExportHeader: 'Product Code',width:'200px' },
            { field: 'email', header: 'Name' },
            { field: 'role', header: 'Role' },
            { field: 'password', header: 'Password' },
        ];

        this.exportColumns = this.cols.map((col: { header: any; field: any; }) => ({ title: col.header, dataKey: col.field }));
    }

    openNew() {
        this.user = {};
        this.submitted = false;
        this.userDialog = true;
    }

    editProduct(product: any) {
        this.user = { ...product };
        this.userDialog = true;
    }

    deleteSelectedProducts() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected products?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.users = this.users.filter((val: any) => !this.selectedProducts?.includes(val));
                this.selectedProducts = null;
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
        this.userDialog = false;
        this.submitted = false;
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
                this.apiService.updateinvoice(dataItem.id, dataItem).subscribe({
                    next: (res: any) => {
                    },
                    error: (err: any) => {
                        console.error('❌ Error updating invoice:', err);
                    }
                });
            } else {
                console.error('❌ Error: Field is undefined in cellValueChangedEvent.colDef');
            }
        }

    }


    deleteProduct(product: any) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + product.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.users = this.users.filter((val: { id: any; }) => val.id !== product.id);
                this.user = {};
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Deleted',
                    life: 3000
                });
            }
        });
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    createId(): string {
        let id = '';
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
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

    saveProduct() {
        this.submitted = true;

        if (this.user.name?.trim()) {
            if (this.user.id) {
                this.users[this.findIndexById(this.user.id)] = this.user;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Updated',
                    life: 3000
                });
            } else {
                this.user.id = this.createId();
                this.user.image = 'product-placeholder.svg';
                this.users.push(this.user);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Created',
                    life: 3000
                });
            }

            this.users = [...this.users];
            this.userDialog = false;
            this.user = {};
        }
    }
}
// import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
// import { ConfirmationService, MessageService } from 'primeng/api';
// import { TableModule } from 'primeng/table';
// import { Dialog } from 'primeng/dialog';
// import { Ripple } from 'primeng/ripple';
// import { ButtonModule } from 'primeng/button';
// import { ToastModule } from 'primeng/toast';
// import { ToolbarModule } from 'primeng/toolbar';
// import { ConfirmDialog } from 'primeng/confirmdialog';
// import { InputTextModule } from 'primeng/inputtext';
// import { TextareaModule } from 'primeng/textarea';
// import { CommonModule } from '@angular/common';
// import { FileUpload } from 'primeng/fileupload';
// import { SelectModule } from 'primeng/select';
// import { FormsModule } from '@angular/forms';
// import { IconFieldModule } from 'primeng/iconfield';
// import { InputIconModule } from 'primeng/inputicon';
// import { Table } from 'primeng/table';
// import { ApiService } from '../../core/services/api.service';

// interface Column {
//     field: string;
//     header: string;
//     customExportHeader?: string;
// }

// interface ExportColumn {
//     title: string;
//     dataKey: string;
// }

// @Component({
//     selector: 'app-admin-user',
//     imports: [TableModule, ButtonModule, Dialog, SelectModule, ToastModule, ToolbarModule, ConfirmDialog, InputTextModule, TextareaModule, CommonModule, FileUpload, InputTextModule, FormsModule, IconFieldModule, InputIconModule],
//     providers: [MessageService, ConfirmationService],
//     templateUrl: './admin-user.component.html',
//     styleUrl: './admin-user.component.scss'
// })
// export class AdminUserComponent implements OnInit {
//     userDialog: boolean = false;

//     users!: any[];

//     user!: any;

//     selectedProducts!: any[] | null;

//     submitted: boolean = false;

//     statuses!: any[];

//     @ViewChild('dt') dt!: Table;

//     cols!: Column[];

//     exportColumns!: ExportColumn[];

//     constructor(
//         private apiService: ApiService,
//         // private productService: ProductService,
//         private messageService: MessageService,
//         private confirmationService: ConfirmationService,
//         private cd: ChangeDetectorRef
//     ) { }
//     ngOnInit(): void {
//         this.loadDemoData()
//     }

//     exportCSV() {
//         this.dt.exportCSV();
//     }

//     filterSearch(event: Event): void {
//         const input = event.target as HTMLInputElement;
//         this.dt.filterGlobal(input.value, 'contains');
//     }
//     loadDemoData() {
//         this.apiService.getAllUserData().subscribe((res: any) => {
//             this.users = res.data;
//             this.cd.markForCheck();
//         });

//         this.statuses = [
//             { label: 'INSTOCK', value: 'instock' },
//             { label: 'LOWSTOCK', value: 'lowstock' },
//             { label: 'OUTOFSTOCK', value: 'outofstock' }
//         ];

//         this.cols = [
//             { field: 'name', header: 'Code', customExportHeader: 'Product Code' },
//             { field: 'email', header: 'Name' },
//             { field: 'role', header: 'Image' },
//             { field: 'password', header: 'Price' },
//         ];

//         this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
//     }

//     openNew() {
//         this.user = {};
//         this.submitted = false;
//         this.userDialog = true;
//     }

//     editProduct(product: any) {
//         this.user = { ...product };
//         this.userDialog = true;
//     }

//     deleteSelectedProducts() {
//         this.confirmationService.confirm({
//             message: 'Are you sure you want to delete the selected products?',
//             header: 'Confirm',
//             icon: 'pi pi-exclamation-triangle',
//             accept: () => {
//                 this.users = this.users.filter((val) => !this.selectedProducts?.includes(val));
//                 this.selectedProducts = null;
//                 this.messageService.add({
//                     severity: 'success',
//                     summary: 'Successful',
//                     detail: 'Products Deleted',
//                     life: 3000
//                 });
//             }
//         });
//     }

//     hideDialog() {
//         this.userDialog = false;
//         this.submitted = false;
//     }
//     deleteProduct(product: any) {
//         this.confirmationService.confirm({
//             message: 'Are you sure you want to delete ' + product.name + '?',
//             header: 'Confirm',
//             icon: 'pi pi-exclamation-triangle',
//             accept: () => {
//                 this.users = this.users.filter((val) => val.id !== product.id);
//                 this.user = {};
//                 this.messageService.add({
//                     severity: 'success',
//                     summary: 'Successful',
//                     detail: 'Product Deleted',
//                     life: 3000
//                 });
//             }
//         });
//     }

//     findIndexById(id: string): number {
//         let index = -1;
//         for (let i = 0; i < this.users.length; i++) {
//             if (this.users[i].id === id) {
//                 index = i;
//                 break;
//             }
//         }

//         return index;
//     }

//     createId(): string {
//         let id = '';
//         var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//         for (var i = 0; i < 5; i++) {
//             id += chars.charAt(Math.floor(Math.random() * chars.length));
//         }
//         return id;
//     }

//     getSeverity(status: string) {
//         switch (status) {
//             case 'INSTOCK':
//                 return 'success';
//             case 'LOWSTOCK':
//                 return 'warn';
//             case 'OUTOFSTOCK':
//                 return 'danger';
//             default:
//                 return 'success';
//         }
//     }

//     saveProduct() {
//         this.submitted = true;

//         if (this.user.name?.trim()) {
//             if (this.user.id) {
//                 this.users[this.findIndexById(this.user.id)] = this.user;
//                 this.messageService.add({
//                     severity: 'success',
//                     summary: 'Successful',
//                     detail: 'Product Updated',
//                     life: 3000
//                 });
//             } else {
//                 this.user.id = this.createId();
//                 this.user.image = 'product-placeholder.svg';
//                 this.users.push(this.user);
//                 this.messageService.add({
//                     severity: 'success',
//                     summary: 'Successful',
//                     detail: 'Product Created',
//                     life: 3000
//                 });
//             }

//             this.users = [...this.users];
//             this.userDialog = false;
//             this.user = {};
//         }
//     }
// }