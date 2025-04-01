import { Routes } from '@angular/router';
import { AdminDashboardsComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUserComponent } from './components/admin-user/admin-user.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

export const ADMIN_ROUTES: Routes = [
  { path: 'adminDashboard', component: AdminDashboardComponent },
  { path: 'users', component: AdminUserComponent },
  { path: 'adusers', component: AdminDashboardsComponent },
];
