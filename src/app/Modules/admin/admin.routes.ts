import { Routes } from '@angular/router';
// import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUserComponent } from './components/admin-user/admin-user.component';
import { AuthLogsComponent } from './components/Logs/auth-logs/auth-logs.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { PermissionComponentComponent } from './components/permission-component/permission-component.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { PurchaseorderService } from '../../core/services/purchaseorder.service';
import { PurchaseOrderDashboardComponent } from './purchase/product-incoming/product-incoming.component';
import { ReportSubscriptionComponent } from './components/report-subscription/report-subscription.component';
import { UserProfileComponent } from '../auth/components/user-profile/user-profile.component';
import { AdminDashboardComponent } from '../../admins/components/admin-dashboard/admin-dashboard.component';

export const ADMIN_ROUTES: Routes = [
    {
    path: 'profile',
    component: UserProfileComponent,
  },
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
  {
    path: 'permission', component: PermissionComponentComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'superAdmin'] }
  },
  {
    path: 'transaction', component: TransactionsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'superAdmin'] }
  },
  {
    path: 'purchase', component: PurchaseOrderDashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'superAdmin'] }
  },
  {
    path: 'subscribe', component: ReportSubscriptionComponent,
    // canActivate: [RoleGuard],
    // data: { roles: ['admin', 'superAdmin'] }
  },
];



