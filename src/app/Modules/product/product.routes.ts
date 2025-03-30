import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductMasterComponent } from './components/product-master/product-master.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

export const PRODUCT_ROUTES: Routes = [
  { path: 'list', component: ProductListComponent },
  { path: 'master', component: ProductMasterComponent },
  { path: 'detail/:id', component: ProductDetailComponent },
];
