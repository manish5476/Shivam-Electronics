// import { Component } from '@angular/core';
// import { ICellRendererAngularComp } from 'ag-grid-angular';
// import { ICellRendererParams } from 'ag-grid-community';
// import { CommonModule } from '@angular/common';
// import { GridContext } from '../ag-grid-reference/ag-grid-reference.component'; // Adjust path as needed

// @Component({
//   selector: 'app-actionbuttons',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="flex items-center justify-center space-x-2 h-full">
//       <ng-container *ngIf="isEditing">
//         <button
//           (click)="onSaveClick()"
//           class="text-green-600 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
//           title="Save"
//           aria-label="Save row changes"
//         >
//           <i class="pi pi-check text-lg"></i>
//         </button>
//         <button
//           (click)="onCancelClick()"
//           class="text-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
//           title="Cancel"
//           aria-label="Cancel row changes"
//         >
//           <i class="pi pi-times text-lg"></i>
//         </button>
//       </ng-container>
//       <ng-container *ngIf="!isEditing">
//         <button
//           *ngIf="params.data"
//           (click)="onEditClick()"
//           class="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           title="Edit"
//           aria-label="Edit row"
//         >
//           <i class="pi pi-pencil text-lg"></i>
//         </button>
//         <button
//           *ngIf="params.data"
//           (click)="onDeleteClick()"
//           class="text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
//           title="Delete"
//           aria-label="Delete row"
//         >
//           <i class="pi pi-trash text-lg"></i>
//         </button>
//       </ng-container>
//     </div>
//   `,
//   styles: [`
//     :host {
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       height: 100%;
//     }
//     .ag-cell {
//       overflow: visible !important;
//     }
//   `]
// })
// export class ActionbuttonsComponent implements ICellRendererAngularComp {
//   params!: ICellRendererParams;
//   isEditing: boolean = false;
//   private context!: GridContext;

//   agInit(params: ICellRendererParams): void {
//     this.params = params;
//     this.context = params.context as GridContext;
//     this.updateEditingState();
//   }

//   refresh(params: ICellRendererParams): boolean {
//     this.params = params;
//     this.updateEditingState();
//     return true;
//   }

//   private updateEditingState(): void {
//     this.isEditing = this.context?.isRowEditing(this.params.data?._id) ?? false;
//     console.log('Actionbuttons isEditing:', this.isEditing, 'Row ID:', this.params.data?._id);
//   }

//   onEditClick(): void {
//     if (this.context?.startEditingRow && this.params.data) {
//       console.log('Edit clicked for row:', this.params.data._id);
//       this.context.startEditingRow(this.params.data);
//     } else {
//       console.warn('Edit action failed: Context or row data missing');
//     }
//   }

//   onSaveClick(): void {
//     if (this.context?.saveRow && this.params.data) {
//       this.context.saveRow(this.params.data);
//     } else {
//       console.warn('Save action failed: Context or row data missing');
//     }
//   }

//   onCancelClick(): void {
//     if (this.context?.cancelEditingRow && this.params.data) {
//       this.context.cancelEditingRow(this.params.data);
//     } else {
//       console.warn('Cancel action failed: Context or row data missing');
//     }
//   }

//   onDeleteClick(): void {
//     if (this.context?.deleteRow && this.params.data) {
//       this.context.deleteRow(this.params.data);
//     } else {
//       console.warn('Delete action failed: Context or row data missing');
//     }
//   }
// }
// // import { Component } from '@angular/core';
// // import { ICellRendererAngularComp } from 'ag-grid-angular';
// // import { ICellRendererParams } from 'ag-grid-community';
// // import { CommonModule } from '@angular/common';


// // // Define the context interface for type safety
// // interface GridContext {
// //   isRowEditing: (id: string) => boolean;
// //   startEditingRow: (rowData: any) => void;
// //   saveRow: (rowData: any) => void;
// //   cancelEditingRow: (rowData: any) => void;
// //   deleteRow: (rowData: any) => void;
// // }

// // @Component({
// //   selector: 'app-actionbuttons',
// //   standalone: true,
// //   imports: [CommonModule],
// //   template: `
// //     <div class="flex items-center justify-center space-x-2 h-full">
// //       <ng-container *ngIf="isEditing">
// //         <!-- Save Button -->
// //         <button
// //           (click)="onSaveClick()"
// //           class="text-green-600 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
// //           title="Save"
// //           aria-label="Save row changes"
// //         >
// //           <i class="pi pi-check text-lg"></i>
// //         </button>
// //         <!-- Cancel Button -->
// //         <button
// //           (click)="onCancelClick()"
// //           class="text-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
// //           title="Cancel"
// //           aria-label="Cancel row changes"
// //         >
// //           <i class="pi pi-times text-lg"></i>
// //         </button>
// //       </ng-container>
// //       <ng-container *ngIf="!isEditing">
// //         <!-- Edit Button -->
// //         <button
// //           *ngIf="params.data"
// //           (click)="onEditClick()"
// //           class="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
// //           title="Edit"
// //           aria-label="Edit row"
// //         >
// //           <i class="pi pi-pencil text-lg"></i>
// //         </button>
// //         <!-- Delete Button -->
// //         <button
// //           *ngIf="params.data"
// //           (click)="onDeleteClick()"
// //           class="text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
// //           title="Delete"
// //           aria-label="Delete row"
// //         >
// //           <i class="pi pi-trash text-lg"></i>
// //         </button>
// //       </ng-container>
// //     </div>
// //   `,
// //   styles: [`
// //     :host {
// //       display: flex;
// //       align-items: center;
// //       justify-content: center;
// //       height: 100%;
// //     }
// //     .ag-cell {
// //       overflow: visible !important;
// //     }
// //   `]
// // })
// // export class ActionbuttonsComponent implements ICellRendererAngularComp {
// //   params!: ICellRendererParams;
// //   isEditing: boolean = false;
// //   private context!: GridContext;

// //   // Initialize the cell renderer with parameters from AG-Grid
// //   agInit(params: ICellRendererParams): void {
// //     this.params = params;
// //     this.context = params.context as GridContext;
// //     this.updateEditingState();
// //   }

// //   // Refresh the cell renderer when data or context changes
// //   refresh(params: ICellRendererParams): boolean {
// //     this.params = params;
// //     this.updateEditingState();
// //     return true; // Indicate that the component has handled the refresh
// //   }

// //   // Helper method to determine if the row is in editing mode
// //   private updateEditingState(): void {
// //     this.isEditing = this.context?.isRowEditing(this.params.data?._id) ?? false;
// //   }

// //   // Handle Edit button click
// //   onEditClick(): void {
// //     if (this.context?.startEditingRow && this.params.data) {
// //       this.context.startEditingRow(this.params.data);
// //     } else {
// //       console.warn('Edit action failed: Context or row data missing');
// //     }
// //   }

// //   // Handle Save button click
// //   onSaveClick(): void {
// //     if (this.context?.saveRow && this.params.data) {
// //       this.context.saveRow(this.params.data);
// //     } else {
// //       console.warn('Save action failed: Context or row data missing');
// //     }
// //   }

// //   // Handle Cancel button click
// //   onCancelClick(): void {
// //     if (this.context?.cancelEditingRow && this.params.data) {
// //       this.context.cancelEditingRow(this.params.data);
// //     } else {
// //       console.warn('Cancel action failed: Context or row data missing');
// //     }
// //   }

// //   // Handle Delete button click
// //   onDeleteClick(): void {
// //     if (this.context?.deleteRow && this.params.data) {
// //       this.context.deleteRow(this.params.data);
// //     } else {
// //       console.warn('Delete action failed: Context or row data missing');
// //     }
// //   }
// // }



// // // // src/app/components/actionbuttons/actionbuttons.component.ts
// // // import { Component } from '@angular/core';
// // // import { ICellRendererAngularComp } from 'ag-grid-angular';
// // // import { ICellRendererParams, GridApi } from 'ag-grid-community'; // Import GridApi
// // // import { CommonModule } from '@angular/common';

// // // // Define the expected context structure for type safety (optional but recommended)
// // // interface GridContext {
// // //   isRowEditing: (id: number) => boolean;
// // //   startEditingRow: (rowData: any) => void;
// // //   saveRow: (rowData: any) => void;
// // //   cancelEditingRow: (rowData: any) => void;
// // //   deleteRow: (rowData: any) => void;
// // // }


// // // @Component({
// // //   selector: 'app-actionbuttons',
// // //   standalone: true,
// // //   imports: [CommonModule], // Need CommonModule for *ngIf
// // //   template: `
// // //   <div class="flex items-center justify-center space-x-2 h-full">
// // //   <ng-container *ngIf="isEditing()">
// // //     <!-- Save Icon -->
// // //     <button
// // //       (click)="onSaveClick()"
// // //       class="text-green-600 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
// // //       title="Save"
// // //     >
// // //       <i class="pi pi-check text-lg"></i>
// // //     </button>

// // //     <!-- Cancel Icon -->
// // //     <button
// // //       (click)="onCancelClick()"
// // //       class="text-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
// // //       title="Cancel"
// // //     >
// // //       <i class="pi pi-times text-lg"></i>
// // //     </button>
// // //   </ng-container>

// // //   <ng-container *ngIf="!isEditing()">
// // //     <!-- Edit Icon -->
// // //     <button
// // //       *ngIf="params.data"
// // //       (click)="onEditClick()"
// // //       class="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
// // //       title="Edit"
// // //     >
// // //       <i class="pi pi-pencil text-lg"></i>
// // //     </button>

// // //     <!-- Delete Icon -->
// // //     <button
// // //       *ngIf="params.data"
// // //       (click)="onDeleteClick()"
// // //       class="text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
// // //       title="Delete"
// // //     >
// // //       <i class="pi pi-trash text-lg"></i>
// // //     </button>
// // //   </ng-container>
// // // </div>

// // //   `,
// // //   styles: [`
// // //     /* Optional: Add specific styles if needed */
// // //     .ag-cell {
// // //         overflow: visible !important; /* Ensure buttons are not cut off if they exceed cell boundaries slightly */
// // //     }
// // //   `]
// // // })
// // // export class ActionbuttonsComponent implements ICellRendererAngularComp {
// // //   params!: ICellRendererParams; // Hold the cell renderer parameters
// // //   private gridApi!: GridApi; // Reference to the grid API
// // //   private context!: GridContext; // Reference to the grid context


// // //   // agInit is called by ag-Grid to initialize the cell renderer
// // //   agInit(params: ICellRendererParams): void {
// // //     this.params = params;
// // //     this.gridApi = params.api;
// // //     this.context = params.context as GridContext; // Cast context for type safety
// // //   }

// // //   // refresh is called when the grid wants to refresh the cell
// // //   // We need to refresh if the editing state of the row changes
// // //   refresh(params: ICellRendererParams): boolean {
// // //     this.params = params; // Update params
// // //     // For this component, we want to refresh the buttons if the editing state changes
// // //     // Returning false forces ag-Grid to re-create the component, which is often simpler
// // //     // than manually updating the template based on state changes.
// // //     return false; // Let ag-Grid re-create the component
// // //   }

// // //   // Helper method to check if the current row is being edited
// // //   isEditing(): boolean {
// // //      // Check if the row's ID exists in the set of editing row IDs managed by the parent
// // //      return this.context && this.context.isRowEditing(this.params.data.id);
// // //   }

// // //   // --- Button Click Handlers ---

// // //   onEditClick(): void {
// // //     // Call the parent component's method to start editing this row
// // //     if (this.context && this.context.startEditingRow) {
// // //       this.context.startEditingRow(this.params.data as any);
// // //     } else {
// // //        console.warn("Context method 'startEditingRow' not found.");
// // //     }
// // //   }

// // //   onSaveClick(): void {
// // //     // Call the parent component's method to save changes for this row
// // //      if (this.context && this.context.saveRow) {
// // //        this.context.saveRow(this.params.data as any);
// // //      } else {
// // //         console.warn("Context method 'saveRow' not found.");
// // //      }
// // //   }

// // //   onCancelClick(): void {
// // //     // Call the parent component's method to cancel editing for this row
// // //      if (this.context && this.context.cancelEditingRow) {
// // //        this.context.cancelEditingRow(this.params.data as any);
// // //      } else {
// // //         console.warn("Context method 'cancelEditingRow' not found.");
// // //      }
// // //   }

// // //   onDeleteClick(): void {
// // //      // Call the parent component's method to delete this row
// // //      if (this.context && this.context.deleteRow) {
// // //        this.context.deleteRow(this.params.data as any);
// // //      } else {
// // //         console.warn("Context method 'deleteRow' not found.");
// // //      }
// // //   }
// // // }
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { GridContext } from '../ag-grid-reference/ag-grid-reference.component';

@Component({
  selector: 'app-actionbuttons',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center space-x-2 h-full">
      <ng-container *ngIf="isEditing">
        <button
          (click)="onSaveClick()"
          class="text-green-600 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          title="Save"
          aria-label="Save row changes"
        >
          <i class="pi pi-check text-lg"></i>
        </button>
        <button
          (click)="onCancelClick()"
          class="text-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
          title="Cancel"
          aria-label="Cancel row changes"
        >
          <i class="pi pi-times text-lg"></i>
        </button>
      </ng-container>
      <ng-container *ngIf="!isEditing">
        <button
          *ngIf="params.data"
          (click)="onEditClick()"
          class="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          title="Edit"
          aria-label="Edit row"
        >
          <i class="pi pi-pencil text-lg"></i>
        </button>
        <button
          *ngIf="params.data"
          (click)="onDeleteClick()"
          class="text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
          title="Delete"
          aria-label="Delete row"
        >
          <i class="pi pi-trash text-lg"></i>
        </button>
      </ng-container>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    .ag-cell {
      overflow: visible !important;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionbuttonsComponent implements ICellRendererAngularComp {
  params!: ICellRendererParams;
  isEditing: boolean = false;
  private context!: GridContext;

  constructor(private cdr: ChangeDetectorRef) {}

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.context = params.context as GridContext;
    this.updateEditingState();
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    const newEditingState = this.context?.isRowEditing(this.params.data?._id) ?? false;
    if (this.isEditing !== newEditingState) {
      this.isEditing = newEditingState;
      this.cdr.markForCheck();
      return true;
    }
    return false;
  }

  private updateEditingState(): void {
    this.isEditing = this.context?.isRowEditing(this.params.data?._id) ?? false;
  }

  onEditClick(): void {
    if (this.context?.startEditingRow && this.params.data) {
      this.context.startEditingRow(this.params.data);
    }
  }

  onSaveClick(): void {
    if (this.context?.saveRow && this.params.data) {
      this.context.saveRow(this.params.data);
    }
  }

  onCancelClick(): void {
    if (this.context?.cancelEditingRow && this.params.data) {
      this.context.cancelEditingRow(this.params.data);
    }
  }

  onDeleteClick(): void {
    if (this.context?.deleteRow && this.params.data) {
      this.context.deleteRow(this.params.data);
    }
  }
}