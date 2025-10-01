// File: src/app/layouts/header/header.component.ts
// Description: Corrected component logic to work with the reactive ThemeService.

import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Select } from 'primeng/select';
// PrimeNG Modules
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';

// App Services & Interfaces
import { AuthService, User } from '../../core/services/auth.service';
import { ThemeService, ThemeSettings } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PopoverModule,
    AvatarModule,
    ButtonModule,Select,
    SelectButtonModule,
    TooltipModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('op') op!: Popover;
  @Input() isMobileMenuOpen: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() mobileMenuToggle = new EventEmitter<void>();

  currentUser$: Observable<User | null>;
  private destroy$ = new Subject<void>();

  // --- Theme State Management ---
  isDarkMode: boolean = false;
  accentColor: string = '#3B82F6';
  activeThemeClass: string = 'theme-blue';
  themeOptions: any[];

  // This list should be kept in sync with the one in your ThemeService
    // colorThemes = [
    //   { name: 'Neo Brutalist', color: '#f8ff00', class: 'theme-neobrutalist' },
    //   { name: 'Classic', color: '#005A9C', class: 'theme-classic' },
    //   { name: 'Vaporwave', color: '#FF71CE', class: 'theme-vaporwave' },
    //   { name: 'Forest', color: '#2F4F4F', class: 'theme-forest' },
    //   { name: 'Monochrome', color: '#333333', class: 'theme-monochrome' },
    //   { name: 'Solarized', color: '#268BD2', class: 'theme-solarized' },

    //   // Custom Extended Themes
    //   { name: 'Old School', color: '#a05f2c', class: 'theme-oldschool' },
    //   { name: 'Retro Pop', color: '#ff5714', class: 'theme-retro' },
    //   { name: 'Modern Minimal', color: '#2563eb', class: 'theme-modern' },
    //   { name: 'Classic Elegant', color: '#8b6f47', class: 'theme-classic' },
    //   { name: 'Premium Luxe', color: '#ffd700', class: 'theme-premium' },


    //   // color
    //   { name: 'Indigo', color: '#6366f1', class: 'theme-indigo' },
    //   { name: 'Slate', color: '#64748b', class: 'theme-slate' },
    //   { name: 'Red', color: '#ef4444', class: 'theme-red' },
    //   { name: 'Orange', color: '#f97316', class: 'theme-orange' },
    //   { name: 'Amber', color: '#f59e0b', class: 'theme-amber' },
    //   { name: 'Yellow', color: '#eab308', class: 'theme-yellow' },
    //   { name: 'Lime', color: '#84cc16', class: 'theme-lime' },
    //   { name: 'Green', color: '#22c55e', class: 'theme-green' },
    //   { name: 'Emerald', color: '#10b981', class: 'theme-emerald' },
    //   { name: 'Teal', color: '#14b8a6', class: 'theme-teal' },
    //   { name: 'Cyan', color: '#06b6d4', class: 'theme-cyan' },
    //   { name: 'Sky', color: '#0ea5e9', class: 'theme-sky' },
    //   { name: 'Blue', color: '#3b82f6', class: 'theme-blue' },
    //   { name: 'Violet', color: '#8b5cf6', class: 'theme-violet' },
    //   { name: 'Purple', color: '#a855f7', class: 'theme-purple' },
    //   { name: 'Fuchsia', color: '#d946ef', class: 'theme-fuchsia' },
    //   { name: 'Pink', color: '#ec4899', class: 'theme-pink' },
    //   { name: 'Rose', color: '#f43f5e', class: 'theme-rose' },
    // ];
colorThemes = [

  // Tailwind palette inspired
  { name: 'Indigo', color: '#6366f1', class: 'theme-indigo' },
  { name: 'Slate', color: '#64748b', class: 'theme-slate' },
  { name: 'Red', color: '#ef4444', class: 'theme-red' },
  { name: 'Orange', color: '#f97316', class: 'theme-orange' },
  { name: 'Amber', color: '#f59e0b', class: 'theme-amber' },
  { name: 'Yellow', color: '#eab308', class: 'theme-yellow' },
  { name: 'Lime', color: '#84cc16', class: 'theme-lime' },
  { name: 'Green', color: '#22c55e', class: 'theme-green' },
  { name: 'Emerald', color: '#10b981', class: 'theme-emerald' },
  { name: 'Teal', color: '#14b8a6', class: 'theme-teal' },
  { name: 'Cyan', color: '#06b6d4', class: 'theme-cyan' },
  { name: 'Sky', color: '#0ea5e9', class: 'theme-sky' },
  { name: 'Blue', color: '#3b82f6', class: 'theme-blue' },
  { name: 'Violet', color: '#8b5cf6', class: 'theme-violet' },
  { name: 'Purple', color: '#a855f7', class: 'theme-purple' },
  { name: 'Fuchsia', color: '#d946ef', class: 'theme-fuchsia' },
  { name: 'Pink', color: '#ec4899', class: 'theme-pink' },
  { name: 'Rose', color: '#f43f5e', class: 'theme-rose' },

  // Retro set
  { name: 'Retro Burgundy', color: '#8b2635', class: 'theme-retro-burgundy' },
  { name: 'Retro Forest', color: '#2d5016', class: 'theme-retro-forest' },
  { name: 'Retro Navy', color: '#1e3a5f', class: 'theme-retro-navy' },
  { name: 'Retro Copper', color: '#b87333', class: 'theme-retro-copper' },
  { name: 'Retro Plum', color: '#6b4c57', class: 'theme-retro-plum' },
  { name: 'Retro Sage', color: '#87a96b', class: 'theme-retro-sage' },

  // Old / Modern / Premium additions
  { name: 'Old School', color: '#a05f2c', class: 'theme-oldschool' },
  { name: 'Retro Pop', color: '#ff8800', class: 'theme-retro-pop' },
  { name: 'Modern Minimal', color: '#2563eb', class: 'theme-modern' },
  { name: 'Classic Elegant', color: '#8b6f47', class: 'theme-classic' },
  { name: 'Premium Luxe', color: '#ffd700', class: 'theme-premium' },

  // The new "best of best"
  { name: 'Retro Pop+', color: '#ff8800', class: 'theme-retro-pop' },
  { name: 'Modern Glass', color: '#0099ff', class: 'theme-modern-glass' },
  { name: 'Classic Royal', color: '#a67c00', class: 'theme-classic-royal' },
  { name: 'Elegant Noir', color: '#ff4081', class: 'theme-elegant-noir' },
  { name: 'Festive India', color: '#ff6600', class: 'theme-festive-india' },

    { name: 'Neo Brutalist', color: '#f8ff00', class: 'theme-neobrutalist' },
  { name: 'Classic', color: '#005A9C', class: 'theme-classic' },
  { name: 'Vaporwave', color: '#FF71CE', class: 'theme-vaporwave' },
  { name: 'Forest', color: '#2F4F4F', class: 'theme-forest' },
  { name: 'Monochrome', color: '#333333', class: 'theme-monochrome' },
  { name: 'Solarized', color: '#268BD2', class: 'theme-solarized' },

];

  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.themeOptions = [
      { icon: 'pi pi-sun', value: false },
      { icon: 'pi pi-moon', value: true }
    ];
  }

  ngOnInit() {
    // Reactively listen for theme changes to keep the UI in sync
    this.themeService.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe((settings: ThemeSettings) => {
        this.isDarkMode = settings.isDarkMode;
        this.activeThemeClass = settings.themeClass;
        this.accentColor = settings.accentColor;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- CORRECTED Theme Control Methods ---

  onThemeModeChange(isDark: boolean): void {
    this.themeService.setDarkMode(isDark);
  }

  onAccentColorChange(colorClass: string, colorHex: string): void {
    // Call the main setTheme method with all required info
    this.themeService.setTheme(colorClass, colorHex);
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }

  toggle(event: any) {
    this.op.toggle(event);
  }
}

// // 1. The Updated Component Logic
// // File: src/app/layouts/header/header.component.ts

// import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { RouterModule } from '@angular/router';
// import { Observable } from 'rxjs';

// // PrimeNG Modules
// import { AvatarModule } from 'primeng/avatar';
// import { ButtonModule } from 'primeng/button';
// import { Popover, PopoverModule } from 'primeng/popover';
// import { SelectButtonModule } from 'primeng/selectbutton';
// import { TooltipModule } from 'primeng/tooltip';

// // App Services & Interfaces
// import { AuthService, User } from '../../core/services/auth.service';
// import { ThemeService } from '../../core/services/theme.service';

// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     RouterModule,
//     PopoverModule,
//     AvatarModule,
//     ButtonModule,
//     SelectButtonModule,
//     TooltipModule
//   ],
//   templateUrl: './header.component.html',
//   styleUrls: ['./header.component.css']
// })
// export class HeaderComponent implements OnInit {
//   @ViewChild('op') op!: Popover;
//   @Input() isMobileMenuOpen: boolean = false;
//   @Output() toggleSidebar = new EventEmitter<void>();
//   @Output() mobileMenuToggle = new EventEmitter<void>();

//   currentUser$: Observable<User | null>;

//   // --- NEW: Theme State Management ---
//   isDarkMode: boolean = false;
//   accentColor: string = '#3B82F6'; // Default accent
//   themeOptions: any[];

//   colorThemes = [
//     // Original Themes
//     { name: 'Indigo', color: '#6366f1', class: 'theme-indigo' },
//     { name: 'Slate', color: '#64748b', class: 'theme-slate' },
//     { name: 'Red', color: '#ef4444', class: 'theme-red' },
//     { name: 'Orange', color: '#f97316', class: 'theme-orange' },
//     { name: 'Amber', color: '#f59e0b', class: 'theme-amber' },
//     { name: 'Yellow', color: '#eab308', class: 'theme-yellow' },
//     { name: 'Lime', color: '#84cc16', class: 'theme-lime' },
//     { name: 'Green', color: '#22c55e', class: 'theme-green' },
//     { name: 'Emerald', color: '#10b981', class: 'theme-emerald' },
//     { name: 'Teal', color: '#14b8a6', class: 'theme-teal' },
//     { name: 'Cyan', color: '#06b6d4', class: 'theme-cyan' },
//     { name: 'Sky', color: '#0ea5e9', class: 'theme-sky' },
//     { name: 'Blue', color: '#3b82f6', class: 'theme-blue' },
//     { name: 'Violet', color: '#8b5cf6', class: 'theme-violet' },
//     { name: 'Purple', color: '#a855f7', class: 'theme-purple' },
//     { name: 'Fuchsia', color: '#d946ef', class: 'theme-fuchsia' },
//     { name: 'Pink', color: '#ec4899', class: 'theme-pink' },
//     { name: 'Rose', color: '#f43f5e', class: 'theme-rose' },
//     //  Retro Themes
//     // { name: 'Retro Burgundy', color: '#8b2635', class: 'theme-retro-burgundy' },
//     // { name: 'Retro Forest', color: '#2d5016', class: 'theme-retro-forest' },
//     // { name: 'Retro Navy', color: '#1e3a5f', class: 'theme-retro-navy' },
//     // { name: 'Retro Copper', color: '#b87333', class: 'theme-retro-copper' },
//     // { name: 'Retro Plum', color: '#6b4c57', class: 'theme-retro-plum' },
//     // { name: 'Retro Sage', color: '#87a96b', class: 'theme-retro-sage' },
//     // { name: 'Retro Gold', color: '#b8860b', class: 'theme-retro-gold' },
//     // { name: 'Retro Mahogany', color: '#c04000', class: 'theme-retro-mahogany' },
//     // { name: 'Retro Teal', color: '#4a7c7e', class: 'theme-retro-teal' },
//     // { name: 'Retro Lavender', color: '#8b7d9b', class: 'theme-retro-lavender' },
//   ];

//   constructor(
//     private authService: AuthService,
//     private themeService: ThemeService
//   ) {
//     this.currentUser$ = this.authService.currentUser$;
//     this.themeOptions = [
//       { icon: 'pi pi-sun', value: false },
//       { icon: 'pi pi-moon', value: true }
//     ];
//   }

//   ngOnInit() {
//     // FIX: The ThemeService should be initialized once in a parent component (like main-layout or app).
//     // This component should reflect the current state.
//     const settings = this.themeService.loadSettings(); // Making loadSettings public in ThemeService is one way to fix this.
//     if (settings) {
//       this.isDarkMode = settings.isDarkMode;
//       this.accentColor = settings.accentColor;
//     }
//   }

//   // --- NEW: Theme Control Methods ---


//   onThemeModeChange(isDark: boolean): void {
//     this.isDarkMode = isDark;
//     // FIX: Call the new, more specific method
//     this.themeService.setDarkMode(this.isDarkMode);
//   }

//   onAccentColorChange(colorClass: string, colorHex: string): void {
//     this.accentColor = colorHex;
//     // FIX: Call the new, more specific method
//     this.themeService.setAccentColor(this.accentColor);
//   }

//   // --- FIX: Add the missing getInitials method ---
//   getInitials(name: string): string {
//     if (!name) return '';
//     return name.split(' ')
//       .map(n => n[0])
//       .slice(0, 2)
//       .join('')
//       .toUpperCase();
//   }

//   // --- Existing Methods ---

//   logout(): void {
//     this.authService.logout();
//   }

//   toggle(event: any) {
//     this.op.toggle(event);
//   }
// }