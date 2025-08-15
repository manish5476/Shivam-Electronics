// 1. The Advanced Theme Service - with public loadSettings
// File: src/app/core/services/theme.service.ts

import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';

export interface ThemeSettings { // Export interface for use in other components
  accentColor: string;
  isDarkMode: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private readonly THEME_KEY = 'app-theme-settings';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Initializes the theme service. Call this in your AppComponent's constructor.
   * It loads the saved theme or detects the system preference.
   */
  initTheme(): void {
    const savedSettings = this.loadSettings();
    if (savedSettings) {
      this.setTheme(savedSettings.accentColor, savedSettings.isDarkMode);
      // Also apply the theme class to the body
      const themeClass = this.getThemeClassFromHex(savedSettings.accentColor);
      if (themeClass) {
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(themeClass);
      }
    } else {
      // Default to system preference if no theme is saved
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme('#3B82F6', prefersDark); // Default accent color
      document.body.classList.add('theme-blue'); // Default theme class
    }
  }

  /**
   * The main function to set and apply a new theme.
   * @param accentColor The base accent color (hex format, e.g., '#3B82F6').
   * @param isDarkMode True for dark mode, false for light mode.
   */
  setTheme(accentColor: string, isDarkMode: boolean): void {
    // 1. Generate the full color palette from the accent color
    const palette = this.generatePalette(accentColor, isDarkMode);

    // 2. Apply the palette as CSS variables to the root element
    Object.keys(palette).forEach(key => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`; // e.g., themeBgPrimary -> --theme-bg-primary
      this.renderer.setStyle(this.document.documentElement, cssVar, palette[key as keyof typeof palette]);
    });

    // 3. Toggle the dark/light mode class on the body for global styles
    if (isDarkMode) {
      this.renderer.addClass(this.document.body, 'dark-mode');
      this.renderer.removeClass(this.document.body, 'light-mode');
    } else {
      this.renderer.addClass(this.document.body, 'light-mode');
      this.renderer.removeClass(this.document.body, 'dark-mode');
    }

    // 4. Save the new settings to localStorage
    this.saveSettings({ accentColor, isDarkMode });
  }

  // --- Helper Functions ---

  /**
   * FIX: Made this method public so components can access saved settings.
   */
  public loadSettings(): ThemeSettings | null {
    if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.THEME_KEY);
        return saved ? JSON.parse(saved) : null;
    }
    return null;
  }

  private saveSettings(settings: ThemeSettings): void {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.THEME_KEY, JSON.stringify(settings));
    }
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

  /**
   * Generates a full light or dark color palette from a single accent color.
   */
  private generatePalette(accentHex: string, isDark: boolean): Record<string, string> {
    const { h, s, l } = this.hexToHsl(accentHex);

    if (isDark) {
      return {
        themeBgPrimary: `hsl(${h}, 15%, 10%)`,
        themeBgSecondary: `hsl(${h}, 12%, 15%)`,
        themeBgTertiary: `hsl(${h}, 10%, 20%)`,
        themeTextPrimary: `hsl(${h}, 15%, 95%)`,
        themeTextSecondary: `hsl(${h}, 10%, 65%)`,
        themeBorderPrimary: `hsl(${h}, 10%, 25%)`,
        themeAccentPrimary: `hsl(${h}, ${s}%, 60%)`, // Lighten accent for dark mode
        themeAccentPrimaryLight: `hsla(${h}, ${s}%, 60%, 0.1)`,
        themeButtonTextPrimary: `hsl(${h}, 20%, 10%)`,
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
        themeButtonTextPrimary: `hsl(0, 0%, 100%)`,
      };
    }
  }

  /**
   * Converts a HEX color string to an HSL object.
   */
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
}

// // 1. The Advanced Theme Service
// // File: src/app/core/services/theme.service.ts

// import { DOCUMENT } from '@angular/common';
// import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';

// interface ThemeSettings {
//   accentColor: string;
//   isDarkMode: boolean;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class ThemeService {
//   private renderer: Renderer2;
//   private readonly THEME_KEY = 'app-theme-settings';

//   constructor(
//     @Inject(DOCUMENT) private document: Document,
//     rendererFactory: RendererFactory2
//   ) {
//     this.renderer = rendererFactory.createRenderer(null, null);
//   }

//   /**
//    * Initializes the theme service. Call this in your AppComponent's constructor.
//    * It loads the saved theme or detects the system preference.
//    */
//   initTheme(): void {
//     const savedSettings = this.loadSettings();
//     if (savedSettings) {
//       this.setTheme(savedSettings.accentColor, savedSettings.isDarkMode);
//     } else {
//       // Default to system preference if no theme is saved
//       const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
//       this.setTheme('#3B82F6', prefersDark); // Default accent color
//     }
//   }

//   /**
//    * The main function to set and apply a new theme.
//    * @param accentColor The base accent color (hex format, e.g., '#3B82F6').
//    * @param isDarkMode True for dark mode, false for light mode.
//    */
//   setTheme(accentColor: string, isDarkMode: boolean): void {
//     // 1. Generate the full color palette from the accent color
//     const palette = this.generatePalette(accentColor, isDarkMode);

//     // 2. Apply the palette as CSS variables to the root element
//     Object.keys(palette).forEach(key => {
//       const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`; // e.g., themeBgPrimary -> --theme-bg-primary
//       this.renderer.setStyle(this.document.documentElement, cssVar, palette[key as keyof typeof palette]);
//     });

//     // 3. Toggle the dark/light mode class on the body for global styles
//     if (isDarkMode) {
//       this.renderer.addClass(this.document.body, 'dark-mode');
//       this.renderer.removeClass(this.document.body, 'light-mode');
//     } else {
//       this.renderer.addClass(this.document.body, 'light-mode');
//       this.renderer.removeClass(this.document.body, 'dark-mode');
//     }

//     // 4. Save the new settings to localStorage
//     this.saveSettings({ accentColor, isDarkMode });
//   }

//   // --- Private Helper Functions ---

//   private saveSettings(settings: ThemeSettings): void {
//     localStorage.setItem(this.THEME_KEY, JSON.stringify(settings));
//   }

//   private loadSettings(): ThemeSettings | null {
//     const saved = localStorage.getItem(this.THEME_KEY);
//     return saved ? JSON.parse(saved) : null;
//   }

//   /**
//    * Generates a full light or dark color palette from a single accent color.
//    */
//   private generatePalette(accentHex: string, isDark: boolean): Record<string, string> {
//     const { h, s, l } = this.hexToHsl(accentHex);

//     if (isDark) {
//       return {
//         themeBgPrimary: `hsl(${h}, 15%, 10%)`,
//         themeBgSecondary: `hsl(${h}, 12%, 15%)`,
//         themeBgTertiary: `hsl(${h}, 10%, 20%)`,
//         themeTextPrimary: `hsl(${h}, 15%, 95%)`,
//         themeTextSecondary: `hsl(${h}, 10%, 65%)`,
//         themeBorderPrimary: `hsl(${h}, 10%, 25%)`,
//         themeAccentPrimary: `hsl(${h}, ${s}%, 60%)`, // Lighten accent for dark mode
//         themeAccentPrimaryLight: `hsla(${h}, ${s}%, 60%, 0.1)`,
//         themeButtonTextPrimary: `hsl(${h}, 20%, 10%)`,
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
//         themeButtonTextPrimary: `hsl(0, 0%, 100%)`,
//       };
//     }
//   }

//   /**
//    * Converts a HEX color string to an HSL object.
//    */
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
// }

// // import { DOCUMENT } from '@angular/common';
// // import { Inject, Injectable } from '@angular/core';

// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class ThemeService {
// //   constructor(@Inject(DOCUMENT) private document: Document) {}

// //   updateGradient(color: string) {
// //     // Ensure color is a valid hex (normalize if needed)
// //     const normalizedColor = color.startsWith('#') ? color : `#${color}`;
// //     this.document.documentElement.style.setProperty('--theme-accent-primary', normalizedColor);
// //     this.document.documentElement.style.setProperty('--theme-accent-primary-light', this.lightenColor(normalizedColor, 0.3));
// //     this.document.documentElement.style.setProperty('--theme-button-bg-primary', normalizedColor);
// //     this.document.documentElement.style.setProperty('--theme-button-hover-bg-primary', this.darkenColor(normalizedColor, 0.8));
// //   }

// //   toggleTheme(isDark: boolean) {
// //     const body = this.document.body;
// //     if (isDark) {
// //       body.classList.add('dark-mode');
// //       body.classList.remove('light-mode');
// //     } else {
// //       body.classList.add('light-mode');
// //       body.classList.remove('dark-mode');
// //     }
// //   }

// //   private lightenColor(color: string, alpha: number): string {
// //     if (color.startsWith('#')) {
// //       const r = parseInt(color.slice(1, 3), 16);
// //       const g = parseInt(color.slice(3, 5), 16);
// //       const b = parseInt(color.slice(5, 7), 16);
// //       return `rgba(${r}, ${g}, ${b}, ${alpha})`;
// //     }
// //     return color;
// //   }

// //   private darkenColor(color: string, factor: number): string {
// //     if (color.startsWith('#')) {
// //       const r = Math.max(0, parseInt(color.slice(1, 3), 16) * factor);
// //       const g = Math.max(0, parseInt(color.slice(3, 5), 16) * factor);
// //       const b = Math.max(0, parseInt(color.slice(5, 7), 16) * factor);
// //       return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
// //     }
// //     return color;
// //   }
// // }
