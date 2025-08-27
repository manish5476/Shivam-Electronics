import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { PermissionService, User, Permission } from '../../../../core/services/permission.service';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch'; // <-- IMPORTED InputSwitch
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { Divider } from "primeng/divider";

interface PermissionGroup {
    name: string;
    permissions: Permission[];
}

@Component({
  selector: 'app-permission-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputSwitchModule, // <-- ADDED InputSwitchModule
    ToastModule,
    ProgressSpinnerModule,
    TooltipModule,
    Divider
],
  templateUrl: './permission-component.component.html',
  styleUrl: './permission-component.component.css'
})
export class PermissionComponentComponent implements OnInit {
  private messageService = inject(MessageService);
  private permissionService = inject(PermissionService);

  isLoading = true;
  error: string | null = null;
  users: any[] = [];
  permissionGroups: PermissionGroup[] = [];
  savingState: { [key: string]: boolean } = {};

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      permissionsRes: this.permissionService.getAllPermissions(),
      usersRes: this.permissionService.getUsersWithPermissions()
    })
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: ({ permissionsRes, usersRes }) => {
          this.permissionGroups = this.groupPermissions(permissionsRes.data);
          this.users = usersRes.data.map(user => this.createUserWithPermissionMap(user, permissionsRes.data));
        },
        error: (err) => {
          this.error = err.message || 'An unknown error occurred.';
          this.messageService.add({ severity: 'error', summary: this.error??'Error' });
        }
      });
  }

  private groupPermissions(permissions: Permission[]): PermissionGroup[] {
    const groups: { [key: string]: Permission[] } = {};
    permissions.forEach(p => {
        const groupName = p.tag.split(':')[0];
        if (!groups[groupName]) {
            groups[groupName] = [];
        }
        groups[groupName].push(p);
    });

    return Object.keys(groups).map(name => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        permissions: groups[name]
    }));
  }

  private createUserWithPermissionMap(user: User, allPermissions: Permission[]): any {
      const permissionMap: { [key: string]: boolean } = {};
      for (const p of allPermissions) {
          permissionMap[p.tag] = user.allowedRoutes.includes(p.tag);
      }
      return { ...user, permissionMap };
  }

  onSavePermissions(user: any): void {
    this.savingState[user._id] = true;
    // Rebuild the allowedRoutes array from the map to ensure it's up to date
    user.allowedRoutes = Object.keys(user.permissionMap).filter(tag => user.permissionMap[tag]);
    
    this.permissionService.updateUserPermissions(user._id, user.allowedRoutes)
      .pipe(finalize(() => this.savingState[user._id] = false))
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: `Permissions for ${user.name} updated!` });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || 'Could not save changes.' });
        }
      });
  }

  toggleGroupPermissions(user: any, group: PermissionGroup, grant: boolean): void {
      group.permissions.forEach(p => {
          user.permissionMap[p.tag] = grant;
      });
  }
}

