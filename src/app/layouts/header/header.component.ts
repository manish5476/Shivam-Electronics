// 1. The Updated Component Logic
// File: src/app/layouts/header/header.component.ts

import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

// PrimeNG Modules
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';

// App Services & Interfaces
import { AuthService, User } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PopoverModule,
    AvatarModule,
    ButtonModule,
    SelectButtonModule,
    TooltipModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @ViewChild('op') op!: Popover;
  @Input() isMobileMenuOpen: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() mobileMenuToggle = new EventEmitter<void>();

  currentUser$: Observable<User | null>;

  // --- NEW: Theme State Management ---
  isDarkMode: boolean = false;
  accentColor: string = '#3B82F6'; // Default accent
  themeOptions: any[];

  // The 20 color palettes for the theme switcher
  colorThemes = [
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
    // FIX: The ThemeService should be initialized once in a parent component (like main-layout or app).
    // This component should reflect the current state.
    const settings = this.themeService.loadSettings(); // Making loadSettings public in ThemeService is one way to fix this.
    if (settings) {
      this.isDarkMode = settings.isDarkMode;
      this.accentColor = settings.accentColor;
    }
  }

  // --- NEW: Theme Control Methods ---

  onThemeModeChange(isDark: boolean): void {
    this.isDarkMode = isDark;
    this.themeService.setTheme(this.accentColor, this.isDarkMode);
  }

  onAccentColorChange(colorClass: string, colorHex: string): void {
    this.accentColor = colorHex;
    // Set the theme class on the body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(colorClass);
    this.themeService.setTheme(this.accentColor, this.isDarkMode);
  }

  // --- FIX: Add the missing getInitials method ---
  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  // --- Existing Methods ---

  logout(): void {
    this.authService.logout();
  }

  toggle(event: any) {
    this.op.toggle(event);
  }
}


// import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ColorPickerModule } from 'primeng/colorpicker';
// import { AvatarModule } from 'primeng/avatar';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { RouterModule } from '@angular/router';
// import { AuthService, User } from '../../core/services/auth.service'; // Import User interface
// import { Popover, PopoverModule } from 'primeng/popover';
// import { Observable } from 'rxjs';

// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [CommonModule, FormsModule, PopoverModule, ColorPickerModule, AvatarModule, ButtonModule, InputTextModule, RouterModule],
//   templateUrl: './header.component.html',
//   styleUrls: ['./header.component.css']
// })
// export class HeaderComponent implements OnInit {
//   @ViewChild('op') op!: Popover;
//   @Input() isMobileMenuOpen: boolean = false;
//   @Output() toggleSidebar = new EventEmitter<void>();
//   @Output() mobileMenuToggle = new EventEmitter<void>();

//   // Use the currentUser$ observable directly in your template with the async pipe
//   currentUser$: Observable<User | null>;

//   constructor(private authService: AuthService) {
//     this.currentUser$ = this.authService.currentUser$;
//   }

//   ngOnInit() {
//     // No need to manually get the user here anymore
//   }

//   logout(): void {
//     this.authService.logout();
//   }

//   toggle(event: any) {
//     this.op.toggle(event);
//   }
// }
