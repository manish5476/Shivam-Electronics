import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Keep FormsModule if any ngModel is used in the future, though not directly in provided HTML
import { ApiService } from '../../../../core/services/api.service';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';

import { CellValueChangedEvent } from 'ag-grid-community';
// import { MouseEvent, HTMLElement } from '@angular/platform-browser'; // Keep for onButtonHover

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

@Component({
    selector: 'app-admin-user',
    standalone: true,
    imports: [
        ButtonModule,
        ToastModule,
        CommonModule,
        FormsModule,
        SharedGridComponent
    ],
    providers: [MessageService, ConfirmationService, ApiService],
    templateUrl: './admin-user.component.html',
    styleUrl: './admin-user.component.css'
})
export class AdminUserComponent implements OnInit {
    users: any = [];
    selectedProducts: any | null = []; // Renamed from selectedUsers for consistency with original code
    cols: any = []; // Column definitions for the grid
    columnDefs: any = []; // For SharedGridComponent
    rowSelectionMode: any = 'multiple'; // Changed to 'multiple' to support 'Delete Selected' button

    constructor(
        private apiService: ApiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadDemoData();
        // Map cols to columnDefs for SharedGridComponent (assuming it's an AG-Grid wrapper)
        this.columnDefs = this.cols.map((col: { field: any; header: any; }) => ({
            field: col.field,
            headerName: col.header,
            sortable: true,
            filter: true,
            resizable: true,
            editable: true // Assuming some fields might be editable based on updateinvoice call
        }));
    }

    /**
     * Placeholder for opening a new user creation form/dialog.
     * The actual dialog implementation would be in a separate component or service.
     */
    openNew() {
        this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'Open New User Dialog (Not implemented in this component yet)',
            life: 3000
        });
        // Logic to open a new user creation dialog/form would go here
    }

    /**
     * Deletes selected users from the list after confirmation.
     */
    deleteSelectedProducts() {
        if (!this.selectedProducts || this.selectedProducts.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'No users selected for deletion.',
                life: 3000
            });
            return;
        }

        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected users?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                // Filter out the selected users
                this.users = this.users.filter((val: any) => !this.selectedProducts.includes(val));
                this.selectedProducts = null; // Clear selection
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Users Deleted',
                    life: 3000
                });
                this.cd.markForCheck(); // Trigger change detection if necessary
            }
        });
    }

    /**
     * Placeholder for exporting data to CSV.
     * If using AG-Grid, you would call its export API here.
     */
    exportCSV() {
        this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'Export to CSV (AG-Grid export logic would go here)',
            life: 3000
        });
        // Example for AG-Grid export (assuming gridApi is available from SharedGridComponent)
        // this.gridApi.exportDataAsCsv();
    }

    /**
     * Loads demo user data and defines grid columns.
     */
    loadDemoData() {
        this.apiService.getAllUserData().subscribe((res: any) => {
            this.users = res.data;
            this.cd.markForCheck();
        });

        // Define columns for the grid
        this.cols = [
            { field: 'name', header: 'User Name', width: '200px' },
            { field: 'email', header: 'Email' },
            { field: 'role', header: 'Role' },
            // Removed 'password' field as it's sensitive and usually not displayed or directly editable in a list
        ];
    }

    /**
     * Handles events emitted from the SharedGridComponent.
     * @param event The event object from the grid.
     */
    eventFromGrid(event: any) {
        if (event.eventType === 'onCellValueCHanged') {
            const cellValueChangedEvent = event.event as CellValueChangedEvent;
            const rowNode = cellValueChangedEvent.node;
            const dataItem = rowNode.data;
            const field = cellValueChangedEvent.colDef.field;
            const newValue = cellValueChangedEvent.newValue;

            if (field) {
                dataItem[field] = newValue;
                // Assuming updateinvoice is a generic update for user data
                this.apiService.updateinvoice(dataItem.id, dataItem).subscribe({
                    next: (res: any) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Update Successful',
                            detail: `User ${field} updated to ${newValue}`,
                            life: 3000
                        });
                    },
                    error: (err: any) => {
                        console.error('❌ Error updating user data:', err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Update Failed',
                            detail: `Failed to update user ${field}.`,
                            life: 3000
                        });
                    }
                });
            } else {
                console.error('❌ Error: Field is undefined in cellValueChangedEvent.colDef');
            }
        }
        // Handle row selection event from the grid
        if (event.eventType === 'onSelectionChanged') {
            this.selectedProducts = event.event.api.getSelectedRows();
            this.cd.markForCheck(); // Update UI if needed
        }
    }

  
    onButtonHover(event: MouseEvent, isHovering: boolean, type: 'primary' | 'danger-outlined' | 'secondary-accent') {
        const button = event.currentTarget as HTMLElement;
        if (type === 'primary') {
            if (isHovering) {
                button.style.backgroundColor = 'var(--theme-button-hover-bg-primary)';
            } else {
                button.style.backgroundColor = 'var(--theme-button-bg-primary)';
            }
        } else if (type === 'danger-outlined') {
            if (isHovering) {
                button.style.backgroundColor = 'var(--theme-button-danger-hover-bg)';
                button.style.color = 'var(--theme-button-danger-hover-text)';
            } else {
                button.style.backgroundColor = 'transparent'; // Outlined buttons have transparent background by default
                button.style.color = 'var(--theme-button-danger-text)';
            }
        } else if (type === 'secondary-accent') {
            if (isHovering) {
                button.style.backgroundColor = 'var(--theme-secondary-accent-hover)';
            } else {
                button.style.backgroundColor = 'var(--theme-secondary-accent-primary)';
            }
        }
    }
}
