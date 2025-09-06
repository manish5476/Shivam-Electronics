import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

// PrimeNG
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-image-cell-renderer',
  standalone: true,
  imports: [CommonModule, AvatarModule, TooltipModule, DialogModule, ButtonModule, SkeletonModule],
  templateUrl: './image-cell-renderer.component.html',
  styleUrls: ['./image-cell-renderer.component.css']
})
export class ImageCellRendererComponent implements ICellRendererAngularComp {
  public params!: ICellRendererParams;
  public imageUrl: string | null = null;
  public displayDialog = false;
  public zoomLevel = 1;
  public loading = true;

  @Input() zoomStep = 0.2; // configurable zoom step

  agInit(params: ICellRendererParams): void {
    this.params = params;

    if (Array.isArray(params.value)) {
      this.imageUrl = params.value[0]; // show first image for now
    } else {
      this.imageUrl =
        params.value || 'https://images.unsplash.com/photo-1755930523772-79e4443c9e4a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDIwfGJvOGpRS1RhRTBZfHxlbnwwfHx8fHw%3D';
    }
  }

  refresh(params: ICellRendererParams): boolean {
    this.agInit(params);
    return true;
  }

  onImageClick(): void {
    if (this.imageUrl) {
      this.resetZoom();
      this.displayDialog = true;
    }
  }

  zoomIn(): void {
    this.zoomLevel += this.zoomStep;
  }

  zoomOut(): void {
    if (this.zoomLevel > 0.3) {
      this.zoomLevel -= this.zoomStep;
    }
  }

  resetZoom(): void {
    this.zoomLevel = 1;
  }

  onImageLoad(): void {
    this.loading = false;
  }

  // ✅ Keyboard support
  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (!this.displayDialog) return;

    switch (event.key) {
      case 'Escape':
        this.displayDialog = false;
        break;
      case '+':
        this.zoomIn();
        break;
      case '-':
        this.zoomOut();
        break;
      case '0':
        this.resetZoom();
        break;
    }
  }
}

/**import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

// PrimeNG
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-image-cell-renderer',
  standalone: true,
  imports: [CommonModule, AvatarModule, TooltipModule, DialogModule, ButtonModule, SkeletonModule],
  templateUrl: './image-cell-renderer.component.html',
  styleUrls: ['./image-cell-renderer.component.css']
})
export class ImagePreviewComponent {
  imageUrl = 'https://picsum.photos/600/600'; // sample image
  displayDialog = false;
  loading = true;

  zoomLevel = 1;
  minZoom = 0.5;
  maxZoom = 3;

  // Drag-to-pan
  isDragging = false;
  startX = 0;
  startY = 0;
  scrollLeft = 0;
  scrollTop = 0;

  onImageClick(): void {
    this.displayDialog = true;
    this.resetZoom();
  }

  // --- Zoom Controls ---
  zoomIn(): void {
    if (this.zoomLevel < this.maxZoom) this.zoomLevel = +(this.zoomLevel + 0.1).toFixed(2);
  }

  zoomOut(): void {
    if (this.zoomLevel > this.minZoom) this.zoomLevel = +(this.zoomLevel - 0.1).toFixed(2);
  }

  resetZoom(): void {
    this.zoomLevel = 1;
  }

  onImageLoad(): void {
    this.loading = false;
  }

  // --- Scroll Wheel Zoom ---
  onScrollZoom(event: WheelEvent): void {
    event.preventDefault();
    if (event.deltaY < 0) this.zoomIn();
    else this.zoomOut();
  }

  // --- Keyboard Shortcuts ---
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.displayDialog) return;
    if (event.ctrlKey && event.key === '=') this.zoomIn();
    if (event.ctrlKey && event.key === '-') this.zoomOut();
    if (event.ctrlKey && event.key.toLowerCase() === '0') this.resetZoom();
  }

  // --- Drag-to-pan ---
  onMouseDown(event: MouseEvent, container: HTMLElement): void {
    if (this.zoomLevel <= 1) return;
    this.isDragging = true;
    container.style.cursor = 'grabbing';
    this.startX = event.pageX - container.offsetLeft;
    this.startY = event.pageY - container.offsetTop;
    this.scrollLeft = container.scrollLeft;
    this.scrollTop = container.scrollTop;
  }

  onMouseMove(event: MouseEvent, container: HTMLElement): void {
    if (!this.isDragging) return;
    event.preventDefault();
    const x = event.pageX - container.offsetLeft;
    const y = event.pageY - container.offsetTop;
    const walkX = x - this.startX;
    const walkY = y - this.startY;
    container.scrollLeft = this.scrollLeft - walkX;
    container.scrollTop = this.scrollTop - walkY;
  }

  onMouseUp(container: HTMLElement): void {
    this.isDragging = false;
    container.style.cursor = 'grab';
  }
} */