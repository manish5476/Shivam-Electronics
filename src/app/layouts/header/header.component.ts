// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-header',
// //   imports: [],
// //   templateUrl: './header.component.html',
// //   styleUrl: './header.component.css'
// // })
// // export class HeaderComponent {

// // }
// import { Component, ViewChild } from '@angular/core';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { DrawerModule } from 'primeng/drawer';
// import { CommonModule } from '@angular/common';
// import { TieredMenu } from 'primeng/tieredmenu';
// import { MenuItem } from 'primeng/api';
// import { RouterModule } from '@angular/router';
// import { Ripple } from 'primeng/ripple';
// import { AvatarModule } from 'primeng/avatar';
// import { StyleClass } from 'primeng/styleclass';
// import { Drawer } from 'primeng/drawer';
// import { ThemeService } from '../../core/services/theme.service';
// import { PanelMenuModule } from 'primeng/panelmenu';
// import { AuthService } from '../../core/services/auth.service';
// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [
//     ButtonModule,
//     CommonModule,
//     DrawerModule,
//     AvatarModule,
//     InputTextModule, PanelMenuModule,
//     RouterModule,
//   ],
//   templateUrl: './header.component.html',
//   styleUrls: ['./header.component.css'],
// })
// export class HeaderComponent {

//   visibles: boolean = false;
//   user: any;
//   showPanel() {
//     this.visibles = !this.visibles
//   }

//   shownotificationdropdown = false;
//   appsdropdown = false;
//   openUserDrop = false;
//   visible = false;
//   position = 'topright';
//   themeLabel = 'Dark Mode';
//   isMobileMenuOpen = false; // State for the mobile menu visibility

//   @ViewChild('drawerRef') drawerRef!: Drawer;
//   menuItemss: ({ label: string; icon: string; routerLink: string[]; items?: undefined; } | { label: string; icon: string; items: { label: string; icon: string; routerLink: string[]; }[]; routerLink?: undefined; })[] | undefined;

//   constructor(private themeService: ThemeService, private authService: AuthService) {
//     this.themeLabel = localStorage.getItem('theme') === 'dark' ? 'Light Mode' : 'Dark Mode';
//   }

//   logout() {
//     this.authService.logout()
//   }
//   onColorChange(event: any) {
//     const selectedColor = event.target.value;
//     this.themeService.updateGradient(selectedColor);
//   }
//   // onColorChange(event: any) {
//   //   const selectedColor = event.target.value;
//   //   this.themeService.updateGradient(selectedColor); // Update gradient via service
//   // }

//   toggleTheme(): void {
//     this.themeService.toggleTheme();
//     this.themeLabel = this.themeLabel === 'Dark Mode' ? 'Light Mode' : 'Dark Mode';
//   }
//   // This method replaces the combined openUserDropDown/showPanel logic
//   toggleMobileMenu(): void {
//     this.isMobileMenuOpen = !this.isMobileMenuOpen;
//   }

//   toggleNotificationDropdown() {
//     this.shownotificationdropdown = !this.shownotificationdropdown;
//   }

//   toggleAppDropDown() {
//     this.appsdropdown = !this.appsdropdown;
//   }

//   openUserDropDown() {
//     this.openUserDrop = !this.openUserDrop;
//   }

//   showDialog(position: string) {
//     this.position = position;
//     this.visible = true;
//   }

//   closeCallback(e: Event): void {
//     this.drawerRef.close(e);
//   }

//   menuItems: MenuItem[] = [];


//   ngOnInit() {
//     this.user = this.authService.getItem('user');

//     this.menuItemss = [
//       { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/dashboard'] },
//       {
//         label: 'Admin',
//         icon: 'pi pi-lock',
//         items: [
//           { label: 'Admin Dashboard', icon: 'pi pi-th-large', routerLink: ['/admin/dashboard'] },
//           { label: 'Users', icon: 'pi pi-user', routerLink: ['/admin/users'] },
//           // { label: 'Add Users', icon: 'pi pi-user-plus', routerLink: ['/admin/adusers'] },
//           { label: 'Logs', icon: 'pi pi-database', routerLink: ['/admin/logs'] }
//           // { label: 'Role Dashboard', icon: 'pi pi-chart-line', routerLink: ['/admin/adminDashboard'] },
//         ]
//       },
//       {
//         label: 'Customers',
//         icon: 'pi pi-users',
//         items: [
//           { label: 'List', icon: 'pi pi-list', routerLink: ['/customers/list'] },
//           { label: 'Master', icon: 'pi pi-cog', routerLink: ['/customers/master'] },
//           { label: 'Details', icon: 'pi pi-info-circle', routerLink: ['/customers/details'] },
//           { label: 'Detailed List', icon: 'pi pi-th-list', routerLink: ['/customers/detailed'] }
//         ]
//       },
//       {
//         label: 'Products',
//         icon: 'pi pi-shopping-bag',
//         items: [
//           { label: 'Product List', icon: 'pi pi-list', routerLink: ['/products/list'] },
//           { label: 'Product Master', icon: 'pi pi-cog', routerLink: ['/products/master'] },
//           { label: 'Product Details', icon: 'pi pi-info-circle', routerLink: ['/products/detail'] }
//         ]
//       },
//       {
//         label: 'Sellers',
//         icon: 'pi pi-briefcase',
//         items: [
//           { label: 'Seller', icon: 'pi pi-id-card', routerLink: ['/sellers/Seller'] },
//           { label: 'Seller Details', icon: 'pi pi-user-edit', routerLink: ['/sellers/Seller details'] },
//           { label: 'Seller List', icon: 'pi pi-th-large', routerLink: ['/sellers/Seller List'] }
//         ]
//       },
//       {
//         label: 'Invoices',
//         icon: 'pi pi-file',
//         items: [
//           { label: 'View Invoice', icon: 'pi pi-eye', routerLink: ['/invoices/view'] },
//           { label: 'Create Invoice', icon: 'pi pi-plus-circle', routerLink: ['/invoices/create'] },
//           { label: 'Invoice Details', icon: 'pi pi-file-edit', routerLink: ['/invoices/Details'] }
//         ]
//       },
//       {
//         label: 'Payments',
//         icon: 'pi pi-wallet',
//         items: [
//           { label: 'Payment', icon: 'pi pi-money-bill', routerLink: ['/payment/payment'] },
//           { label: 'View Payment', icon: 'pi pi-eye', routerLink: ['/payment/paymentView'] },
//           { label: 'Payment List', icon: 'pi pi-list', routerLink: ['/payment/paymentList'] }
//         ]
//       }
//     ];
//   }

// }
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    AvatarModule,
    InputTextModule,     RouterModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent  implements OnInit {
  isSidebarPinned: boolean = false;
  isSidebarHovered: boolean = false;
  isMobileMenuOpen: boolean = false;
  user: any;
  expandedItems: boolean[] = [];
  menuItems = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/dashboard'] },
    {
      label: 'Admin',
      icon: 'pi pi-lock',
      items: [
        { label: 'Admin Dashboard', icon: 'pi pi-th-large', routerLink: ['/admin/dashboard'] },
        { label: 'Users', icon: 'pi pi-user', routerLink: ['/admin/users'] },
        { label: 'Logs', icon: 'pi pi-database', routerLink: ['/admin/logs'] }
      ]
    },
    {
      label: 'Customers',
      icon: 'pi pi-users',
      items: [
        { label: 'List', icon: 'pi pi-list', routerLink: ['/customers/list'] },
        { label: 'Master', icon: 'pi pi-cog', routerLink: ['/customers/master'] },
        { label: 'Details', icon: 'pi pi-info-circle', routerLink: ['/customers/details'] },
        { label: 'Detailed List', icon: 'pi pi-th-list', routerLink: ['/customers/detailed'] }
      ]
    },
    {
      label: 'Products',
      icon: 'pi pi-shopping-bag',
      items: [
        { label: 'Product List', icon: 'pi pi-list', routerLink: ['/products/list'] },
        { label: 'Product Master', icon: 'pi pi-cog', routerLink: ['/products/master'] },
        { label: 'Product Details', icon: 'pi pi-info-circle', routerLink: ['/products/detail'] }
      ]
    },
    {
      label: 'Sellers',
      icon: 'pi pi-briefcase',
      items: [
        { label: 'Seller', icon: 'pi pi-id-card', routerLink: ['/sellers/Seller'] },
        { label: 'Seller Details', icon: 'pi pi-user-edit', routerLink: ['/sellers/Seller details'] },
        { label: 'Seller List', icon: 'pi pi-th-large', routerLink: ['/sellers/Seller List'] }
      ]
    },
    {
      label: 'Invoices',
      icon: 'pi pi-file',
      items: [
        { label: 'View Invoice', icon: 'pi pi-eye', routerLink: ['/invoices/view'] },
        { label: 'Create Invoice', icon: 'pi pi-plus-circle', routerLink: ['/invoices/create'] },
        { label: 'Invoice Details', icon: 'pi pi-file-edit', routerLink: ['/invoices/Details'] }
      ]
    },
    {
      label: 'Payments',
      icon: 'pi pi-wallet',
      items: [
        { label: 'Payment', icon: 'pi pi-money-bill', routerLink: ['/payment/payment'] },
        { label: 'View Payment', icon: 'pi pi-eye', routerLink: ['/payment/paymentView'] },
        { label: 'Payment List', icon: 'pi pi-list', routerLink: ['/payment/paymentList'] }
      ]
    }
  ];

  constructor(private themeService: ThemeService, private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.getItem('user');
    this.expandedItems = new Array(this.menuItems.length).fill(false);
  }

  toggleSidebar() {
    this.isSidebarPinned = !this.isSidebarPinned;
  }

  onMouseEnter() {
    if (!this.isSidebarPinned) {
      this.isSidebarHovered = true;
    }
  }

  onMouseLeave() {
    if (!this.isSidebarPinned) {
      this.isSidebarHovered = false;
    }
  }

  togglePin() {
    this.isSidebarPinned = !this.isSidebarPinned;
  }

  toggleMenuItem(index: number) {
    this.expandedItems[index] = !this.expandedItems[index];
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onColorChange(event: any) {
    const selectedColor = event.target.value;
    this.themeService.updateGradient(selectedColor);
  }

  logout() {
    this.authService.logout();
  }
}