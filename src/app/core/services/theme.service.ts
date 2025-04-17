import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkMode = false;

  private gradientSubject = new BehaviorSubject<string>('linear-gradient(90.1deg, rgba(8,81,98,1) 14.5%, rgba(198,231,249,1) 135.4%)');
    currentGradient$ = this.gradientSubject.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    this.darkMode = savedTheme === 'dark';
    this.applyTheme();
  }

  updateGradient(color: string) {
    const newGradient = `linear-gradient(90.1deg, ${color} 14.5%, rgba(198,231,249,1) 135.4%)`; // Dynamic gradient
    this.gradientSubject.next(newGradient);
  }

 
  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
  }
}
