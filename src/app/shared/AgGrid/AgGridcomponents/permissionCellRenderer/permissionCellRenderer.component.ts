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
import { TagModule } from 'primeng/tag';

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

// --- NEW: User Cell Renderer ---
@Component({
    selector: 'app-user-cell-renderer',
    standalone: true,
    imports: [CommonModule, TagModule],
    template: `
        <div class="user-cell" *ngIf="params.data">
            <div class="user-avatar" [style.background-color]="params.data.color">{{ getInitials(params.data.name) }}</div>
            <div class="user-info">
                <div class="font-semibold text-slate-800">{{ params.data.name }}</div>
                <div class="text-sm text-slate-500">{{ params.data.email }}</div>
            </div>
            <p-tag [value]="params.data.role" [severity]="getRoleSeverity(params.data.role)" styleClass="ml-auto"></p-tag>
        </div>
    `,
    styles: [`
        .user-cell { display: flex; align-items: center; gap: 0.75rem; height: 100%; width: 100%; }
        .user-avatar { width: 38px; height: 38px; border-radius: 50%; color: white; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem; flex-shrink: 0; }
        .user-info { flex-grow: 1; }
    `]
})
export class UserCellRenderer implements ICellRendererAngularComp {
    public params!: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(params: ICellRendererParams): boolean {
        this.params = params;
        return true;
    }

    getInitials(name: string): string {
        if (!name) return '';
        const names = name.trim().split(' ');
        const initials = names.map(n => n[0]).join('');
        return (initials.length > 2 ? initials.substring(0, 2) : initials).toUpperCase();
    }

   getRoleSeverity(role: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (role) {
        case 'superAdmin': return 'danger';
        case 'admin': return 'warn';   // ✅ changed to "warn"
        case 'staff': return 'success';
        default: return 'info';
    }
}

}

// import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { forkJoin } from 'rxjs';
// import { finalize } from 'rxjs/operators';
// import { MessageService } from 'primeng/api';
// import { PermissionService, User, Permission } from '../../../../core/services/permission.service';
// import { ICellRendererAngularComp } from 'ag-grid-angular';
// import { ICellRendererParams } from 'ag-grid-community';

// // PrimeNG Modules
// import { ButtonModule } from 'primeng/button';
// import { InputSwitchModule } from 'primeng/inputswitch';
// import { ToastModule } from 'primeng/toast';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { TooltipModule } from 'primeng/tooltip';
// import { DividerModule } from "primeng/divider";

// // Shared Grid
// import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
// import { GridApi, GridReadyEvent } from 'ag-grid-community';

// // --- Interfaces ---
// interface UserWithPermissions extends User {
//     permissionMap: { [key: string]: boolean };
//     originalPermissionMap: { [key: string]: boolean };
//     isDirty: boolean;
//     color: string;
// }

// interface PermissionGroup {
//     name: string;
//     permissions: Permission[];
// }

// // --- Cell Renderer for Permissions ---
// @Component({
//     selector: 'app-permission-cell-renderer',
//     standalone: true,
//     imports: [CommonModule, InputSwitchModule, FormsModule],
//     template: `
//         <div class="flex justify-center items-center h-full">
//             <p-inputSwitch
//                 *ngIf="!isDisabled"
//                 [(ngModel)]="value"
//                 (onChange)="onValueChange($event)">
//             </p-inputSwitch>
//             <i *ngIf="isDisabled" class="pi pi-lock text-slate-400" pTooltip="Admins have full access" tooltipPosition="top"></i>
//         </div>
//     `
// })
// export class PermissionCellRenderer implements ICellRendererAngularComp {
//     private params!: ICellRendererParams;
//     public value!: boolean;
//     public isDisabled = false;

//     agInit(params: ICellRendererParams): void {
//         this.params = params;
//         this.value = params.value;
//         this.isDisabled = params.data.role === 'superAdmin' || params.data.role === 'admin';
//     }

//     refresh(params: ICellRendererParams): boolean {
//         return false;
//     }

//     onValueChange(event: any): void {
//         // ✅ FIX: Use optional chaining to safely call setValue only if it exists.
//         this.params?.setValue?.(event.checked);
//     }
// }
