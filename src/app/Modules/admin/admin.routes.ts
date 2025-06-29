import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUserComponent } from './components/admin-user/admin-user.component';
import { AuthLogsComponent } from './components/Logs/auth-logs/auth-logs.component';

export const ADMIN_ROUTES: Routes = [
   { path: 'users', component: AdminUserComponent },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'logs', component: AuthLogsComponent },

];
