import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { CellValueChangedEvent } from 'ag-grid-community';
import { CustomerService } from '../../../../core/services/customer.service';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { SelectModule } from 'primeng/select';
import { IftaLabelModule } from 'primeng/iftalabel';
import { FormsModule } from '@angular/forms';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { AppMessageService } from '../../../../core/services/message.service';
// Add this import to the top of your component file
import { ImageCellRendererComponent } from '../../../../shared/AgGrid/AgGridcomponents/image-cell-renderer/image-cell-renderer.component';
import { Button } from "primeng/button";
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
@Component({
    selector: 'app-customer-list',
    standalone: true,
    imports: [SharedGridComponent, SelectModule, AutoCompleteModule, FormsModule, IftaLabelModule, Button],
    providers: [CustomerService],
    templateUrl: './customer-list.component.html',
    styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
    resetFilters() {
        this.customerFilter.name = null
        this.customerFilter.mobileNumber = null
        this.customerFilter.guaranter = null
        this.customerFilter.email = null
        this.customerFilter.page = 1
        this.getData();
    }
    data: any = [];
    customer: any
    column: any = [];
    rowSelectionMode: any = 'singleRow';
    customerFilter: any = {
        name: null,
        mobileNumber: '',
        guaranter: '',
        page: '',
        email: '',
        limit: '',
        customerIDDropdown: [],
    }
    constructor(private cdr: ChangeDetectorRef, private autoPopulate: AutopopulateService, private InvoiceService: InvoiceService, private CustomerService: CustomerService, private messageService: AppMessageService) { }

    ngOnInit(): void {
        this.autopopulatedata()
        this.getColumn();
        this.getData();
    }

    emailSuggestions: string[] = [];

    private readonly domains: string[] = [
        '@gmail.com',
        '@yahoo.com',
        '@outlook.com',
        '@hotmail.com',
        '@protonmail.com'
    ];

    filterEmails(event: AutoCompleteCompleteEvent) {
        const query = event.query;

        if (!query) {
            this.emailSuggestions = [];
            return;
        }

        // If user already typed '@', don’t prepend again
        if (query.includes('@')) {
            this.emailSuggestions = [];
        } else {
            this.emailSuggestions = this.domains.map(domain => query + domain);
        }
    }

    autopopulatedata() {
        this.autoPopulate.getModuleData('customers').subscribe((data: any) => {
            this.customerFilter.customerIDDropdown = data;
        });
    }

    getColumn(): void {
        this.column = [
            { field: '_id', headerName: 'ID', sortable: true, filter: true, resizable: true, tooltipField: '_id' },
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
            { headerName: 'Profile Photo', tooltipField: 'profileImg', field: 'profileImg', cellRenderer: ImageCellRendererComponent, width: 120, autoHeight: true, filter: false, sortable: false },
            { tooltipField: 'email', field: 'email', headerName: 'Email', sortable: true, filter: true, resizable: true, tooltiptooltipField: 'profileImg', Field: 'name' },
            { tooltipField: 'fullname', field: 'fullname', headerName: 'Full Name', sortable: true, filter: true, resizable: true, tooltiptooltipField: 'profileImg', Field: 'name' },
            {                field: 'phoneNumbers[0].number', headerName: 'Contact Number', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.phoneNumbers?.[0]?.number, tooltipValueGetter: (params: any) => params.data.phoneNumbers?.[0]?.number,},
            {                field: 'addresses[0].street', headerName: 'Street', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.addresses?.[0]?.street, tooltipValueGetter: (params: any) => params.data.addresses?.[0]?.street,},
            {                field: 'addresses[0].city', headerName: 'City', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.addresses?.[0]?.city, tooltipValueGetter: (params: any) => params.data.addresses?.[0]?.city,},
            {                field: 'addresses[0].state', headerName: 'State', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.addresses?.[0]?.state, tooltipValueGetter: (params: any) => params.data.addresses?.[0]?.state,},
            {                field: 'addresses[0].zipCode', headerName: 'Zip Code', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.addresses?.[0]?.zipCode, tooltipValueGetter: (params: any) => params.data.addresses?.[0]?.zipCode,},
            {                field: 'addresses[0].country', headerName: 'Country', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.addresses?.[0]?.country, tooltipValueGetter: (params: any) => params.data.addresses?.[0]?.country,},
            { tooltipField: 'totalPurchasedAmount', field: 'totalPurchasedAmount', headerName: 'Total Purchased Amount', sortable: true, filter: true, resizable: true, tooltiptooltipField: 'profileImg', Field: 'name' },
            {
                tooltipField: 'remainingAmount', field: 'remainingAmount', headerName: 'Remaining Amount', sortable: true, filter: true, resizable: true, cellStyle: (params: any) => {
                    const remaining = params.data.remainingAmount;
                    if (typeof remaining !== 'number' || isNaN(remaining)) {
                        return {}; // Return default style if not a valid number
                    }
                    if (remaining === 0) {
                        return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' }; // Green
                    } else if (remaining > 0 && remaining < 3000) {
                        return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' }; // Orange (like your 'pending' style)
                    } else if (remaining < 0) {
                        return { backgroundColor: '#cce0ff', color: '#00008b', fontWeight: 'bold' }; // Example: Blueish for overpayment
                    }
                    else if (remaining > 3000) {
                        return { backgroundColor: '#FCB045', color: '#d35400', fontWeight: 'bold' }; // Orange (like your 'pending' style)
                    }
                    else {
                        return {};
                    }
                }
            },
            {
                tooltipField: 'paymentHistory', field: 'paymentHistory',
                headerName: 'Payment History',
                sortable: true,
                filter: true,
                resizable: true,
                valueGetter: (params: any) => params.data.paymentHistory?.length > 0 ? params.data.paymentHistory.map((p: any) => p.amount + ' ' + p.currency).join(', ') : 'No History',
                cellStyle: (params: any) => {
                    switch (params.data.remainingAmount) {
                        case '0': return { backgroundColor: '#ccffcc', color: '#006400', fontWeight: 'bold' };
                        case 'inactive': return { backgroundColor: '#ffcccc', color: '#8b0000', fontWeight: 'bold' };
                        case 'pending': return { backgroundColor: '#ffe0b3', color: '#d35400', fontWeight: 'bold' };
                        case 'suspended': return { backgroundColor: '#f0f0f0', color: '#808080', fontWeight: 'bold' };
                        case 'blocked': return { backgroundColor: '#e0e0e0', color: '#555555', fontWeight: 'bold' };
                        default: return {};
                    }
                },
            },
            { tooltipField: 'paymentHistory', field: 'metadata', headerName: 'Metadata', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => JSON.stringify(params.data.metadata) },
            { tooltipField: 'createdAt', field: 'createdAt', headerName: 'Created At', sortable: true, filter: true, resizable: true, valueFormatter: (params: any) => new Date(params.value).toLocaleString() },
            { tooltipField: 'updatedAt', field: 'updatedAt', headerName: 'Updated At', sortable: true, filter: true, resizable: true, valueFormatter: (params: any) => new Date(params.value).toLocaleString() },
            { tooltipField: '__v', field: '__v', headerName: 'Version', sortable: true, filter: true, resizable: true, tooltiptooltipField: 'profileImg', Field: 'name' },
            { tooltipField: 'cart', field: 'cart', headerName: 'Cart Items', sortable: true, filter: true, resizable: true, valueGetter: (params: any) => params.data.cart?.items?.length }
        ];
        this.cdr.detectChanges();
    }

    getData() {
        let filterParams = {
            _id: this.customerFilter.name,
            guaranteerId: this.customerFilter.guaranter,
            page: this.customerFilter.page || 1,
            email: this.customerFilter.email,
            mobileNumber: this.customerFilter.phone,
            limit: this.customerFilter.limit || 100,
            // fields:'mobileNumber fullName'
        }
        this.CustomerService.getAllCustomerData(filterParams).subscribe((res: any) => {
            this.data = res.data;
            this.cdr.markForCheck();
        });
    }

    eventFromGrid(event: any) {
        if (event.eventType === 'onCellValueChanged') {
            const cellValueChangedEvent = event.event as CellValueChangedEvent;
            const rowNode = cellValueChangedEvent.node;
            const dataItem = rowNode.data;
            this.customer = dataItem
            const field = cellValueChangedEvent.colDef.field;
            const newValue = cellValueChangedEvent.newValue;
            if (field) {
                dataItem[field] = newValue;
                this.InvoiceService.updateInvoice(dataItem.id, dataItem).subscribe({
                    next: (res: any) => { },
                    error: (err: any) => { console.error('❌ Error updating invoice:', err) }
                });
            } else {
                console.error('❌ Error: Field is undefined in cellValueChangedEvent.colDef');
            }
        }
    }


    validateCustomer(): boolean {
        if (!this.customer.fullname) { return false; }
        if (!this.customer.email || !this.customer.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) { return false; }
        return true;
    }

    saveCustomer() {
        if (this.validateCustomer()) {
            //   this.customer.guaranteerId = this.selectedGuaranter._id;
            this.customer.mobileNumber = Number(this.customer.phoneNumbers[0].number); // Convert string to number
            this.CustomerService.createNewCustomer(this.customer).subscribe(
                (response: any) => {
                    if (response.status === 'success') {
                        const customerId = response.data._id;
                    } else {
                        this.messageService.showError('Error', response.message || 'Failed to create customer.');
                    }
                },
                (error) => {
                    const errorMessage = error.error?.message || 'An unexpected error occurred.';
                    this.messageService.showError('Error', errorMessage);
                }
            );
        } else {
            this.messageService.showError('Validation Error', 'Please fill in all required fields.');
        }
    }
}
