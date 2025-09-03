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

// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ICellRendererAngularComp } from 'ag-grid-angular';
// import { ICellRendererParams } from 'ag-grid-community';

// // PrimeNG Imports for UI elements
// import { AvatarModule } from 'primeng/avatar';
// import { TooltipModule } from 'primeng/tooltip';
// import { DialogModule } from 'primeng/dialog';
// import { ButtonModule } from 'primeng/button';

// @Component({
//   selector: 'app-image-cell-renderer',
//   standalone: true,
//   imports: [
//     CommonModule,
//     AvatarModule,
//     TooltipModule,
//     DialogModule,
//     ButtonModule
//   ],
//   templateUrl: './image-cell-renderer.component.html',
//   styleUrls: ['./image-cell-renderer.component.css']
// })
// export class ImageCellRendererComponent implements ICellRendererAngularComp {
//   public params!: ICellRendererParams;
//   public imageUrl: string | null = null;
//   public displayDialog = false;
//   public zoomLevel = 1;
//   private readonly ZOOM_STEP = 0.1;

//   agInit(params: ICellRendererParams): void {
//     this.params = params;
//     this.imageUrl = params.value || 'https://www.primefaces.org/cdn/primeng/images/avatar/placeholder.png';
//   }

//   refresh(params: ICellRendererParams): boolean {
//     this.params = params;
//     this.imageUrl = params.value || 'https://www.primefaces.org/cdn/primeng/images/avatar/placeholder.png';
//     return true;
//   }

//   /**
//    * Shows the dialog and resets the zoom level to default.
//    */
//   onImageClick(): void {
//     if (this.params.value) {
//       this.resetZoom();
//       this.displayDialog = true;
//     }
//   }

//   /**
//    * Increases the image zoom level.
//    */
//   zoomIn(): void {
//     this.zoomLevel += this.ZOOM_STEP;
//   }

//   /**
//    * Decreases the image zoom level, with a minimum threshold.
//    */
//   zoomOut(): void {
//     if (this.zoomLevel > 0.2) { // Set a minimum zoom level
//       this.zoomLevel -= this.ZOOM_STEP;
//     }
//   }


//   resetZoom(): void {
//     this.zoomLevel = 1;
//   }
// }


// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ICellRendererAngularComp } from 'ag-grid-angular';
// import { ICellRendererParams } from 'ag-grid-community';

// // PrimeNG Imports for UI elements
// import { AvatarModule } from 'primeng/avatar';
// import { TooltipModule } from 'primeng/tooltip';
// import { DialogModule } from 'primeng/dialog';
// import { ButtonModule } from 'primeng/button';

// @Component({
//   selector: 'app-image-cell-renderer',
//   standalone: true,
//   imports: [
//     CommonModule,
//     AvatarModule,
//     TooltipModule,
//     DialogModule,
//     ButtonModule
//   ],
//   templateUrl: './image-cell-renderer.component.html',
//   styleUrls: ['./image-cell-renderer.component.css']
// })
// export class ImageCellRendererComponent implements ICellRendererAngularComp {
//   public params!: ICellRendererParams;
//   public imageUrl: string | null = null;
//   public displayDialog = false;

//   // AG Grid's initialization method. It's called once for each cell.
//   agInit(params: ICellRendererParams): void {
//     this.params = params;
//     // Set the image URL from the cell's value.
//     // We also provide a fallback placeholder image in case the URL is null or invalid.
//     this.imageUrl = params.value ? params.value : 'https://www.primefaces.org/cdn/primeng/images/avatar/placeholder.png';
//   }

//   // AG Grid's refresh method. It's called when data is updated.
//   refresh(params: ICellRendererParams): boolean {
//     this.params = params;
//     this.imageUrl = params.value ? params.value : 'https://www.primefaces.org/cdn/primeng/images/avatar/placeholder.png';
//     // Return true to tell AG Grid the refresh was successful.
//     return true;
//   }

//   onImageClick(): void {
//     if (this.params.value) {
//       this.displayDialog = true;
//     }
//   }
// }