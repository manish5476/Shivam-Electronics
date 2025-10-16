import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/Components/notfound/notfound.component';
import { AuthGuard } from './core/guards/authguard.guard';
import { MainLayoutComponent } from './layouts/mainlayout/mainlayout.component';
import { MainDashboardComponent } from './layouts/main-dashboard/main-dashboard.component';
import { AuthResolver } from './core/auth.resolver';
import { HomePageComponent } from './layouts/dashboard/home-page/home-page.component';
import { UserProfileComponent } from './Modules/auth/components/user-profile/user-profile.component';
import { AdminDashboardComponent } from './Modules/admin/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./Modules/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    resolve: { isAuthenticated: AuthResolver },
    children: [
      { path: '', component: AdminDashboardComponent }, // default (can keep or change)
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'home', component: HomePageComponent }, // 👈 add this
      {
        path: 'admin',
        loadChildren: () =>
          import('./Modules/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: 'payment',
        loadChildren: () =>
          import('./Modules/payment/payment.routes').then(
            (m) => m.PAYMENT_ROUTES,
          ),
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./Modules/customer/customer.routes').then(
            (m) => m.CUSTOMER_ROUTES,
          ),
      },
      {
        path: 'sellers',
        loadChildren: () =>
          import('./Modules/seller/seller.routes').then((m) => m.SELLER_ROUTES),
      },
      {
        path: 'invoices',
        loadChildren: () =>
          import('./Modules/billing/billing.routes').then(
            (m) => m.BILLING_ROUTES,
          ),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./Modules/product/product.routes').then(
            (m) => m.PRODUCT_ROUTES,
          ),
      },
      {
        path: 'master',
        loadChildren: () =>
          import('./Modules/MasterList/master.routes').then(
            (m) => m.MASTER_ROUTES,
          ),
      },
      {
        path: 'personalInfo',
        loadChildren: () =>
          import('./Modules/PersonalInfo/personalinfo.routes').then(
            (m) => m.PERSONAL_INFO,
          ),
      },
      { path: '**', component: NotFoundComponent },
    ],
  },
];

// export const routes: Routes = [
//   {
//     path: 'auth',
//     loadChildren: () => import('./Modules/auth/auth.routes').then(m => m.AUTH_ROUTES),
//   },
//   {
//     path: '',
//     component: MainLayoutComponent,
//     canActivate: [AuthGuard],
//     resolve: { isAuthenticated: AuthResolver },
//     children: [
//       { path: '', component: MainDashboardComponent },
//       { path: 'dashboard', component: MainDashboardComponent },
//       {
//         path: 'admin',
//         loadChildren: () => import('./Modules/admin/admin.routes').then(m => m.ADMIN_ROUTES),
//       },
//       {
//         path: 'payment',
//         loadChildren: () => import('./Modules/payment/payment.routes').then(m => m.PAYMENT_ROUTES),
//       },
//       {
//         path: 'customers',
//         loadChildren: () => import('./Modules/customer/customer.routes').then(m => m.CUSTOMER_ROUTES),
//       },
//       {
//         path: 'sellers',
//         loadChildren: () => import('./Modules/seller/seller.routes').then(m => m.SELLER_ROUTES),
//       },
//       {
//         path: 'invoices',
//         loadChildren: () => import('./Modules/billing/billing.routes').then(m => m.BILLING_ROUTES),
//       },
//       {
//         path: 'products',
//         loadChildren: () => import('./Modules/product/product.routes').then(m => m.PRODUCT_ROUTES),
//       },
//       {
//         path: 'personalInfo',
//         loadChildren: () => import('./Modules/PersonalInfo/personalinfo.routes').then(m => m.PERSONAL_INFO),
//       },
//       { path: '**', component: NotFoundComponent },
//     ],
//   },
// ];

// import { Routes } from '@angular/router';
// import { NotFoundComponent } from './shared/Components/notfound/notfound.component';
// import { AuthGuard } from './core/guards/authguard.guard';
// import { MainLayoutComponent } from './layouts/mainlayout/mainlayout.component';
// import { MainDashboardComponent } from './layouts/main-dashboard/main-dashboard.component';
// import { AuthResolver } from './core/auth.resolver';
// export const routes: Routes = [
//   { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
//   // Lazy Load Auth Routes
//   { path: 'auth', loadChildren: () => import('./Modules/auth/auth.routes').then(m => m.AUTH_ROUTES) },
//   {
//     path: '',
//     component: MainLayoutComponent,
//     // Remove AuthGuard here
//     resolve: { isAuthenticated: AuthResolver }, // Add the resolver
//     children: [
//       { path: 'dashboard', component: MainLayoutComponent },
//       // Lazy Load Other Modules
//       { path: 'admin', loadChildren: () => import('./Modules/admin/admin.routes').then(m => m.ADMIN_ROUTES) },
//       { path: 'payment', loadChildren: () => import('./Modules/payment/payment.routes').then(m => m.PAYMENT_ROUTES) },
//       { path: 'customers', loadChildren: () => import('./Modules/customer/customer.routes').then(m => m.CUSTOMER_ROUTES) },
//       { path: 'sellers', loadChildren: () => import('./Modules/seller/seller.routes').then(m => m.SELLER_ROUTES) },
//       { path: 'invoices', loadChildren: () => import('./Modules/billing/billing.routes').then(m => m.BILLING_ROUTES) },
//       { path: 'products', loadChildren: () => import('./Modules/product/product.routes').then(m => m.PRODUCT_ROUTES) },
//       { path: 'personalInfo', loadChildren: () => import('./Modules/PersonalInfo/personalinfo.routes').then(m => m.PERSONAL_INFO) },
//       // 404 Page inside MainLayout
//       { path: '**', component: NotFoundComponent },
//     ],
//   },
// ];
