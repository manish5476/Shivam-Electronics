import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'primeng/colorpicker';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Popover, PopoverModule } from 'primeng/popover';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule,PopoverModule, ColorPickerModule, AvatarModule, ButtonModule, InputTextModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
     @ViewChild('op') op!: Popover;

  @Input() isMobileMenuOpen: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() colorChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();
  @Output() mobileMenuToggle = new EventEmitter<void>();
  accentColor: string = '#007bff';
  user: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.getItem('user');
    this.accentColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-accent-primary').trim() || '#007bff';
  }
    toggle(event: any) {
      console.log(event);
        this.op.toggle(event);
    }

}
// import { Component, OnInit } from '@angular/core';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { AvatarModule } from 'primeng/avatar';
// import { ThemeService } from '../../core/services/theme.service';
// import { AuthService } from '../../core/services/auth.service';

// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [
//     ButtonModule,
//     CommonModule,
//     AvatarModule,
//     InputTextModule,
//     RouterModule,
//   ],
//   templateUrl: './header.component.html',
//   styleUrls: ['./header.component.css'],
// })
// export class HeaderComponent implements OnInit {
//   isSidebarPinned: boolean = false;
//   isSidebarHovered: boolean = false;
//   isMobileMenuOpen: boolean = false;
//   user: any;
//   expandedItems: boolean[] = [];
//   menuItems = [
//     { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/dashboard'] },
//     {
//       label: 'Admin',
//       icon: 'pi pi-lock',
//       items: [
//         { label: 'Admin Dashboard', icon: 'pi pi-th-large', routerLink: ['/admin/dashboard'] },
//         { label: 'Users', icon: 'pi pi-user', routerLink: ['/admin/users'] },
//         { label: 'Logs', icon: 'pi pi-database', routerLink: ['/admin/logs'] }
//       ]
//     },
//     {
//       label: 'Customers',
//       icon: 'pi pi-users',
//       items: [
//         { label: 'List', icon: 'pi pi-list', routerLink: ['/customers/list'] },
//         { label: 'Master', icon: 'pi pi-cog', routerLink: ['/customers/master'] },
//         { label: 'Details', icon: 'pi pi-info-circle', routerLink: ['/customers/details'] },
//         { label: 'Detailed List', icon: 'pi pi-th-list', routerLink: ['/customers/detailed'] }
//       ]
//     },
//     {
//       label: 'Products',
//       icon: 'pi pi-shopping-bag',
//       items: [
//         { label: 'Product List', icon: 'pi pi-list', routerLink: ['/products/list'] },
//         { label: 'Product Master', icon: 'pi pi-cog', routerLink: ['/products/master'] },
//         { label: 'Product Details', icon: 'pi pi-info-circle', routerLink: ['/products/detail'] }
//       ]
//     },
//     {
//       label: 'Sellers',
//       icon: 'pi pi-briefcase',
//       items: [
//         { label: 'Seller', icon: 'pi pi-id-card', routerLink: ['/sellers/Seller'] },
//         { label: 'Seller Details', icon: 'pi pi-user-edit', routerLink: ['/sellers/Seller details'] },
//         { label: 'Seller List', icon: 'pi pi-th-large', routerLink: ['/sellers/Seller List'] }
//       ]
//     },
//     {
//       label: 'Invoices',
//       icon: 'pi pi-file',
//       items: [
//         { label: 'View Invoice', icon: 'pi pi-eye', routerLink: ['/invoices/view'] },
//         { label: 'Create Invoice', icon: 'pi pi-plus-circle', routerLink: ['/invoices/create'] },
//         { label: 'Invoice Details', icon: 'pi pi-file-edit', routerLink: ['/invoices/Details'] }
//       ]
//     },
//     {
//       label: 'Payments',
//       icon: 'pi pi-wallet',
//       items: [
//         { label: 'Payment', icon: 'pi pi-money-bill', routerLink: ['/payment/payment'] },
//         { label: 'View Payment', icon: 'pi pi-eye', routerLink: ['/payment/paymentView'] },
//         { label: 'Payment List', icon: 'pi pi-list', routerLink: ['/payment/paymentList'] }
//       ]
//     }
//   ];

//   constructor(private themeService: ThemeService, private authService: AuthService) {}

//   ngOnInit() {
//     this.user = this.authService.getItem('user');
//     this.expandedItems = new Array(this.menuItems.length).fill(false);
//     // Debugging: Log initial state
//     console.log('Initial state:', { isSidebarPinned: this.isSidebarPinned, isSidebarHovered: this.isSidebarHovered });
//   }

//   toggleSidebar() {
//     this.isSidebarPinned = !this.isSidebarPinned;
//     this.isSidebarHovered = this.isSidebarPinned; // Sync hover state with pin state
//     console.log('toggleSidebar:', { isSidebarPinned: this.isSidebarPinned, isSidebarHovered: this.isSidebarHovered });
//   }

//   onMouseEnter() {
//     if (!this.isSidebarPinned) {
//       this.isSidebarHovered = true;
//       console.log('onMouseEnter: Sidebar hovered');
//     }
//   }

//   onMouseEnterTriggerZone() {
//     if (!this.isSidebarPinned) {
//       this.isSidebarHovered = true;
//       console.log('onMouseEnterTriggerZone: Trigger zone hovered');
//     }
//   }

//   onMouseLeave() {
//     if (!this.isSidebarPinned) {
//       this.isSidebarHovered = false;
//       console.log('onMouseLeave: Sidebar unhovered');
//     }
//   }

//   onMouseEnterMainContent() {
//     if (!this.isSidebarPinned) {
//       this.isSidebarHovered = false;
//       console.log('onMouseEnterMainContent: Main content hovered');
//     }
//   }

//   togglePin() {
//     this.isSidebarPinned = !this.isSidebarPinned;
//     if (this.isSidebarPinned) {
//       this.isSidebarHovered = true; // Ensure sidebar stays open when pinned
//     }
//     console.log('togglePin:', { isSidebarPinned: this.isSidebarPinned, isSidebarHovered: this.isSidebarHovered });
//   }

//   toggleMenuItem(index: number) {
//     this.expandedItems[index] = !this.expandedItems[index];
//     console.log('toggleMenuItem:', { index, expanded: this.expandedItems[index] });
//   }

//   toggleMobileMenu() {
//     this.isMobileMenuOpen = !this.isMobileMenuOpen;
//     console.log('toggleMobileMenu:', { isMobileMenuOpen: this.isMobileMenuOpen });
//   }

//  onColorChange(event: Event) {
//   const color = (event.target as HTMLInputElement).value;
//   document.documentElement.style.setProperty('--theme-accent-primary', color);
// }

//   logout() {
//     this.authService.logout();
//     console.log('logout: User logged out');
//   }

//   debugTriggerZone() {
//     console.log('debugTriggerZone: Trigger zone clicked');
//   }
// }
