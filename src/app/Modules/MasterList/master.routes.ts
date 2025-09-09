import { Routes } from '@angular/router';
import { MasterListManagerComponent } from './MasterListManager/master-list-manager.component';
import { MasterListTypeManagerComponent } from './master-list-type-manager/master-list-type-manager.component';
import { MasterListItemManagerComponent } from './master-list-item-manager/master-list-item-manager.component';

export const MASTER_ROUTES: Routes = [
  { path: 'masterLists', component: MasterListManagerComponent },
  { path: 'masterListsType', component: MasterListTypeManagerComponent },
  { path: 'masterListsItem', component: MasterListItemManagerComponent },
  // { path: 'details', component: InvoiceDetailCardComponent },
];
