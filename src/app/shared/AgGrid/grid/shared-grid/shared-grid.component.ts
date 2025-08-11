import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, CellValueChangedEvent, RowSelectedEvent, CellClickedEvent, GetRowIdParams } from 'ag-grid-community';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';
import { ColorPickerModule } from 'primeng/colorpicker';
import { AllCommunityModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ActionbuttonsComponent } from '../../AgGridcomponents/actionbuttons/actionbuttons.component';
import { DynamicCellComponent } from '../../AgGridcomponents/dynamic-cell/dynamic-cell.component';
import { ThemeService } from '../../../../core/services/theme.service';
import { themeQuartz } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-shared-grid',
  standalone: true,
  imports: [AgGridAngular, FormsModule, ToolbarModule, CommonModule, SelectModule, ColorPickerModule],
  template: `
<!-- Main container for the entire grid, styled as a modern card -->
<!-- Main container for the entire grid, styled as a modern card using your theme variables -->
<div class="rounded-lg shadow-xl overflow-hidden w-full"
     [style.backgroundColor]="'var(--theme-bg-secondary)'"
     [style.color]="'var(--theme-text-primary)'"
     [style.borderColor]="'var(--theme-border-primary)'"
     [style.boxShadow]="'0 2px 5px var(--theme-shadow-color)'">

  <!-- The header filter area, visible only if the headerFilter input is true -->
  <div *ngIf="headerFilter"
       class="p-4 border-b"
       [style.borderColor]="'var(--theme-border-primary)'"
       [style.backgroundColor]="'var(--theme-bg-secondary)'">

    <!-- Flexbox container for the controls. Uses 'flex-wrap' for responsiveness on smaller screens -->
    <div class="flex flex-wrap items-center justify-between gap-4">

      <!-- Accent Color Picker and Label -->
      <div class="flex items-center gap-2">
        <label for="colorPicker"
               class="text-sm font-medium"
               [style.color]="'var(--theme-text-label)'">Accent Color</label>
        <p-colorPicker id="colorPicker" [(ngModel)]="accentColor" (onChange)="onColorChange($event)" appendTo="body"
          [style]="{'width': '2.25rem', 'height': '2.25rem'}" class="rounded-full overflow-hidden"></p-colorPicker>
      </div>
      
      <!-- Global Search Input with an icon -->
      <div class="flex items-center flex-1 min-w-[16rem] rounded-lg shadow-inner focus-within:ring-2"
           [style.backgroundColor]="'var(--theme-bg-tertiary)'"
           [style.color]="'var(--theme-text-primary)'"
           [style.boxShadow]="'inset 0 1px 2px var(--theme-shadow-color)'"
           [style.outlineColor]="'var(--theme-accent-focus-ring)'">
        <i class="pi pi-search text-base p-2" [style.color]="'var(--theme-text-secondary)'"></i>
        <input type="text" placeholder="Search grid data..." (input)="onSearch($event)"
               class="bg-transparent border-none text-sm w-full py-2 px-1 focus:outline-none"
               [style.color]="'var(--theme-text-primary)'"
               [style.placeholderColor]="'var(--theme-text-secondary)'"/>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 ml-auto">
        <!-- Filter button uses the theme's brand primary color -->
        <button class="p-button p-component p-button-sm rounded-md px-4 py-2 text-sm"
                (click)="onFilterClick()"
                [style.backgroundColor]="'var(--theme-brand-primary)'"
                [style.color]="'var(--theme-button-text-primary-btn)'"
                [style.hoverBackgroundColor]="'var(--theme-brand-primary-hover)'">
          <i class="pi pi-filter mr-2"></i> Filter
        </button>
        <!-- Export button uses a secondary, outlined style -->
        <button class="p-button p-component p-button-sm p-button-outlined rounded-md px-4 py-2 text-sm"
                (click)="exportToCSV()"
                [style.borderColor]="'var(--theme-button-outlined-border)'"
                [style.color]="'var(--theme-button-outlined-text)'"
                [style.hoverBackgroundColor]="'var(--theme-button-outlined-hover-bg)'"
                [style.hoverColor]="'var(--theme-button-outlined-hover-text)'">
          <i class="pi pi-upload mr-2"></i> Export
        </button>
      </div>

    </div>
  </div>

  <!-- The main AG-Grid area -->
  <div class="relative w-full ag-grid-main-area" [style.height]="mainGridHeight">
    <ag-grid-angular
      style="height: 100%; width: 100%;"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [theme]="theme"
      [defaultColDef]="defaultColDef"
      [pagination]="true"
      [rowSelection]="rowSelection"
      [rowClassRules]="mergedRowClassRules"
      [paginationPageSize]="paginationPageSize"
      [getRowId]="getRowId"
      (cellValueChanged)="onCellValueChanged($event)"
      (rowSelected)="onRowSelected($event)"
      (cellClicked)="onCellClicked($event)"
      (gridReady)="onGridReady($event)">
    </ag-grid-angular>
  </div>
</div>


  `,
  styles: [`
    .ag-grid-main-area {
      overflow: hidden;
    }
    .ag-grid-header-filter-area {
      padding: 0.5rem;
    }
    .p-button-sm {
      padding: 0.25rem 0.5rem;
    }
  `]
})
export class SharedGridComponent implements OnInit, OnChanges {
  @Input() rowClassRules: any = {};
  @Input() usertheme: string = 'ag-theme-quartz';
  @Input() data: any[] = [];
  @Input() rowSelectionMode: string = 'single';
  @Input() column: ColDef[] = [];
  @Input() gridHeight: string = '162px'; // Adjusted for 50px navbar + 64px toolbar + 48px padding
  @Input() gridWidth: string = '100%';
  @Input() padding: string = '0 0px';
  @Input() paginationPageSize: number = 100;
  @Input() GridName: string = '';
  @Input() headerFilter: boolean = true;
  @Output() dataChanged = new EventEmitter<any>();
  @Output() eventFromGrid = new EventEmitter<any>();
  @Output() gridReady = new EventEmitter<GridReadyEvent>();

  private gridApi!: GridApi;
  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  editingRowId: string | null = null;
  originalRowData: any = {};
  accentColor: string = '#3b82f6'; // Default blue for ag-theme-quartz
  mainGridHeight: string = 'calc(100vh - 162px)';

  defaultColDef: ColDef = {
    sortable: true,
    filter: 'agTextColumnFilter',
    resizable: true,
    editable: (params) => this.editingRowId === params.data._id
  };

  rowSelection: any = { mode: 'single' };

  // Default rowClassRules for common scenarios
  defaultRowClassRules = {
    'bg-blue-100 dark:bg-blue-900': (params: any) => this.editingRowId === params.data._id,
    'bg-gray-50 dark:bg-gray-700': (params: any) => params.node.rowIndex % 2 === 0, // Alternating rows
    'bg-red-100 dark:bg-red-900': (params: any) => params.data.availabilityStatus === 'OutOfStock',
    'bg-green-100 dark:bg-green-900': (params: any) => params.data.availabilityStatus === 'InStock'
  };

  // Merge default and input rowClassRules
  mergedRowClassRules: any = {};

  theme = themeQuartz.withParams({
    backgroundColor: 'var(--theme-bg-primary, #ffffff)',
    foregroundColor: 'var(--theme-text-primary, #111827)',
    headerTextColor: 'var(--theme-text-heading, #374151)',
    headerBackgroundColor: 'var(--theme-bg-secondary, #f3f4f6)',
    oddRowBackgroundColor: 'var(--theme-bg-primary, #ffffff)',
    headerColumnResizeHandleColor: 'var(--theme-accent-primary, #3b82f6)',
    borderColor: 'var(--theme-border-primary, #e5e7eb)',
    fontFamily: 'Inter, Poppins, sans-serif',
    fontSize: '0.75rem',
    headerFontFamily: 'Inter, Poppins, sans-serif',
    headerFontWeight: '500',
    rangeSelectionBorderColor: 'var(--theme-accent-primary, #3b82f6)',
    rangeSelectionBorderStyle: 'dashed',
    rangeSelectionBackgroundColor: 'var(--theme-accent-primary-light, #dbeafe)',
    rangeSelectionHighlightColor: 'var(--theme-accent-primary, #3b82f6)',
    inputBorder: { color: 'var(--theme-accent-primary, #3b82f6)', style: 'solid', width: 1 },
    inputBackgroundColor: 'var(--theme-bg-tertiary, #f9fafb)',
    inputPlaceholderTextColor: 'var(--theme-text-secondary, #6b7280)',
    inputIconColor: 'var(--theme-accent-primary, #3b82f6)',
    selectedRowBackgroundColor: 'var(--theme-accent-primary-light, #dbeafe)'
  });

  getRowId: (params: GetRowIdParams) => string = (params: GetRowIdParams) => {
    return params.data._id || String(params.data.id);
  };

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    this.rowSelection = { mode: this.rowSelectionMode };
    this.computeGridHeight();
    this.rowData = Array.isArray(this.data) ? this.data : [];
    this.columnDefs = this.column;
    this.updateColumnDefs();
    this.updateRowClassRules();
    this.accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--theme-accent-primary')
      .trim() || '#3b82f6';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.rowData = Array.isArray(changes['data'].currentValue) ? changes['data'].currentValue : [];
      this.updateColumnDefs();
    }
    if (changes['column'] && changes['column'].currentValue) {
      this.columnDefs = changes['column'].currentValue;
      this.updateColumnDefs();
    }
    if (changes['rowSelectionMode']) {
      this.rowSelection = { mode: this.rowSelectionMode };
    }
    if (changes['gridHeight']) {
      this.computeGridHeight();
    }
    if (changes['rowClassRules']) {
      this.updateRowClassRules();
    }
  }

  computeGridHeight(): void {
    const isValidLength = (value: string): boolean => {
      if (!/^\d+(\.\d+)?(\w+|%)$/.test(value)) {
        console.warn(`Invalid CSS length for gridHeight: ${value}. Using default '162px'.`);
        return false;
      }
      return true;
    };
    const height = isValidLength(this.gridHeight) ? this.gridHeight : '162px';
    this.mainGridHeight = `calc(100vh - ${height})`;
  }

  updateRowClassRules(): void {
    this.mergedRowClassRules = {
      ...this.defaultRowClassRules,
      ...this.rowClassRules
    };
  }

  updateColumnDefs(): void {
    if (!this.column || this.column.length === 0) {
      this.columnDefs = this.generateDefaultColumns(this.rowData);
    } else {
      this.columnDefs = [...this.column];
    }
    this.addActionButtonCol();
  }

  addActionButtonCol(): void {
    const alreadyExists = this.columnDefs.some((col: ColDef) => col.colId === 'actionButtons');
    if (alreadyExists) return;
    this.columnDefs.push({
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: ActionbuttonsComponent,
      editable: false,
      colId: 'actionButtons',
      cellRendererParams: {
        context: {
          isRowEditing: (id: string) => this.editingRowId === id,
          startEditingRow: (rowData: any) => this.startEditingRow(rowData),
          saveRow: (rowData: any) => this.saveRow(rowData),
          cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
          deleteRow: (rowData: any) => this.deleteRow(rowData),
          stopEditing: (cancel: boolean) => this.gridApi.stopEditing(cancel)
        }
      },
      pinned: 'right',
      width: 120,
      minWidth: 100
    });
  }

  startEditingRow(rowData: any): void {
    if (!this.gridApi) return;
    this.editingRowId = rowData._id;
    this.originalRowData = { ...rowData };
    this.gridApi.refreshCells({ force: true });
    const firstEditableField = this.columnDefs.find(col => col.editable !== false)?.field || 'email';
    this.gridApi.startEditingCell({ rowIndex: this.getRowIndex(rowData), colKey: firstEditableField });
  }

  saveRow(rowData: any): void {
    if (!this.gridApi) return;
    this.gridApi.stopEditing(false);
    this.editingRowId = null;
    this.gridApi.refreshCells({ force: true });
    this.dataChanged.emit({ type: 'save', data: rowData });
  }

  cancelEditingRow(rowData: any): void {
    if (!this.gridApi) return;
    const rowIndex = this.getRowIndex(rowData);
    if (rowIndex >= 0) {
      const restoredRow = { ...this.originalRowData };
      this.rowData[rowIndex] = restoredRow;
      this.gridApi.applyTransaction({ update: [restoredRow] });
      this.gridApi.stopEditing(true);
      this.editingRowId = null;
      this.gridApi.refreshCells({ force: true });
      this.dataChanged.emit({ type: 'cancel', data: rowData });
    }
  }

  deleteRow(rowData: any): void {
    if (!this.gridApi) return;
    this.rowData = this.rowData.filter(row => row._id !== rowData._id);
    this.gridApi.applyTransaction({ remove: [rowData] });
    this.dataChanged.emit({ type: 'delete', data: rowData });
  }

  getRowIndex(rowData: any): number {
    return this.rowData.findIndex(row => row._id === rowData._id);
  }

  generateDefaultColumns(data: any[]): ColDef[] {
    if (!data || data.length === 0) {
      return [
        {
          headerName: 'No Data',
          field: 'noData',
          valueGetter: () => 'No data available',
          editable: false
        }
      ];
    }
    return Object.keys(data[0]).map(key => {
      const isNumeric = data.every(row => typeof row[key] === 'number' || row[key] == null);
      const isBoolean = data.every(row => typeof row[key] === 'boolean' || row[key] == null);
      return {
        headerName: key.charAt(0).toUpperCase() + key.slice(1),
        field: key,
        cellRenderer: isNumeric || isBoolean ? undefined : DynamicCellComponent,
        cellRendererParams: isNumeric || isBoolean ? undefined : { type: 'text' },
        filter: isNumeric ? 'agNumberColumnFilter' : isBoolean ? 'agSetColumnFilter' : 'agTextColumnFilter'
      };
    });
  }

  onCellValueChanged(event: CellValueChangedEvent): void {
    this.eventFromGrid.emit({ eventType: 'onCellValueChanged', event });
  }

  onRowSelected(event: RowSelectedEvent): void {
    this.eventFromGrid.emit({ eventType: 'RowSelectedEvent', event });
  }

  onCellClicked(event: CellClickedEvent): void {
    this.eventFromGrid.emit({ eventType: 'CellClickedEvent', event });
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    this.gridReady.emit(event);
  }

  exportToCSV(): void {
    this.gridApi.exportDataAsCsv();
  }

  onColorChange(event: any): void {
    const color = event.value;
    this.accentColor = color;
    document.documentElement.style.setProperty('--theme-accent-primary', color);
    this.gridApi.refreshHeader();
    this.gridApi.refreshCells({ force: true });
    this.themeService.updateGradient(color);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.gridApi.setGridOption('quickFilterText', input.value);
  }

  onFilterClick(): void {
    this.gridApi.setFilterModel(null);
    this.gridApi.onFilterChanged();
  }

  onActionClicked(event: { action: string; data: any }): void {
    this.eventFromGrid.emit({ eventType: 'actionClicked', action: event.action, data: event.data });
  }
}
// import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
// import { AgGridAngular } from 'ag-grid-angular';
// import { ColDef, GridApi, GridReadyEvent, CellValueChangedEvent, RowSelectedEvent, CellClickedEvent, GetRowIdParams } from 'ag-grid-community';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { SelectModule } from 'primeng/select';
// import { ToolbarModule } from 'primeng/toolbar';
// import { ColorPickerModule } from 'primeng/colorpicker';
// import { AllCommunityModule } from 'ag-grid-community';
// import { ModuleRegistry } from 'ag-grid-community';
// import { ActionbuttonsComponent } from '../../AgGridcomponents/actionbuttons/actionbuttons.component';
// import { DynamicCellComponent } from '../../AgGridcomponents/dynamic-cell/dynamic-cell.component';
// import { ThemeService } from '../../../../core/services/theme.service';
// import { themeQuartz } from 'ag-grid-community';

// ModuleRegistry.registerModules([AllCommunityModule]);

// @Component({
//   selector: 'app-shared-grid',
//   standalone: true,
//   imports: [AgGridAngular, FormsModule, ToolbarModule, CommonModule, SelectModule, ColorPickerModule],
//   templateUrl: './shared-grid.component.html',
//   styleUrls: ['./shared-grid.component.css']
// })
// export class SharedGridComponent implements OnInit, OnChanges {
//   @Input() rowClassrules: any;
//   @Input() usertheme: string = 'ag-theme-quartz';
//   @Input() data: any[] = [];
//   @Input() rowSelectionMode: string = 'single';
//   @Input() column: ColDef[] = [];
//   @Input() gridHeight: string = '200px'; // Simple CSS length as offset
//   @Input() gridWidth: string = '100%';
//   @Input() padding: string = '0 0px';
//   @Input() paginationPageSize: number = 100;
//   @Input() GridName: string = ''; // Type-safe string
//   @Output() dataChanged = new EventEmitter<any>();
//   @Output() eventFromGrid = new EventEmitter<any>();
//   @Output() gridReady = new EventEmitter<GridReadyEvent>();

//   private gridApi!: GridApi;
//   rowData: any[] = [];
//   columnDefs: ColDef[] = [];
//   editingRowId: string | null = null;
//   originalRowData: any = {};
//   accentColor: string = '#f472b6'; // Matches --theme-accent-primary (light mode)
//   mainGridHeight: string = 'calc(100vh - 200px)'; // Computed height

//   defaultColDef: ColDef = {
//     sortable: true,
//     filter: 'agTextColumnFilter',
//     resizable: true,
//     editable: (params) => this.editingRowId === params.data._id
//   };

//   rowSelection: any = { mode: 'single' };
//   theme = themeQuartz.withParams({
//     backgroundColor: 'var(--theme-bg-primary)',
//     foregroundColor: 'var(--theme-text-primary)',
//     headerTextColor: 'var(--theme-text-heading)',
//     headerBackgroundColor: 'var(--theme-bg-secondary)',
//     oddRowBackgroundColor: 'var(--theme-bg-primary)',
//     headerColumnResizeHandleColor: 'var(--theme-accent-primary)',
//     borderColor: 'var(--theme-border-primary)',
//     fontFamily: 'Inter, Poppins, sans-serif',
//     fontSize: '0.875rem',
//     headerFontFamily: 'Inter, Poppins, sans-serif',
//     headerFontWeight: '500',
//     rangeSelectionBorderColor: 'var(--theme-accent-primary)',
//     rangeSelectionBorderStyle: 'dashed',
//     rangeSelectionBackgroundColor: 'var(--theme-accent-primary-light)',
//     rangeSelectionHighlightColor: 'var(--theme-accent-primary)',
//     inputBorder: { color: 'var(--theme-accent-primary)', style: 'solid', width: 1 },
//     inputBackgroundColor: 'var(--theme-bg-tertiary)',
//     inputPlaceholderTextColor: 'var(--theme-text-secondary)',
//     inputIconColor: 'var(--theme-accent-primary)',
//     selectedRowBackgroundColor: 'var(--theme-accent-primary-light)'
//   });

//   getRowId: (params: GetRowIdParams) => string = (params: GetRowIdParams) => {
//     return params.data._id || String(params.data.id);
//   };

//   constructor(private themeService: ThemeService) {}

//   ngOnInit(): void {
//     this.rowSelection = { mode: this.rowSelectionMode };
//     this.computeGridHeight();
//     this.rowData = Array.isArray(this.data) ? this.data : [];
//     this.columnDefs = this.column;
//     this.updateColumnDefs();
//     // this.themeService.applyTheme(this.usertheme);
//     this.accentColor = getComputedStyle(document.documentElement)
//       .getPropertyValue('--theme-accent-primary')
//       .trim() || '#f472b6';
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['data'] && changes['data'].currentValue) {
//       this.rowData = Array.isArray(changes['data'].currentValue) ? changes['data'].currentValue : [];
//       this.updateColumnDefs();
//     }
//     if (changes['column'] && changes['column'].currentValue) {
//       this.columnDefs = changes['column'].currentValue;
//       this.updateColumnDefs();
//     }
//     if (changes['rowSelectionMode']) {
//       this.rowSelection = { mode: this.rowSelectionMode };
//     }
//     if (changes['gridHeight']) {
//       this.computeGridHeight();
//     }
//   }

//   computeGridHeight(): void {
//     const isValidLength = (value: string): boolean => {
//       if (!/^\d+(\.\d+)?(\w+|%)$/.test(value)) {
//         console.warn(`Invalid CSS length for gridHeight: ${value}. Using default '200px'.`);
//         return false;
//       }
//       return true;
//     };
//     const height = isValidLength(this.gridHeight) ? this.gridHeight : '200px';
//     this.mainGridHeight = `calc(100vh - ${height})`;
//   }

//   updateColumnDefs(): void {
//     if (!this.column || this.column.length === 0) {
//       this.columnDefs = this.generateDefaultColumns(this.rowData);
//     } else {
//       this.columnDefs = [...this.column];
//     }
//     this.addActionButtonCol();
//   }

//   addActionButtonCol(): void {
//     const alreadyExists = this.columnDefs.some((col: ColDef) => col.colId === 'actionButtons');
//     if (alreadyExists) return;
//     this.columnDefs.push({
//       headerName: 'Actions',
//       field: 'actions',
//       cellRenderer: ActionbuttonsComponent,
//       editable: false,
//       colId: 'actionButtons',
//       cellRendererParams: {
//         context: {
//           isRowEditing: (id: string) => this.editingRowId === id,
//           startEditingRow: (rowData: any) => this.startEditingRow(rowData),
//           saveRow: (rowData: any) => this.saveRow(rowData),
//           cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
//           deleteRow: (rowData: any) => this.deleteRow(rowData),
//         }
//       },
//       pinned: 'right',
//       width: 120,
//       minWidth: 100
//     });
//   }

//   startEditingRow(rowData: any): void {
//     if (!this.gridApi) return;
//     this.editingRowId = rowData._id;
//     this.originalRowData = { ...rowData };
//     this.gridApi.refreshCells({ force: true });
//     const firstEditableField = this.columnDefs.find(col => col.editable !== false)?.field || 'email';
//     this.gridApi.startEditingCell({ rowIndex: this.getRowIndex(rowData), colKey: firstEditableField });
//   }

//   saveRow(rowData: any): void {
//     this.gridApi.stopEditing();
//     this.editingRowId = null;
//     this.gridApi.refreshCells({ force: true });
//     this.dataChanged.emit({ type: 'save', data: rowData });
//   }

//   cancelEditingRow(rowData: any): void {
//     const rowIndex = this.getRowIndex(rowData);
//     if (rowIndex >= 0) {
//       const restoredRow = { ...this.originalRowData };
//       this.rowData[rowIndex] = restoredRow;
//       this.gridApi.applyTransaction({ update: [restoredRow] });
//       this.editingRowId = null;
//       this.gridApi.refreshCells({ force: true });
//     }
//   }

//   deleteRow(rowData: any): void {
//     this.rowData = this.rowData.filter(row => row._id !== rowData._id);
//     this.gridApi.applyTransaction({ remove: [rowData] });
//     this.dataChanged.emit({ type: 'delete', data: rowData });
//   }

//   getRowIndex(rowData: any): number {
//     return this.rowData.findIndex(row => row._id === rowData._id);
//   }

//   generateDefaultColumns(data: any[]): ColDef[] {
//     if (!data || data.length === 0) {
//       return [
//         {
//           headerName: 'No Data',
//           field: 'noData',
//           valueGetter: () => 'No data available',
//           editable: false
//         }
//       ];
//     }
//     return Object.keys(data[0]).map(key => {
//       const isNumeric = data.every(row => typeof row[key] === 'number' || row[key] == null);
//       const isBoolean = data.every(row => typeof row[key] === 'boolean' || row[key] == null);
//       return {
//         headerName: key.charAt(0).toUpperCase() + key.slice(1),
//         field: key,
//         cellRenderer: isNumeric || isBoolean ? undefined : DynamicCellComponent,
//         cellRendererParams: isNumeric || isBoolean ? undefined : { type: 'text' },
//         filter: isNumeric ? 'agNumberColumnFilter' : isBoolean ? 'agSetColumnFilter' : 'agTextColumnFilter'
//       };
//     });
//   }

//   onCellValueChanged(event: CellValueChangedEvent): void {
//     this.eventFromGrid.emit({ eventType: 'onCellValueChanged', event });
//   }

//   onRowSelected(event: RowSelectedEvent): void {
//     this.eventFromGrid.emit({ eventType: 'RowSelectedEvent', event });
//   }

//   onCellClicked(event: CellClickedEvent): void {
//     this.eventFromGrid.emit({ eventType: 'CellClickedEvent', event });
//   }

//   onGridReady(event: GridReadyEvent): void {
//     this.gridApi = event.api;
//     this.gridReady.emit(event);
//   }

//   exportToCSV(): void {
//     this.gridApi.exportDataAsCsv();
//   }

//   onColorChange(event: any): void {
//     const color = event.value;
//     this.accentColor = color;
//     document.documentElement.style.setProperty('--theme-accent-primary', color);
//     this.gridApi.refreshHeader();
//     this.gridApi.refreshCells({ force: true });
//     this.themeService.updateGradient(color);
//   }

//   onSearch(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     this.gridApi.setGridOption('quickFilterText', input.value);
//   }

//   onFilterClick(): void {
//     this.gridApi.setFilterModel(null);
//     this.gridApi.onFilterChanged();
//   }

//   onButtonHover(event: MouseEvent, isHovering: boolean, type: 'brand' | 'brand-outlined' | 'secondary-accent'): void {
//     const button = event.currentTarget as HTMLElement;
//     if (type === 'brand') {
//       button.style.backgroundColor = isHovering ? 'var(--theme-brand-primary-hover)' : 'var(--theme-brand-primary)';
//     } else if (type === 'brand-outlined') {
//       button.style.backgroundColor = isHovering ? 'var(--theme-button-outlined-hover-bg)' : 'transparent';
//     } else if (type === 'secondary-accent') {
//       button.style.backgroundColor = isHovering ? 'var(--theme-secondary-accent-hover)' : 'var(--theme-secondary-accent-primary)';
//     }
//   }
// }
// // import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
// // import { AgGridAngular } from 'ag-grid-angular';
// // import { ColDef, GridApi, GridReadyEvent, CellValueChangedEvent, RowSelectedEvent, CellClickedEvent, GetRowIdParams } from 'ag-grid-community';
// // import { FormsModule } from '@angular/forms';
// // import { CommonModule } from '@angular/common';
// // import { SelectModule } from 'primeng/select';
// // import { ToolbarModule } from 'primeng/toolbar';
// // import { ColorPickerModule } from 'primeng/colorpicker';
// // import { AllCommunityModule } from 'ag-grid-community';
// // import { ModuleRegistry } from 'ag-grid-community';
// // import { ActionbuttonsComponent } from '../../AgGridcomponents/actionbuttons/actionbuttons.component';
// // import { DynamicCellComponent } from '../../AgGridcomponents/dynamic-cell/dynamic-cell.component';
// // import { ThemeService } from '../../../../core/services/theme.service';
// // import { themeQuartz } from 'ag-grid-community';

// // ModuleRegistry.registerModules([AllCommunityModule]);

// // @Component({
// //   selector: 'app-shared-grid',
// //   standalone: true,
// //   imports: [AgGridAngular, FormsModule, ToolbarModule, CommonModule, SelectModule, ColorPickerModule],
// //   templateUrl: './shared-grid.component.html',
// //   styleUrls: ['./shared-grid.component.css']
// // })
// // export class SharedGridComponent implements OnInit, OnChanges {
// //   @Input() rowClassrules: any;
// //   @Input() usertheme: string = 'ag-theme-quartz';
// //   @Input() data: any[] = [];
// //   @Input() rowSelectionMode: string = 'single';
// //   @Input() column: ColDef[] = [];
// //   @Input() gridHeight: string = 'calc(100vh - 200px)';
// //   @Input() gridWidth: string = '100%';
// //   @Input() padding: string = '0 0px';
// //   @Input() paginationPageSize: number = 100;
// //   @Input() GridName: any;
// //   @Input() headerHeight: string = '100px';
// //   @Input() footerHeight: string = '50px';
// //   @Output() dataChanged = new EventEmitter<any>();
// //   @Output() eventFromGrid = new EventEmitter<any>();
// //   @Output() gridReady = new EventEmitter<GridReadyEvent>();

// //   private gridApi!: GridApi;
// //   rowData: any[] = [];
// //   columnDefs: ColDef[] = [];
// //   editingRowId: string | null = null;
// //   originalRowData: any = {};
// //   accentColor: string = '#f472b6';

// //   defaultColDef: ColDef = {
// //     sortable: true,
// //     filter: 'agTextColumnFilter',
// //     resizable: true,
// //     editable: (params) => this.editingRowId === params.data._id
// //   };

// //   rowSelection: any = { mode: 'single' };
// //   theme = themeQuartz.withParams({
// //     backgroundColor: 'var(--theme-bg-primary)',
// //     foregroundColor: 'var(--theme-text-primary)',
// //     headerTextColor: 'var(--theme-text-heading)',
// //     headerBackgroundColor: 'var(--theme-bg-secondary)',
// //     oddRowBackgroundColor: 'var(--theme-bg-primary)',
// //     headerColumnResizeHandleColor: 'var(--theme-accent-primary)',
// //     borderColor: 'var(--theme-border-primary)',
// //     fontFamily: 'Inter, Poppins, sans-serif',
// //     fontSize: '0.875rem',
// //     headerFontFamily: 'Inter, Poppins, sans-serif',
// //     headerFontWeight: '500',
// //     rangeSelectionBorderColor: 'var(--theme-accent-primary)',
// //     rangeSelectionBorderStyle: 'dashed',
// //     rangeSelectionBackgroundColor: 'var(--theme-accent-primary-light)',
// //     rangeSelectionHighlightColor: 'var(--theme-accent-primary)',
// //     inputBorder: { color: 'var(--theme-accent-primary)', style: 'solid', width: 1 },
// //     inputBackgroundColor: 'var(--theme-bg-tertiary)',
// //     inputPlaceholderTextColor: 'var(--theme-text-secondary)',
// //     inputIconColor: 'var(--theme-accent-primary)',
// //     selectedRowBackgroundColor: 'var(--theme-accent-primary-light)'
// //   });

// //   // Explicitly typed getRowId
// //   getRowId: (params: GetRowIdParams) => string = (params: GetRowIdParams) => {
// //     return params.data._id || String(params.data.id);
// //   };

// //   constructor(private themeService: ThemeService) {}

// //   ngOnInit(): void {
// //     this.rowSelection = { mode: this.rowSelectionMode };
// //     this.validateAndSetGridHeight();
// //     this.rowData = Array.isArray(this.data) ? this.data : [];
// //     this.columnDefs = this.column;
// //     this.updateColumnDefs();
// //     // this.themeService.applyTheme(this.usertheme);
// //     this.accentColor = getComputedStyle(document.documentElement)
// //       .getPropertyValue('--theme-accent-primary')
// //       .trim() || '#f472b6';
// //   }

// //   ngOnChanges(changes: SimpleChanges): void {
// //     if (changes['data'] && changes['data'].currentValue) {
// //       this.rowData = Array.isArray(changes['data'].currentValue) ? changes['data'].currentValue : [];
// //       this.updateColumnDefs();
// //     }
// //     if (changes['column'] && changes['column'].currentValue) {
// //       this.columnDefs = changes['column'].currentValue;
// //       this.updateColumnDefs();
// //     }
// //     if (changes['rowSelectionMode']) {
// //       this.rowSelection = { mode: this.rowSelectionMode };
// //     }
// //     if (changes['headerHeight'] || changes['footerHeight']) {
// //       this.validateAndSetGridHeight();
// //     }
// //   }

// //   validateAndSetGridHeight(): void {
// //     const isValidLength = (value: string): boolean => {
// //       if (!/^\d+(\.\d+)?(\w+|%)$/.test(value)) {
// //         console.warn(`Invalid CSS length: ${value}. Using default.`);
// //         return false;
// //       }
// //       return true;
// //     };
// //     const header = isValidLength(this.headerHeight) ? this.headerHeight : '100px';
// //     const footer = isValidLength(this.footerHeight) ? this.footerHeight : '50px';
// //     this.gridHeight = `calc(100vh - (${header} + ${footer} + 50px))`;
// //   }

// //   updateColumnDefs(): void {
// //     if (!this.column || this.column.length === 0) {
// //       this.columnDefs = this.generateDefaultColumns(this.rowData);
// //     } else {
// //       this.columnDefs = [...this.column];
// //     }
// //     this.addActionButtonCol();
// //   }

// //   addActionButtonCol(): void {
// //     const alreadyExists = this.columnDefs.some((col: ColDef) => col.colId === 'actionButtons');
// //     if (alreadyExists) return;
// //     this.columnDefs.push({
// //       headerName: 'Actions',
// //       field: 'actions',
// //       cellRenderer: ActionbuttonsComponent,
// //       editable: false,
// //       colId: 'actionButtons',
// //       cellRendererParams: {
// //         context: {
// //           isRowEditing: (id: string) => this.editingRowId === id,
// //           startEditingRow: (rowData: any) => this.startEditingRow(rowData),
// //           saveRow: (rowData: any) => this.saveRow(rowData),
// //           cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
// //           deleteRow: (rowData: any) => this.deleteRow(rowData),
// //         }
// //       },
// //       pinned: 'right',
// //       width: 120,
// //       minWidth: 100
// //     });
// //   }

// //   startEditingRow(rowData: any): void {
// //     if (!this.gridApi) return;
// //     this.editingRowId = rowData._id;
// //     this.originalRowData = { ...rowData };
// //     this.gridApi.refreshCells({ force: true });
// //     const firstEditableField = this.columnDefs.find(col => col.editable !== false)?.field || 'email';
// //     this.gridApi.startEditingCell({ rowIndex: this.getRowIndex(rowData), colKey: firstEditableField });
// //   }

// //   saveRow(rowData: any): void {
// //     this.gridApi.stopEditing();
// //     this.editingRowId = null;
// //     this.gridApi.refreshCells({ force: true });
// //     this.dataChanged.emit({ type: 'save', data: rowData });
// //   }

// //   cancelEditingRow(rowData: any): void {
// //     const rowIndex = this.getRowIndex(rowData);
// //     if (rowIndex >= 0) {
// //       const restoredRow = { ...this.originalRowData };
// //       this.rowData[rowIndex] = restoredRow;
// //       this.gridApi.applyTransaction({ update: [restoredRow] });
// //       this.editingRowId = null;
// //       this.gridApi.refreshCells({ force: true });
// //     }
// //   }

// //   deleteRow(rowData: any): void {
// //     this.rowData = this.rowData.filter(row => row._id !== rowData._id);
// //     this.gridApi.applyTransaction({ remove: [rowData] });
// //     this.dataChanged.emit({ type: 'delete', data: rowData });
// //   }

// //   getRowIndex(rowData: any): number {
// //     return this.rowData.findIndex(row => row._id === rowData._id);
// //   }

// //   generateDefaultColumns(data: any[]): ColDef[] {
// //     if (!data || data.length === 0) {
// //       return [
// //         {
// //           headerName: 'No Data',
// //           field: 'noData',
// //           valueGetter: () => 'No data available',
// //           editable: false
// //         }
// //       ];
// //     }
// //     return Object.keys(data[0]).map(key => {
// //       const isNumeric = data.every(row => typeof row[key] === 'number' || row[key] == null);
// //       const isBoolean = data.every(row => typeof row[key] === 'boolean' || row[key] == null);
// //       return {
// //         headerName: key.charAt(0).toUpperCase() + key.slice(1),
// //         field: key,
// //         cellRenderer: isNumeric || isBoolean ? undefined : DynamicCellComponent,
// //         cellRendererParams: isNumeric || isBoolean ? undefined : { type: 'text' },
// //         filter: isNumeric ? 'agNumberColumnFilter' : isBoolean ? 'agSetColumnFilter' : 'agTextColumnFilter'
// //       };
// //     });
// //   }

// //   onCellValueChanged(event: CellValueChangedEvent): void {
// //     this.eventFromGrid.emit({ eventType: 'onCellValueChanged', event });
// //   }

// //   onRowSelected(event: RowSelectedEvent): void {
// //     this.eventFromGrid.emit({ eventType: 'RowSelectedEvent', event });
// //   }

// //   onCellClicked(event: CellClickedEvent): void {
// //     this.eventFromGrid.emit({ eventType: 'CellClickedEvent', event });
// //   }

// //   onGridReady(event: GridReadyEvent): void {
// //     this.gridApi = event.api;
// //     this.gridReady.emit(event);
// //   }

// //   exportToCSV(): void {
// //     this.gridApi.exportDataAsCsv();
// //   }

// //   onColorChange(event: any): void {
// //     const color = event.value;
// //     this.accentColor = color;
// //     document.documentElement.style.setProperty('--theme-accent-primary', color);
// //     this.gridApi.refreshHeader();
// //     this.gridApi.refreshCells({ force: true });
// //     this.themeService.updateGradient(color);
// //   }

// //   onSearch(event: Event): void {
// //     const input = event.target as HTMLInputElement;
// //     this.gridApi.setGridOption('quickFilterText', input.value);
// //   }

// //   onFilterClick(): void {
// //     this.gridApi.setFilterModel(null);
// //     this.gridApi.onFilterChanged();
// //   }

// //   onButtonHover(event: MouseEvent, isHovering: boolean, type: 'brand' | 'brand-outlined' | 'secondary-accent'): void {
// //     const button = event.currentTarget as HTMLElement;
// //     if (type === 'brand') {
// //       button.style.backgroundColor = isHovering ? 'var(--theme-brand-primary-hover)' : 'var(--theme-brand-primary)';
// //     } else if (type === 'brand-outlined') {
// //       button.style.backgroundColor = isHovering ? 'var(--theme-button-outlined-hover-bg)' : 'transparent';
// //     } else if (type === 'secondary-accent') {
// //       button.style.backgroundColor = isHovering ? 'var(--theme-secondary-accent-hover)' : 'var(--theme-secondary-accent-primary)';
// //     }
// //   }
// // }
// // // // // // import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
// // // // // // import { AgGridAngular } from 'ag-grid-angular';
// // // // // // import { ColDef, GridApi, GridReadyEvent, CellValueChangedEvent, themeQuartz, RowSelectedEvent, CellClickedEvent } from 'ag-grid-community';
// // // // // // import { FormsModule } from '@angular/forms';
// // // // // // import { CommonModule } from '@angular/common';
// // // // // // import { SelectModule } from 'primeng/select';
// // // // // // import { ToolbarModule } from 'primeng/toolbar';
// // // // // // import { AllCommunityModule } from 'ag-grid-community';
// // // // // // import { ModuleRegistry } from 'ag-grid-community';
// // // // // // import { ActionbuttonsComponent } from '../../AgGridcomponents/actionbuttons/actionbuttons.component';
// // // // // // import { DynamicCellComponent } from '../../AgGridcomponents/dynamic-cell/dynamic-cell.component';

// // // // // // ModuleRegistry.registerModules([AllCommunityModule]);

// // // // // // @Component({
// // // // // //   selector: 'app-shared-grid',
// // // // // //   standalone: true,
// // // // // //   imports: [AgGridAngular, FormsModule, ToolbarModule, CommonModule, SelectModule],
// // // // // //   templateUrl: './shared-grid.component.html',
// // // // // //   styleUrls: ['./shared-grid.component.css']
// // // // // // })
// // // // // // export class SharedGridComponent implements OnInit, OnChanges {
// // // // // //   @Input() rowClassrules: any;
// // // // // //   @Input() usertheme: string = 'ag-theme-quartz';
// // // // // //   @Input() data: any[] = [];
// // // // // //   @Input() rowSelectionMode: string = 'single';
// // // // // //   @Input() column: ColDef[] = [];
// // // // // //   @Input() gridHeight: string = '500px';
// // // // // //   @Input() gridWidth: string = '100%';
// // // // // //   @Input() padding: string = '0 0px';
// // // // // //   @Input() paginationPageSize: any= 100
// // // // // //   @Output() dataChanged = new EventEmitter<any>();
// // // // // //   @Output() eventFromGrid = new EventEmitter<any>();
// // // // // //   @Output() gridReady = new EventEmitter<GridReadyEvent>();

// // // // // //   private gridApi!: GridApi;
// // // // // //   rowData: any[] = [];
// // // // // //   columnDefs: ColDef[] = [];
// // // // // //   editingRowId: string | null = null;
// // // // // //   originalRowData: any = {};

// // // // // //   defaultColDef: ColDef = {
// // // // // //     sortable: true,
// // // // // //     filter: true,
// // // // // //     resizable: true,
// // // // // //     floatingFilter: true,
// // // // // //     editable: (params) => this.editingRowId === params.data._id
// // // // // //   };

// // // // // //   rowSelection: any = { mode: 'single' };
// // // // // //   // theme = themeQuartz;
// // // // // //   theme = themeQuartz.withParams({
// // // // // //     backgroundColor: '#EFEEEA', // Light background for grid rows
// // // // // //     foregroundColor: '#06202B', // Text color
// // // // // //     headerTextColor: '#FE5D26', // Header text color
// // // // // //     headerBackgroundColor: '#183B4E', // Header background color
// // // // // //     oddRowBackgroundColor: '#C7C8CC', // Subtle background for odd rows
// // // // // //     headerColumnResizeHandleColor: 'rgb(126, 46, 132)', // Color for resize handle
// // // // // //     borderColor: '#CCCCCC',         // Medium grey for borders
// // // // // //     // fontFamily: 'Arial, sans-serif', // Example font family
// // // // // //     // fontSize: '13px',
// // // // // //     fontFamily: 'Inter, sans-serif', // Or your preferred font stack
// // // // // //     fontSize: '14px',             // Adjust size as needed
// // // // // //     // For headers:
// // // // // //     headerFontFamily: 'Inter, sans-serif', // Often the same as fontFamily
// // // // // //     headerFontWeight: 'bold',
// // // // // //     rangeSelectionBorderColor: 'rgb(193, 0, 97)',
// // // // // //     rangeSelectionBorderStyle: 'dashed',
// // // // // //     // background color of selection - you can use a semi-transparent color
// // // // // //     // and it wil overlay on top of the existing cells
// // // // // //     rangeSelectionBackgroundColor: 'rgb(255, 0, 128, 0.1)',
// // // // // //     // color used to indicate that data has been copied form the cell range
// // // // // //     rangeSelectionHighlightColor: 'rgb(60, 188, 0, 0.3)',

// // // // // //     inputBorder: { color: 'orange', style: 'dotted', width: 3 },
// // // // // //     inputBackgroundColor: 'rgb(255, 209, 123)', // light orange
// // // // // //     inputPlaceholderTextColor: 'rgb(155, 101, 1)', // darker orange
// // // // // //     inputIconColor: 'purple', // light orange

// // // // // //     selectedRowBackgroundColor: '#73A9AD',
// // // // // //     // Add other parameters as needed for further customization
// // // // // //     // rowHoverColor: '...',
// // // // // //     // selectedRowBackgroundColor: '...',
// // // // // //   });

// // // // // //   getRowId = (params: { data: any }) => params.data._id;

// // // // // //   ngOnInit(): void {
// // // // // //     // this.theme = this.usertheme || 'ag-theme-quartz';
// // // // // //     this.rowSelection = { mode: this.rowSelectionMode };
// // // // // //     this.updateColumnDefs();
// // // // // //   }

// // // // // //   ngOnChanges(changes: SimpleChanges): void {
// // // // // //     if (changes['data'] && changes['data'].currentValue) {
// // // // // //       this.rowData = Array.isArray(changes['data'].currentValue) ? changes['data'].currentValue : [];
// // // // // //     }
// // // // // //     if (changes['column'] && changes['column'].currentValue) {
// // // // // //       this.columnDefs = changes['column'].currentValue;
// // // // // //       this.updateColumnDefs();
// // // // // //     }
// // // // // //     if (changes['rowSelectionMode']) {
// // // // // //       this.rowSelection = { mode: this.rowSelectionMode };
// // // // // //     }
// // // // // //   }

// // // // // //   updateColumnDefs() {
// // // // // //     if (!this.column || this.column.length === 0) {
// // // // // //       this.columnDefs = this.generateDefaultColumns(this.rowData);
// // // // // //     } else {
// // // // // //       this.columnDefs = [...this.column];
// // // // // //     }
// // // // // //     // this.addActionButtonCol();
// // // // // //   }

// // // // // //   addActionButtonCol() {
// // // // // //     const alreadyExists = this.columnDefs.some((col: ColDef) => col.colId === 'actionButtons');
// // // // // //     if (alreadyExists) return;
// // // // // //     this.columnDefs.push({
// // // // // //       headerName: 'Actions',
// // // // // //       field: 'actions',
// // // // // //       cellRenderer: ActionbuttonsComponent,
// // // // // //       editable: false,
// // // // // //       colId: 'actionButtons',
// // // // // //       cellRendererParams: {
// // // // // //         context: {
// // // // // //           isRowEditing: (id: string) => this.editingRowId === id,
// // // // // //           startEditingRow: (rowData: any) => this.startEditingRow(rowData),
// // // // // //           saveRow: (rowData: any) => this.saveRow(rowData),
// // // // // //           cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
// // // // // //           deleteRow: (rowData: any) => this.deleteRow(rowData),
// // // // // //         }
// // // // // //       },
// // // // // //       pinned: 'right',
// // // // // //       width: 160,
// // // // // //     });
// // // // // //   }
// // // // // //   startEditingRow(rowData: any) {
// // // // // //     if (!this.gridApi) return;
// // // // // //     this.editingRowId = rowData._id;
// // // // // //     this.originalRowData = { ...rowData };
// // // // // //     this.gridApi.refreshCells({ force: true }); // Refresh to update editable state
// // // // // //     this.gridApi.startEditingCell({ rowIndex: this.getRowIndex(rowData), colKey: this.columnDefs[0].field || 'email' });
// // // // // //   }

// // // // // //   saveRow(rowData: any) {
// // // // // //     this.gridApi.stopEditing();
// // // // // //     this.editingRowId = null;
// // // // // //     this.gridApi.refreshCells({ force: true });
// // // // // //     this.dataChanged.emit({ type: 'save', data: rowData });
// // // // // //   }

// // // // // //   cancelEditingRow(rowData: any) {
// // // // // //     const rowIndex = this.getRowIndex(rowData);
// // // // // //     if (rowIndex >= 0) {
// // // // // //       const restoredRow = { ...this.originalRowData };
// // // // // //       this.rowData[rowIndex] = restoredRow;
// // // // // //       this.gridApi.applyTransaction({ update: [restoredRow] });
// // // // // //       this.editingRowId = null;
// // // // // //       this.gridApi.refreshCells({ force: true });
// // // // // //     }
// // // // // //   }

// // // // // //   deleteRow(rowData: any) {
// // // // // //     this.rowData = this.rowData.filter(row => row._id !== rowData._id);
// // // // // //     this.gridApi.applyTransaction({ remove: [rowData] });
// // // // // //     this.dataChanged.emit({ type: 'delete', data: rowData });
// // // // // //   }
// // // // // //   // addActionButtonCol() {
// // // // // //   //   const alreadyExists = this.columnDefs.some((col: ColDef) => col.colId === 'actionButtons');
// // // // // //   //   if (alreadyExists) return;
// // // // // //   //   this.columnDefs.push({
// // // // // //   //     headerName: 'Actions',
// // // // // //   //     field: 'actions',
// // // // // //   //     cellRenderer: ActionbuttonsComponent,
// // // // // //   //     editable: false,
// // // // // //   //     colId: 'actionButtons',
// // // // // //   //     cellRendererParams: {
// // // // // //   //       context: {
// // // // // //   //         isRowEditing: (id: string) => this.editingRowId === id,
// // // // // //   //         startEditingRow: (rowData: any) => this.startEditingRow(rowData),
// // // // // //   //         saveRow: (rowData: any) => this.saveRow(rowData),
// // // // // //   //         cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
// // // // // //   //         deleteRow: (rowData: any) => this.deleteRow(rowData),
// // // // // //   //       }
// // // // // //   //     },
// // // // // //   //     pinned: 'right',
// // // // // //   //     width: 160,
// // // // // //   //   });
// // // // // //   // }

// // // // // //   // startEditingRow(rowData: any) {
// // // // // //   //   if (!this.gridApi) return;
// // // // // //   //   this.editingRowId = rowData._id;
// // // // // //   //   this.originalRowData = { ...rowData };
// // // // // //   //   this.gridApi.refreshCells({ force: true }); // Refresh cells to update editable state
// // // // // //   //   this.gridApi.startEditingCell({ rowIndex: this.getRowIndex(rowData), colKey: this.columnDefs[0].field || 'email' });
// // // // // //   // }

// // // // // //   // saveRow(rowData: any) {
// // // // // //   //   this.gridApi.stopEditing();
// // // // // //   //   this.editingRowId = null;
// // // // // //   //   this.gridApi.refreshCells({ force: true });
// // // // // //   //   this.dataChanged.emit({ type: 'save', data: rowData });
// // // // // //   // }

// // // // // //   // cancelEditingRow(rowData: any) {
// // // // // //   //   const rowIndex = this.getRowIndex(rowData);
// // // // // //   //   if (rowIndex >= 0) {
// // // // // //   //     const restoredRow = { ...this.originalRowData };
// // // // // //   //     this.rowData[rowIndex] = restoredRow;
// // // // // //   //     this.gridApi.applyTransaction({ update: [restoredRow] });
// // // // // //   //     this.editingRowId = null;
// // // // // //   //     this.gridApi.refreshCells({ force: true });
// // // // // //   //   }
// // // // // //   // }

// // // // // //   // deleteRow(rowData: any) {
// // // // // //   //   this.rowData = this.rowData.filter(row => row._id !== rowData._id);
// // // // // //   //   this.gridApi.applyTransaction({ remove: [rowData] });
// // // // // //   //   this.dataChanged.emit({ type: 'delete', data: rowData });
// // // // // //   // }

// // // // // //   getRowIndex(rowData: any): number {
// // // // // //     return this.rowData.findIndex(row => row._id === rowData._id);
// // // // // //   }

// // // // // //   generateDefaultColumns(data: any[]): ColDef[] {
// // // // // //     if (data && data.length > 0) {
// // // // // //       return Object.keys(data[0]).map(key => ({
// // // // // //         headerName: key.charAt(0).toUpperCase() + key.slice(1),
// // // // // //         field: key,
// // // // // //         cellRenderer: DynamicCellComponent,
// // // // // //         cellRendererParams: { type: 'text' }
// // // // // //       }));
// // // // // //     }
// // // // // //     return [];
// // // // // //   }

// // // // // //   onCellValueChanged(event: CellValueChangedEvent) {
// // // // // //     this.eventFromGrid.emit({ eventType: 'onCellValueChanged', event });
// // // // // //   }

// // // // // //   onRowSelected(event: RowSelectedEvent) {
// // // // // //     this.eventFromGrid.emit({ eventType: 'RowSelectedEvent', event });
// // // // // //   }

// // // // // //   onCellClicked(event: CellClickedEvent) {
// // // // // //     this.eventFromGrid.emit({ eventType: 'CellClickedEvent', event });
// // // // // //   }

// // // // // //   onGridReady(event: GridReadyEvent) {
// // // // // //     this.gridApi = event.api;
// // // // // //     this.gridReady.emit(event);
// // // // // //   }

// // // // // //   exportToCSV() {
// // // // // //     this.gridApi.exportDataAsCsv();
// // // // // //   }
// // // // // // }
// // // // // // // import { Component, Input, OnInit, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
// // // // // // // import { CellValueChangedEvent, ColDef, GridApi, GridReadyEvent, RowSelectedEvent, CellClickedEvent, GridOptions } from 'ag-grid-community';
// // // // // // // // import { AllCommunityModule, ModuleRegistry, themeQuartz, colorSchemeDark } from 'ag-grid-community';
// // // // // // // import {
// // // // // // //   AllCommunityModule,
// // // // // // //   ModuleRegistry,
// // // // // // //   colorSchemeDark,
// // // // // // //   colorSchemeDarkBlue,
// // // // // // //   colorSchemeDarkWarm,
// // // // // // //   colorSchemeLight,
// // // // // // //   colorSchemeLightCold,
// // // // // // //   colorSchemeLightWarm,
// // // // // // //   colorSchemeVariable,
// // // // // // //   iconSetAlpine,
// // // // // // //   iconSetMaterial,
// // // // // // //   iconSetQuartzBold,
// // // // // // //   iconSetQuartzLight,
// // // // // // //   iconSetQuartzRegular,
// // // // // // //   themeAlpine,
// // // // // // //   themeBalham,
// // // // // // //   themeQuartz,
// // // // // // // } from "ag-grid-community";
// // // // // // // import { AgGridAngular } from 'ag-grid-angular';
// // // // // // // import { FormsModule } from '@angular/forms';
// // // // // // // import { CommonModule } from '@angular/common';
// // // // // // // import { SelectModule } from 'primeng/select';
// // // // // // // import { ToolbarModule } from 'primeng/toolbar';
// // // // // // // import { ToolbarComponent } from "../../../Components/toolbar/toolbar.component";
// // // // // // // import { ActionbuttonsComponent } from '../../AgGridcomponents/actionbuttons/actionbuttons.component';
// // // // // // // ModuleRegistry.registerModules([AllCommunityModule]);

// // // // // // // @Component({
// // // // // // //   selector: 'app-shared-grid',
// // // // // // //   imports: [AgGridAngular, FormsModule, ToolbarModule, CommonModule, SelectModule],
// // // // // // //   templateUrl: './shared-grid.component.html',
// // // // // // //   styleUrls: ['./shared-grid.component.css'],
// // // // // // //   standalone: true // Make it a standalone component for easier use
// // // // // // // })
// // // // // // // export class SharedGridComponent implements OnInit, OnChanges {
// // // // // // //   @Input() rowClassrules: any
// // // // // // //   @Input() usertheme: any;
// // // // // // //   @Input() data: any;
// // // // // // //   @Input() rowSelectionMode: any;
// // // // // // //   @Input() column: any;
// // // // // // //   @Output() dataChanged = new EventEmitter<any>();
// // // // // // //   @Output() eventFromGrid = new EventEmitter<any>();
// // // // // // //   // @Output() cellValueChanged = new EventEmitter<CellValueChangedEvent>();
// // // // // // //   // @Output() rowSelected = new EventEmitter<RowSelectedEvent>();
// // // // // // //   // @Output() cellClicked = new EventEmitter<CellClickedEvent>();
// // // // // // //   @Output() gridReady = new EventEmitter<GridReadyEvent>();
// // // // // // //   // pagesizeselector: any = [10, 20, 30]
// // // // // // //   private gridApi!: GridApi;
// // // // // // //   // getRowId = (params: { data: any }) => params.data._id;
// // // // // // //   getRowId = (params: { data: any }) => params.data._id;

// // // // // // //   rowData: any[] = [];
// // // // // // //   columnDefs: ColDef[] = [];
// // // // // // //   defaultColDef: ColDef = {
// // // // // // //     sortable: true,
// // // // // // //     filter: true,
// // // // // // //     resizable: true,
// // // // // // //     floatingFilter: true,
// // // // // // //     editable: (params) => this.editingRowId === params.data._id
// // // // // // //   };

// // // // // // //   theme = themeQuartz;

// // // // // // //   rowSelection: any;
// // // // // // //   @Input() gridHeight: any;
// // // // // // //   @Input() gridWidth: any
// // // // // // //   @Input() padding: any
// // // // // // //   ngOnInit(): void {
// // // // // // //     this.gridHeight = this.gridHeight ? this.gridHeight : '500px'
// // // // // // //     this.gridWidth = this.gridWidth ? this.gridWidth : '100%'
// // // // // // //     this.padding = this.padding ? this.padding : '0 0px'

// // // // // // //     if (!this.column || this.column.length === 0) {
// // // // // // //       this.columnDefs = this.generateDefaultColumns(this.rowData);
// // // // // // //     } else {
// // // // // // //       this.columnDefs = this.column; // Use input columns directly
// // // // // // //     }
// // // // // // //     this.rowSelection = {
// // // // // // //       mode: this.rowSelectionMode // Use the input row selection mode
// // // // // // //     };
// // // // // // //     // this.addActionButtonCol()
// // // // // // //   }

// // // // // // //   addActionButtonCol() {
// // // // // // //     const alreadyExists = this.column?.some((col: ColDef) => col.colId === 'actionButtons');
// // // // // // //     if (alreadyExists) return;
// // // // // // //     this.column.push({
// // // // // // //       headerName: 'Actions',
// // // // // // //       field: 'actions',
// // // // // // //       cellRenderer: ActionbuttonsComponent,
// // // // // // //       editable: false,
// // // // // // //       colId: 'actionButtons',
// // // // // // //       cellRendererParams: {
// // // // // // //         context: {
// // // // // // //           isRowEditing: (id: string | number) => this.editingRowId === id,
// // // // // // //           startEditingRow: (rowData: any) => this.startEditingRow(rowData),
// // // // // // //           saveRow: (rowData: any) => this.saveRow(rowData),
// // // // // // //           cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
// // // // // // //           deleteRow: (rowData: any) => this.deleteRow(rowData),
// // // // // // //         }
// // // // // // //       },
// // // // // // //       pinned: 'right',
// // // // // // //       width: 160,
// // // // // // //     });
// // // // // // //   }


// // // // // // //   editingRowId: number | null = null;
// // // // // // //   originalRowData: any = {};

// // // // // // //   startEditingRow(rowData: any) {
// // // // // // //     if (!this.gridApi) return;
// // // // // // //     this.editingRowId = rowData.id;
// // // // // // //     this.originalRowData = { ...rowData };
// // // // // // //     this.gridApi.startEditingCell({ rowIndex: this.getRowIndex(rowData), colKey: 'email' });
// // // // // // //   }

// // // // // // //   saveRow(rowData: any) {
// // // // // // //     this.gridApi.stopEditing();
// // // // // // //     this.editingRowId = null;
// // // // // // //     this.dataChanged.emit({ type: 'save', data: rowData });
// // // // // // //   }

// // // // // // //   cancelEditingRow(rowData: any) {
// // // // // // //     const rowIndex = this.getRowIndex(rowData);
// // // // // // //     if (rowIndex >= 0) {
// // // // // // //       const restoredRow = { ...this.originalRowData };
// // // // // // //       this.rowData[rowIndex] = restoredRow;
// // // // // // //       this.gridApi.applyTransaction({ update: [restoredRow] });
// // // // // // //       this.editingRowId = null;
// // // // // // //     }
// // // // // // //   }


// // // // // // //   deleteRow(rowData: any) {
// // // // // // //     this.rowData = this.rowData.filter(row => row.id !== rowData.id);
// // // // // // //     this.gridApi.applyTransaction({ remove: [rowData] });
// // // // // // //     this.dataChanged.emit({ type: 'delete', data: rowData });
// // // // // // //   }

// // // // // // //   getRowIndex(rowData: any): number {
// // // // // // //     return this.rowData.findIndex(row => row.id === rowData.id);
// // // // // // //   }


// // // // // // //   generateDefaultColumns(data: any[]): ColDef[] {
// // // // // // //     if (data && data.length > 0) { // Check if data is valid and has length
// // // // // // //       return Object.keys(data[0]).map(key => ({
// // // // // // //         headerName: key.charAt(0).toUpperCase() + key.slice(1),
// // // // // // //         field: key
// // // // // // //       }));
// // // // // // //     }
// // // // // // //     return [];
// // // // // // //   }

// // // // // // //   ngOnChanges(changes: SimpleChanges): void {
// // // // // // //     if (changes['data'] && changes['data'].currentValue) {
// // // // // // //       this.rowData = Array.isArray(changes['data'].currentValue)
// // // // // // //         ? changes['data'].currentValue
// // // // // // //         : [];
// // // // // // //     }
// // // // // // //     if (changes['column'] && changes['column'].currentValue) {
// // // // // // //       this.columnDefs = changes['column'].currentValue;
// // // // // // //     }
// // // // // // //     if (changes['rowSelectionMode'] && changes['rowSelectionMode'].currentValue) {
// // // // // // //       this.rowSelection = { mode: changes['rowSelectionMode'].currentValue };
// // // // // // //     }
// // // // // // //   }

// // // // // // //   onCellValueChanged(event: CellValueChangedEvent) {
// // // // // // //     // this.cellValueChanged.emit(event)
// // // // // // //     this.eventFromGrid.emit({ "eventType": 'onCellValueCHanged', 'event': event });
// // // // // // //   }

// // // // // // //   onRowSelected(event: RowSelectedEvent) {
// // // // // // //     this.eventFromGrid.emit({ "eventType": 'RowSelectedEvent', 'event': event });

// // // // // // //     // this.rowSelected.emit(event); // Emit rowSelected event
// // // // // // //   }

// // // // // // //   onCellClicked(event: CellClickedEvent) {
// // // // // // //     this.eventFromGrid.emit({ "eventType": 'CellClickedEvent', 'event': event });
// // // // // // //     // this.cellClicked.emit(event);
// // // // // // //   }

// // // // // // //   onGridReady(event: GridReadyEvent) {
// // // // // // //     this.gridApi = event.api; // 💥 This line assigns the Grid API correctly
// // // // // // //     this.eventFromGrid.emit({ "eventType": 'GridReadyEvent', 'event': event });
// // // // // // //   }

// // // // // // //   exportToCSV() {
// // // // // // //     this.gridApi.exportDataAsCsv();
// // // // // // //   }

// // // // // // //   onGridApiReady(params: GridReadyEvent) {
// // // // // // //     this.gridApi = params.api;
// // // // // // //     this.gridReady.emit(params); // Also emit gridReady when Grid API is ready
// // // // // // //   }

// // // // // // //   // theme = themeQuartz.withPart(colorSchemeDark).withParams({
// // // // // // //   //   fontFamily: 'IBM Plex Sans, DM Sans, Kanit, sans-serif',
// // // // // // //   //   headerFontFamily: 'Kanit, sans-serif',
// // // // // // //   //   cellFontFamily: 'DM Sans, sans-serif',
// // // // // // //   //   wrapperBorder: false,
// // // // // // //   //   headerRowBorder: false,
// // // // // // //   //   columnBorder: { style: 'dashed', color: '#9696C8' },
// // // // // // //   // });

// // // // // // //   // get theme() {
// // // // // // //   // let theme = themeQuartz;
// // // // // // //   // theme = theme.withPart(iconSetQuartzBold);
// // // // // // //   // theme = theme.withPart(colorSchemeDarkBlue);
// // // // // // //   // return theme.withParams({
// // // // // // //   //   fontFamily: 'IBM Plex Sans, DM Sans, Kanit, sans-serif',
// // // // // // //   //   headerFontFamily: 'Kanit, sans-serif',
// // // // // // //   //   cellFontFamily: 'DM Sans, sans-serif',
// // // // // // //   //   wrapperBorder: true,
// // // // // // //   //   headerRowBorder: true,
// // // // // // //   //   columnBorder: { style: 'dashed', color: '#9696C8' },
// // // // // // //   // });
// // // // // // //   // }

// // // // // // //   // gridOptions: GridOptions = {
// // // // // // //   //   theme: 'ag-theme-my-custom-theme', // Apply your custom theme
// // // // // // //   // };
// // // // // // //   // get theme() {
// // // // // // //   //   let theme = themeQuartz;
// // // // // // //   //   // if (this.iconSet) {
// // // // // // //   //   // theme = theme.withPart(this.iconSet);
// // // // // // //   //   theme = theme.withPart(iconSetQuartzBold);
// // // // // // //   //   // }
// // // // // // //   //   // if (this.colorScheme) {
// // // // // // //   //   // theme = theme.withPart(this.colorScheme);
// // // // // // //   //   theme = theme.withPart(colorSchemeDarkBlue);
// // // // // // //   //   // }

// // // // // // //   //   return theme.withParams({
// // // // // // //   //     fontFamily: 'IBM Plex Sans, DM Sans, Kanit, sans-serif',
// // // // // // //   //     headerFontFamily: 'Kanit, sans-serif',
// // // // // // //   //     cellFontFamily: 'DM Sans, sans-serif',
// // // // // // //   //     wrapperBorder: true,
// // // // // // //   //     headerRowBorder: true,
// // // // // // //   //     columnBorder: { style: 'dashed', color: '#9696C8' },
// // // // // // //   //   });
// // // // // // //   // }


// // // // // // // }

// // // // // // // //
// // // // // // // //
// // // // // // // /*
// // // // // // // value gettter in aggrid to handle the data with multiple col
// // // // // // // ex=  valueGetter:(o:any)=>o.col1+o.col2


// // // // // // // // value formatter to convert to string
// // // // // // // ex = valueFormatter:(i:any)=>'rupee'+i.value.toString()
// // // // // // // */


// // // // // // // // best thermes
// // // // // // // /*
// // // // // // //   baseThemes = [
// // // // // // //     { id: "themeQuartz", value: themeQuartz },
// // // // // // //     { id: "themeBalham", value: themeBalham },
// // // // // // //     { id: "themeAlpine", value: themeAlpine },
// // // // // // //   ];
// // // // // // //   baseTheme = themeQuartz;

// // // // // // //   colorSchemes = [
// // // // // // //     { id: "(unchanged)", value: null },
// // // // // // //     { id: "colorSchemeLight", value: colorSchemeLight },
// // // // // // //     { id: "colorSchemeLightCold", value: colorSchemeLightCold },
// // // // // // //     { id: "colorSchemeLightWarm", value: colorSchemeLightWarm },
// // // // // // //     { id: "colorSchemeDark", value: colorSchemeDark },
// // // // // // //     { id: "colorSchemeDarkWarm", value: colorSchemeDarkWarm },
// // // // // // //     { id: "colorSchemeDarkBlue", value: colorSchemeDarkBlue },
// // // // // // //     { id: "colorSchemeVariable", value: colorSchemeVariable },
// // // // // // //   ];
// // // // // // //   colorScheme = null;

// // // // // // //   iconSets = [
// // // // // // //     { id: "(unchanged)", value: null },
// // // // // // //     { id: "iconSetQuartzLight", value: iconSetQuartzLight },
// // // // // // //     { id: "iconSetQuartzRegular", value: iconSetQuartzRegular },
// // // // // // //     { id: "iconSetQuartzBold", value: iconSetQuartzBold },
// // // // // // //     { id: "iconSetAlpine", value: iconSetAlpine },
// // // // // // //     { id: "iconSetMaterial", value: iconSetMaterial },
// // // // // // //   ];
// // // // // // //   iconSet = null;
// // // // // // // */