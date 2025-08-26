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
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-permission-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CheckboxModule,
    ToastModule,
    ProgressSpinnerModule,
    TooltipModule
  ],
  templateUrl: './permission-component.component.html',
  styleUrl: './permission-component.component.css'
})
export class PermissionComponentComponent implements OnInit {
  private messageService = inject(MessageService);
  private permissionService = inject(PermissionService);

  isLoading = true;
  error: string | null = null;
  users: any[] = []; // Use the extended interface
  permissions: Permission[] = [];
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
          this.permissions = permissionsRes.data;
          // Transform the user data to include the true/false permission map
          this.users = usersRes.data.map(user => this.createUserWithPermissionMap(user, permissionsRes.data));
        },
        error: (err) => {
          this.error = err.message || 'An unknown error occurred.';
          this.messageService.add({ severity: 'error', summary:  this.error??'Error', });
        }
      });
  }

  // Helper function to create the permission map for a user
  private createUserWithPermissionMap(user: User, allPermissions: Permission[]): any {
      const permissionMap: { [key: string]: boolean } = {};
      for (const p of allPermissions) {
          permissionMap[p.tag] = user.allowedRoutes.includes(p.tag);
      }
      return { ...user, permissionMap };
  }

  onSavePermissions(user: any): void {
    this.savingState[user._id] = true;
    // The allowedRoutes array is the source of truth for the backend
    const permissionsToSave = user.allowedRoutes;

    this.permissionService.updateUserPermissions(user._id, permissionsToSave)
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

  onPermissionChange(checked: boolean, user: any, permissionTag: string): void {
    // 1. Update the visual map for instant UI feedback
    user.permissionMap[permissionTag] = checked;

    // 2. Update the underlying allowedRoutes array that gets saved
    if (checked) {
      if (!user.allowedRoutes.includes(permissionTag)) {
        user.allowedRoutes.push(permissionTag);
      }
    } else {
      user.allowedRoutes = user.allowedRoutes.filter((p:any) => p !== permissionTag);
    }
  }
}



// /*
// ================================================================================
// File: /app/features/components/permissions/permission-component.component.ts
// ================================================================================
// */
// import { Component, inject, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { forkJoin } from 'rxjs';
// import { finalize } from 'rxjs/operators';
// import { MessageService } from 'primeng/api';
// import { PermissionService, User, Permission } from '../../../../core/services/permission.service';

// // PrimeNG Modules
// import { TableModule } from 'primeng/table';
// import { ButtonModule } from 'primeng/button';
// import { CheckboxModule } from 'primeng/checkbox';
// import { ToastModule } from 'primeng/toast';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { TooltipModule } from 'primeng/tooltip';

// @Component({
//   selector: 'app-permission-component',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     TableModule,
//     ButtonModule,
//     CheckboxModule,
//     ToastModule,
//     ProgressSpinnerModule,
//     TooltipModule
//   ],
//   templateUrl: './permission-component.component.html',
//   styleUrl: './permission-component.component.css'
// })
// export class PermissionComponentComponent implements OnInit {
//   private messageService = inject(MessageService);
//   private permissionService = inject(PermissionService);

//   isLoading = true;
//   error: string | null = null;
//   users: User[] = [];
//   permissions: Permission[] = [];
//   savingState: { [key: string]: boolean } = {};

//   ngOnInit(): void {
//     this.loadInitialData();
//   }

//   loadInitialData(): void {
//     this.isLoading = true;
//     this.error = null;

//     forkJoin({
//       permissionsRes: this.permissionService.getAllPermissions(),
//       usersRes: this.permissionService.getUsersWithPermissions()
//     })
//       .pipe(finalize(() => this.isLoading = false))
//       .subscribe({
//         next: ({ permissionsRes, usersRes }) => {
//           this.permissions = permissionsRes.data;
//           this.users = usersRes.data;
//         },
//         error: (err) => {
//           this.error = err.message || 'An unknown error occurred.';
//           this.messageService.add({ severity: 'error', summary: this.error ?? 'error' });
//         }
//       });
//   }

//   onSavePermissions(user: User): void {
//     this.savingState[user._id] = true;
//     const checkedPermissions = user.allowedRoutes;

//     this.permissionService.updateUserPermissions(user._id, checkedPermissions)
//       .pipe(finalize(() => this.savingState[user._id] = false))
//       .subscribe({
//         next: () => {
//           this.loadInitialData()
//           this.messageService.add({ severity: 'success', summary: 'Success', detail: `Permissions for ${user.name} updated!` });
//         },
//         error: (err) => {
//           this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || 'Could not save changes.' });
//         }
//       });
//   }

//   onPermissionChange(checked: boolean, user: User, permissionTag: string): void {
//     if (checked) {
//       if (!user.allowedRoutes.includes(permissionTag)) {
//         user.allowedRoutes.push(permissionTag);
//       }
//     } else {
//       user.allowedRoutes = user.allowedRoutes.filter(p => p !== permissionTag);
//     }
//   }

//   hasPermission(user: User, permissionTag: string): boolean {
//     return user.allowedRoutes.includes(permissionTag);
//   }
// }