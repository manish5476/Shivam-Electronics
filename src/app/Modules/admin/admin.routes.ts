import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUserComponent } from './components/admin-user/admin-user.component';
import { AuthLogsComponent } from './components/Logs/auth-logs/auth-logs.component';
import { RoleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'users', component: AdminUserComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'superAdmin'] }
  },
  {
    path: 'dashboard', component: AdminDashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'superAdmin'] }
  },
  {
    path: 'logs', component: AuthLogsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'superAdmin'] }
  },
];



