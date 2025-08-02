import { Routes } from '@angular/router';
import { SellersComponent } from './components/sellers/sellers.component';
import { SellersDetailsComponent } from './components/sellers-details/sellers-details.component';

export const SELLER_ROUTES: Routes = [
  { path: 'Seller', component: SellersComponent },
  { path: 'Sellerdetails', component: SellersDetailsComponent },
];
