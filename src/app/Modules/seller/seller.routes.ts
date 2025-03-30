import { Routes } from '@angular/router';
import { SellersComponent } from './components/sellers/sellers.component';
import { SellersDetailsComponent } from './components/sellers-details/sellers-details.component';
import { SellersListsComponent } from './components/sellers-list/sellers-list.component';

export const SELLER_ROUTES: Routes = [
  { path: 'Seller', component: SellersComponent },
  { path: 'Seller details', component: SellersDetailsComponent },
  { path: 'Seller List', component: SellersListsComponent },
];
