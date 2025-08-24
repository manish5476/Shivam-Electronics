import { Component } from '@angular/core';
import { HomePageComponent } from '../dashboard/home-page/home-page.component';
import { Router, NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { AppNavigationComponent } from '../../shared/Components/common-layout/common-layout.component';
import { GstInvoiceComponent } from '../../Modules/billing/components/gst-invoice/gst-invoice.component';
import { ProductListComponent } from '../../Modules/product/components/product-list/product-list.component';
import { ProductDetailComponent } from '../../Modules/product/components/product-detail/product-detail.component';
import { AdminDashboardComponent } from "../../Modules/admin/admin-dashboard/admin-dashboard.component";
@Component({
  selector: 'app-main-dashboard',
  imports: [CommonModule, SelectButtonModule, FormsModule, RouterModule,  AdminDashboardComponent],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.css'
})
export class MainDashboardComponent {
  showHeaderAndSidebar: boolean = true;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const noSidebarRoutes = ['/auth/login'];
        this.showHeaderAndSidebar = !noSidebarRoutes.includes(this.router.url);
      }
    });
  }

  activeComponent: any = HomePageComponent;
  componentNavItems: any[] = [
    { label: 'home', component: HomePageComponent },
    { label: 'invoice', component: GstInvoiceComponent }, // Corrected key
    { label: 'Product List', component: ProductListComponent },


  ];
  navigateToComponent(component: any) {
    this.activeComponent = component;
  }
}
