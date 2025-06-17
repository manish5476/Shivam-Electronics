import { Routes } from '@angular/router';
import { DashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUserComponent } from './components/admin-user/admin-user.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AuthLogsComponent } from './components/Logs/auth-logs/auth-logs.component';

export const ADMIN_ROUTES: Routes = [
  { path: 'adminDashboard', component: AdminDashboardComponent },
  { path: 'users', component: AdminUserComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'logs', component: AuthLogsComponent },

];
