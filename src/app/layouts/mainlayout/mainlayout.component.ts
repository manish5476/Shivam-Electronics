import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AsyncPipe, HeaderComponent, SidebarComponent],
  templateUrl: './mainlayout.component.html',
  styleUrls: ['./mainlayout.component.css']
})
export class MainLayoutComponent implements OnInit {
  @Input() selectedItems: any[] = [];
  @Output() search = new EventEmitter<string>();
  @Output() newItem = new EventEmitter<void>();
  @Output() deleteItems = new EventEmitter<void>();
  gradient$!: Observable<string>;
  isSidebarPinned: boolean = false;
  isSidebarHovered: boolean = false;
  isMobileMenuOpen: boolean = false;
  isLoaded: boolean = false;

  @ViewChild(RouterOutlet) outlet: RouterOutlet | undefined;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    // this.gradient$ = this.themeService.currentGradient$;
    setTimeout(() => this.isLoaded = true, 100); // Simulate loading delay
  }

  ngAfterViewInit() {
    if (this.outlet?.isActivated) {
      this.isLoaded = true;
    }
  }

  onColorChange(color: string) {
    if (color && color.startsWith('#')) {
      this.themeService.updateGradient(color);
    }
  }

  onSearch(term: string) {
    this.search.emit(term);
  }

  toggleSidebar() {
    this.isSidebarPinned = !this.isSidebarPinned;
    if (!this.isSidebarPinned) this.isSidebarHovered = false;
  }

  togglePin() {
    this.isSidebarPinned = !this.isSidebarPinned;
    if (this.isSidebarPinned) this.isSidebarHovered = true;
  }

  onMouseEnter() {
    if (!this.isSidebarPinned) this.isSidebarHovered = true;
  }

  onMouseEnterTriggerZone() {
    if (!this.isSidebarPinned) this.isSidebarHovered = true;
  }

  onMouseLeave() {
    if (!this.isSidebarPinned) this.isSidebarHovered = false;
  }

  onMouseEnterMainContent() {
    if (!this.isSidebarPinned) this.isSidebarHovered = false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}