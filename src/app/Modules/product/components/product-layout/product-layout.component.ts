// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-product-layout',
//   imports: [],
//   templateUrl: './product-layout.component.html',
//   styleUrl: './product-layout.component.css'
// })
// export class ProductLayoutComponent {

// }
import { Component } from '@angular/core';
import { ProductMasterComponent } from '../product-master/product-master.component';
import { ProductListComponent } from '../product-list/product-list.component';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Routes } from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
@Component({
    selector: 'app-product-layout',
    imports: [CommonModule, RouterModule, SelectButtonModule, FormsModule],
    templateUrl: './product-layout.component.html',
    styleUrl: './product-layout.component.css'
})

export class ProductLayoutComponent {
    activeComponent: any = ProductMasterComponent; 
    componentNavItems: any[] = [
      { label: 'Product Master', component: ProductMasterComponent },
      { label: 'Product List', component: ProductListComponent },
      { label: 'Product detail', component: ProductDetailComponent }
    ];

  navigateToComponent(component: any) {
    this.activeComponent = component;
  }
}


// // import { Component } from '@angular/core';
// import { ProductMasterComponent } from '../product-master/product-master.component';
// import { ProductListComponent } from '../product-list/product-list.component';
// import { ProductDetailComponent } from '../product-detail/product-detail.component';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { Routes } from '@angular/router';
// import { SelectButtonModule } from 'primeng/selectbutton';
// import { FormsModule } from '@angular/forms';
// import { CommonLayoutComponent } from "../../../../shared/components/common-layout/common-layout.component";
// @Component({
//   selector: 'app-product-layout',
//   standalone: true,
//   imports: [CommonModule, RouterModule, SelectButtonModule, FormsModule, CommonLayoutComponent],
//   templateUrl: './product-layout.component.html',
//   styleUrl: './product-layout.component.css'
// })

// export class ProductLayoutComponent {
//     activeComponent: any = ProductMasterComponent; 
//     componentNavItems: any[] = [
//       { label: 'Product Master', component: ProductMasterComponent },
//       { label: 'Product List', component: ProductListComponent       },
//       { label: 'Product detail', component: ProductDetailComponent }
//     ];



//   onComponentSelected(selectedComponent: any) {
//     this.activeComponent = selectedComponent;
//   }
// }