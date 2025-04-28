import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, CellValueChangedEvent, RowSelectedEvent, CellClickedEvent, CellKeyDownEvent, FullWidthCellKeyDownEvent } from 'ag-grid-community';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';
import { AllCommunityModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ActionbuttonsComponent } from '../../AgGridcomponents/actionbuttons/actionbuttons.component';
import { DynamicCellComponent } from '../../AgGridcomponents/dynamic-cell/dynamic-cell.component';
import { GridContext } from '../../../../interfaces/grid-context.interface';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-shared-grid',
  standalone: true,
  imports: [AgGridAngular, FormsModule, ToolbarModule, CommonModule, SelectModule],
  template: `
    <div class="rounded-lg shadow-lg overflow-hidden w-full mb-0 mt-4 ag-grid-container"
         style="background: var(--background); color: var(--text-color); border-color: var(--border-color)">
      <div class="relative w-full" [style.width]="gridWidth" [style.padding]="padding" [style.height]="gridHeight">
        <ag-grid-angular
          style="height: 100%; width: 100%;"
          [rowData]="rowData"
          [columnDefs]="columnDefs"
          [class]="theme"
          [defaultColDef]="defaultColDef"
          [pagination]="true"
          [rowSelection]="rowSelection"
          [rowClassRules]="rowClassrules"
          [editType]="'fullRow'"
          [rowModelType]="'clientSide'"
          [cacheBlockSize]="50"
          [maxBlocksInCache]="10"
          [suppressHorizontalScroll]="false"
          (cellValueChanged)="onCellValueChanged($event)"
          (rowSelected)="onRowSelected($event)"
          (cellClicked)="onCellClicked($event)"
          (gridReady)="onGridReady($event)"
          (cellEditingStarted)="onCellEditingStarted($event)"
          (cellKeyDown)="onCellKeyDown($event)"
          [getRowId]="getRowId"
        ></ag-grid-angular>
      </div>
    </div>
  `,
  styles: [`
    .ag-grid-container {
      width: 100% !important;
      height: 100% !important;
    }
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class SharedGridComponent implements OnInit, OnChanges {
  @Input() rowClassrules: any;
  @Input() usertheme: string = 'ag-theme-quartz';
  @Input() data: any[] = [];
  @Input() rowSelectionMode: string = 'single';
  @Input() column: ColDef[] = [];
  @Input() gridHeight: string = '500px';
  @Input() gridWidth: string = '100%';
  @Input() padding: string = '0 0px';

  @Output() dataChanged = new EventEmitter<any>();
  @Output() eventFromGrid = new EventEmitter<any>();
  @Output() gridReady = new EventEmitter<GridReadyEvent>();

  private gridApi!: GridApi;
  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  editingRowId: string | null = null;
  originalRowData: any = {};

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    minWidth: 150,
    flex: 1,
    editable: (params) => {
      return this.editingRowId === params.data._id;
    }
  };

  rowSelection: any = { mode: 'single' };
  theme: string = 'ag-theme-quartz';

  getRowId = (params: { data: any }) => params.data._id;

  ngOnInit(): void {
    this.theme = this.usertheme || 'ag-theme-quartz';
    this.rowSelection = { mode: this.rowSelectionMode };
    this.updateColumnDefs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.rowData = Array.isArray(changes['data'].currentValue) ? changes['data'].currentValue : [];
    }
    if (changes['column'] && changes['column'].currentValue) {
      this.columnDefs = changes['column'].currentValue;
      this.updateColumnDefs();
    }
    if (changes['rowSelectionMode']) {
      this.rowSelection = { mode: this.rowSelectionMode };
    }
  }

  updateColumnDefs() {
    if (!this.column || this.column.length === 0) {
      this.columnDefs = this.generateDefaultColumns(this.rowData);
    } else {
      this.columnDefs = [...this.column];
    }
    this.addActionButtonCol();
  }

  addActionButtonCol() {
    const alreadyExists = this.columnDefs.some((col: ColDef) => col.colId === 'actionButtons');
    if (alreadyExists) return;
    const context: GridContext = {
      isRowEditing: (id: string) => this.editingRowId === id,
      startEditingRow: (rowData: any) => this.startEditingRow(rowData),
      saveRow: (rowData: any) => this.saveRow(rowData),
      cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
      deleteRow: (rowData: any) => this.deleteRow(rowData),
    };
    this.columnDefs.push({
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: ActionbuttonsComponent,
      editable: false,
      colId: 'actionButtons',
      cellRendererParams: { context },
      pinned: 'right',
      width: 120,
      minWidth: 120,
      maxWidth: 120,
    });
    this.columnDefs = this.columnDefs.map(col => {
      return {
        ...col,
        cellRendererParams: {
          ...col.cellRendererParams,
          context
        },
        cellEditor: col.cellRenderer === DynamicCellComponent ? DynamicCellComponent : undefined,
        cellEditorParams: col.cellRenderer === DynamicCellComponent ? { ...col.cellRendererParams } : undefined
      };
    });
  }

  startEditingRow(rowData: any) {
    if (!this.gridApi) {
      console.error('Grid API not initialized');
      return;
    }
    console.log('Starting edit for row:', rowData._id);
    this.editingRowId = rowData._id;
    this.originalRowData = { ...rowData };
    const rowIndex = this.getRowIndex(rowData);
    if (rowIndex >= 0) {
      this.gridApi.startEditingCell({ rowIndex, colKey: this.columnDefs[0].field || 'email' });
    }
    // Refresh only the action buttons to update their state
    this.gridApi.refreshCells({
      rowNodes: [this.gridApi.getRowNode(rowData._id)!],
      columns: ['actionButtons'],
      force: false,
      suppressFlash: true,
    });
  }

  saveRow(rowData: any) {
    if (!this.gridApi) return;
    console.time('Save row');
    this.gridApi.stopEditing(true);
    this.editingRowId = null;
    // Update the row data in place without triggering a full refresh
    const rowIndex = this.getRowIndex(rowData);
    if (rowIndex >= 0) {
      this.rowData[rowIndex] = { ...rowData };
      // Refresh only the affected row, without forcing a full re-render
      this.gridApi.refreshCells({
        rowNodes: [this.gridApi.getRowNode(rowData._id)!],
        force: false,
        suppressFlash: true,
      });
    }
    this.dataChanged.emit({ type: 'save', data: rowData });
    console.timeEnd('Save row');
  }

  cancelEditingRow(rowData: any) {
    if (!this.gridApi) return;
    console.time('Cancel edit');
    this.gridApi.stopEditing(false);
    const rowIndex = this.getRowIndex(rowData);
    if (rowIndex >= 0) {
      const restoredRow = { ...this.originalRowData };
      this.rowData[rowIndex] = restoredRow;
      // Refresh only the affected row
      this.gridApi.refreshCells({
        rowNodes: [this.gridApi.getRowNode(rowData._id)!],
        force: false,
        suppressFlash: true,
      });
    }
    this.editingRowId = null;
    console.timeEnd('Cancel edit');
  }

  deleteRow(rowData: any) {
    if (!this.gridApi) return;
    console.log('Deleting row:', rowData._id);
    this.rowData = this.rowData.filter(row => row._id !== rowData._id);
    this.gridApi.applyTransaction({ remove: [rowData] });
    this.dataChanged.emit({ type: 'delete', data: rowData });
  }

  getRowIndex(rowData: any): number {
    return this.rowData.findIndex(row => row._id === rowData._id);
  }

  generateDefaultColumns(data: any[]): ColDef[] {
    if (data && data.length > 0) {
      const context = this.getGridContext();
      return Object.keys(data[0]).map(key => ({
        headerName: key.charAt(0).toUpperCase() + key.slice(1),
        field: key,
        cellRenderer: DynamicCellComponent,
        cellEditor: DynamicCellComponent,
        cellRendererParams: { type: 'text', context },
        cellEditorParams: { type: 'text', context },
        minWidth: 150,
        flex: 1,
      }));
    }
    return [];
  }

  private getGridContext(): GridContext {
    return {
      isRowEditing: (id: string) => this.editingRowId === id,
      startEditingRow: (rowData: any) => this.startEditingRow(rowData),
      saveRow: (rowData: any) => this.saveRow(rowData),
      cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
      deleteRow: (rowData: any) => this.deleteRow(rowData),
    };
  }

  onCellValueChanged(event: CellValueChangedEvent) {
    console.log('Cell value changed:', event);
    this.eventFromGrid.emit({ eventType: 'onCellValueChanged', event });
  }

  onRowSelected(event: RowSelectedEvent) {
    this.eventFromGrid.emit({ eventType: 'RowSelectedEvent', event });
  }

  onCellClicked(event: CellClickedEvent) {
    this.eventFromGrid.emit({ eventType: 'CellClickedEvent', event });
  }

  onCellEditingStarted(event: any) {
    console.log('Cell editing started:', event.colDef.field);
  }

  onCellKeyDown(event: CellKeyDownEvent<any, any> | FullWidthCellKeyDownEvent<any, any>) {
    if ('column' in event && event.event instanceof KeyboardEvent && event.event.key === 'Tab') {
      console.log('Tab pressed in cell:', event.colDef.field, 'Row:', event.rowIndex);
      const colId = event.column.getColId();
      const rowIndex = event.rowIndex;
      const allColumns = this.gridApi.getColumns() || [];
      const currentIndex = allColumns.findIndex(col => col.getColId() === colId);
      let nextIndex = event.event.shiftKey ? currentIndex - 1 : currentIndex + 1;

      if (rowIndex === null) {
        console.warn('Row index is null, skipping tab navigation');
        return;
      }

      while (nextIndex >= 0 && nextIndex < allColumns.length) {
        const nextCol = allColumns[nextIndex];
        if (nextCol.getColDef().editable) {
          setTimeout(() => {
            this.gridApi.startEditingCell({ rowIndex, colKey: nextCol.getColId() });
          }, 0);
          break;
        }
        nextIndex = event.event.shiftKey ? nextIndex - 1 : nextIndex + 1;
      }
    } else {
      console.log('Tab pressed in full-width cell or unsupported event, skipping navigation');
    }
  }

  onGridReady(event: GridReadyEvent) {
    console.time('Grid initialization');
    this.gridApi = event.api;
    const allColumnIds = this.gridApi.getColumns()?.map(col => col.getColId()) || [];
    this.gridApi.autoSizeColumns(allColumnIds, false);
    this.gridReady.emit(event);
    console.timeEnd('Grid initialization');
  }

  exportToCSV() {
    this.gridApi.exportDataAsCsv();
  }
}
// // import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
// // import { AgGridAngular } from 'ag-grid-angular';
// // import { ColDef, GridApi, GridReadyEvent, CellValueChangedEvent,themeQuartz, RowSelectedEvent, CellClickedEvent } from 'ag-grid-community';
// // import { FormsModule } from '@angular/forms';
// // import { CommonModule } from '@angular/common';
// // import { SelectModule } from 'primeng/select';
// // import { ToolbarModule } from 'primeng/toolbar';
// // import { AllCommunityModule } from 'ag-grid-community';
// // import { ModuleRegistry } from 'ag-grid-community';
// // import { ActionbuttonsComponent } from '../../AgGridcomponents/actionbuttons/actionbuttons.component';
// // import { DynamicCellComponent } from '../../AgGridcomponents/dynamic-cell/dynamic-cell.component';
// // import { GridContext } from '../../../../interfaces/grid-context.interface';
// // ModuleRegistry.registerModules([AllCommunityModule]);

// // @Component({
// //   selector: 'app-shared-grid',
// //   standalone: true,
// //   imports: [AgGridAngular, FormsModule, ToolbarModule, CommonModule, SelectModule],
// //   template: `
// //   <div class="rounded-lg shadow-lg overflow-hidden w-full mb-0 mt-4 ag-grid-container"
// //   style="background: var(--background); color: var(--text-color); border-color: var(--border-color)">
// //   <div class="relative w-full" [style.width]="gridWidth" [style.padding]="padding" [style.height]="gridHeight">

// //     <ag-grid-angular style="height: 100%; width: 100%;" [rowData]="rowData" [columnDefs]="columnDefs" [theme]="theme"           [editType]="'fullRow'"
// //     [class]="theme"          (cellEditingStarted)="onCellEditingStarted($event)"


// //       [defaultColDef]="defaultColDef" [pagination]="true" [rowSelection]="rowSelection" [rowClassRules]="rowClassrules"
// //       (cellValueChanged)="onCellValueChanged($event)" (rowSelected)="onRowSelected($event)"
// //       (cellClicked)="onCellClicked($event)" (gridReady)="onGridReady($event)"  [getRowId]="getRowId">
// //     </ag-grid-angular>
// //   </div>
// // </div>
// //     <!-- <div class="rounded-lg shadow-lg overflow-hidden w-full mb-0 mt-4 ag-grid-container"
// //          style="background: var(--background); color: var(--text-color); border-color: var(--border-color)">
// //       <div class="relative w-full" [style.width]="gridWidth" [style.padding]="padding" [style.height]="gridHeight">
// //         <ag-grid-angular
// //           style="height: 100%; width: 100%;"
// //           [rowData]="rowData"
// //           [columnDefs]="columnDefs"
// //           [class]="theme"
// //           [defaultColDef]="defaultColDef"
// //           [pagination]="true"
// //           [rowSelection]="rowSelection"
// //           [rowClassRules]="rowClassrules"
// //           [editType]="'fullRow'"
// //           (cellValueChanged)="onCellValueChanged($event)"
// //           (rowSelected)="onRowSelected($event)"
// //           (cellClicked)="onCellClicked($event)"
// //           (gridReady)="onGridReady($event)"
// //           (cellEditingStarted)="onCellEditingStarted($event)"
// //           [getRowId]="getRowId"
// //         ></ag-grid-angular>
// //       </div>
// //     </div> -->
// //   `,
// //   styles: [`
// //     .ag-grid-container {
// //       /* Add custom styles if needed */
// //     }
// //   `]
// // })
// // export class SharedGridComponent implements OnInit, OnChanges {
// //   @Input() rowClassrules: any;
// //   @Input() usertheme: string = 'ag-theme-quartz';
// //   @Input() data: any[] = [];
// //   @Input() rowSelectionMode: string = 'single';
// //   @Input() column: ColDef[] = [];
// //   @Input() gridHeight: string = '500px';
// //   @Input() gridWidth: string = '100%';
// //   @Input() padding: string = '0 0px';

// //   @Output() dataChanged = new EventEmitter<any>();
// //   @Output() eventFromGrid = new EventEmitter<any>();
// //   @Output() gridReady = new EventEmitter<GridReadyEvent>();

// //   private gridApi!: GridApi;
// //   rowData: any[] = [];
// //   columnDefs: ColDef[] = [];
// //   editingRowId: string | null = null;
// //   originalRowData: any = {};
// //   theme = themeQuartz;
// //   defaultColDef: ColDef = {
// //     sortable: true,
// //     filter: true,
// //     resizable: true,
// //     floatingFilter: true,
// //     editable: (params) => {
// //       console.log('Editable check:', this.editingRowId, params.data._id, this.editingRowId === params.data._id);
// //       return this.editingRowId === params.data._id;
// //     }
// //   };

// //   rowSelection: any = { mode: 'single' };

// //   getRowId = (params: { data: any }) => params.data._id;

// //   ngOnInit(): void {
// //     this.rowSelection = { mode: this.rowSelectionMode };
// //     this.updateColumnDefs();
// //   }

// //   ngOnChanges(changes: SimpleChanges): void {
// //     if (changes['data'] && changes['data'].currentValue) {
// //       this.rowData = Array.isArray(changes['data'].currentValue) ? changes['data'].currentValue : [];
// //     }
// //     if (changes['column'] && changes['column'].currentValue) {
// //       this.columnDefs = changes['column'].currentValue;
// //       this.updateColumnDefs();
// //     }
// //     if (changes['rowSelectionMode']) {
// //       this.rowSelection = { mode: this.rowSelectionMode };
// //     }
// //   }

// //   updateColumnDefs() {
// //     if (!this.column || this.column.length === 0) {
// //       this.columnDefs = this.generateDefaultColumns(this.rowData);
// //     } else {
// //       this.columnDefs = [...this.column];
// //     }
// //     this.addActionButtonCol();
// //   }

// //   addActionButtonCol() {
// //     const alreadyExists = this.columnDefs.some((col: ColDef) => col.colId === 'actionButtons');
// //     if (alreadyExists) return;
// //     const context: GridContext = {
// //       isRowEditing: (id: string) => {
// //         console.log('isRowEditing:', id, this.editingRowId, this.editingRowId === id);
// //         return this.editingRowId === id;
// //       },
// //       startEditingRow: (rowData: any) => this.startEditingRow(rowData),
// //       saveRow: (rowData: any) => this.saveRow(rowData),
// //       cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
// //       deleteRow: (rowData: any) => this.deleteRow(rowData),
// //     };
// //     this.columnDefs.push({
// //       headerName: 'Actions',
// //       field: 'actions',
// //       cellRenderer: ActionbuttonsComponent,
// //       editable: false,
// //       colId: 'actionButtons',
// //       cellRendererParams: { context },
// //       pinned: 'right',
// //       width: 160,
// //     });
// //     this.columnDefs = this.columnDefs.map(col => ({
// //       ...col,
// //       cellRendererParams: {
// //         ...col.cellRendererParams,
// //         context
// //       },
// //       cellEditor: col.cellRenderer === DynamicCellComponent ? DynamicCellComponent : undefined,
// //       cellEditorParams: col.cellRenderer === DynamicCellComponent ? col.cellRendererParams : undefined
// //     }));
// //   }

// //   startEditingRow(rowData: any) {
// //     if (!this.gridApi) {
// //       console.error('Grid API not initialized');
// //       return;
// //     }
// //     console.log('Starting edit for row:', rowData._id);
// //     this.editingRowId = rowData._id;
// //     this.originalRowData = { ...rowData };
// //     this.gridApi.refreshCells({ force: true });
// //     const rowIndex = this.getRowIndex(rowData);
// //     if (rowIndex >= 0) {
// //       this.gridApi.startEditingCell({ rowIndex, colKey: this.columnDefs[0].field || 'email' });
// //     }
// //   }

// //   saveRow(rowData: any) {
// //     if (!this.gridApi) return;
// //     console.log('Saving row:', rowData._id);
// //     this.gridApi.stopEditing(true);
// //     this.editingRowId = null;
// //     this.gridApi.applyTransaction({ update: [rowData] });
// //     this.gridApi.refreshCells({ force: true });
// //     this.dataChanged.emit({ type: 'save', data: rowData });
// //   }

// //   cancelEditingRow(rowData: any) {
// //     if (!this.gridApi) return;
// //     console.log('Cancelling edit for row:', rowData._id);
// //     this.gridApi.stopEditing(false);
// //     const rowIndex = this.getRowIndex(rowData);
// //     if (rowIndex >= 0) {
// //       const restoredRow = { ...this.originalRowData };
// //       this.rowData[rowIndex] = restoredRow;
// //       this.gridApi.applyTransaction({ update: [restoredRow] });
// //       this.editingRowId = null;
// //       this.gridApi.refreshCells({ force: true });
// //     }
// //   }

// //   deleteRow(rowData: any) {
// //     if (!this.gridApi) return;
// //     console.log('Deleting row:', rowData._id);
// //     this.rowData = this.rowData.filter(row => row._id !== rowData._id);
// //     this.gridApi.applyTransaction({ remove: [rowData] });
// //     this.dataChanged.emit({ type: 'delete', data: rowData });
// //   }

// //   getRowIndex(rowData: any): number {
// //     return this.rowData.findIndex(row => row._id === rowData._id);
// //   }

// //   generateDefaultColumns(data: any[]): ColDef[] {
// //     if (data && data.length > 0) {
// //       const context = this.getGridContext();
// //       return Object.keys(data[0]).map(key => ({
// //         headerName: key.charAt(0).toUpperCase() + key.slice(1),
// //         field: key,
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: { type: 'text', context },
// //         cellEditorParams: { type: 'text', context }
// //       }));
// //     }
// //     return [];
// //   }

// //   private getGridContext(): GridContext {
// //     return {
// //       isRowEditing: (id: string) => this.editingRowId === id,
// //       startEditingRow: (rowData: any) => this.startEditingRow(rowData),
// //       saveRow: (rowData: any) => this.saveRow(rowData),
// //       cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
// //       deleteRow: (rowData: any) => this.deleteRow(rowData),
// //     };
// //   }

// //   onCellValueChanged(event: CellValueChangedEvent) {
// //     console.log('Cell value changed:', event);
// //     this.eventFromGrid.emit({ eventType: 'onCellValueChanged', event });
// //   }

// //   onRowSelected(event: RowSelectedEvent) {
// //     this.eventFromGrid.emit({ eventType: 'RowSelectedEvent', event });
// //   }

// //   onCellClicked(event: CellClickedEvent) {
// //     this.eventFromGrid.emit({ eventType: 'CellClickedEvent', event });
// //   }

// //   onCellEditingStarted(event: any) {
// //     console.log('Cell editing started:', event);
// //   }

// //   onGridReady(event: GridReadyEvent) {
// //     this.gridApi = event.api;
// //     this.gridReady.emit(event);
// //   }

// //   exportToCSV() {
// //     this.gridApi.exportDataAsCsv();
// //   }
// // }
// // // import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
// // // import { AgGridAngular } from 'ag-grid-angular';
// // // import { ColDef, GridApi, GridReadyEvent, CellValueChangedEvent, RowSelectedEvent, CellClickedEvent } from 'ag-grid-community';
// // // import { FormsModule } from '@angular/forms';
// // // import { CommonModule } from '@angular/common';
// // // import { SelectModule } from 'primeng/select';
// // // import { ToolbarModule } from 'primeng/toolbar';
// // // import { AllCommunityModule } from 'ag-grid-community';
// // // import { ModuleRegistry } from 'ag-grid-community';
// // // import { ActionbuttonsComponent } from '../../AgGridcomponents/actionbuttons/actionbuttons.component';
// // // import { DynamicCellComponent } from '../../AgGridcomponents/dynamic-cell/dynamic-cell.component';
// // // import { GridContext } from '../../../../interfaces/grid-context.interface';

// // // ModuleRegistry.registerModules([AllCommunityModule]);

// // // @Component({
// // //   selector: 'app-shared-grid',
// // //   standalone: true,
// // //   imports: [AgGridAngular, FormsModule, ToolbarModule, CommonModule, SelectModule],
// // //   template: `
// // //     <div class="rounded-lg shadow-lg overflow-hidden w-full mb-0 mt-4 ag-grid-container"
// // //          style="background: var(--background); color: var(--text-color); border-color: var(--border-color)">
// // //       <div class="relative w-full" [style.width]="gridWidth" [style.padding]="padding" [style.height]="gridHeight">
// // //         <ag-grid-angular
// // //           style="height: 100%; width: 100%;"
// // //           [rowData]="rowData"
// // //           [columnDefs]="columnDefs"
// // //           [class]="theme"
// // //           [defaultColDef]="defaultColDef"
// // //           [pagination]="true"
// // //           [rowSelection]="rowSelection"
// // //           [rowClassRules]="rowClassrules"
// // //           [editType]="'fullRow'"
// // //           (cellValueChanged)="onCellValueChanged($event)"
// // //           (rowSelected)="onRowSelected($event)"
// // //           (cellClicked)="onCellClicked($event)"
// // //           (gridReady)="onGridReady($event)"
// // //           (cellEditingStarted)="onCellEditingStarted($event)"
// // //           [getRowId]="getRowId"
// // //         ></ag-grid-angular>
// // //       </div>
// // //     </div>
// // //   `,
// // //   styles: [`
// // //     .ag-grid-container {
// // //       /* Add custom styles if needed */
// // //     }
// // //   `]
// // // })
// // // export class SharedGridComponent implements OnInit, OnChanges {
// // //   @Input() rowClassrules: any;
// // //   @Input() usertheme: string = 'ag-theme-quartz';
// // //   @Input() data: any[] = [];
// // //   @Input() rowSelectionMode: string = 'single';
// // //   @Input() column: ColDef[] = [];
// // //   @Input() gridHeight: string = '500px';
// // //   @Input() gridWidth: string = '100%';
// // //   @Input() padding: string = '0 0px';

// // //   @Output() dataChanged = new EventEmitter<any>();
// // //   @Output() eventFromGrid = new EventEmitter<any>();
// // //   @Output() gridReady = new EventEmitter<GridReadyEvent>();

// // //   private gridApi!: GridApi;
// // //   rowData: any[] = [];
// // //   columnDefs: ColDef[] = [];
// // //   editingRowId: string | null = null;
// // //   originalRowData: any = {};

// // //   defaultColDef: ColDef = {
// // //     sortable: true,
// // //     filter: true,
// // //     resizable: true,
// // //     floatingFilter: true,
// // //     editable: (params) => {
// // //       console.log('Editable check:', this.editingRowId, params.data._id, this.editingRowId === params.data._id);
// // //       return this.editingRowId === params.data._id;
// // //     }
// // //   };

// // //   rowSelection: any = { mode: 'single' };
// // //   theme: string = 'ag-theme-quartz';

// // //   getRowId = (params: { data: any }) => params.data._id;

// // //   ngOnInit(): void {
// // //     this.theme = this.usertheme || 'ag-theme-quartz';
// // //     this.rowSelection = { mode: this.rowSelectionMode };
// // //     this.updateColumnDefs();
// // //   }

// // //   ngOnChanges(changes: SimpleChanges): void {
// // //     if (changes['data'] && changes['data'].currentValue) {
// // //       this.rowData = Array.isArray(changes['data'].currentValue) ? changes['data'].currentValue : [];
// // //     }
// // //     if (changes['column'] && changes['column'].currentValue) {
// // //       this.columnDefs = changes['column'].currentValue;
// // //       this.updateColumnDefs();
// // //     }
// // //     if (changes['rowSelectionMode']) {
// // //       this.rowSelection = { mode: this.rowSelectionMode };
// // //     }
// // //   }

// // //   updateColumnDefs() {
// // //     if (!this.column || this.column.length === 0) {
// // //       this.columnDefs = this.generateDefaultColumns(this.rowData);
// // //     } else {
// // //       this.columnDefs = [...this.column];
// // //     }
// // //     this.addActionButtonCol();
// // //   }

// // //   addActionButtonCol() {
// // //     const alreadyExists = this.columnDefs.some((col: ColDef) => col.colId === 'actionButtons');
// // //     if (alreadyExists) return;
// // //     const context: GridContext = {
// // //       isRowEditing: (id: string) => {
// // //         console.log('isRowEditing:', id, this.editingRowId, this.editingRowId === id);
// // //         return this.editingRowId === id;
// // //       },
// // //       startEditingRow: (rowData: any) => this.startEditingRow(rowData),
// // //       saveRow: (rowData: any) => this.saveRow(rowData),
// // //       cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
// // //       deleteRow: (rowData: any) => this.deleteRow(rowData),
// // //     };
// // //     this.columnDefs.push({
// // //       headerName: 'Actions',
// // //       field: 'actions',
// // //       cellRenderer: ActionbuttonsComponent,
// // //       editable: false,
// // //       colId: 'actionButtons',
// // //       cellRendererParams: { context },
// // //       pinned: 'right',
// // //       width: 160,
// // //     });
// // //     // Ensure all columns have the context and custom editor
// // //     this.columnDefs = this.columnDefs.map(col => ({
// // //       ...col,
// // //       cellRendererParams: {
// // //         ...col.cellRendererParams,
// // //         context
// // //       },
// // //       cellEditor: col.cellRenderer === DynamicCellComponent ? DynamicCellComponent : undefined,
// // //       cellEditorParams: col.cellRenderer === DynamicCellComponent ? col.cellRendererParams : undefined
// // //     }));
// // //   }

// // //   startEditingRow(rowData: any) {
// // //     if (!this.gridApi) {
// // //       console.error('Grid API not initialized');
// // //       return;
// // //     }
// // //     console.log('Starting edit for row:', rowData._id);
// // //     this.editingRowId = rowData._id;
// // //     this.originalRowData = { ...rowData };
// // //     this.gridApi.refreshCells({ force: true });
// // //     const rowIndex = this.getRowIndex(rowData);
// // //     if (rowIndex >= 0) {
// // //       this.gridApi.startEditingCell({ rowIndex, colKey: this.columnDefs[0].field || 'email' });
// // //     }
// // //   }

// // //   saveRow(rowData: any) {
// // //     if (!this.gridApi) return;
// // //     console.log('Saving row:', rowData._id);
// // //     this.gridApi.stopEditing(true);
// // //     this.editingRowId = null;
// // //     this.gridApi.applyTransaction({ update: [rowData] });
// // //     this.gridApi.refreshCells({ force: true });
// // //     this.dataChanged.emit({ type: 'save', data: rowData });
// // //   }

// // //   cancelEditingRow(rowData: any) {
// // //     if (!this.gridApi) return;
// // //     console.log('Cancelling edit for row:', rowData._id);
// // //     this.gridApi.stopEditing(false);
// // //     const rowIndex = this.getRowIndex(rowData);
// // //     if (rowIndex >= 0) {
// // //       const restoredRow = { ...this.originalRowData };
// // //       this.rowData[rowIndex] = restoredRow;
// // //       this.gridApi.applyTransaction({ update: [restoredRow] });
// // //       this.editingRowId = null;
// // //       this.gridApi.refreshCells({ force: true });
// // //     }
// // //   }

// // //   deleteRow(rowData: any) {
// // //     if (!this.gridApi) return;
// // //     console.log('Deleting row:', rowData._id);
// // //     this.rowData = this.rowData.filter(row => row._id !== rowData._id);
// // //     this.gridApi.applyTransaction({ remove: [rowData] });
// // //     this.dataChanged.emit({ type: 'delete', data: rowData });
// // //   }

// // //   getRowIndex(rowData: any): number {
// // //     return this.rowData.findIndex(row => row._id === rowData._id);
// // //   }

// // //   generateDefaultColumns(data: any[]): ColDef[] {
// // //     if (data && data.length > 0) {
// // //       const context = this.getGridContext();
// // //       return Object.keys(data[0]).map(key => ({
// // //         headerName: key.charAt(0).toUpperCase() + key.slice(1),
// // //         field: key,
// // //         cellRenderer: DynamicCellComponent,
// // //         cellEditor: DynamicCellComponent,
// // //         cellRendererParams: { type: 'text', context },
// // //         cellEditorParams: { type: 'text', context }
// // //       }));
// // //     }
// // //     return [];
// // //   }

// // //   private getGridContext(): GridContext {
// // //     return {
// // //       isRowEditing: (id: string) => this.editingRowId === id,
// // //       startEditingRow: (rowData: any) => this.startEditingRow(rowData),
// // //       saveRow: (rowData: any) => this.saveRow(rowData),
// // //       cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
// // //       deleteRow: (rowData: any) => this.deleteRow(rowData),
// // //     };
// // //   }

// // //   onCellValueChanged(event: CellValueChangedEvent) {
// // //     console.log('Cell value changed:', event);
// // //     this.eventFromGrid.emit({ eventType: 'onCellValueChanged', event });
// // //   }

// // //   onRowSelected(event: RowSelectedEvent) {
// // //     this.eventFromGrid.emit({ eventType: 'RowSelectedEvent', event });
// // //   }

// // //   onCellClicked(event: CellClickedEvent) {
// // //     this.eventFromGrid.emit({ eventType: 'CellClickedEvent', event });
// // //   }

// // //   onCellEditingStarted(event: any) {
// // //     console.log('Cell editing started:', event);
// // //   }

// // //   onGridReady(event: GridReadyEvent) {
// // //     this.gridApi = event.api;
// // //     this.gridReady.emit(event);
// // //   }

// // //   exportToCSV() {
// // //     this.gridApi.exportDataAsCsv();
// // //   }
// // // }
// // // // import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
// // // // import { AgGridAngular } from 'ag-grid-angular';
// // // // import { ColDef, GridApi, GridReadyEvent, CellValueChangedEvent,themeQuartz, RowSelectedEvent, CellClickedEvent } from 'ag-grid-community';
// // // // import { FormsModule } from '@angular/forms';
// // // // import { CommonModule } from '@angular/common';
// // // // import { SelectModule } from 'primeng/select';
// // // // import { ToolbarModule } from 'primeng/toolbar';
// // // // import { AllCommunityModule } from 'ag-grid-community';
// // // // import { ModuleRegistry } from 'ag-grid-community';
// // // // import { ActionbuttonsComponent } from '../../AgGridcomponents/actionbuttons/actionbuttons.component';
// // // // import { DynamicCellComponent } from '../../AgGridcomponents/dynamic-cell/dynamic-cell.component';

// // // // export interface GridContext {
// // // //   isRowEditing: (id: string) => boolean;
// // // //   startEditingRow: (rowData: any) => void;
// // // //   saveRow: (rowData: any) => void;
// // // //   cancelEditingRow: (rowData: any) => void;
// // // //   deleteRow: (rowData: any) => void;
// // // // }

// // // // ModuleRegistry.registerModules([AllCommunityModule]);

// // // // @Component({
// // // //   selector: 'app-shared-grid',
// // // //   standalone: true,
// // // //   imports: [AgGridAngular, FormsModule, ToolbarModule, CommonModule, SelectModule],
// // // //   templateUrl: './shared-grid.component.html',
// // // //   styleUrls: ['./shared-grid.component.css']
// // // // })
// // // // export class SharedGridComponent implements OnInit, OnChanges {
// // // //   @Input() rowClassrules: any;
// // // //   @Input() usertheme: string = 'ag-theme-quartz';
// // // //   @Input() data: any[] = [];
// // // //   @Input() rowSelectionMode: string = 'single';
// // // //   @Input() column: ColDef[] = [];
// // // //   @Input() gridHeight: string = '500px';
// // // //   @Input() gridWidth: string = '100%';
// // // //   @Input() padding: string = '0 0px';

// // // //   @Output() dataChanged = new EventEmitter<any>();
// // // //   @Output() eventFromGrid = new EventEmitter<any>();
// // // //   @Output() gridReady = new EventEmitter<GridReadyEvent>();

// // // //   private gridApi!: GridApi;
// // // //   rowData: any[] = [];
// // // //   columnDefs: ColDef[] = [];
// // // //   editingRowId: string | null = null;
// // // //   originalRowData: any = {};

// // // //   defaultColDef: ColDef = {
// // // //     sortable: true,
// // // //     filter: true,
// // // //     resizable: true,
// // // //     floatingFilter: true,
// // // //     editable: (params) => this.editingRowId === params.data._id
// // // //   };
// // // //   // defaultColDef: ColDef = {
// // // //   //   sortable: true,
// // // //   //   filter: true,
// // // //   //   resizable: true,
// // // //   //   floatingFilter: true,
// // // //   //   editable: (params) => this.editingRowId === params.data._id
// // // //   // };

// // // //   rowSelection: any = { mode: 'single' };
// // // //   theme = themeQuartz;

// // // //   getRowId = (params: { data: any }) => params.data._id;

// // // //   ngOnInit(): void {
// // // //     // this.theme = this.usertheme || 'ag-theme-quartz';
// // // //     this.rowSelection = { mode: this.rowSelectionMode };
// // // //     this.updateColumnDefs();
// // // //   }

// // // //   ngOnChanges(changes: SimpleChanges): void {
// // // //     if (changes['data'] && changes['data'].currentValue) {
// // // //       this.rowData = Array.isArray(changes['data'].currentValue) ? changes['data'].currentValue : [];
// // // //     }
// // // //     if (changes['column'] && changes['column'].currentValue) {
// // // //       this.columnDefs = changes['column'].currentValue;
// // // //       this.updateColumnDefs();
// // // //     }
// // // //     if (changes['rowSelectionMode']) {
// // // //       this.rowSelection = { mode: this.rowSelectionMode };
// // // //     }
// // // //   }

// // // //   updateColumnDefs() {
// // // //     if (!this.column || this.column.length === 0) {
// // // //       this.columnDefs = this.generateDefaultColumns(this.rowData);
// // // //     } else {
// // // //       this.columnDefs = [...this.column];
// // // //     }
// // // //     this.addActionButtonCol();
// // // //   }

// // // //   addActionButtonCol() {
// // // //     const alreadyExists = this.columnDefs.some((col: ColDef) => col.colId === 'actionButtons');
// // // //     if (alreadyExists) return;
// // // //     this.columnDefs.push({
// // // //       headerName: 'Actions',
// // // //       field: 'actions',
// // // //       cellRenderer: ActionbuttonsComponent,
// // // //       editable: false,
// // // //       colId: 'actionButtons',
// // // //       cellRendererParams: {
// // // //         context: {
// // // //           isRowEditing: (id: string) => this.editingRowId === id,
// // // //           startEditingRow: (rowData: any) => this.startEditingRow(rowData),
// // // //           saveRow: (rowData: any) => this.saveRow(rowData),
// // // //           cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
// // // //           deleteRow: (rowData: any) => this.deleteRow(rowData),
// // // //         }
// // // //       },
// // // //       pinned: 'right',
// // // //       width: 160,
// // // //     });
// // // //   }
// // // //   startEditingRow(rowData: any) {
// // // //     if (!this.gridApi) return;
// // // //     this.editingRowId = rowData._id;
// // // //     this.originalRowData = { ...rowData };
// // // //     this.gridApi.refreshCells({ force: true }); // Refresh to update editable state
// // // //     this.gridApi.startEditingCell({ rowIndex: this.getRowIndex(rowData), colKey: this.columnDefs[0].field || 'email' });
// // // //   }

// // // //   saveRow(rowData: any) {
// // // //     this.gridApi.stopEditing();
// // // //     this.editingRowId = null;
// // // //     this.gridApi.refreshCells({ force: true });
// // // //     this.dataChanged.emit({ type: 'save', data: rowData });
// // // //   }

// // // //   cancelEditingRow(rowData: any) {
// // // //     const rowIndex = this.getRowIndex(rowData);
// // // //     if (rowIndex >= 0) {
// // // //       const restoredRow = { ...this.originalRowData };
// // // //       this.rowData[rowIndex] = restoredRow;
// // // //       this.gridApi.applyTransaction({ update: [restoredRow] });
// // // //       this.editingRowId = null;
// // // //       this.gridApi.refreshCells({ force: true });
// // // //     }
// // // //   }

// // // //   deleteRow(rowData: any) {
// // // //     this.rowData = this.rowData.filter(row => row._id !== rowData._id);
// // // //     this.gridApi.applyTransaction({ remove: [rowData] });
// // // //     this.dataChanged.emit({ type: 'delete', data: rowData });
// // // //   }
// // // //   // addActionButtonCol() {
// // // //   //   const alreadyExists = this.columnDefs.some((col: ColDef) => col.colId === 'actionButtons');
// // // //   //   if (alreadyExists) return;
// // // //   //   this.columnDefs.push({
// // // //   //     headerName: 'Actions',
// // // //   //     field: 'actions',
// // // //   //     cellRenderer: ActionbuttonsComponent,
// // // //   //     editable: false,
// // // //   //     colId: 'actionButtons',
// // // //   //     cellRendererParams: {
// // // //   //       context: {
// // // //   //         isRowEditing: (id: string) => this.editingRowId === id,
// // // //   //         startEditingRow: (rowData: any) => this.startEditingRow(rowData),
// // // //   //         saveRow: (rowData: any) => this.saveRow(rowData),
// // // //   //         cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
// // // //   //         deleteRow: (rowData: any) => this.deleteRow(rowData),
// // // //   //       }
// // // //   //     },
// // // //   //     pinned: 'right',
// // // //   //     width: 160,
// // // //   //   });
// // // //   // }

// // // //   // startEditingRow(rowData: any) {
// // // //   //   if (!this.gridApi) return;
// // // //   //   this.editingRowId = rowData._id;
// // // //   //   this.originalRowData = { ...rowData };
// // // //   //   this.gridApi.refreshCells({ force: true }); // Refresh cells to update editable state
// // // //   //   this.gridApi.startEditingCell({ rowIndex: this.getRowIndex(rowData), colKey: this.columnDefs[0].field || 'email' });
// // // //   // }

// // // //   // saveRow(rowData: any) {
// // // //   //   this.gridApi.stopEditing();
// // // //   //   this.editingRowId = null;
// // // //   //   this.gridApi.refreshCells({ force: true });
// // // //   //   this.dataChanged.emit({ type: 'save', data: rowData });
// // // //   // }

// // // //   // cancelEditingRow(rowData: any) {
// // // //   //   const rowIndex = this.getRowIndex(rowData);
// // // //   //   if (rowIndex >= 0) {
// // // //   //     const restoredRow = { ...this.originalRowData };
// // // //   //     this.rowData[rowIndex] = restoredRow;
// // // //   //     this.gridApi.applyTransaction({ update: [restoredRow] });
// // // //   //     this.editingRowId = null;
// // // //   //     this.gridApi.refreshCells({ force: true });
// // // //   //   }
// // // //   // }

// // // //   // deleteRow(rowData: any) {
// // // //   //   this.rowData = this.rowData.filter(row => row._id !== rowData._id);
// // // //   //   this.gridApi.applyTransaction({ remove: [rowData] });
// // // //   //   this.dataChanged.emit({ type: 'delete', data: rowData });
// // // //   // }

// // // //   getRowIndex(rowData: any): number {
// // // //     return this.rowData.findIndex(row => row._id === rowData._id);
// // // //   }

// // // //   generateDefaultColumns(data: any[]): ColDef[] {
// // // //     if (data && data.length > 0) {
// // // //       return Object.keys(data[0]).map(key => ({
// // // //         headerName: key.charAt(0).toUpperCase() + key.slice(1),
// // // //         field: key,
// // // //         cellRenderer: DynamicCellComponent,
// // // //         cellRendererParams: { type: 'text' }
// // // //       }));
// // // //     }
// // // //     return [];
// // // //   }

// // // //   onCellValueChanged(event: CellValueChangedEvent) {
// // // //     this.eventFromGrid.emit({ eventType: 'onCellValueChanged', event });
// // // //   }

// // // //   onRowSelected(event: RowSelectedEvent) {
// // // //     this.eventFromGrid.emit({ eventType: 'RowSelectedEvent', event });
// // // //   }

// // // //   onCellClicked(event: CellClickedEvent) {
// // // //     this.eventFromGrid.emit({ eventType: 'CellClickedEvent', event });
// // // //   }

// // // //   onGridReady(event: GridReadyEvent) {
// // // //     this.gridApi = event.api;
// // // //     this.gridReady.emit(event);
// // // //   }

// // // //   exportToCSV() {
// // // //     this.gridApi.exportDataAsCsv();
// // // //   }
// // // // }
// // // // // import { Component, Input, OnInit, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
// // // // // import { CellValueChangedEvent, ColDef, GridApi, GridReadyEvent, RowSelectedEvent, CellClickedEvent, GridOptions } from 'ag-grid-community';
// // // // // // import { AllCommunityModule, ModuleRegistry, themeQuartz, colorSchemeDark } from 'ag-grid-community';
// // // // // import {
// // // // //   AllCommunityModule,
// // // // //   ModuleRegistry,
// // // // //   colorSchemeDark,
// // // // //   colorSchemeDarkBlue,
// // // // //   colorSchemeDarkWarm,
// // // // //   colorSchemeLight,
// // // // //   colorSchemeLightCold,
// // // // //   colorSchemeLightWarm,
// // // // //   colorSchemeVariable,
// // // // //   iconSetAlpine,
// // // // //   iconSetMaterial,
// // // // //   iconSetQuartzBold,
// // // // //   iconSetQuartzLight,
// // // // //   iconSetQuartzRegular,
// // // // //   themeAlpine,
// // // // //   themeBalham,
// // // // //   themeQuartz,
// // // // // } from "ag-grid-community";
// // // // // import { AgGridAngular } from 'ag-grid-angular';
// // // // // import { FormsModule } from '@angular/forms';
// // // // // import { CommonModule } from '@angular/common';
// // // // // import { SelectModule } from 'primeng/select';
// // // // // import { ToolbarModule } from 'primeng/toolbar';
// // // // // import { ToolbarComponent } from "../../../Components/toolbar/toolbar.component";
// // // // // import { ActionbuttonsComponent } from '../../AgGridcomponents/actionbuttons/actionbuttons.component';
// // // // // ModuleRegistry.registerModules([AllCommunityModule]);

// // // // // @Component({
// // // // //   selector: 'app-shared-grid',
// // // // //   imports: [AgGridAngular, FormsModule, ToolbarModule, CommonModule, SelectModule],
// // // // //   templateUrl: './shared-grid.component.html',
// // // // //   styleUrls: ['./shared-grid.component.css'],
// // // // //   standalone: true // Make it a standalone component for easier use
// // // // // })
// // // // // export class SharedGridComponent implements OnInit, OnChanges {
// // // // //   @Input() rowClassrules: any
// // // // //   @Input() usertheme: any;
// // // // //   @Input() data: any;
// // // // //   @Input() rowSelectionMode: any;
// // // // //   @Input() column: any;
// // // // //   @Output() dataChanged = new EventEmitter<any>();
// // // // //   @Output() eventFromGrid = new EventEmitter<any>();
// // // // //   // @Output() cellValueChanged = new EventEmitter<CellValueChangedEvent>();
// // // // //   // @Output() rowSelected = new EventEmitter<RowSelectedEvent>();
// // // // //   // @Output() cellClicked = new EventEmitter<CellClickedEvent>();
// // // // //   @Output() gridReady = new EventEmitter<GridReadyEvent>();
// // // // //   // pagesizeselector: any = [10, 20, 30]
// // // // //   private gridApi!: GridApi;
// // // // //   // getRowId = (params: { data: any }) => params.data._id;
// // // // //   getRowId = (params: { data: any }) => params.data._id;

// // // // //   rowData: any[] = [];
// // // // //   columnDefs: ColDef[] = [];
// // // // //   defaultColDef: ColDef = {
// // // // //     sortable: true,
// // // // //     filter: true,
// // // // //     resizable: true,
// // // // //     floatingFilter: true,
// // // // //     editable: (params) => this.editingRowId === params.data._id
// // // // //   };

// // // // //   theme = themeQuartz;

// // // // //   rowSelection: any;
// // // // //   @Input() gridHeight: any;
// // // // //   @Input() gridWidth: any
// // // // //   @Input() padding: any
// // // // //   ngOnInit(): void {
// // // // //     this.gridHeight = this.gridHeight ? this.gridHeight : '500px'
// // // // //     this.gridWidth = this.gridWidth ? this.gridWidth : '100%'
// // // // //     this.padding = this.padding ? this.padding : '0 0px'

// // // // //     if (!this.column || this.column.length === 0) {
// // // // //       this.columnDefs = this.generateDefaultColumns(this.rowData);
// // // // //     } else {
// // // // //       this.columnDefs = this.column; // Use input columns directly
// // // // //     }
// // // // //     this.rowSelection = {
// // // // //       mode: this.rowSelectionMode // Use the input row selection mode
// // // // //     };
// // // // //     // this.addActionButtonCol()
// // // // //   }

// // // // //   addActionButtonCol() {
// // // // //     const alreadyExists = this.column?.some((col: ColDef) => col.colId === 'actionButtons');
// // // // //     if (alreadyExists) return;
// // // // //     this.column.push({
// // // // //       headerName: 'Actions',
// // // // //       field: 'actions',
// // // // //       cellRenderer: ActionbuttonsComponent,
// // // // //       editable: false,
// // // // //       colId: 'actionButtons',
// // // // //       cellRendererParams: {
// // // // //         context: {
// // // // //           isRowEditing: (id: string | number) => this.editingRowId === id,
// // // // //           startEditingRow: (rowData: any) => this.startEditingRow(rowData),
// // // // //           saveRow: (rowData: any) => this.saveRow(rowData),
// // // // //           cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
// // // // //           deleteRow: (rowData: any) => this.deleteRow(rowData),
// // // // //         }
// // // // //       },
// // // // //       pinned: 'right',
// // // // //       width: 160,
// // // // //     });
// // // // //   }


// // // // //   editingRowId: number | null = null;
// // // // //   originalRowData: any = {};

// // // // //   startEditingRow(rowData: any) {
// // // // //     if (!this.gridApi) return;
// // // // //     this.editingRowId = rowData.id;
// // // // //     this.originalRowData = { ...rowData };
// // // // //     this.gridApi.startEditingCell({ rowIndex: this.getRowIndex(rowData), colKey: 'email' });
// // // // //   }

// // // // //   saveRow(rowData: any) {
// // // // //     this.gridApi.stopEditing();
// // // // //     this.editingRowId = null;
// // // // //     this.dataChanged.emit({ type: 'save', data: rowData });
// // // // //   }

// // // // //   cancelEditingRow(rowData: any) {
// // // // //     const rowIndex = this.getRowIndex(rowData);
// // // // //     if (rowIndex >= 0) {
// // // // //       const restoredRow = { ...this.originalRowData };
// // // // //       this.rowData[rowIndex] = restoredRow;
// // // // //       this.gridApi.applyTransaction({ update: [restoredRow] });
// // // // //       this.editingRowId = null;
// // // // //     }
// // // // //   }


// // // // //   deleteRow(rowData: any) {
// // // // //     this.rowData = this.rowData.filter(row => row.id !== rowData.id);
// // // // //     this.gridApi.applyTransaction({ remove: [rowData] });
// // // // //     this.dataChanged.emit({ type: 'delete', data: rowData });
// // // // //   }

// // // // //   getRowIndex(rowData: any): number {
// // // // //     return this.rowData.findIndex(row => row.id === rowData.id);
// // // // //   }


// // // // //   generateDefaultColumns(data: any[]): ColDef[] {
// // // // //     if (data && data.length > 0) { // Check if data is valid and has length
// // // // //       return Object.keys(data[0]).map(key => ({
// // // // //         headerName: key.charAt(0).toUpperCase() + key.slice(1),
// // // // //         field: key
// // // // //       }));
// // // // //     }
// // // // //     return [];
// // // // //   }

// // // // //   ngOnChanges(changes: SimpleChanges): void {
// // // // //     if (changes['data'] && changes['data'].currentValue) {
// // // // //       this.rowData = Array.isArray(changes['data'].currentValue)
// // // // //         ? changes['data'].currentValue
// // // // //         : [];
// // // // //     }
// // // // //     if (changes['column'] && changes['column'].currentValue) {
// // // // //       this.columnDefs = changes['column'].currentValue;
// // // // //     }
// // // // //     if (changes['rowSelectionMode'] && changes['rowSelectionMode'].currentValue) {
// // // // //       this.rowSelection = { mode: changes['rowSelectionMode'].currentValue };
// // // // //     }
// // // // //   }

// // // // //   onCellValueChanged(event: CellValueChangedEvent) {
// // // // //     // this.cellValueChanged.emit(event)
// // // // //     this.eventFromGrid.emit({ "eventType": 'onCellValueCHanged', 'event': event });
// // // // //   }

// // // // //   onRowSelected(event: RowSelectedEvent) {
// // // // //     this.eventFromGrid.emit({ "eventType": 'RowSelectedEvent', 'event': event });

// // // // //     // this.rowSelected.emit(event); // Emit rowSelected event
// // // // //   }

// // // // //   onCellClicked(event: CellClickedEvent) {
// // // // //     this.eventFromGrid.emit({ "eventType": 'CellClickedEvent', 'event': event });
// // // // //     // this.cellClicked.emit(event);
// // // // //   }

// // // // //   onGridReady(event: GridReadyEvent) {
// // // // //     this.gridApi = event.api; // 💥 This line assigns the Grid API correctly
// // // // //     this.eventFromGrid.emit({ "eventType": 'GridReadyEvent', 'event': event });
// // // // //   }

// // // // //   exportToCSV() {
// // // // //     this.gridApi.exportDataAsCsv();
// // // // //   }

// // // // //   onGridApiReady(params: GridReadyEvent) {
// // // // //     this.gridApi = params.api;
// // // // //     this.gridReady.emit(params); // Also emit gridReady when Grid API is ready
// // // // //   }

// // // // //   // theme = themeQuartz.withPart(colorSchemeDark).withParams({
// // // // //   //   fontFamily: 'IBM Plex Sans, DM Sans, Kanit, sans-serif',
// // // // //   //   headerFontFamily: 'Kanit, sans-serif',
// // // // //   //   cellFontFamily: 'DM Sans, sans-serif',
// // // // //   //   wrapperBorder: false,
// // // // //   //   headerRowBorder: false,
// // // // //   //   columnBorder: { style: 'dashed', color: '#9696C8' },
// // // // //   // });

// // // // //   // get theme() {
// // // // //   // let theme = themeQuartz;
// // // // //   // theme = theme.withPart(iconSetQuartzBold);
// // // // //   // theme = theme.withPart(colorSchemeDarkBlue);
// // // // //   // return theme.withParams({
// // // // //   //   fontFamily: 'IBM Plex Sans, DM Sans, Kanit, sans-serif',
// // // // //   //   headerFontFamily: 'Kanit, sans-serif',
// // // // //   //   cellFontFamily: 'DM Sans, sans-serif',
// // // // //   //   wrapperBorder: true,
// // // // //   //   headerRowBorder: true,
// // // // //   //   columnBorder: { style: 'dashed', color: '#9696C8' },
// // // // //   // });
// // // // //   // }

// // // // //   // gridOptions: GridOptions = {
// // // // //   //   theme: 'ag-theme-my-custom-theme', // Apply your custom theme
// // // // //   // };
// // // // //   // get theme() {
// // // // //   //   let theme = themeQuartz;
// // // // //   //   // if (this.iconSet) {
// // // // //   //   // theme = theme.withPart(this.iconSet);
// // // // //   //   theme = theme.withPart(iconSetQuartzBold);
// // // // //   //   // }
// // // // //   //   // if (this.colorScheme) {
// // // // //   //   // theme = theme.withPart(this.colorScheme);
// // // // //   //   theme = theme.withPart(colorSchemeDarkBlue);
// // // // //   //   // }

// // // // //   //   return theme.withParams({
// // // // //   //     fontFamily: 'IBM Plex Sans, DM Sans, Kanit, sans-serif',
// // // // //   //     headerFontFamily: 'Kanit, sans-serif',
// // // // //   //     cellFontFamily: 'DM Sans, sans-serif',
// // // // //   //     wrapperBorder: true,
// // // // //   //     headerRowBorder: true,
// // // // //   //     columnBorder: { style: 'dashed', color: '#9696C8' },
// // // // //   //   });
// // // // //   // }


// // // // // }

// // // // // //
// // // // // //
// // // // // /*
// // // // // value gettter in aggrid to handle the data with multiple col
// // // // // ex=  valueGetter:(o:any)=>o.col1+o.col2


// // // // // // value formatter to convert to string
// // // // // ex = valueFormatter:(i:any)=>'rupee'+i.value.toString()
// // // // // */


// // // // // // best thermes
// // // // // /*
// // // // //   baseThemes = [
// // // // //     { id: "themeQuartz", value: themeQuartz },
// // // // //     { id: "themeBalham", value: themeBalham },
// // // // //     { id: "themeAlpine", value: themeAlpine },
// // // // //   ];
// // // // //   baseTheme = themeQuartz;

// // // // //   colorSchemes = [
// // // // //     { id: "(unchanged)", value: null },
// // // // //     { id: "colorSchemeLight", value: colorSchemeLight },
// // // // //     { id: "colorSchemeLightCold", value: colorSchemeLightCold },
// // // // //     { id: "colorSchemeLightWarm", value: colorSchemeLightWarm },
// // // // //     { id: "colorSchemeDark", value: colorSchemeDark },
// // // // //     { id: "colorSchemeDarkWarm", value: colorSchemeDarkWarm },
// // // // //     { id: "colorSchemeDarkBlue", value: colorSchemeDarkBlue },
// // // // //     { id: "colorSchemeVariable", value: colorSchemeVariable },
// // // // //   ];
// // // // //   colorScheme = null;

// // // // //   iconSets = [
// // // // //     { id: "(unchanged)", value: null },
// // // // //     { id: "iconSetQuartzLight", value: iconSetQuartzLight },
// // // // //     { id: "iconSetQuartzRegular", value: iconSetQuartzRegular },
// // // // //     { id: "iconSetQuartzBold", value: iconSetQuartzBold },
// // // // //     { id: "iconSetAlpine", value: iconSetAlpine },
// // // // //     { id: "iconSetMaterial", value: iconSetMaterial },
// // // // //   ];
// // // // //   iconSet = null;
// // // // // */


// import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
// import { AgGridAngular } from 'ag-grid-angular';
// import { ColDef, GridApi, GridReadyEvent, CellValueChangedEvent, themeQuartz, RowSelectedEvent, CellClickedEvent, CellKeyDownEvent, FullWidthCellKeyDownEvent } from 'ag-grid-community';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { SelectModule } from 'primeng/select';
// import { ToolbarModule } from 'primeng/toolbar';
// import { AllCommunityModule } from 'ag-grid-community';
// import { ModuleRegistry } from 'ag-grid-community';
// import { ActionbuttonsComponent } from '../../AgGridcomponents/actionbuttons/actionbuttons.component';
// import { DynamicCellComponent } from '../../AgGridcomponents/dynamic-cell/dynamic-cell.component';
// import { GridContext } from '../../../../interfaces/grid-context.interface';

// // import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
// // import { AgGridAngular } from 'ag-grid-angular';
// // import { ColDef, GridApi, GridReadyEvent, CellValueChangedEvent, RowSelectedEvent, CellClickedEvent, CellKeyDownEvent, FullWidthCellKeyDownEvent } from 'ag-grid-community';
// // import { FormsModule } from '@angular/forms';
// // import { CommonModule } from '@angular/common';
// // import { SelectModule } from 'primeng/select';
// // import { ToolbarModule } from 'primeng/toolbar';
// // import { AllCommunityModule } from '@ag-grid-community/all-modules';
// // import { ModuleRegistry } from '@ag-grid-community/core';
// // import { ActionbuttonsComponent } from '../actionbuttons/actionbuttons.component';
// // import { DynamicCellComponent } from '../dynamic-cell/dynamic-cell.component';
// // import { GridContext } from '../ag-grid-reference/ag-grid-reference.component';

// ModuleRegistry.registerModules([AllCommunityModule]);

// @Component({
//   selector: 'app-shared-grid',
//   standalone: true,
//   imports: [AgGridAngular, FormsModule, ToolbarModule, CommonModule, SelectModule],
//   template: `
//     <div class="rounded-lg shadow-lg overflow-hidden w-full mb-0 mt-4 ag-grid-container"
//          style="background: var(--background); color: var(--text-color); border-color: var(--border-color)">
//       <div class="relative w-full" [style.width]="gridWidth" [style.padding]="padding" [style.height]="gridHeight">
//         <ag-grid-angular
//           style="height: 100%; width: 100%;"
//           [rowData]="rowData"
//           [columnDefs]="columnDefs"
//           [class]="theme"
//           [defaultColDef]="defaultColDef"
//           [pagination]="true"
//           [rowSelection]="rowSelection"
//           [rowClassRules]="rowClassrules"
//           [editType]="'fullRow'"
//           [rowModelType]="'clientSide'"
//           [cacheBlockSize]="50"
//           [maxBlocksInCache]="10"
//           [suppressHorizontalScroll]="false"
//           (cellValueChanged)="onCellValueChanged($event)"
//           (rowSelected)="onRowSelected($event)"
//           (cellClicked)="onCellClicked($event)"
//           (gridReady)="onGridReady($event)"
//           (cellEditingStarted)="onCellEditingStarted($event)"
//           (cellKeyDown)="onCellKeyDown($event)"
//           [getRowId]="getRowId"
//         ></ag-grid-angular>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .ag-grid-container {
//       width: 100% !important;
//       height: 100% !important;
//     }
//     :host {
//       display: block;
//       width: 100%;
//       height: 100%;
//     }
//   `]
// })
// export class SharedGridComponent implements OnInit, OnChanges {
//   @Input() rowClassrules: any;
//   @Input() usertheme: string = 'ag-theme-quartz';
//   @Input() data: any[] = [];
//   @Input() rowSelectionMode: string = 'single';
//   @Input() column: ColDef[] = [];
//   @Input() gridHeight: string = '500px';
//   @Input() gridWidth: string = '100%';
//   @Input() padding: string = '0 0px';

//   @Output() dataChanged = new EventEmitter<any>();
//   @Output() eventFromGrid = new EventEmitter<any>();
//   @Output() gridReady = new EventEmitter<GridReadyEvent>();

//   private gridApi!: GridApi;
//   rowData: any[] = [];
//   columnDefs: ColDef[] = [];
//   editingRowId: string | null = null;
//   originalRowData: any = {};

//   defaultColDef: ColDef = {
//     sortable: true,
//     filter: true,
//     resizable: true,
//     floatingFilter: true,
//     minWidth: 150, // Ensure columns are at least 150px wide
//     flex: 1, // Distribute extra space proportionally
//     editable: (params) => {
//       console.log('Editable check:', this.editingRowId, params.data._id, this.editingRowId === params.data._id);
//       return this.editingRowId === params.data._id;
//     }
//   };

//   rowSelection: any = { mode: 'single' };
//   theme: string = 'ag-theme-quartz';

//   getRowId = (params: { data: any }) => params.data._id;

//   ngOnInit(): void {
//     this.theme = this.usertheme || 'ag-theme-quartz';
//     this.rowSelection = { mode: this.rowSelectionMode };
//     this.updateColumnDefs();
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['data'] && changes['data'].currentValue) {
//       this.rowData = Array.isArray(changes['data'].currentValue) ? changes['data'].currentValue : [];
//     }
//     if (changes['column'] && changes['column'].currentValue) {
//       this.columnDefs = changes['column'].currentValue;
//       this.updateColumnDefs();
//     }
//     if (changes['rowSelectionMode']) {
//       this.rowSelection = { mode: this.rowSelectionMode };
//     }
//   }

//   updateColumnDefs() {
//     if (!this.column || this.column.length === 0) {
//       this.columnDefs = this.generateDefaultColumns(this.rowData);
//     } else {
//       this.columnDefs = [...this.column];
//     }
//     this.addActionButtonCol();
//   }

//   addActionButtonCol() {
//     const alreadyExists = this.columnDefs.some((col: ColDef) => col.colId === 'actionButtons');
//     if (alreadyExists) return;
//     const context: GridContext = {
//       isRowEditing: (id: string) => {
//         console.log('isRowEditing:', id, this.editingRowId, this.editingRowId === id);
//         return this.editingRowId === id;
//       },
//       startEditingRow: (rowData: any) => this.startEditingRow(rowData),
//       saveRow: (rowData: any) => this.saveRow(rowData),
//       cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
//       deleteRow: (rowData: any) => this.deleteRow(rowData),
//     };
//     this.columnDefs.push({
//       headerName: 'Actions',
//       field: 'actions',
//       cellRenderer: ActionbuttonsComponent,
//       editable: false,
//       colId: 'actionButtons',
//       cellRendererParams: { context },
//       pinned: 'right',
//       width: 120, // Reduced width to give more space to other columns
//       minWidth: 120,
//       maxWidth: 120,
//     });
//     this.columnDefs = this.columnDefs.map(col => {
//       console.log('Setting cellEditor for column:', col.field, 'Renderer:', col.cellRenderer);
//       return {
//         ...col,
//         cellRendererParams: {
//           ...col.cellRendererParams,
//           context
//         },
//         cellEditor: col.cellRenderer === DynamicCellComponent ? DynamicCellComponent : undefined,
//         cellEditorParams: col.cellRenderer === DynamicCellComponent ? { ...col.cellRendererParams } : undefined
//       };
//     });
//   }

//   startEditingRow(rowData: any) {
//     if (!this.gridApi) {
//       console.error('Grid API not initialized');
//       return;
//     }
//     console.log('Starting edit for row:', rowData._id);
//     this.editingRowId = rowData._id;
//     this.originalRowData = { ...rowData };
//     const rowIndex = this.getRowIndex(rowData);
//     if (rowIndex >= 0) {
//       this.gridApi.startEditingCell({ rowIndex, colKey: this.columnDefs[0].field || 'email' });
//     }
//   }

//   saveRow(rowData: any) {
//     if (!this.gridApi) return;
//     console.log('Saving row:', rowData._id);
//     this.gridApi.stopEditing(true);
//     this.editingRowId = null;
//     this.gridApi.applyTransaction({ update: [rowData] });
//     this.dataChanged.emit({ type: 'save', data: rowData });
//   }

//   cancelEditingRow(rowData: any) {
//     if (!this.gridApi) return;
//     console.log('Cancelling edit for row:', rowData._id);
//     this.gridApi.stopEditing(false);
//     const rowIndex = this.getRowIndex(rowData);
//     if (rowIndex >= 0) {
//       const restoredRow = { ...this.originalRowData };
//       this.rowData[rowIndex] = restoredRow;
//       this.gridApi.applyTransaction({ update: [restoredRow] });
//       this.editingRowId = null;
//     }
//   }

//   deleteRow(rowData: any) {
//     if (!this.gridApi) return;
//     console.log('Deleting row:', rowData._id);
//     this.rowData = this.rowData.filter(row => row._id !== rowData._id);
//     this.gridApi.applyTransaction({ remove: [rowData] });
//     this.dataChanged.emit({ type: 'delete', data: rowData });
//   }

//   getRowIndex(rowData: any): number {
//     return this.rowData.findIndex(row => row._id === rowData._id);
//   }

//   generateDefaultColumns(data: any[]): ColDef[] {
//     if (data && data.length > 0) {
//       const context = this.getGridContext();
//       return Object.keys(data[0]).map(key => ({
//         headerName: key.charAt(0).toUpperCase() + key.slice(1),
//         field: key,
//         cellRenderer: DynamicCellComponent,
//         cellEditor: DynamicCellComponent,
//         cellRendererParams: { type: 'text', context },
//         cellEditorParams: { type: 'text', context },
//         minWidth: 150,
//         flex: 1,
//       }));
//     }
//     return [];
//   }

//   private getGridContext(): GridContext {
//     return {
//       isRowEditing: (id: string) => this.editingRowId === id,
//       startEditingRow: (rowData: any) => this.startEditingRow(rowData),
//       saveRow: (rowData: any) => this.saveRow(rowData),
//       cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
//       deleteRow: (rowData: any) => this.deleteRow(rowData),
//     };
//   }

//   onCellValueChanged(event: CellValueChangedEvent) {
//     console.log('Cell value changed:', event);
//     this.eventFromGrid.emit({ eventType: 'onCellValueChanged', event });
//   }

//   onRowSelected(event: RowSelectedEvent) {
//     this.eventFromGrid.emit({ eventType: 'RowSelectedEvent', event });
//   }

//   onCellClicked(event: CellClickedEvent) {
//     this.eventFromGrid.emit({ eventType: 'CellClickedEvent', event });
//   }

//   onCellEditingStarted(event: any) {
//     console.log('Cell editing started:', event.colDef.field);
//   }

//   onCellKeyDown(event: CellKeyDownEvent<any, any> | FullWidthCellKeyDownEvent<any, any>) {
//     if ('column' in event && event.event instanceof KeyboardEvent && event.event.key === 'Tab') {
//       console.log('Tab pressed in cell:', event.colDef.field, 'Row:', event.rowIndex);
//       const colId = event.column.getColId();
//       const rowIndex = event.rowIndex;
//       const allColumns = this.gridApi.getColumns() || [];
//       const currentIndex = allColumns.findIndex(col => col.getColId() === colId);
//       let nextIndex = event.event.shiftKey ? currentIndex - 1 : currentIndex + 1;

//       if (rowIndex === null) {
//         console.warn('Row index is null, skipping tab navigation');
//         return;
//       }

//       while (nextIndex >= 0 && nextIndex < allColumns.length) {
//         const nextCol = allColumns[nextIndex];
//         if (nextCol.getColDef().editable) {
//           setTimeout(() => {
//             this.gridApi.startEditingCell({ rowIndex, colKey: nextCol.getColId() });
//           }, 0);
//           break;
//         }
//         nextIndex = event.event.shiftKey ? nextIndex - 1 : nextIndex + 1;
//       }
//     } else {
//       console.log('Tab pressed in full-width cell or unsupported event, skipping navigation');
//     }
//   }

//   onGridReady(event: GridReadyEvent) {
//     console.time('Grid initialization');
//     this.gridApi = event.api;
//     // Auto-size columns based on content instead of fitting to width
//     const allColumnIds = this.gridApi.getColumns()?.map(col => col.getColId()) || [];
//     this.gridApi.autoSizeColumns(allColumnIds, false);
//     this.gridReady.emit(event);
//     console.timeEnd('Grid initialization');
//   }

//   exportToCSV() {
//     this.gridApi.exportDataAsCsv();
//   }
// }
// // ModuleRegistry.registerModules([AllCommunityModule]);

// // @Component({
// //   selector: 'app-shared-grid',
// //   standalone: true,
// //   imports: [AgGridAngular, FormsModule, ToolbarModule, CommonModule, SelectModule],
// //   template: `
// //     <!-- <div class="rounded-lg shadow-lg overflow-hidden w-full mb-0 mt-4 ag-grid-container"
// //          style="background: var(--background); color: var(--text-color); border-color: var(--border-color)">
// //       <div class="relative w-full" [style.width]="gridWidth" [style.padding]="padding" [style.height]="gridHeight">
// //         <ag-grid-angular
// //           style="height: 100%; width: 100%;"
// //           [rowData]="rowData"
// //           [columnDefs]="columnDefs"
// //           [class]="theme"
// //           [defaultColDef]="defaultColDef"
// //           [pagination]="true"
// //           [rowSelection]="rowSelection"
// //           [rowClassRules]="rowClassrules"
// //           [editType]="'fullRow'"
// //           [rowModelType]="'clientSide'"
// //           [cacheBlockSize]="50"
// //           [maxBlocksInCache]="10"
// //           (cellValueChanged)="onCellValueChanged($event)"
// //           (rowSelected)="onRowSelected($event)"
// //           (cellClicked)="onCellClicked($event)"
// //           (gridReady)="onGridReady($event)"
// //           (cellEditingStarted)="onCellEditingStarted($event)"
// //           (cellKeyDown)="onCellKeyDown($event)"
// //           [getRowId]="getRowId"
// //         ></ag-grid-angular>
// //       </div>
// //     </div> -->
// //     <div class="rounded-lg shadow-lg overflow-hidden w-full mb-0 mt-4 ag-grid-container"
// //    style="background: var(--background); color: var(--text-color); border-color: var(--border-color)">
// //    <!-- <div class="relative w-full" [style.width]="gridWidth" [style.padding]="padding" [style.height]="gridHeight">
// //      <ag-grid-angular style="height: 100%; width: 100%;" [rowData]="rowData" [columnDefs]="columnDefs" [theme]="theme"
// //      [editType]="'fullRow'"  
// //      [cacheBlockSize]="50"
// //      [rowClassRules]="rowClassrules"
// //      [defaultColDef]="defaultColDef"
// //      [rowSelection]="rowSelection"
// //      [class]="theme"                   
// //      [rowModelType]="'clientSide'"
// //      [maxBlocksInCache]="10"
// //      (cellKeyDown)="onCellKeyDown($event)"
// //      (cellEditingStarted)="onCellEditingStarted($event)"
// //        [defaultColDef]="defaultColDef" [pagination]="true" [rowSelection]="rowSelection" [rowClassRules]="rowClassrules"
// //        (cellValueChanged)="onCellValueChanged($event)" (rowSelected)="onRowSelected($event)"
// //        (cellClicked)="onCellClicked($event)" (gridReady)="onGridReady($event)"  [getRowId]="getRowId">
// //      </ag-grid-angular>
// //    </div> -->
// //    <div class="relative w-full" [style.width]="gridWidth" [style.padding]="padding" [style.height]="gridHeight">
// //   <ag-grid-angular
// //     style="height: 100%; width: 100%;"
// //     [rowData]="rowData"
// //     [columnDefs]="columnDefs"
// //     [editType]="'fullRow'"
// //     [cacheBlockSize]="50"
// //     [rowClassRules]="rowClassrules"
// //     [defaultColDef]="defaultColDef" 
// //     [rowSelection]="rowSelection"
// //     [class]="theme"
// //     [rowModelType]="'clientSide'"
// //     [maxBlocksInCache]="10"
// //     (cellKeyDown)="onCellKeyDown($event)"
// //     (cellEditingStarted)="onCellEditingStarted($event)"
// //     [pagination]="true"
// //     (cellValueChanged)="onCellValueChanged($event)"
// //     (rowSelected)="onRowSelected($event)"
// //     (cellClicked)="onCellClicked($event)"
// //     (gridReady)="onGridReady($event)"
// //     [getRowId]="getRowId"
// //   ></ag-grid-angular>
// // </div>

// //   `,
// //   styles: [`
// //     .ag-grid-container {
// //     }
// //   `]
// // })
// // export class SharedGridComponent implements OnInit, OnChanges {
// //   @Input() rowClassrules: any;
// //   @Input() usertheme: string = 'ag-theme-quartz';
// //   @Input() data: any[] = [];
// //   @Input() rowSelectionMode: string = 'single';
// //   @Input() column: ColDef[] = [];
// //   @Input() gridHeight: string = '500px';
// //   @Input() gridWidth: string = '100%';
// //   @Input() padding: string = '0 0px';

// //   @Output() dataChanged = new EventEmitter<any>();
// //   @Output() eventFromGrid = new EventEmitter<any>();
// //   @Output() gridReady = new EventEmitter<GridReadyEvent>();

// //   private gridApi!: GridApi;
// //   rowData: any[] = [];
// //   columnDefs: ColDef[] = [];
// //   editingRowId: string | null = null;
// //   originalRowData: any = {};

// //   defaultColDef: ColDef = {
// //     sortable: true,
// //     filter: true,
// //     resizable: true,
// //     floatingFilter: true,
// //     editable: (params) => {
// //       console.log('Editable check:', this.editingRowId, params.data._id, this.editingRowId === params.data._id);
// //       return this.editingRowId === params.data._id;
// //     }
// //   };

// //   rowSelection: any = { mode: 'single' };
// //   theme = themeQuartz;

// //   getRowId = (params: { data: any }) => params.data._id;

// //   ngOnInit(): void {
// //     // this.theme = this.usertheme || 'ag-theme-quartz';
// //     this.rowSelection = { mode: this.rowSelectionMode };
// //     this.updateColumnDefs();
// //   }

// //   ngOnChanges(changes: SimpleChanges): void {
// //     if (changes['data'] && changes['data'].currentValue) {
// //       this.rowData = Array.isArray(changes['data'].currentValue) ? changes['data'].currentValue : [];
// //     }
// //     if (changes['column'] && changes['column'].currentValue) {
// //       this.columnDefs = changes['column'].currentValue;
// //       this.updateColumnDefs();
// //     }
// //     if (changes['rowSelectionMode']) {
// //       this.rowSelection = { mode: this.rowSelectionMode };
// //     }
// //   }

// //   updateColumnDefs() {
// //     if (!this.column || this.column.length === 0) {
// //       this.columnDefs = this.generateDefaultColumns(this.rowData);
// //     } else {
// //       this.columnDefs = [...this.column];
// //     }
// //     this.addActionButtonCol();
// //   }

// //   addActionButtonCol() {
// //     const alreadyExists = this.columnDefs.some((col: ColDef) => col.colId === 'actionButtons');
// //     if (alreadyExists) return;
// //     const context: GridContext = {
// //       isRowEditing: (id: string) => {
// //         console.log('isRowEditing:', id, this.editingRowId, this.editingRowId === id);
// //         return this.editingRowId === id;
// //       },
// //       startEditingRow: (rowData: any) => this.startEditingRow(rowData),
// //       saveRow: (rowData: any) => this.saveRow(rowData),
// //       cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
// //       deleteRow: (rowData: any) => this.deleteRow(rowData),
// //     };
// //     this.columnDefs.push({
// //       headerName: 'Actions',
// //       field: 'actions',
// //       cellRenderer: ActionbuttonsComponent,
// //       editable: false,
// //       colId: 'actionButtons',
// //       cellRendererParams: { context },
// //       pinned: 'right',
// //       width: 160,
// //     });
// //     this.columnDefs = this.columnDefs.map(col => {
// //       console.log('Setting cellEditor for column:', col.field, 'Renderer:', col.cellRenderer);
// //       return {
// //         ...col,
// //         cellRendererParams: {
// //           ...col.cellRendererParams,
// //           context
// //         },
// //         cellEditor: col.cellRenderer === DynamicCellComponent ? DynamicCellComponent : undefined,
// //         cellEditorParams: col.cellRenderer === DynamicCellComponent ? { ...col.cellRendererParams } : undefined
// //       };
// //     });
// //   }

// //   startEditingRow(rowData: any) {
// //     if (!this.gridApi) {
// //       console.error('Grid API not initialized');
// //       return;
// //     }
// //     console.log('Starting edit for row:', rowData._id);
// //     this.editingRowId = rowData._id;
// //     this.originalRowData = { ...rowData };
// //     // Removed refreshCells to avoid disrupting editors
// //     const rowIndex = this.getRowIndex(rowData);
// //     if (rowIndex >= 0) {
// //       this.gridApi.startEditingCell({ rowIndex, colKey: this.columnDefs[0].field || 'email' });
// //     }
// //   }

// //   saveRow(rowData: any) {
// //     if (!this.gridApi) return;
// //     console.log('Saving row:', rowData._id);
// //     this.gridApi.stopEditing(true);
// //     this.editingRowId = null;
// //     this.gridApi.applyTransaction({ update: [rowData] });
// //     this.dataChanged.emit({ type: 'save', data: rowData });
// //   }

// //   cancelEditingRow(rowData: any) {
// //     if (!this.gridApi) return;
// //     console.log('Cancelling edit for row:', rowData._id);
// //     this.gridApi.stopEditing(false);
// //     const rowIndex = this.getRowIndex(rowData);
// //     if (rowIndex >= 0) {
// //       const restoredRow = { ...this.originalRowData };
// //       this.rowData[rowIndex] = restoredRow;
// //       this.gridApi.applyTransaction({ update: [restoredRow] });
// //       this.editingRowId = null;
// //     }
// //   }

// //   deleteRow(rowData: any) {
// //     if (!this.gridApi) return;
// //     console.log('Deleting row:', rowData._id);
// //     this.rowData = this.rowData.filter(row => row._id !== rowData._id);
// //     this.gridApi.applyTransaction({ remove: [rowData] });
// //     this.dataChanged.emit({ type: 'delete', data: rowData });
// //   }

// //   getRowIndex(rowData: any): number {
// //     return this.rowData.findIndex(row => row._id === rowData._id);
// //   }

// //   generateDefaultColumns(data: any[]): ColDef[] {
// //     if (data && data.length > 0) {
// //       const context = this.getGridContext();
// //       return Object.keys(data[0]).map(key => ({
// //         headerName: key.charAt(0).toUpperCase() + key.slice(1),
// //         field: key,
// //         cellRenderer: DynamicCellComponent,
// //         cellEditor: DynamicCellComponent,
// //         cellRendererParams: { type: 'text', context },
// //         cellEditorParams: { type: 'text', context }
// //       }));
// //     }
// //     return [];
// //   }

// //   private getGridContext(): GridContext {
// //     return {
// //       isRowEditing: (id: string) => this.editingRowId === id,
// //       startEditingRow: (rowData: any) => this.startEditingRow(rowData),
// //       saveRow: (rowData: any) => this.saveRow(rowData),
// //       cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
// //       deleteRow: (rowData: any) => this.deleteRow(rowData),
// //     };
// //   }

// //   onCellValueChanged(event: CellValueChangedEvent) {
// //     console.log('Cell value changed:', event);
// //     this.eventFromGrid.emit({ eventType: 'onCellValueChanged', event });
// //   }

// //   onRowSelected(event: RowSelectedEvent) {
// //     this.eventFromGrid.emit({ eventType: 'RowSelectedEvent', event });
// //   }

// //   onCellClicked(event: CellClickedEvent) {
// //     this.eventFromGrid.emit({ eventType: 'CellClickedEvent', event });
// //   }

// //   onCellEditingStarted(event: any) {
// //     console.log('Cell editing started:', event.colDef.field);
// //   }

// //   onCellKeyDown(event: CellKeyDownEvent<any, any> | FullWidthCellKeyDownEvent<any, any>) {
// //     // Type guard to check if the event is a CellKeyDownEvent
// //     if ('column' in event && event.event instanceof KeyboardEvent && event.event.key === 'Tab') {
// //       console.log('Tab pressed in cell:', event.colDef.field, 'Row:', event.rowIndex);
// //       const colId = event.column.getColId();
// //       const rowIndex = event.rowIndex;
// //       const allColumns = this.gridApi.getColumns() || [];
// //       const currentIndex = allColumns.findIndex(col => col.getColId() === colId);
// //       let nextIndex = event.event.shiftKey ? currentIndex - 1 : currentIndex + 1;

// //       if (rowIndex === null) {
// //         console.warn('Row index is null, skipping tab navigation');
// //         return;
// //       }

// //       while (nextIndex >= 0 && nextIndex < allColumns.length) {
// //         const nextCol = allColumns[nextIndex];
// //         if (nextCol.getColDef().editable) {
// //           setTimeout(() => {
// //             this.gridApi.startEditingCell({ rowIndex, colKey: nextCol.getColId() });
// //           }, 0);
// //           break;
// //         }
// //         nextIndex = event.event.shiftKey ? nextIndex - 1 : nextIndex + 1;
// //       }
// //     } else {
// //       console.log('Tab pressed in full-width cell or unsupported event, skipping navigation');
// //     }
// //   }

// //   onGridReady(event: GridReadyEvent) {
// //     console.time('Grid initialization');
// //     this.gridApi = event.api;
// //     this.gridApi.sizeColumnsToFit();
    
// //     this.gridReady.emit(event);
// //     console.timeEnd('Grid initialization');
// //   }

// //   exportToCSV() {
// //     this.gridApi.exportDataAsCsv();
// //   }
// // }