import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { CellValueChangedEvent } from 'ag-grid-community';
import { ToolbarComponent } from "../../../../shared/Components/toolbar/toolbar.component";
import { CustomerService } from '../../../../core/services/customer.service';
import { InvoiceService } from '../../../../core/services/invoice.service';
@Component({
    selector: 'app-customer-list',
    standalone: true,
    imports: [SharedGridComponent, ToolbarComponent, ToolbarComponent],
    providers: [CustomerService],
    templateUrl: './customer-list.component.html',
    styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
    data: any = [];
    column: any = [];
    rowSelectionMode: any = 'singleRow';

    constructor(private cdr: ChangeDetectorRef,private InvoiceService:InvoiceService, private CustomerService: CustomerService) { }

    ngOnInit(): void {
        this.getColumn();
        this.getData();
    }

    getColumn(): void {
        this.column = [
            { field: '_id', headerName: 'ID', sortable: true, filter: true, resizable: true },
            {
                field: 'status', headerName: 'Status', sortable: true, filter: true, resizable: true,
                cellStyle: (params: any) => {
                    switch (params.value) {
                        case 'active': return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' };
                        case 'inactive': return { backgroundColor: '#ffcccc', color: '#8b0000', fontWeight: 'bold' };
                        case 'pending': return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' };
                        case 'suspended': return { backgroundColor: '#f0f0f0', color: '#808080', fontWeight: 'bold' };
                        case 'blocked': return { backgroundColor: '#e0e0e0', color: '#555555', fontWeight: 'bold' };
                        default: return {};
                    }
                },
            },
            { field: 'profileImg', headerName: 'Profile Image', sortable: true, filter: true, resizable: true },
            { field: 'email', headerName: 'Email', sortable: true, filter: true, resizable: true },
            { field: 'fullname', headerName: 'Full Name', sortable: true, filter: true, resizable: true },
            { field: 'phoneNumbers[0].number', headerName: 'Contact Number', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.phoneNumbers?.[0]?.number },
            { field: 'addresses[0].street', headerName: 'Street', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.addresses?.[0]?.street },
            { field: 'addresses[0].city', headerName: 'City', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.addresses?.[0]?.city },
            { field: 'addresses[0].state', headerName: 'State', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.addresses?.[0]?.state },
            { field: 'addresses[0].zipCode', headerName: 'Zip Code', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.addresses?.[0]?.zipCode },
            { field: 'addresses[0].country', headerName: 'Country', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.addresses?.[0]?.country },
            { field: 'totalPurchasedAmount', headerName: 'Total Purchased Amount', sortable: true, filter: true, resizable: true },
            { field: 'remainingAmount', headerName: 'Remaining Amount', sortable: true, filter: true, resizable: true },
            // For paymentHistory, it's an array, you might want to customize how to display it
            {
                field: 'paymentHistory',
                headerName: 'Payment History',
                sortable: true,
                filter: true,
                resizable: true,
                valueGetter: (params: any) => params.data.paymentHistory?.length > 0 ? params.data.paymentHistory.map((p: any) => p.amount + ' ' + p.currency).join(', ') : 'No History'
            },
            { field: 'metadata', headerName: 'Metadata', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => JSON.stringify(params.data.metadata) },
            { field: 'createdAt', headerName: 'Created At', sortable: true, filter: true, resizable: true, valueFormatter: (params: any) => new Date(params.value).toLocaleString() },
            { field: 'updatedAt', headerName: 'Updated At', sortable: true, filter: true, resizable: true, valueFormatter: (params: any) => new Date(params.value).toLocaleString() },
            { field: '__v', headerName: 'Version', sortable: true, filter: true, resizable: true },
            {
                field: 'cart',
                headerName: 'Cart Items',
                sortable: true,
                filter: true,
                resizable: true,
                valueGetter: (params: any) => params.data.cart?.items?.length
            }
        ];
        this.cdr.detectChanges();
    }

    getData() {
        this.CustomerService.getAllCustomerData().subscribe((res: any) => {
            this.data = res.data;
            this.cdr.markForCheck();
        });
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
                this.InvoiceService.updateinvoice(dataItem.id, dataItem).subscribe({
                    next: (res: any) => {
                        // console.log('✅ invoice updated successfully:', res);
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
}

// import { CustomerService } from '../../../../core/services/api.service';
// import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
// import { ConfirmationService, MessageService } from 'primeng/api';
// import { TableModule } from 'primeng/table';
// import { Dialog } from 'primeng/dialog';
// import { ButtonModule } from 'primeng/button';
// import { ToastModule } from 'primeng/toast';
// import { ToolbarModule } from 'primeng/toolbar';
// import { ConfirmDialog } from 'primeng/confirmdialog';
// import { InputTextModule } from 'primeng/inputtext';
// import { TextareaModule } from 'primeng/textarea';
// import { CommonModule } from '@angular/common';
// import { FileUpload } from 'primeng/fileupload';
// import { SelectModule } from 'primeng/select';
// import { Tag } from 'primeng/tag';
// import { IconFieldModule } from 'primeng/iconfield';
// import { InputIconModule } from 'primeng/inputicon';
// import { Table } from 'primeng/table';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { AppMessageService } from '../../../core/services/message.service';
// import { error } from 'console';
// export interface CartItem {
//     customerId: string;
//     invoiceIds: string[];
//     _id?: string;
// }

// interface Column {
//     field: string;
//     header: string;
//     customExportHeader?: string;
// }

// interface ExportColumn {
//     title: string;
//     dataKey: string;
// }

// export interface PhoneNumber {
//     number: string;
//     type: 'home' | 'mobile' | 'work';
//     primary: boolean;
//     _id?: string;
// }

// export interface Address {
//     street: string;
//     city: string;
//     state: string;
//     zipCode: string;
//     country: string;
//     type: 'billing' | 'shipping' | 'home' | 'work';
//     isDefault: boolean;
//     _id?: string;
// }

// export interface Customer {
//     _id: string;
//     //   createdAt: Date;
//     updatedAt: Date;
//     status: 'active' | 'inactive' | 'pending' | 'suspended' | 'blocked';
//     email: string;
//     fullname: string;
//     phoneNumbers: PhoneNumber[];
//     addresses: Address[];
//     cart: {
//         items: CartItem[];
//     };
//     guarantorId?: string;
//     totalPurchasedAmount: number;
//     remainingAmount: number;
//     paymentHistory: Payment[];
//     metadata: Map<string, any>;
// }

// export interface Payment {
//     _id: string;
//     amount: number;
//     currency: string;
//     status: string;
//     createdAt: Date;
// }

// export interface Invoice {
//     _id: string;
//     amount: number;
//     createdAt: Date;
// }
// @Component({
//     selector: 'app-customer-list',
//     imports: [TableModule, Dialog, ButtonModule, SelectModule, ToastModule, ToolbarModule, ConfirmDialog, InputTextModule, TextareaModule, CommonModule, FileUpload, Tag, InputTextModule, FormsModule, IconFieldModule, InputIconModule],
//     providers: [MessageService, ConfirmationService, CustomerService],
//     templateUrl: './customer-list.component.html',
//     styleUrl: './customer-list.component.css'
// })
// export class CustomerListComponent {
//     checkedCustomer(customer: any) {
//     }
//     loading: boolean = true;

//     @ViewChild('dt') dt!: Table;
//     customerDialog: boolean = false;
//     customers: any[] = [];
//     customer: any = [];
//     selectedcustomers: any[] = [];
//     submitted: boolean = false;
//     statuses: any[] = [];
//     cols: Column[] = [];
//     exportColumns: ExportColumn[] = [];
//     redirectedcustomer: any;
//     customersdropdowndata: any[] = []
//     constructor(
//         private router: Router,
//         private CustomerService: CustomerService,
//         private messageService: AppMessageService,
//         private confirmationService: ConfirmationService,
//         private cd: ChangeDetectorRef
//     ) { }

//     ngOnInit() {
//         this.customerDropDownData()
//         this.loadDemoData()
//     }

//     customerDropDownData() {
//         this.CustomerService.getCustomerDropDown().subscribe((res: any) => {
//             if (res.data) {
//                 this.customersdropdowndata = res.data
//             }
//         }, (error: any) => {
//             console.error(error)
//         })
//     }

//     vierCustomer(customerId: any) {
//         this.router.navigate(['/customer', customerId._id]);
//     }

//     filterSearch(event: Event): void {
//         const input = event.target as HTMLInputElement;
//         this.dt.filterGlobal(input.value, 'contains');
//     }

//     exportCSV() {
//         this.dt.exportCSV();
//     }


//     loadDemoData() {
//         this.CustomerService.getAllCustomerData().subscribe((res: any) => {
//             this.customers = res.data;
//             this.cd.markForCheck();
//             this.loading = false
//         })
//         this.cols = [
//             { field: 'code', header: 'Code', customExportHeader: 'customer Code' },
//             { field: 'fullname', header: 'fullname' },
//             { field: 'email', header: 'email' },
//             { field: 'remainingAmount', header: 'remainingAmount' },
//             { field: 'guaranteerId', header: 'guaranteerId' },
//             { field: 'status', header: 'status' }
//         ];
//         this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
//     }

//     openNew() {
//         this.customer = {};
//         this.submitted = false;
//         this.customerDialog = true;
//     }

//     editcustomer(customer: any) {
//         this.customer = { ...customer };
//         this.redirectedcustomer = { ...customer };
//         this.customerDialog = true;
//     }



//     hideDialog() {
//         this.customerDialog = false;
//         this.submitted = false;
//     }

//     getSeverity(status: string) {
//         switch (status) {
//             case 'active':
//                 return 'success';
//             case 'inactive':
//                 return 'danger';
//             case 'pending':
//                 return 'contrast';
//             default:
//                 return 'success';
//         }
//     }
//     deleteSelectedcustomers() {
//         this.confirmationService.confirm({
//             message: 'Are you sure you want to delete the selectedcustomers?',
//             header: 'Confirm',
//             icon: 'pi pi-exclamation-triangle',
//             accept: () => {
//                 const ids = this.selectedcustomers ? this.selectedcustomers.map(customer => customer.id) : []; // Extract IDs
//                 this.CustomerService.deleteCustomers(ids).subscribe({
//                     next: (res: any) => {
//                         this.customers = this.customers.filter(customer => !ids.includes(customer.id));
//                         this.loadDemoData();
//                         this.messageService.handleResponse(res, 'Customers Deleted', 'Selected customers were successfully deleted.'); // Use handleResponse
//                     },
//                     error: (err) => {
//                         console.error('Deletion Error:', err);
//                         this.messageService.handleError(err, 'Deletion Failed'); // Use handleError for errors
//                     }
//                 });
//                 this.selectedcustomers = [];
//             }
//         });
//     }
//     deletecustomer(customer: any) {
//         this.confirmationService.confirm({
//             message: 'Are you sure you want to delete ' + customer.fullname + '?',
//             header: 'Confirm',
//             icon: 'pi pi-exclamation-triangle',
//             accept: () => {
//                 this.CustomerService.deleteCustomerID(customer._id).subscribe({
//                     next: (res: any) => {
//                         this.loadDemoData();
//                         this.messageService.handleResponse(res, 'Customer Deleted', `${customer.fullname} successfully deleted.`); // Use handleResponse
//                     },
//                     error: (err) => {
//                         console.error('Deletion Error:', err);
//                         this.messageService.handleError(err, 'Deletion Failed'); // Use handleError for errors
//                     }
//                 });
//             }
//         });
//     }


// }