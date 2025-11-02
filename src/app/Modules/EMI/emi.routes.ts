import { Routes } from '@angular/router';
import { EmiCreateComponent } from './create-emi/create-emi.component';
import { EmiDashboardComponent } from './emi-dashboard/emi-dashboard.component';

export const EMI_ROUTES: Routes = [
  { path: 'create', component: EmiCreateComponent },
  { path: 'emidashboard', component: EmiDashboardComponent },

];
