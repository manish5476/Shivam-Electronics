import { Component, EventEmitter, Output } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';

interface GridContext {
  isRowEditing: (id: string) => boolean;
  startEditingRow: (rowData: any) => void;
  saveRow: (rowData: any) => void;
  cancelEditingRow: (rowData: any) => void;
  deleteRow: (rowData: any) => void;
}

@Component({
  selector: 'app-actionbuttons',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center space-x-2 h-full">
      <ng-container *ngIf="isEditing">
        <!-- Save Button -->
        <button
          (click)="onSaveClick()"
          class="text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full w-6 h-6 flex items-center justify-center"
          title="Save"
          aria-label="Save row changes"
        >
          <i class="pi pi-check text-sm"></i>
        </button>
        <!-- Cancel Button -->
        <button
          (click)="onCancelClick()"
          class="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-full w-6 h-6 flex items-center justify-center"
          title="Cancel"
          aria-label="Cancel row changes"
        >
          <i class="pi pi-times text-sm"></i>
        </button>
      </ng-container>
      <ng-container *ngIf="!isEditing">
        <!-- Edit Button -->
        <button
          *ngIf="params.data"
          (click)="onEditClick()"
          class="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full w-6 h-6 flex items-center justify-center"
          title="Edit"
          aria-label="Edit row"
        >
          <i class="pi pi-pencil text-sm"></i>
        </button>
        <!-- Delete Button -->
        <button
          *ngIf="params.data"
          (click)="onDeleteClick()"
          class="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full w-6 h-6 flex items-center justify-center"
          title="Delete"
          aria-label="Delete row"
        >
          <i class="pi pi-trash text-sm"></i>
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
  `]
})
export class ActionbuttonsComponent implements ICellRendererAngularComp {
  params!: ICellRendererParams;
  isEditing: boolean = false;
  private context!: GridContext;
  @Output() actionClicked = new EventEmitter<{ action: string; data: any }>();

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.context = params.context as GridContext;
    this.updateEditingState();
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    this.context = params.context as GridContext;
    this.updateEditingState();
    return true;
  }

  private updateEditingState(): void {
    this.isEditing = this.context?.isRowEditing(this.params.data?._id) ?? false;
  }

  onEditClick(): void {
    if (this.context?.startEditingRow && this.params.data) {
      this.context.startEditingRow(this.params.data);
      this.actionClicked.emit({ action: 'edit', data: this.params.data });
    } else {
      console.warn('Edit action failed: Context or row data missing');
    }
  }

  onSaveClick(): void {
    if (this.context?.saveRow && this.params.data) {
      this.context.saveRow(this.params.data);
      this.actionClicked.emit({ action: 'save', data: this.params.data });
    } else {
      console.warn('Save action failed: Context or row data missing');
    }
  }

  onCancelClick(): void {
    if (this.context?.cancelEditingRow && this.params.data) {
      this.context.cancelEditingRow(this.params.data);
      this.actionClicked.emit({ action: 'cancel', data: this.params.data });
    } else {
      console.warn('Cancel action failed: Context or row data missing');
    }
  }

  onDeleteClick(): void {
    if (this.context?.deleteRow && this.params.data) {
      this.context.deleteRow(this.params.data);
      this.actionClicked.emit({ action: 'delete', data: this.params.data });
    } else {
      console.warn('Delete action failed: Context or row data missing');
    }
  }
}
// import { Component, EventEmitter, Output } from '@angular/core';
// import { ICellRendererAngularComp } from 'ag-grid-angular';
// import { ICellRendererParams } from 'ag-grid-community';
// import { CommonModule } from '@angular/common';

// interface GridContext {
//   isRowEditing: (id: string) => boolean;
//   startEditingRow: (rowData: any) => void;
//   saveRow: (rowData: any) => void;
//   cancelEditingRow: (rowData: any) => void;
//   deleteRow: (rowData: any) => void;
// }

// @Component({
//   selector: 'app-actionbuttons',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="flex items-center justify-center space-x-2 h-full">
//       <ng-container *ngIf="isEditing">
//         <!-- Save Button -->
//         <button
//           (click)="onSaveClick()"
//           class="text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full w-6 h-6 flex items-center justify-center"
//           title="Save"
//           aria-label="Save row changes"
//         >
//           <i class="pi pi-check text-sm"></i>
//         </button>
//         <!-- Cancel Button -->
//         <button
//           (click)="onCancelClick()"
//           class="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-full w-6 h-6 flex items-center justify-center"
//           title="Cancel"
//           aria-label="Cancel row changes"
//         >
//           <i class="pi pi-times text-sm"></i>
//         </button>
//       </ng-container>
//       <ng-container *ngIf="!isEditing">
//         <!-- Edit Button -->
//         <button
//           *ngIf="params.data"
//           (click)="onEditClick()"
//           class="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full w-6 h-6 flex items-center justify-center"
//           title="Edit"
//           aria-label="Edit row"
//         >
//           <i class="pi pi-pencil text-sm"></i>
//         </button>
//         <!-- Delete Button -->
//         <button
//           *ngIf="params.data"
//           (click)="onDeleteClick()"
//           class="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full w-6 h-6 flex items-center justify-center"
//           title="Delete"
//           aria-label="Delete row"
//         >
//           <i class="pi pi-trash text-sm"></i>
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
//   @Output() actionClicked = new EventEmitter<{ action: string; data: any }>();

//   agInit(params: ICellRendererParams): void {
//     this.params = params;
//     this.context = params.context as GridContext;
//     this.updateEditingState();
//   }

//   refresh(params: ICellRendererParams): boolean {
//     this.params = params;
//     this.context = params.context as GridContext;
//     this.updateEditingState();
//     return true;
//   }

//   private updateEditingState(): void {
//     this.isEditing = this.context?.isRowEditing(this.params.data?._id) ?? false;
//   }

//   onEditClick(): void {
//     if (this.context?.startEditingRow && this.params.data) {
//       this.context.startEditingRow(this.params.data);
//       this.actionClicked.emit({ action: 'edit', data: this.params.data });
//     } else {
//       console.warn('Edit action failed: Context or row data missing');
//     }
//   }

//   onSaveClick(): void {
//     if (this.context?.saveRow && this.params.data) {
//       this.context.saveRow(this.params.data);
//       this.actionClicked.emit({ action: 'save', data: this.params.data });
//     } else {
//       console.warn('Save action failed: Context or row data missing');
//     }
//   }

//   onCancelClick(): void {
//     if (this.context?.cancelEditingRow && this.params.data) {
//       this.context.cancelEditingRow(this.params.data);
//       this.actionClicked.emit({ action: 'cancel', data: this.params.data });
//     } else {
//       console.warn('Cancel action failed: Context or row data missing');
//     }
//   }

//   onDeleteClick(): void {
//     if (this.context?.deleteRow && this.params.data) {
//       this.context.deleteRow(this.params.data);
//       this.actionClicked.emit({ action: 'delete', data: this.params.data });
//     } else {
//       console.warn('Delete action failed: Context or row data missing');
//     }
//   }
// }

// // import { Component } from '@angular/core';
// // import { ICellRendererAngularComp } from 'ag-grid-angular';
// // import { ICellRendererParams } from 'ag-grid-community';
// // import { CommonModule } from '@angular/common';
// // interface GridContext {
// //   // stopEditing:  (id: string) => boolean;
// //   isRowEditing: (id: string) => boolean;
// //   startEditingRow: (rowData: any) => void;
// //   stopEditing : (cancel: boolean) => void;
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

// //   refresh(params: ICellRendererParams): boolean {
// //     this.params = params;
// //     this.context = params.context as GridContext; // <-- Add this line
// //     this.updateEditingState();
// //     return true;
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
// //     if (this.context?.stopEditing) {
// //       this.context.stopEditing(true); // cancel = true
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