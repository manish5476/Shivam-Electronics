// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-header',
//   imports: [],
//   templateUrl: './header.component.html',
//   styleUrl: './header.component.css'
// })
// export class HeaderComponent {

// }
import { Component, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DrawerModule } from 'primeng/drawer';
import { CommonModule } from '@angular/common';
import { TieredMenu } from 'primeng/tieredmenu';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { StyleClass } from 'primeng/styleclass';
import { Drawer } from 'primeng/drawer';
import { ThemeService } from '../../core/services/theme.service';
import { PanelMenuModule } from 'primeng/panelmenu';
import { AuthService } from '../../core/services/auth.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    DrawerModule,
    AvatarModule,
    InputTextModule, PanelMenuModule,
    RouterModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {

  visibles: boolean = false;
  showPanel() {
    this.visibles = !this.visibles
  }

  shownotificationdropdown = false;
  appsdropdown = false;
  openUserDrop = false;
  visible = false;
  position = 'topright';
  themeLabel = 'Dark Mode';
  isMobileMenuOpen = false; // State for the mobile menu visibility

  @ViewChild('drawerRef') drawerRef!: Drawer;
  menuItemss: ({ label: string; icon: string; routerLink: string[]; items?: undefined; } | { label: string; icon: string; items: { label: string; icon: string; routerLink: string[]; }[]; routerLink?: undefined; })[] | undefined;

  constructor(private themeService: ThemeService, private authService: AuthService) {
    this.themeLabel = localStorage.getItem('theme') === 'dark' ? 'Light Mode' : 'Dark Mode';
  }

  logout() {
    this.authService.logout()
  }
  onColorChange(event: any) {
    const selectedColor = event.target.value;
    this.themeService.updateGradient(selectedColor);
  }
  // onColorChange(event: any) {
  //   const selectedColor = event.target.value;
  //   this.themeService.updateGradient(selectedColor); // Update gradient via service
  // }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.themeLabel = this.themeLabel === 'Dark Mode' ? 'Light Mode' : 'Dark Mode';
  }
    // This method replaces the combined openUserDropDown/showPanel logic
    toggleMobileMenu(): void {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

  toggleNotificationDropdown() {
    this.shownotificationdropdown = !this.shownotificationdropdown;
  }

  toggleAppDropDown() {
    this.appsdropdown = !this.appsdropdown;
  }

  openUserDropDown() {
    this.openUserDrop = !this.openUserDrop;
  }

  showDialog(position: string) {
    this.position = position;
    this.visible = true;
  }

  closeCallback(e: Event): void {
    this.drawerRef.close(e);
  }

  menuItems: MenuItem[] = [];

  ngOnInit() {
    // this.getMenuItems();
    this.ngOnInits()
  }
  ngOnInits() {
    this.menuItemss = [
      { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/dashboard']
      },
      {
        label: 'Admin',
        icon: 'pi pi-users',
        items: [
          { label: 'Admin Dashboard', icon: 'pi pi-user', routerLink: ['/admin/adminDashboard'] },
          { label: 'users', icon: 'pi pi-user', routerLink: ['/admin/users'] },
          { label: 'dashboard', icon: 'pi pi-user', routerLink: ['/admin/dashboard'] },
          { label: 'adusers', icon: 'pi pi-user', routerLink: ['/admin/adusers'] },
          { label: 'logs', icon: 'pi pi-user', routerLink: ['/admin/logs'] }
        ]
      },
      {
        label: 'Customers',
        icon: 'pi pi-user-plus',
        items: [
          { label: 'List', icon: 'pi pi-list', routerLink: ['/customers/list'] },
          { label: 'Master', icon: 'pi pi-cog', routerLink: ['/customers/master'] },
          { label: 'Details', icon: 'pi pi-info-circle', routerLink: ['/customers/details'] },
          { label: 'Detailed List', icon: 'pi pi-list', routerLink: ['/customers/detailed'] }
        ]
      },
      {
        label: 'Products',
        icon: 'pi pi-box',
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
          { label: 'Seller', icon: 'pi pi-user', routerLink: ['/sellers/Seller'] },
          { label: 'Seller Details', icon: 'pi pi-info-circle', routerLink: ['/sellers/Seller details'] },
          { label: 'Seller List', icon: 'pi pi-list', routerLink: ['/sellers/Seller List'] }
        ]
      },
      {
        label: 'Invoices',
        icon: 'pi pi-file',
        items: [
          { label: 'View Invoice', icon: 'pi pi-eye', routerLink: ['/invoices/view'] },
          { label: 'Create Invoice', icon: 'pi pi-plus', routerLink: ['/invoices/create'] },
          { label: 'Invoice Details', icon: 'pi pi-file', routerLink: ['/invoices/Details'] }
        ]
      },
      {
        label: 'Payments',
        icon: 'pi pi-credit-card',
        items: [
          { label: 'Payment', icon: 'pi pi-money-bill', routerLink: ['/payment/payment'] },
          { label: 'View Payment', icon: 'pi pi-file', routerLink: ['/payment/paymentView'] }, 
          { label: 'Payment List', icon: 'pi pi-file', routerLink: ['/payment/paymentList'] }
        ]
      },
   
    ];
  }

  // getMenuItems() {
  //   this.menuItems = [
  //     {
  //       label: 'Dashboard',
  //       icon: 'pi pi-home',
  //       routerLink: ['/dashboard']
  //     },
  //     {
  //       label: 'Admin',
  //       icon: 'pi pi-users',
  //       items: [
  //         { label: 'Admin Dashboard', icon: 'pi pi-user', routerLink: ['/admin/adminDashboard'] }
  //       ]
  //     },
  //     {
  //       label: 'Customers',
  //       icon: 'pi pi-user-plus',
  //       items: [
  //         { label: 'List', icon: 'pi pi-list', routerLink: ['/customers/list'] },
  //         { label: 'Master', icon: 'pi pi-cog', routerLink: ['/customers/master'] },
  //         { label: 'Details', icon: 'pi pi-info-circle', routerLink: ['/customers/details'] },
  //         { label: 'Detailed List', icon: 'pi pi-list', routerLink: ['/customers/detailed'] }
  //       ]
  //     },
  //     {
  //       label: 'Sellers',
  //       icon: 'pi pi-briefcase',
  //       items: [
  //         { label: 'Seller', icon: 'pi pi-user', routerLink: ['/sellers/Seller'] },
  //         { label: 'Seller Details', icon: 'pi pi-info-circle', routerLink: ['/sellers/Seller details'] },
  //         { label: 'Seller List', icon: 'pi pi-list', routerLink: ['/sellers/Seller List'] }
  //       ]
  //     },
  //     {
  //       label: 'Invoices',
  //       icon: 'pi pi-file',
  //       items: [
  //         { label: 'View Invoice', icon: 'pi pi-eye', routerLink: ['/invoices/view'] },
  //         { label: 'Create Invoice', icon: 'pi pi-plus', routerLink: ['/invoices/create'] },
  //         { label: 'Invoice Details', icon: 'pi pi-file', routerLink: ['/invoices/Details'] }
  //       ]
  //     },
  //     {
  //       label: 'Payments',
  //       icon: 'pi pi-credit-card',
  //       items: [
  //         { label: 'Payment', icon: 'pi pi-money-bill', routerLink: ['/payment/payment'] },
  //         { label: 'GST Invoice', icon: 'pi pi-file', routerLink: ['/payment/invoice'] }
  //       ]
  //     },
  //     {
  //       label: 'Products',
  //       icon: 'pi pi-box',
  //       items: [
  //         { label: 'Product List', icon: 'pi pi-list', routerLink: ['/products/list'] },
  //         { label: 'Product Master', icon: 'pi pi-cog', routerLink: ['/products/master'] },
  //         { label: 'Product Details', icon: 'pi pi-info-circle', routerLink: ['/products/detail/:id'] }
  //       ]
  //     }
  //   ];
  // }
}