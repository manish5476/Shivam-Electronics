// 1. The Advanced, Reactive Theme Service
// File: src/app/core/services/theme.service.ts

import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, OnDestroy, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ThemeSettings {
  accentColor: string; // The hex value, e.g., '#6366f1'
  isDarkMode: boolean;
  themeClass: string; // The CSS class, e.g., 'theme-indigo'
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService implements OnDestroy {
  private renderer: Renderer2;
  private readonly THEME_KEY = 'app-theme-settings';

  // --- Reactive State Management ---
  private settingsSubject: BehaviorSubject<ThemeSettings>;
  public settings$: Observable<ThemeSettings>;
  public isDarkMode$: Observable<boolean>;
  public accentColor$: Observable<string>;

  private colorSchemeSub: Subscription;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);

    // Initialize state with a default or from storage
    const initialSettings = this.loadSettings() || this.getSystemDefault();
    this.settingsSubject = new BehaviorSubject<ThemeSettings>(initialSettings);
    
    // Create public observables from the state
    this.settings$ = this.settingsSubject.asObservable();
    this.isDarkMode$ = this.settings$.pipe(map(s => s.isDarkMode));
    this.accentColor$ = this.settings$.pipe(map(s => s.accentColor));

    // Listen for OS-level theme changes
    this.colorSchemeSub = fromEvent<MediaQueryList>(window.matchMedia('(prefers-color-scheme: dark)'), 'change')
      .subscribe(e => {
        const currentSettings = this.loadSettings();
        // Only update if the user hasn't manually overridden the theme
        if (!currentSettings) { 
          this.setDarkMode(e.matches);
        }
      });
  }

  /**
   * Initializes the theme on application startup. Call this once in your AppComponent.
   */
  initTheme(): void {
    this.applyTheme(this.settingsSubject.value);
  }

  // --- Public API Methods ---

  /**
   * Toggles between light and dark mode.
   */
  toggleDarkMode(): void {
    const newSettings = { ...this.settingsSubject.value, isDarkMode: !this.settingsSubject.value.isDarkMode };
    this.applyTheme(newSettings);
  }
  
  /**
   * Sets the dark mode to a specific state.
   */
  setDarkMode(isDark: boolean): void {
    const newSettings = { ...this.settingsSubject.value, isDarkMode: isDark };
    this.applyTheme(newSettings);
  }

  /**
   * Sets a new accent color for the application.
   * @param accentColor The new hex color code.
   */
  setAccentColor(accentColor: string): void {
      const currentSettings = this.settingsSubject.value;
      const themeClass = this.getThemeClassFromHex(accentColor) || currentSettings.themeClass;
      this.applyTheme({ ...currentSettings, accentColor, themeClass });
  }

  public loadSettings(): ThemeSettings | null {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.THEME_KEY);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  }

  // --- Core Logic ---

  private applyTheme(settings: ThemeSettings): void {
    const palette = this.generatePalette(settings.accentColor, settings.isDarkMode);

    Object.keys(palette).forEach(key => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      this.renderer.setStyle(this.document.documentElement, cssVar, palette[key as keyof typeof palette]);
    });

    this.document.body.className = this.document.body.className.replace(/theme-\w+/g, '');
    if (settings.themeClass) {
        this.renderer.addClass(this.document.body, settings.themeClass);
    }
    if (settings.isDarkMode) {
      this.renderer.addClass(this.document.body, 'dark-mode');
      this.renderer.removeClass(this.document.body, 'light-mode');
    } else {
      this.renderer.addClass(this.document.body, 'light-mode');
      this.renderer.removeClass(this.document.body, 'dark-mode');
    }

    this.saveSettings(settings);
    this.settingsSubject.next(settings);
  }

  private saveSettings(settings: ThemeSettings): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.THEME_KEY, JSON.stringify(settings));
    }
  }
  
  private getSystemDefault(): ThemeSettings {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return { accentColor: '#3B82F6', isDarkMode: prefersDark, themeClass: 'theme-blue' };
  }

  private getThemeClassFromHex(hex: string): string | undefined {
      const themes = [
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
      const foundTheme = themes.find(t => t.color === hex);
      return foundTheme?.class;
  }

  private generatePalette(accentHex: string, isDark: boolean): Record<string, string> {
    const { h, s } = this.hexToHsl(accentHex);

    if (isDark) {
      return {
        themeBgPrimary: `hsl(${h}, 15%, 10%)`,
        themeBgSecondary: `hsl(${h}, 12%, 15%)`,
        themeBgTertiary: `hsl(${h}, 10%, 20%)`,
        themeTextPrimary: `hsl(${h}, 15%, 95%)`,
        themeTextSecondary: `hsl(${h}, 10%, 65%)`,
        themeBorderPrimary: `hsl(${h}, 10%, 25%)`,
        themeAccentPrimary: `hsl(${h}, ${s}%, 60%)`,
        themeAccentPrimaryLight: `hsla(${h}, ${s}%, 60%, 0.1)`,
        themeAccentTextColor: `hsl(${h}, 20%, 10%)`,
        // --- NEW: Secondary Accent Color ---
        themeAccentSecondary: `hsl(${(h + 150) % 360}, ${s}%, 70%)`, // Complementary color
      };
    } else {
      return {
        themeBgPrimary: `hsl(${h}, 20%, 98%)`,
        themeBgSecondary: `hsl(${h}, 25%, 94%)`,
        themeBgTertiary: `hsl(${h}, 20%, 88%)`,
        themeTextPrimary: `hsl(${h}, 15%, 15%)`,
        themeTextSecondary: `hsl(${h}, 10%, 40%)`,
        themeBorderPrimary: `hsl(${h}, 20%, 85%)`,
        themeAccentPrimary: accentHex,
        themeAccentPrimaryLight: `hsla(${h}, ${s}%, 50%, 0.1)`,
        themeAccentTextColor: `hsl(0, 0%, 100%)`,
        // --- NEW: Secondary Accent Color ---
        themeAccentSecondary: `hsl(${(h + 150) % 360}, ${s - 5}%, 45%)`, // Complementary color
      };
    }
  }

  private hexToHsl(hex: string): { h: number, s: number, l: number } {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }
  
  ngOnDestroy(): void {
    this.colorSchemeSub.unsubscribe();
  }
}

// // 1. The Advanced, Reactive Theme Service
// // File: src/app/core/services/theme.service.ts

// import { DOCUMENT } from '@angular/common';
// import { Inject, Injectable, OnDestroy, Renderer2, RendererFactory2 } from '@angular/core';
// import { BehaviorSubject, Observable, Subscription, fromEvent } from 'rxjs';
// import { map } from 'rxjs/operators';

// export interface ThemeSettings {
//   accentColor: string; // The hex value, e.g., '#6366f1'
//   isDarkMode: boolean;
//   themeClass: string; // The CSS class, e.g., 'theme-indigo'
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class ThemeService implements OnDestroy {
//   private renderer: Renderer2;
//   private readonly THEME_KEY = 'app-theme-settings';

//   // --- Reactive State Management ---
//   private settingsSubject: BehaviorSubject<ThemeSettings>;
//   public settings$: Observable<ThemeSettings>;
//   public isDarkMode$: Observable<boolean>;
//   public accentColor$: Observable<string>;

//   private colorSchemeSub: Subscription;

//   constructor(
//     @Inject(DOCUMENT) private document: Document,
//     rendererFactory: RendererFactory2
//   ) {
//     this.renderer = rendererFactory.createRenderer(null, null);

//     // Initialize state with a default or from storage
//     const initialSettings = this.loadSettings() || this.getSystemDefault();
//     this.settingsSubject = new BehaviorSubject<ThemeSettings>(initialSettings);
    
//     // Create public observables from the state
//     this.settings$ = this.settingsSubject.asObservable();
//     this.isDarkMode$ = this.settings$.pipe(map(s => s.isDarkMode));
//     this.accentColor$ = this.settings$.pipe(map(s => s.accentColor));

//     // Listen for OS-level theme changes
//     this.colorSchemeSub = fromEvent<MediaQueryList>(window.matchMedia('(prefers-color-scheme: dark)'), 'change')
//       .subscribe(e => {
//         const currentSettings = this.loadSettings();
//         // Only update if the user hasn't manually overridden the theme
//         if (!currentSettings) { 
//           this.setDarkMode(e.matches);
//         }
//       });
//   }

//   /**
//    * Initializes the theme on application startup. Call this once in your AppComponent.
//    */
//   initTheme(): void {
//     this.applyTheme(this.settingsSubject.value);
//   }

//   // --- Public API Methods ---

//   /**
//    * Toggles between light and dark mode.
//    */
//   toggleDarkMode(): void {
//     const newSettings = { ...this.settingsSubject.value, isDarkMode: !this.settingsSubject.value.isDarkMode };
//     this.applyTheme(newSettings);
//   }
  
//   /**
//    * Sets the dark mode to a specific state.
//    */
//   setDarkMode(isDark: boolean): void {
//     const newSettings = { ...this.settingsSubject.value, isDarkMode: isDark };
//     this.applyTheme(newSettings);
//   }

//   /**
//    * Sets a new accent color for the application.
//    * @param accentColor The new hex color code.
//    */
//   setAccentColor(accentColor: string): void {
//       const currentSettings = this.settingsSubject.value;
//       const themeClass = this.getThemeClassFromHex(accentColor) || currentSettings.themeClass;
//       this.applyTheme({ ...currentSettings, accentColor, themeClass });
//   }

//   /**
//    * FIX: Made this method public so components can access saved settings.
//    */
//   public loadSettings(): ThemeSettings | null {
//     if (typeof localStorage !== 'undefined') {
//       const saved = localStorage.getItem(this.THEME_KEY);
//       return saved ? JSON.parse(saved) : null;
//     }
//     return null;
//   }

//   // --- Core Logic ---

//   /**
//    * The main private method to apply all theme changes and update state.
//    */
//   private applyTheme(settings: ThemeSettings): void {
//     // 1. Generate the full color palette
//     const palette = this.generatePalette(settings.accentColor, settings.isDarkMode);

//     // 2. Apply the palette as CSS variables
//     Object.keys(palette).forEach(key => {
//       const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
//       this.renderer.setStyle(this.document.documentElement, cssVar, palette[key as keyof typeof palette]);
//     });

//     // 3. Apply the theme and mode classes to the body
//     this.document.body.className = this.document.body.className.replace(/theme-\w+/g, ''); // Clear old theme classes
//     if (settings.themeClass) {
//         this.renderer.addClass(this.document.body, settings.themeClass);
//     }
//     if (settings.isDarkMode) {
//       this.renderer.addClass(this.document.body, 'dark-mode');
//       this.renderer.removeClass(this.document.body, 'light-mode');
//     } else {
//       this.renderer.addClass(this.document.body, 'light-mode');
//       this.renderer.removeClass(this.document.body, 'dark-mode');
//     }

//     // 4. Save settings and update the observable state
//     this.saveSettings(settings);
//     this.settingsSubject.next(settings);
//   }

//   private saveSettings(settings: ThemeSettings): void {
//     if (typeof localStorage !== 'undefined') {
//       localStorage.setItem(this.THEME_KEY, JSON.stringify(settings));
//     }
//   }
  
//   private getSystemDefault(): ThemeSettings {
//       const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
//       return { accentColor: '#3B82F6', isDarkMode: prefersDark, themeClass: 'theme-blue' };
//   }

//   private getThemeClassFromHex(hex: string): string | undefined {
//       const themes = [
//           { name: 'Indigo', color: '#6366f1', class: 'theme-indigo' },
//           { name: 'Slate', color: '#64748b', class: 'theme-slate' },
//           { name: 'Red', color: '#ef4444', class: 'theme-red' },
//           { name: 'Orange', color: '#f97316', class: 'theme-orange' },
//           { name: 'Amber', color: '#f59e0b', class: 'theme-amber' },
//           { name: 'Yellow', color: '#eab308', class: 'theme-yellow' },
//           { name: 'Lime', color: '#84cc16', class: 'theme-lime' },
//           { name: 'Green', color: '#22c55e', class: 'theme-green' },
//           { name: 'Emerald', color: '#10b981', class: 'theme-emerald' },
//           { name: 'Teal', color: '#14b8a6', class: 'theme-teal' },
//           { name: 'Cyan', color: '#06b6d4', class: 'theme-cyan' },
//           { name: 'Sky', color: '#0ea5e9', class: 'theme-sky' },
//           { name: 'Blue', color: '#3b82f6', class: 'theme-blue' },
//           { name: 'Violet', color: '#8b5cf6', class: 'theme-violet' },
//           { name: 'Purple', color: '#a855f7', class: 'theme-purple' },
//           { name: 'Fuchsia', color: '#d946ef', class: 'theme-fuchsia' },
//           { name: 'Pink', color: '#ec4899', class: 'theme-pink' },
//           { name: 'Rose', color: '#f43f5e', class: 'theme-rose' },
//       ];
//       const foundTheme = themes.find(t => t.color === hex);
//       return foundTheme?.class;
//   }

//   private generatePalette(accentHex: string, isDark: boolean): Record<string, string> {
//     const { h, s } = this.hexToHsl(accentHex);

//     if (isDark) {
//       return {
//         themeBgPrimary: `hsl(${h}, 15%, 10%)`,
//         themeBgSecondary: `hsl(${h}, 12%, 15%)`,
//         themeBgTertiary: `hsl(${h}, 10%, 20%)`,
//         themeTextPrimary: `hsl(${h}, 15%, 95%)`,
//         themeTextSecondary: `hsl(${h}, 10%, 65%)`,
//         themeBorderPrimary: `hsl(${h}, 10%, 25%)`,
//         themeAccentPrimary: `hsl(${h}, ${s}%, 60%)`,
//         themeAccentPrimaryLight: `hsla(${h}, ${s}%, 60%, 0.1)`,
//         themeAccentTextColor: `hsl(${h}, 20%, 10%)`,
//       };
//     } else {
//       return {
//         themeBgPrimary: `hsl(${h}, 20%, 98%)`,
//         themeBgSecondary: `hsl(${h}, 25%, 94%)`,
//         themeBgTertiary: `hsl(${h}, 20%, 88%)`,
//         themeTextPrimary: `hsl(${h}, 15%, 15%)`,
//         themeTextSecondary: `hsl(${h}, 10%, 40%)`,
//         themeBorderPrimary: `hsl(${h}, 20%, 85%)`,
//         themeAccentPrimary: accentHex,
//         themeAccentPrimaryLight: `hsla(${h}, ${s}%, 50%, 0.1)`,
//         themeAccentTextColor: `hsl(0, 0%, 100%)`,
//       };
//     }
//   }

//   private hexToHsl(hex: string): { h: number, s: number, l: number } {
//     let r = 0, g = 0, b = 0;
//     if (hex.length === 4) {
//       r = parseInt(hex[1] + hex[1], 16);
//       g = parseInt(hex[2] + hex[2], 16);
//       b = parseInt(hex[3] + hex[3], 16);
//     } else if (hex.length === 7) {
//       r = parseInt(hex.slice(1, 3), 16);
//       g = parseInt(hex.slice(3, 5), 16);
//       b = parseInt(hex.slice(5, 7), 16);
//     }
//     r /= 255; g /= 255; b /= 255;
//     const max = Math.max(r, g, b), min = Math.min(r, g, b);
//     let h = 0, s = 0, l = (max + min) / 2;
//     if (max !== min) {
//       const d = max - min;
//       s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
//       switch (max) {
//         case r: h = (g - b) / d + (g < b ? 6 : 0); break;
//         case g: h = (b - r) / d + 2; break;
//         case b: h = (r - g) / d + 4; break;
//       }
//       h /= 6;
//     }
//     return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
//   }
  
//   ngOnDestroy(): void {
//     this.colorSchemeSub.unsubscribe();
//   }
// }


// // // 1. The Advanced Theme Service - with public loadSettings
// // // File: src/app/core/services/theme.service.ts

// // import { DOCUMENT } from '@angular/common';
// // import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';

// // export interface ThemeSettings { // Export interface for use in other components
// //   accentColor: string;
// //   isDarkMode: boolean;
// // }

// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class ThemeService {
// //   private renderer: Renderer2;
// //   private readonly THEME_KEY = 'app-theme-settings';

// //   constructor(
// //     @Inject(DOCUMENT) private document: Document,
// //     rendererFactory: RendererFactory2
// //   ) {
// //     this.renderer = rendererFactory.createRenderer(null, null);
// //   }

// //   /**
// //    * Initializes the theme service. Call this in your AppComponent's constructor.
// //    * It loads the saved theme or detects the system preference.
// //    */
// //   initTheme(): void {
// //     const savedSettings = this.loadSettings();
// //     if (savedSettings) {
// //       this.setTheme(savedSettings.accentColor, savedSettings.isDarkMode);
// //       // Also apply the theme class to the body
// //       const themeClass = this.getThemeClassFromHex(savedSettings.accentColor);
// //       if (themeClass) {
// //         document.body.className = document.body.className.replace(/theme-\w+/g, '');
// //         document.body.classList.add(themeClass);
// //       }
// //     } else {
// //       // Default to system preference if no theme is saved
// //       const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
// //       this.setTheme('#3B82F6', prefersDark); // Default accent color
// //       document.body.classList.add('theme-blue'); // Default theme class
// //     }
// //   }

// //   /**
// //    * The main function to set and apply a new theme.
// //    * @param accentColor The base accent color (hex format, e.g., '#3B82F6').
// //    * @param isDarkMode True for dark mode, false for light mode.
// //    */
// //   setTheme(accentColor: string, isDarkMode: boolean): void {
// //     // 1. Generate the full color palette from the accent color
// //     const palette = this.generatePalette(accentColor, isDarkMode);

// //     // 2. Apply the palette as CSS variables to the root element
// //     Object.keys(palette).forEach(key => {
// //       const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`; // e.g., themeBgPrimary -> --theme-bg-primary
// //       this.renderer.setStyle(this.document.documentElement, cssVar, palette[key as keyof typeof palette]);
// //     });

// //     // 3. Toggle the dark/light mode class on the body for global styles
// //     if (isDarkMode) {
// //       this.renderer.addClass(this.document.body, 'dark-mode');
// //       this.renderer.removeClass(this.document.body, 'light-mode');
// //     } else {
// //       this.renderer.addClass(this.document.body, 'light-mode');
// //       this.renderer.removeClass(this.document.body, 'dark-mode');
// //     }

// //     // 4. Save the new settings to localStorage
// //     this.saveSettings({ accentColor, isDarkMode });
// //   }

// //   // --- Helper Functions ---

// //   /**
// //    * FIX: Made this method public so components can access saved settings.
// //    */
// //   public loadSettings(): ThemeSettings | null {
// //     if (typeof localStorage !== 'undefined') {
// //         const saved = localStorage.getItem(this.THEME_KEY);
// //         return saved ? JSON.parse(saved) : null;
// //     }
// //     return null;
// //   }

// //   private saveSettings(settings: ThemeSettings): void {
// //     if (typeof localStorage !== 'undefined') {
// //         localStorage.setItem(this.THEME_KEY, JSON.stringify(settings));
// //     }
// //   }

// //   private getThemeClassFromHex(hex: string): string | undefined {
// //       const themes = [
// //           { name: 'Indigo', color: '#6366f1', class: 'theme-indigo' },
// //           { name: 'Slate', color: '#64748b', class: 'theme-slate' },
// //           { name: 'Red', color: '#ef4444', class: 'theme-red' },
// //           { name: 'Orange', color: '#f97316', class: 'theme-orange' },
// //           { name: 'Amber', color: '#f59e0b', class: 'theme-amber' },
// //           { name: 'Yellow', color: '#eab308', class: 'theme-yellow' },
// //           { name: 'Lime', color: '#84cc16', class: 'theme-lime' },
// //           { name: 'Green', color: '#22c55e', class: 'theme-green' },
// //           { name: 'Emerald', color: '#10b981', class: 'theme-emerald' },
// //           { name: 'Teal', color: '#14b8a6', class: 'theme-teal' },
// //           { name: 'Cyan', color: '#06b6d4', class: 'theme-cyan' },
// //           { name: 'Sky', color: '#0ea5e9', class: 'theme-sky' },
// //           { name: 'Blue', color: '#3b82f6', class: 'theme-blue' },
// //           { name: 'Violet', color: '#8b5cf6', class: 'theme-violet' },
// //           { name: 'Purple', color: '#a855f7', class: 'theme-purple' },
// //           { name: 'Fuchsia', color: '#d946ef', class: 'theme-fuchsia' },
// //           { name: 'Pink', color: '#ec4899', class: 'theme-pink' },
// //           { name: 'Rose', color: '#f43f5e', class: 'theme-rose' },
// //       ];
// //       const foundTheme = themes.find(t => t.color === hex);
// //       return foundTheme?.class;
// //   }

// //   /**
// //    * Generates a full light or dark color palette from a single accent color.
// //    */
// //   private generatePalette(accentHex: string, isDark: boolean): Record<string, string> {
// //     const { h, s, l } = this.hexToHsl(accentHex);

// //     if (isDark) {
// //       return {
// //         themeBgPrimary: `hsl(${h}, 15%, 10%)`,
// //         themeBgSecondary: `hsl(${h}, 12%, 15%)`,
// //         themeBgTertiary: `hsl(${h}, 10%, 20%)`,
// //         themeTextPrimary: `hsl(${h}, 15%, 95%)`,
// //         themeTextSecondary: `hsl(${h}, 10%, 65%)`,
// //         themeBorderPrimary: `hsl(${h}, 10%, 25%)`,
// //         themeAccentPrimary: `hsl(${h}, ${s}%, 60%)`, // Lighten accent for dark mode
// //         themeAccentPrimaryLight: `hsla(${h}, ${s}%, 60%, 0.1)`,
// //         themeButtonTextPrimary: `hsl(${h}, 20%, 10%)`,
// //       };
// //     } else {
// //       return {
// //         themeBgPrimary: `hsl(${h}, 20%, 98%)`,
// //         themeBgSecondary: `hsl(${h}, 25%, 94%)`,
// //         themeBgTertiary: `hsl(${h}, 20%, 88%)`,
// //         themeTextPrimary: `hsl(${h}, 15%, 15%)`,
// //         themeTextSecondary: `hsl(${h}, 10%, 40%)`,
// //         themeBorderPrimary: `hsl(${h}, 20%, 85%)`,
// //         themeAccentPrimary: accentHex,
// //         themeAccentPrimaryLight: `hsla(${h}, ${s}%, 50%, 0.1)`,
// //         themeButtonTextPrimary: `hsl(0, 0%, 100%)`,
// //       };
// //     }
// //   }

// //   /**
// //    * Converts a HEX color string to an HSL object.
// //    */
// //   private hexToHsl(hex: string): { h: number, s: number, l: number } {
// //     let r = 0, g = 0, b = 0;
// //     if (hex.length === 4) {
// //       r = parseInt(hex[1] + hex[1], 16);
// //       g = parseInt(hex[2] + hex[2], 16);
// //       b = parseInt(hex[3] + hex[3], 16);
// //     } else if (hex.length === 7) {
// //       r = parseInt(hex.slice(1, 3), 16);
// //       g = parseInt(hex.slice(3, 5), 16);
// //       b = parseInt(hex.slice(5, 7), 16);
// //     }
// //     r /= 255; g /= 255; b /= 255;
// //     const max = Math.max(r, g, b), min = Math.min(r, g, b);
// //     let h = 0, s = 0, l = (max + min) / 2;
// //     if (max !== min) {
// //       const d = max - min;
// //       s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
// //       switch (max) {
// //         case r: h = (g - b) / d + (g < b ? 6 : 0); break;
// //         case g: h = (b - r) / d + 2; break;
// //         case b: h = (r - g) / d + 4; break;
// //       }
// //       h /= 6;
// //     }
// //     return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
// //   }
// // }
