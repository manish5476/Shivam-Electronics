import { Routes } from '@angular/router';
import { ProductMasterComponent } from './components/product-master/product-master.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

export const PRODUCT_ROUTES: Routes = [
  { path: 'master', component: ProductMasterComponent },
  { path: 'detail', component: ProductDetailComponent },
];
