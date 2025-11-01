import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { PermissionService, User, Permission } from '../../../../core/services/permission.service';

// PrimeNG Modules used
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

interface UserWithPermissions extends User {
  permissionMap: { [key: string]: boolean };
  originalPermissionMap: { [key: string]: boolean };
  isDirty: boolean;
  color: string;
  expanded: boolean;
  allPermissionsEnabled: boolean;
}

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
    ButtonModule,
    InputSwitchModule,
    CheckboxModule,
    ToastModule,
    ProgressSpinnerModule,
    TooltipModule,
    TagModule
  ],
  templateUrl: './permission-component.component.html',
  styleUrls: ['./permission-component.component.css'],
  providers: [MessageService]
})
export class PermissionComponentComponent implements OnInit {
  private messageService = inject(MessageService);
  private permissionService = inject(PermissionService);

  isLoading = true;
  error: string | null = null;
  users: UserWithPermissions[] = [];
  permissionGroups: PermissionGroup[] = [];
  savingState: { [key: string]: boolean } = {};
  totalColumns = 2;

  ngOnInit(): void {
    this.loadInitialData();
  }

  /* ---------- Helpers ---------- */

  getInitials(name: string): string {
    if (!name) return '';
    const names = name.trim().split(' ');
    const initials = names.map(n => n[0]).join('');
    return (initials.length > 2 ? initials.substring(0, 2) : initials).toUpperCase();
  }

  getUserColor(name: string): string {
    const colors = ["#ef4444", "#f97316", "#84cc16", "#10b981", "#06b6d4", "#6366f1", "#d946ef", "#f43f5e"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getRoleSeverity(role: string) {
    switch (role) {
      case 'admin': return 'info';
      case 'superAdmin': return 'success';
      default: return 'warning';
    }
  }

  /* ---------- Data loading ---------- */

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
          const allPermissions = permissionsRes.data;
          this.permissionGroups = this.groupPermissions(allPermissions);
          this.users = usersRes.data.map(user => this.createUserState(user, allPermissions));
          this.totalColumns = this.permissionGroups.reduce((acc, g) => acc + g.permissions.length, 0) + 2;
        },
        error: (err) => {
          this.error = err.message || 'An unknown error occurred.';
          this.messageService.add({ severity: 'error', summary: 'Loading Failed'});
        }
      });
  }

  private groupPermissions(permissions: Permission[]): PermissionGroup[] {
    const groups = permissions.reduce((acc, p) => {
      const groupName = p.tag.split(':')[0];
      acc[groupName] = acc[groupName] || [];
      acc[groupName].push(p);
      return acc;
    }, {} as { [key: string]: Permission[] });

    return Object.keys(groups).map(name => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      permissions: groups[name]
    }));
  }

  private createUserState(user: User, allPermissions: Permission[]): UserWithPermissions {
    const permissionMap: { [key: string]: boolean } = {};
    allPermissions.forEach(p => {
      permissionMap[p.tag] = user.allowedRoutes.includes(p.tag);
    });
    const allEnabled = Object.values(permissionMap).every(v => v === true);
    return {
      ...user,
      permissionMap,
      originalPermissionMap: { ...permissionMap },
      isDirty: false,
      color: this.getUserColor(user.name),
      expanded: false,
      allPermissionsEnabled: allEnabled
    };
  }

  /* ---------- Interaction handlers ---------- */

  onPermissionChange(user: UserWithPermissions): void {
    user.allPermissionsEnabled = Object.values(user.permissionMap).every(v => v === true);
    user.isDirty = JSON.stringify(user.permissionMap) !== JSON.stringify(user.originalPermissionMap);
  }

onToggleAllPermissions(user: UserWithPermissions): void {
  Object.keys(user.permissionMap).forEach(tag => {
    user.permissionMap[tag] = user.allPermissionsEnabled;
  });
  this.onPermissionChange(user);
}


  onSavePermissions(user: UserWithPermissions): void {
    if (!user.isDirty) return;
    this.savingState[user._id] = true;
    const updatedRoutes = Object.keys(user.permissionMap).filter(tag => user.permissionMap[tag]);

    this.permissionService.updateUserPermissions(user._id, updatedRoutes)
      .pipe(finalize(() => this.savingState[user._id] = false))
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: `Permissions for ${user.name} updated.` });
          user.originalPermissionMap = { ...user.permissionMap };
          user.isDirty = false;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Save Error', detail: err.message || 'Could not save permissions.' });
        }
      });
  }

  toggleGroupPermissions(group: PermissionGroup, grant: boolean): void {
    this.users.forEach(user => {
      if (user.role !== 'superAdmin' && user.role !== 'admin') {
        group.permissions.forEach(p => {
          user.permissionMap[p.tag] = grant;
        });
        this.onPermissionChange(user);
      }
    });
  }
}


// import { Component, inject, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { forkJoin } from 'rxjs';
// import { finalize } from 'rxjs/operators';
// import { MessageService } from 'primeng/api';
// import { PermissionService, User, Permission } from '../../../../core/services/permission.service';
// import { AccordionModule } from 'primeng/accordion';
// // PrimeNG Modules
// import { TableModule } from 'primeng/table';
// import { ButtonModule } from 'primeng/button';
// import { InputSwitchModule } from 'primeng/inputswitch';
// import { ToastModule } from 'primeng/toast';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { TooltipModule } from 'primeng/tooltip';
// import { DividerModule } from "primeng/divider";
// import { TagModule } from "primeng/tag";

// interface UserWithPermissions extends User {
//   permissionMap: { [key: string]: boolean };
//   originalPermissionMap: { [key: string]: boolean };
//   isDirty: boolean;
//   color: string;
//   expanded: boolean; // ✅ Add this line
// }


// interface PermissionGroup {
//   name: string;
//   permissions: Permission[];
// }

// @Component({
//   selector: 'app-permission-component',
//   standalone: true,
//   imports: [
//     CommonModule,AccordionModule,
//     FormsModule,
//     TableModule,
//     ButtonModule,
//     InputSwitchModule,
//     ToastModule,
//     ProgressSpinnerModule,
//     TooltipModule,
//     DividerModule,
//     TagModule
//   ],
//   templateUrl: './permission-component.component.html',
//   styleUrl: './permission-component.component.css'
// })
// export class PermissionComponentComponent implements OnInit {
//   private messageService = inject(MessageService);
//   private permissionService = inject(PermissionService);

//   isLoading = true;
//   error: string | null = null;
//   users: UserWithPermissions[] = [];
//   permissionGroups: PermissionGroup[] = [];
//   savingState: { [key: string]: boolean } = {};
//   totalColumns = 2;

//   ngOnInit(): void {
//     this.loadInitialData();
//   }
//   getRoleSeverity(role: string) {
//   switch (role) {
//     case 'admin':
//       return 'info';
//     case 'superAdmin':
//       return 'success';
//     default:
//       return 'warning';
//   }
// }




//   getInitials(name: string): string {
//     if (!name) return '';
//     const names = name.trim().split(' ');
//     const initials = names.map(n => n[0]).join('');
//     return (initials.length > 2 ? initials.substring(0, 2) : initials).toUpperCase();
//   }

//   getUserColor(name: string): string {
//     const colors = ["#ef4444", "#f97316", "#84cc16", "#10b981", "#06b6d4", "#6366f1", "#d946ef", "#f43f5e"];
//     let hash = 0;
//     for (let i = 0; i < name.length; i++) {
//       hash = name.charCodeAt(i) + ((hash << 5) - hash);
//     }
//     return colors[Math.abs(hash) % colors.length];
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
//           const allPermissions = permissionsRes.data;
//           this.permissionGroups = this.groupPermissions(allPermissions);
//           this.users = usersRes.data.map(user => this.createUserState(user, allPermissions));
//           this.totalColumns = this.permissionGroups.reduce((acc, g) => acc + g.permissions.length, 0) + 2;
//         },
//         error: (err) => {
//           this.error = err.message || 'An unknown error occurred.';
//           this.messageService.add({ severity: 'error', summary: 'Loading Failed' });
//         }
//       });
//   }

//   private groupPermissions(permissions: Permission[]): PermissionGroup[] {
//     const groups = permissions.reduce((acc, p) => {
//       const groupName = p.tag.split(':')[0];
//       acc[groupName] = acc[groupName] || [];
//       acc[groupName].push(p);
//       return acc;
//     }, {} as { [key: string]: Permission[] });

//     return Object.keys(groups).map(name => ({
//       name: name.charAt(0).toUpperCase() + name.slice(1),
//       permissions: groups[name]
//     }));
//   }



//   onPermissionChange(user: UserWithPermissions): void {
//     // user.isDirty = true;
//     user.isDirty = JSON.stringify(user.permissionMap) !== JSON.stringify(user.originalPermissionMap);
//   }
// //   onPermissionChange(user: any) {
// //   user.isDirty = true;
// // }

//   onSavePermissions(user: UserWithPermissions): void {
//     if (!user.isDirty) return;
//     this.savingState[user._id] = true;
//     const updatedRoutes = Object.keys(user.permissionMap).filter(tag => user.permissionMap[tag]);

//     this.permissionService.updateUserPermissions(user._id, updatedRoutes)
//       .pipe(finalize(() => this.savingState[user._id] = false))
//       .subscribe({
//         next: () => {
//           this.messageService.add({ severity: 'success', summary: 'Success', detail: `Permissions for ${user.name} updated.` });
//           user.originalPermissionMap = { ...user.permissionMap };
//           user.isDirty = false;
//         },
//         error: (err) => {
//           this.messageService.add({ severity: 'error', summary: 'Save Error', detail: err.message || 'Could not save permissions.' });
//         }
//       });
//   }

//   toggleGroupPermissions(group: PermissionGroup, grant: boolean): void {
//     this.users.forEach(user => {
//       if (user.role !== 'superAdmin' && user.role !== 'admin') {
//         group.permissions.forEach(p => {
//           user.permissionMap[p.tag] = grant;
//         });
//         this.onPermissionChange(user);
//       }
//     });
//   }


// private createUserState(user: User, allPermissions: Permission[]): UserWithPermissions {
//   const permissionMap: { [key: string]: boolean } = {};
//   allPermissions.forEach(p => {
//     permissionMap[p.tag] = user.allowedRoutes.includes(p.tag);
//   });
//   return {
//     ...user,
//     permissionMap,
//     originalPermissionMap: { ...permissionMap },
//     isDirty: false,
//     color: this.getUserColor(user.name),
//     expanded: false // ✅ Add this property
//   };
// }


//   // private createUserState(user: User, allPermissions: Permission[]): UserWithPermissions {
//   //   const permissionMap: { [key: string]: boolean } = {};
//   //   allPermissions.forEach(p => {
//   //     permissionMap[p.tag] = user.allowedRoutes.includes(p.tag);
//   //   });
//   //   return {
//   //     ...user,
//   //     permissionMap,
//   //     originalPermissionMap: { ...permissionMap },
//   //     isDirty: false,
//   //     color: this.getUserColor(user.name)
//   //   };
//   // }

// }
