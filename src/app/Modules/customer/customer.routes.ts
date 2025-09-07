import { Routes } from '@angular/router';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { CustomerMasterComponent } from './components/customer-master/customer-master.component';
import { CustomerDetailedListComponent } from './components/customer-detailed-list/customer-detailed-list.component';
import { CustomerSnapshotComponent } from './customer-snapshot/customer-snapshot.component';
import { CustomerSegmentsComponent } from './components/customer-segments/customer-segments.component';

export const CUSTOMER_ROUTES: Routes = [
  { path: 'list', component: CustomerListComponent },
  { path: 'master', component: CustomerMasterComponent },
  { path: 'detailed', component: CustomerDetailedListComponent },
  { path: 'snapshot', component: CustomerSnapshotComponent },
  { path: 'segment', component: CustomerSegmentsComponent },
];
