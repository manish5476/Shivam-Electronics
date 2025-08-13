import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, CellValueChangedEvent, RowSelectedEvent, CellClickedEvent, GetRowIdParams } from 'ag-grid-community';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';
// import { ColorPickerModule } from 'primeng/color-picker';
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
  imports: [AgGridAngular, FormsModule, ToolbarModule, CommonModule, SelectModule],
  templateUrl: './shared-grid.component.html',
  styleUrls: ['./shared-grid.component.css']
})
export class SharedGridComponent implements OnInit, OnChanges {
  @Input() rowClassRules: any = {};
  @Input() usertheme: string = 'ag-theme-quartz';
  @Input() data: any[] = [];
  @Input() rowSelectionMode: string = 'single';
  @Input() column: ColDef[] = [];
  @Input() gridHeight: string = '162px';
  @Input() paginationPageSize: number = 100;
  @Input() GridName: string = '';
  @Input() headerFilter: boolean = true;
  @Input() showActions: boolean = false;
  @Output() dataChanged = new EventEmitter<any>();
  @Output() eventFromGrid = new EventEmitter<any>();
  @Output() gridReady = new EventEmitter<GridReadyEvent>();

  private gridApi!: GridApi;
  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  editingRowId: string | null = null;
  originalRowData: any = {};
  accentColor: string = '#3b82f6';
  mainGridHeight: string = 'calc(100vh - 162px)';

  defaultColDef: ColDef = {
    sortable: true,
    filter: 'agTextColumnFilter',
    resizable: true,
    editable: (params) => this.editingRowId === (params.data?._id || params.data?.id)
  };

  rowSelection: any = { mode: 'single' };

  defaultRowClassRules = {
    'bg-blue-100 dark:bg-blue-900': (params: any) => this.editingRowId === (params.data?._id || params.data?.id),
    'bg-gray-50 dark:bg-gray-700': (params: any) => params.node.rowIndex % 2 === 0,
    'bg-red-100 dark:bg-red-900': (params: any) => params.data.availabilityStatus === 'OutOfStock',
    'bg-green-100 dark:bg-green-900': (params: any) => params.data.availabilityStatus === 'InStock'
  };

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
    this.updateColumnDefs();
    this.updateRowClassRules();
    this.accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--theme-accent-primary')
      .trim() || '#3b82f6';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.rowData = Array.isArray(changes['data'].currentValue) ? changes['data'].currentValue : [];
    }
    if (changes['column'] || changes['showActions']) {
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
    const baseColumns = this.column && this.column.length > 0 ? [...this.column] : this.generateDefaultColumns(this.rowData);
    if (this.showActions) {
      const actionColumnExists = baseColumns.some(col => col.colId === 'actionButtons');
      if (!actionColumnExists) {
        baseColumns.push({
          headerName: 'Actions',
          field: 'actions',
          cellRenderer: ActionbuttonsComponent,
          editable: false,
          colId: 'actionButtons',
          cellRendererParams: {
            actionHandler: (action: string, data: any) => this.handleCellAction(action, data),
            isRowEditing: (id: string) => this.editingRowId === id
          },
          pinned: 'right',
          width: 120,
          minWidth: 100,
        });
      }
    }

    this.columnDefs = baseColumns;
  }

  handleCellAction(action: string, data: any): void {
    console.log('Action received:', action, data);
    switch (action) {
      case 'edit':
        this.startEditingRow(data);
        break;
      case 'save':
        this.saveRow(data);
        break;
      case 'cancel':
        this.cancelEditingRow(data);
        break;
      case 'delete':
        this.deleteRow(data);
        break;
    }
  }

  startEditingRow(rowData: any): void {
    if (!this.gridApi) return;
    this.editingRowId = rowData._id || rowData.id;
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
    return this.rowData.findIndex(row => (row._id || row.id) === (rowData._id || rowData.id));
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
    // this.themeService.updateGradient(color);
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
    console.log(event);
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
// // import { ColorPickerModule } from 'primeng/color-picker';
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
//   imports: [AgGridAngular, FormsModule, ToolbarModule, CommonModule, SelectModule],
//   templateUrl: './shared-grid.component.html',
//   styleUrls: ['./shared-grid.component.css']
// })
// export class SharedGridComponent implements OnInit, OnChanges {
//   @Input() rowClassRules: any = {};
//   @Input() usertheme: string = 'ag-theme-quartz';
//   @Input() data: any[] = [];
//   @Input() rowSelectionMode: string = 'single';
//   @Input() column: ColDef[] = [];
//   @Input() gridHeight: string = '162px';
//   @Input() paginationPageSize: number = 100;
//   @Input() GridName: string = '';
//   @Input() headerFilter: boolean = true;
//   @Input() showActions: boolean = true;
//   @Output() dataChanged = new EventEmitter<any>();
//   @Output() eventFromGrid = new EventEmitter<any>();
//   @Output() gridReady = new EventEmitter<GridReadyEvent>();

//   private gridApi!: GridApi;
//   rowData: any[] = [];
//   columnDefs: ColDef[] = [];
//   editingRowId: string | null = null;
//   originalRowData: any = {};
//   accentColor: string = '#3b82f6';
//   mainGridHeight: string = 'calc(100vh - 162px)';

//   defaultColDef: ColDef = {
//     sortable: true,
//     filter: 'agTextColumnFilter',
//     resizable: true,
//     editable: (params) => this.editingRowId === (params.data?._id || params.data?.id)
//   };

//   rowSelection: any = { mode: 'single' };

//   defaultRowClassRules = {
//     'bg-blue-100 dark:bg-blue-900': (params: any) => this.editingRowId === (params.data?._id || params.data?.id),
//     'bg-gray-50 dark:bg-gray-700': (params: any) => params.node.rowIndex % 2 === 0,
//     'bg-red-100 dark:bg-red-900': (params: any) => params.data.availabilityStatus === 'OutOfStock',
//     'bg-green-100 dark:bg-green-900': (params: any) => params.data.availabilityStatus === 'InStock'
//   };

//   mergedRowClassRules: any = {};

//   theme = themeQuartz.withParams({
//     backgroundColor: 'var(--theme-bg-primary, #ffffff)',
//     foregroundColor: 'var(--theme-text-primary, #111827)',
//     headerTextColor: 'var(--theme-text-heading, #374151)',
//     headerBackgroundColor: 'var(--theme-bg-secondary, #f3f4f6)',
//     oddRowBackgroundColor: 'var(--theme-bg-primary, #ffffff)',
//     headerColumnResizeHandleColor: 'var(--theme-accent-primary, #3b82f6)',
//     borderColor: 'var(--theme-border-primary, #e5e7eb)',
//     fontFamily: 'Inter, Poppins, sans-serif',
//     fontSize: '0.75rem',
//     headerFontFamily: 'Inter, Poppins, sans-serif',
//     headerFontWeight: '500',
//     rangeSelectionBorderColor: 'var(--theme-accent-primary, #3b82f6)',
//     rangeSelectionBorderStyle: 'dashed',
//     rangeSelectionBackgroundColor: 'var(--theme-accent-primary-light, #dbeafe)',
//     rangeSelectionHighlightColor: 'var(--theme-accent-primary, #3b82f6)',
//     inputBorder: { color: 'var(--theme-accent-primary, #3b82f6)', style: 'solid', width: 1 },
//     inputBackgroundColor: 'var(--theme-bg-tertiary, #f9fafb)',
//     inputPlaceholderTextColor: 'var(--theme-text-secondary, #6b7280)',
//     inputIconColor: 'var(--theme-accent-primary, #3b82f6)',
//     selectedRowBackgroundColor: 'var(--theme-accent-primary-light, #dbeafe)'
//   });

//   getRowId: (params: GetRowIdParams) => string = (params: GetRowIdParams) => {
//     return params.data._id || String(params.data.id);
//   };

//   constructor(private themeService: ThemeService) { }

//   ngOnInit(): void {
//     this.rowSelection = { mode: this.rowSelectionMode };
//     this.computeGridHeight();
//     this.rowData = Array.isArray(this.data) ? this.data : [];
//     this.updateColumnDefs();
//     this.updateRowClassRules();
//     this.accentColor = getComputedStyle(document.documentElement)
//       .getPropertyValue('--theme-accent-primary')
//       .trim() || '#3b82f6';
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['data'] && changes['data'].currentValue) {
//       this.rowData = Array.isArray(changes['data'].currentValue) ? changes['data'].currentValue : [];
//     }
//     if (changes['column'] || changes['showActions']) {
//       this.updateColumnDefs();
//     }
//     if (changes['rowSelectionMode']) {
//       this.rowSelection = { mode: this.rowSelectionMode };
//     }
//     if (changes['gridHeight']) {
//       this.computeGridHeight();
//     }
//     if (changes['rowClassRules']) {
//       this.updateRowClassRules();
//     }
//   }

//   computeGridHeight(): void {
//     const isValidLength = (value: string): boolean => {
//       if (!/^\d+(\.\d+)?(\w+|%)$/.test(value)) {
//         console.warn(`Invalid CSS length for gridHeight: ${value}. Using default '162px'.`);
//         return false;
//       }
//       return true;
//     };
//     const height = isValidLength(this.gridHeight) ? this.gridHeight : '162px';
//     this.mainGridHeight = `calc(100vh - ${height})`;
//   }

//   updateRowClassRules(): void {
//     this.mergedRowClassRules = {
//       ...this.defaultRowClassRules,
//       ...this.rowClassRules
//     };
//   }

//   updateColumnDefs(): void {
//     // Start with the base columns from the input
//     const baseColumns = this.column && this.column.length > 0 ? [...this.column] : this.generateDefaultColumns(this.rowData);

//     if (this.showActions) {
//       const actionColumnExists = baseColumns.some(col => col.colId === 'actionButtons');
//       if (!actionColumnExists) {
//         // Add the action button column if it's not already there and showActions is true
//         baseColumns.push({
//           headerName: 'Actions',
//           field: 'actions',
//           cellRenderer: ActionbuttonsComponent,
//           editable: false,
//           colId: 'actionButtons',
//           cellRendererParams: {
//             context: {
//               isRowEditing: (id: string) => this.editingRowId === id,
//               startEditingRow: (rowData: any) => this.startEditingRow(rowData),
//               saveRow: (rowData: any) => this.saveRow(rowData),
//               cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
//               deleteRow: (rowData: any) => this.deleteRow(rowData),
//             },
//             // Pass a function to the cell renderer
//             actionHandler: (action: string, data: any) => this.onActionClicked({ action, data })
//           },
//           pinned: 'right',
//           width: 120,
//           minWidth: 100
//         });
//       }
//     }

//     this.columnDefs = baseColumns;
//   }

//   startEditingRow(rowData: any): void {
//     if (!this.gridApi) return;
//     this.editingRowId = rowData._id || rowData.id;
//     this.originalRowData = { ...rowData };
//     this.gridApi.refreshCells({ force: true });
//     const firstEditableField = this.columnDefs.find(col => col.editable !== false)?.field || 'email';
//     this.gridApi.startEditingCell({ rowIndex: this.getRowIndex(rowData), colKey: firstEditableField });
//   }

//   saveRow(rowData: any): void {
//     if (!this.gridApi) return;
//     this.gridApi.stopEditing(false);
//     this.editingRowId = null;
//     this.gridApi.refreshCells({ force: true });
//     this.dataChanged.emit({ type: 'save', data: rowData });
//   }

//   cancelEditingRow(rowData: any): void {
//     if (!this.gridApi) return;
//     const rowIndex = this.getRowIndex(rowData);
//     if (rowIndex >= 0) {
//       const restoredRow = { ...this.originalRowData };
//       this.rowData[rowIndex] = restoredRow;
//       this.gridApi.applyTransaction({ update: [restoredRow] });
//       this.gridApi.stopEditing(true);
//       this.editingRowId = null;
//       this.gridApi.refreshCells({ force: true });
//       this.dataChanged.emit({ type: 'cancel', data: rowData });
//     }
//   }

//   deleteRow(rowData: any): void {
//     if (!this.gridApi) return;
//     this.rowData = this.rowData.filter(row => row._id !== rowData._id);
//     this.gridApi.applyTransaction({ remove: [rowData] });
//     this.dataChanged.emit({ type: 'delete', data: rowData });
//   }

//   getRowIndex(rowData: any): number {
//     return this.rowData.findIndex(row => (row._id || row.id) === (rowData._id || rowData.id));
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

//   onActionClicked(event: { action: string; data: any }): void {
//     console.log(event);
//     this.eventFromGrid.emit({ eventType: 'actionClicked', action: event.action, data: event.data });
//   }