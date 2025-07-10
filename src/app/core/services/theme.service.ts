import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  updateGradient(color: string) {
    // Ensure color is a valid hex (normalize if needed)
    const normalizedColor = color.startsWith('#') ? color : `#${color}`;
    this.document.documentElement.style.setProperty('--theme-accent-primary', normalizedColor);
    this.document.documentElement.style.setProperty('--theme-accent-primary-light', this.lightenColor(normalizedColor, 0.3));
    this.document.documentElement.style.setProperty('--theme-button-bg-primary', normalizedColor);
    this.document.documentElement.style.setProperty('--theme-button-hover-bg-primary', this.darkenColor(normalizedColor, 0.8));
  }

  toggleTheme(isDark: boolean) {
    const body = this.document.body;
    if (isDark) {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    } else {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    }
  }

  private lightenColor(color: string, alpha: number): string {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  }

  private darkenColor(color: string, factor: number): string {
    if (color.startsWith('#')) {
      const r = Math.max(0, parseInt(color.slice(1, 3), 16) * factor);
      const g = Math.max(0, parseInt(color.slice(3, 5), 16) * factor);
      const b = Math.max(0, parseInt(color.slice(5, 7), 16) * factor);
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }
    return color;
  }
}
