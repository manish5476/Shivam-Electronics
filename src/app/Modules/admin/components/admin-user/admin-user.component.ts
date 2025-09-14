import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GridApi, GridReadyEvent, CellValueChangedEvent } from 'ag-grid-community';
import { UserService } from '../../../../core/services/user.service'; // ✅ Using UserService
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagCellRendererComponent } from '../../../../shared/AgGrid/AgGridcomponents/tagCellRenderer/tagcellRenderer.component';

@Component({
    selector: 'app-admin-user',
    standalone: true,
    imports: [
        SharedGridComponent,
        CommonModule,
        FormsModule,
        ButtonModule,
        ToastModule,
        SelectModule,
        InputTextModule,
        ConfirmDialogModule
    ],
    providers: [UserService, ConfirmationService, MessageService], // ✅ Using UserService
    templateUrl: './admin-user.component.html',
    styleUrl: './admin-user.component.css'
})
export class AdminUserComponent implements OnInit {
    // 🔹--- Pagination & Grid State ---
    private gridApi!: GridApi;
    private currentPage = 1;
    private isLoading = false;
    private totalCount = 0;
    private pageSize = 20;
    public data: any[] = [];
    public column: any[] = [];
    public rowSelectionMode = 'multiple';

    // 🔹--- Filter State ---
    public userFilter = {
        name: '',
        email: '',
        role: null
    };
    public roleOptions = [
        { label: 'User', value: 'user' },
        { label: 'Staff', value: 'staff' },
        { label: 'Admin', value: 'admin' },
        { label: 'Super Admin', value: 'superAdmin' },
    ];

    constructor(
        private userService: UserService, // ✅ Renamed for clarity and correctness
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.getColumn();
    }

    // 🔹--- Core Data and Filter Methods ---

    public applyFiltersAndReset(): void {
        this.currentPage = 1;
        this.data = [];
        this.gridApi?.setGridOption('rowData', []);
        this.gridApi?.showLoadingOverlay();
        this.getData(true);
    }

    public resetFilters(): void {
        this.userFilter = { name: '', email: '', role: null };
        this.applyFiltersAndReset();
    }

    public getData(isReset: boolean = false): void {
        if (this.isLoading) return;
        this.isLoading = true;
        if (isReset) this.currentPage = 1;

        const filterParams: any = {
            page: this.currentPage,
            limit: this.pageSize,
            ...this.userFilter
        };

        // ✅ Using correct service and method
        this.userService.getAllUserData(filterParams).subscribe({
            next: (res: any) => {
                const newData = res.data || [];
                // ✅ FIX: Using 'totalCount' from API response for pagination
                this.totalCount = res.totalCount || 0;

                if (this.gridApi) {
                    this.gridApi.applyTransaction({ add: newData });
                    const totalRows = this.gridApi.getDisplayedRowCount();
                    totalRows > 0 ? this.gridApi.hideOverlay() : this.gridApi.showNoRowsOverlay();
                } else {
                    this.data = newData;
                }

                this.currentPage++;
                this.isLoading = false;
                this.cd.markForCheck();
            },
            error: err => {
                console.error('Error loading users', err);
                this.isLoading = false;
                this.gridApi?.hideOverlay();
            }
        });
    }

    // 🔹--- Grid Event Handlers ---

    public onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api;
        this.getData(true);
    }

    public onScrolledToBottom(_: any): void {
        const rowCount = this.gridApi?.getDisplayedRowCount() ?? this.data.length;
        if (!this.isLoading && rowCount < this.totalCount) {
            this.getData(false);
        }
    }

    public eventFromGrid(event: any): void {
        if (event.eventType === 'onCellValueChanged') {
            const e: CellValueChangedEvent = event.event;
            const field = e.colDef.field;
            const newValue = e.newValue;

            if (!field) return;

            // ✅ FIX: Create a payload with ONLY the changed field to prevent accidental updates
            const updatePayload = { [field]: newValue };

            this.userService.updateUser(e.data._id, updatePayload).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User role updated successfully' });
                },
                error: err => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user role' });
                    console.error('Error updating user:', err);
                    e.node.setDataValue(field, e.oldValue); // Revert change on error
                }
            });
        }
    }

    // 🔹--- Column Definitions ---

    private getColumn(): void {
        this.column = [
            { headerName: 'Name', field: 'name', sortable: true, filter: true, resizable: true, checkboxSelection: true, headerCheckboxSelection: true },
            { headerName: 'Email', field: 'email', sortable: true, filter: true, resizable: true, flex: 1 },
            {
                headerName: 'Role', field: 'role', sortable: true, filter: true, resizable: true,
                editable: true,
                cellRenderer: TagCellRendererComponent,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: {
                    values: ['user', 'staff', 'admin', 'superAdmin']
                }
            },
            { field: 'createdAt', headerName: 'Created On', sortable: true, filter: 'agDateColumnFilter', valueFormatter: (p: any) => new Date(p.value).toLocaleDateString() }
        ];
    }

    // 🔹--- Action Bar Methods ---

    openNew() {
        this.messageService.add({ severity: 'info', summary: 'Info', detail: 'New User functionality not yet implemented.' });
    }

    deleteSelectedProducts() {
        const selectedNodes = this.gridApi?.getSelectedNodes();
        if (!selectedNodes || selectedNodes.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No users selected.' });
            return;
        }

        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${selectedNodes.length} selected user(s)?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const idsToDelete = selectedNodes.map(node => node.data._id).toString();
                this.userService.deleteUser(idsToDelete).subscribe({
                    next: (res:any) => {
                        this.getData(false)

                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Users deleted successfully' });
                        this.gridApi.applyTransaction({ remove: selectedNodes.map(node => node.data) });
                    },
                    error: err => {
                        this.getData(false)
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete users' });
                        console.error('Error deleting users:', err);
                    }
                });
            }
        });
    }

    exportCSV() {
        this.gridApi?.exportDataAsCsv();
    }
}

