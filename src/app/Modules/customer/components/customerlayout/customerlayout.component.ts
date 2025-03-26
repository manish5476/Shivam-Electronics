// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-customerlayout',
//   imports: [],
//   templateUrl: './customerlayout.component.html',
//   styleUrl: './customerlayout.component.css'
// })
// export class CustomerlayoutComponent {

// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Routes } from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { CustomerMasterComponent } from '../customer-master/customer-master.component';
import { CustomerListComponent } from '../customer-list/customer-list.component';
import { CustomerdetailsComponent } from '../customerdetails/customerdetails.component';
import { SellersComponent } from '../../../seller/components/sellers/sellers.component';
import { SellersDetailsComponent } from '../../../seller/components/sellers-details/sellers-details.component';
import { SellersListsComponent } from '../../../seller/components/sellers-list/sellers-list.component';
import { CustomerDetailedListComponent } from '../customer-detailed-list/customer-detailed-list.component';
@Component({
  selector: 'app-customerlayout',
  imports: [CommonModule, RouterModule, SelectButtonModule, FormsModule],
  templateUrl: './customerlayout.component.html',
  styleUrl: './customerlayout.component.css'
})
export class CustomerlayoutComponent {
  activeComponent: any = CustomerMasterComponent;
  componentNavItems: any[] = [
    { label: 'Customer Master', component: CustomerMasterComponent },
    { label: 'Customer List', component: CustomerListComponent },
    // { label: 'customerDetails', component: CustomerdetailsComponent },
    { label: 'customer Details lsit', component: CustomerDetailedListComponent },
    { label: 'Seller Mater', component: SellersComponent },
    { label: 'Seller details', component: SellersDetailsComponent },
    { label: 'Seller List', component: SellersListsComponent },


  ];

  navigateToComponent(component: any) {
    this.activeComponent = component;
  }
}

