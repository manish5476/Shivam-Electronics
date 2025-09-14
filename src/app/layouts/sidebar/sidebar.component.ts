import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() isPinned: boolean = false;
  @Input() isHovered: boolean = false;
  @Output() pinToggle = new EventEmitter<void>();
  @Output() mouseEnter = new EventEmitter<void>();
  @Output() mouseEnterTriggerZone = new EventEmitter<void>();
  @Output() mouseLeave = new EventEmitter<void>();

  expandedItems: boolean[] = [];

menuItems = [
    // {
    //   label: 'Master', icon: 'pi pi-database',
    //   items: [
    //     { label: 'Manager', icon: 'pi pi-sitemap', routerLink: ['/master/masterLists'] },
    //     { label: 'Type', icon: 'pi pi-tags', routerLink: ['/master/masterListsType'] },
    //     { label: 'Item', icon: 'pi pi-list', routerLink: ['/master/masterListsItem'] },
    //   ]
    // },
    {
      label: 'Admin', icon: 'pi pi-shield',
      items: [
        { label: 'Dashboard', icon: 'pi pi-chart-bar', routerLink: ['/admin/dashboard'] },
        { label: 'Users', icon: 'pi pi-users', routerLink: ['/admin/users'] },
        { label: 'Logs', icon: 'pi pi-history', routerLink: ['/admin/logs'] },
        { label: 'Transaction', icon: 'pi pi-receipt', routerLink: ['/admin/transaction'] },
        { label: 'Permission', icon: 'pi pi-key', routerLink: ['/admin/permission'] },
        { label: 'Purchase', icon: 'pi pi-shopping-cart', routerLink: ['/admin/purchase'] },
        { label: 'Subscribe', icon: 'pi pi-bell', routerLink: ['/admin/subscribe'] },
      ]
    },
    {
      label: 'Customers', icon: 'pi pi-users',
      items: [
        { label: 'List', icon: 'pi pi-list', routerLink: ['/customers/list'] },
        { label: 'Master', icon: 'pi pi-cog', routerLink: ['/customers/master'] },
        { label: 'Details', icon: 'pi pi-info-circle', routerLink: ['/customers/detailed'] },
        { label: 'Segment', icon: 'pi pi-chart-pie', routerLink: ['/customers/segment'] },
      ]
    },
    {
      label: 'Products', icon: 'pi pi-shopping-bag',
      items: [
        { label: 'Product List', icon: 'pi pi-list', routerLink: ['/products/list'] },
        { label: 'Product Master', icon: 'pi pi-cog', routerLink: ['/products/master'] },
        { label: 'Product Details', icon: 'pi pi-info-circle', routerLink: ['/products/detail'] }
      ]
    },
    {
      label: 'Sellers', icon: 'pi pi-briefcase',
      items: [
        { label: 'Seller', icon: 'pi pi-id-card', routerLink: ['/sellers/Seller'] },
        { label: 'Seller Details', icon: 'pi pi-user-edit', routerLink: ['/sellers/Sellerdetails'] },
      ]
    },
    {
      label: 'Invoices', icon: 'pi pi-file',
      items: [
        { label: 'View Invoice', icon: 'pi pi-eye', routerLink: ['/invoices/view'] },
        { label: 'Create Invoice', icon: 'pi pi-plus-circle', routerLink: ['/invoices/create'] },
        { label: 'Invoice Details', icon: 'pi pi-file-edit', routerLink: ['/invoices/details'] }
      ]
    },
    {
      label: 'Payments', icon: 'pi pi-wallet',
      items: [
        { label: 'Payment', icon: 'pi pi-money-bill', routerLink: ['/payment/payment'] },
        { label: 'View Payment', icon: 'pi pi-eye', routerLink: ['/payment/paymentView'] },
        { label: 'Payment List', icon: 'pi pi-list', routerLink: ['/payment/paymentList'] }
      ]
    }
  ];
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.expandedItems = new Array(this.menuItems.length).fill(false);
  }

  toggleMenuItem(index: number) {
    // Only toggle if the item has a sub-menu
    if (this.menuItems[index].items) {
      this.expandedItems[index] = !this.expandedItems[index];
    }
  }

  logout() {
    this.authService.logout();
  }
}

// import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ButtonModule } from 'primeng/button';
// import { AvatarModule } from 'primeng/avatar';
// import { RouterModule } from '@angular/router';
// import { AuthService, User } from '../../core/services/auth.service'; // Import User
// import { Observable } from 'rxjs';

// @Component({
//   selector: 'app-sidebar',
//   standalone: true,
//   imports: [CommonModule, ButtonModule, AvatarModule, RouterModule],
//   templateUrl: './sidebar.component.html',
//   styleUrls: ['./sidebar.component.css']
// })
// export class SidebarComponent implements OnInit {
//   @Input() isPinned: boolean = false;
//   @Input() isHovered: boolean = false;
//   @Output() pinToggle = new EventEmitter<void>();
//   @Output() mouseEnter = new EventEmitter<void>();
//   @Output() mouseEnterTriggerZone = new EventEmitter<void>();
//   @Output() mouseLeave = new EventEmitter<void>();
//   user: any;
//   expandedItems: boolean[] = [];
//   menuItems = [
//     { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/dashboard'] },
//     {
//       label: 'Admin', icon: 'pi pi-lock', items: [
//         { label: 'Admin Dashboard', icon: 'pi pi-th-large', routerLink: ['/admin/dashboard'] },
//         { label: 'Users', icon: 'pi pi-user', routerLink: ['/admin/users'] },
//         { label: 'Logs', icon: 'pi pi-database', routerLink: ['/admin/logs'] }
//       ]
//     },
//     {
//       label: 'Customers', icon: 'pi pi-users', items: [
//         { label: 'List', icon: 'pi pi-list', routerLink: ['/customers/list'] },
//         { label: 'Master', icon: 'pi pi-cog', routerLink: ['/customers/master'] },
//         { label: 'Details', icon: 'pi pi-info-circle', routerLink: ['/customers/detailed'] },
//         // { label: 'Detailed List', icon: 'pi pi-th-list', routerLink: ['/customers/detailed'] }
//       ]
//     },
//     {
//       label: 'Products', icon: 'pi pi-shopping-bag', items: [
//         { label: 'Product List', icon: 'pi pi-list', routerLink: ['/products/list'] },
//         { label: 'Product Master', icon: 'pi pi-cog', routerLink: ['/products/master'] },
//         { label: 'Product Details', icon: 'pi pi-info-circle', routerLink: ['/products/detail'] }
//       ]
//     },
//     {
//       label: 'Sellers', icon: 'pi pi-briefcase', items: [
//         { label: 'Seller', icon: 'pi pi-id-card', routerLink: ['/sellers/Seller'] },
//         { label: 'Seller Details', icon: 'pi pi-user-edit', routerLink: ['/sellers/Sellerdetails'] },
//         // { label: 'Seller List', icon: 'pi pi-th-large', routerLink: ['/sellers/SellerList'] }
//       ]
//     },
//     {
//       label: 'Invoices', icon: 'pi pi-file', items: [
//         { label: 'View Invoice', icon: 'pi pi-eye', routerLink: ['/invoices/view'] },
//         { label: 'Create Invoice', icon: 'pi pi-plus-circle', routerLink: ['/invoices/create'] },
//         { label: 'Invoice Details', icon: 'pi pi-file-edit', routerLink: ['/invoices/details'] }
//       ]
//     },
//     {
//       label: 'Payments', icon: 'pi pi-wallet', items: [
//         { label: 'Payment', icon: 'pi pi-money-bill', routerLink: ['/payment/payment'] },
//         { label: 'View Payment', icon: 'pi pi-eye', routerLink: ['/payment/paymentView'] },
//         { label: 'Payment List', icon: 'pi pi-list', routerLink: ['/payment/paymentList'] }
//       ]
//     }
//   ];

//  // Use the currentUser$ observable
//   currentUser$: Observable<User | null>;

//   constructor(private authService: AuthService) {
//     this.currentUser$ = this.authService.currentUser$;
//   }

//   ngOnInit() {
//     this.expandedItems = new Array(this.menuItems.length).fill(false);
//   }

//   toggleMenuItem(index: number) {
//     if (this.menuItems[index].items) {
//       this.expandedItems[index] = !this.expandedItems[index];
//     }
//   }

//   logout() {
//     this.authService.logout();
//   }
// }
  // menuItems = [
  //   {
  //     label: 'Master', icon: 'pi pi-home', items: [
  //       { label: 'MasterList Manager', icon: 'pi pi-th-large', routerLink: ['/master/masterLists'] },
  //       { label: 'MasterList Type', icon: 'pi pi-th-large', routerLink: ['/master/masterListsType'] },
  //       { label: 'MasterList Item', icon: 'pi pi-th-large', routerLink: ['/master/masterListsItem'] },
  //     ]
  //   },
  //   {
  //     label: 'Admin', icon: 'pi pi-lock', items: [
  //       { label: 'Admin Dashboard', icon: 'pi pi-th-large', routerLink: ['/admin/dashboard'] },
  //       { label: 'Users', icon: 'pi pi-user', routerLink: ['/admin/users'] },
  //       { label: 'Logs', icon: 'pi pi-database', routerLink: ['/admin/logs'] },
  //       { label: 'transaction', icon: 'pi pi-list', routerLink: ['/admin/transaction'] },
  //       { label: 'permission', icon: 'pi pi-access', routerLink: ['/admin/permission'] },
  //       { label: 'purchase', icon: 'pi pi-bill', routerLink: ['/admin/purchase'] },
  //       { label: 'subscribe', icon: 'pi pi-database', routerLink: ['/admin/subscribe'] },
  //     ]
  //   },
  //   {
  //     label: 'Customers', icon: 'pi pi-users', items: [
  //       { label: 'List', icon: 'pi pi-list', routerLink: ['/customers/list'] },
  //       { label: 'Master', icon: 'pi pi-cog', routerLink: ['/customers/master'] },
  //       { label: 'Details', icon: 'pi pi-info-circle', routerLink: ['/customers/detailed'] },
  //       // { label: 'snapshot', icon: 'pi pi-info-circle', routerLink: ['/customers/snapshot'] },
  //       { label: 'segment', icon: 'pi pi-info-circle', routerLink: ['/customers/segment'] },
  //     ]
  //   },
  //   {
  //     label: 'Products', icon: 'pi pi-shopping-bag', items: [
  //       { label: 'Product List', icon: 'pi pi-list', routerLink: ['/products/list'] },
  //       { label: 'Product Master', icon: 'pi pi-cog', routerLink: ['/products/master'] },
  //       { label: 'Product Details', icon: 'pi pi-info-circle', routerLink: ['/products/detail'] }
  //     ]
  //   },
  //   {
  //     label: 'Sellers', icon: 'pi pi-briefcase', items: [
  //       { label: 'Seller', icon: 'pi pi-id-card', routerLink: ['/sellers/Seller'] },
  //       { label: 'Seller Details', icon: 'pi pi-user-edit', routerLink: ['/sellers/Sellerdetails'] },
  //     ]
  //   },
  //   {
  //     label: 'Invoices', icon: 'pi pi-file', items: [
  //       { label: 'View Invoice', icon: 'pi pi-eye', routerLink: ['/invoices/view'] },
  //       { label: 'Create Invoice', icon: 'pi pi-plus-circle', routerLink: ['/invoices/create'] },
  //       { label: 'Invoice Details', icon: 'pi pi-file-edit', routerLink: ['/invoices/details'] }
  //     ]
  //   },
  //   {
  //     label: 'Payments', icon: 'pi pi-wallet', items: [
  //       { label: 'Payment', icon: 'pi pi-money-bill', routerLink: ['/payment/payment'] },
  //       { label: 'View Payment', icon: 'pi pi-eye', routerLink: ['/payment/paymentView'] },
  //       { label: 'Payment List', icon: 'pi pi-list', routerLink: ['/payment/paymentList'] }
  //     ]
  //   }
  // ];