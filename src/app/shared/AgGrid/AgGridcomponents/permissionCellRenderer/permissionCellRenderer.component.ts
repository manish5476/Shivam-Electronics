import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { PermissionService, User, Permission } from '../../../../core/services/permission.service';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from "primeng/divider";

// Shared Grid
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { GridApi, GridReadyEvent } from 'ag-grid-community';

// --- Interfaces ---
interface UserWithPermissions extends User {
    permissionMap: { [key: string]: boolean };
    originalPermissionMap: { [key: string]: boolean };
    isDirty: boolean;
    color: string;
}

interface PermissionGroup {
    name: string;
    permissions: Permission[];
}

// --- Cell Renderer for Permissions ---
@Component({
    selector: 'app-permission-cell-renderer',
    standalone: true,
    imports: [CommonModule, InputSwitchModule, FormsModule],
    template: `
        <div class="flex justify-center items-center h-full">
            <p-inputSwitch 
                *ngIf="!isDisabled"
                [(ngModel)]="value" 
                (onChange)="onValueChange($event)">
            </p-inputSwitch>
            <i *ngIf="isDisabled" class="pi pi-lock text-slate-400" pTooltip="Admins have full access" tooltipPosition="top"></i>
        </div>
    `
})
export class PermissionCellRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams;
    public value!: boolean;
    public isDisabled = false;

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.value = params.value;
        this.isDisabled = params.data.role === 'superAdmin' || params.data.role === 'admin';
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }

    onValueChange(event: any): void {
        // ✅ FIX: Use optional chaining to safely call setValue only if it exists.
        this.params?.setValue?.(event.checked);
    }
}
