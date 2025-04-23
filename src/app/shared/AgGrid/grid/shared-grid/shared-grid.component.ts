
import { Component, Input, OnInit, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { CellValueChangedEvent, ColDef, GridApi, GridReadyEvent, RowSelectedEvent, CellClickedEvent, GridOptions } from 'ag-grid-community';
// import { AllCommunityModule, ModuleRegistry, themeQuartz, colorSchemeDark } from 'ag-grid-community';
import {
  AllCommunityModule,
  ModuleRegistry,
  colorSchemeDark,
  colorSchemeDarkBlue,
  colorSchemeDarkWarm,
  colorSchemeLight,
  colorSchemeLightCold,
  colorSchemeLightWarm,
  colorSchemeVariable,
  iconSetAlpine,
  iconSetMaterial,
  iconSetQuartzBold,
  iconSetQuartzLight,
  iconSetQuartzRegular,
  themeAlpine,
  themeBalham,
  themeQuartz,
} from "ag-grid-community";
import { AgGridAngular } from 'ag-grid-angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';
import { ToolbarComponent } from "../../../Components/toolbar/toolbar.component";
import { ActionbuttonsComponent } from '../../AgGridcomponents/actionbuttons/actionbuttons.component';
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-shared-grid',
  imports: [AgGridAngular, FormsModule, ToolbarModule, CommonModule, SelectModule],
  templateUrl: './shared-grid.component.html',
  styleUrls: ['./shared-grid.component.css'],
  standalone: true // Make it a standalone component for easier use
})
export class SharedGridComponent implements OnInit, OnChanges {
  @Input() rowClassrules: any
  @Input() usertheme: any;
  @Input() data: any;
  @Input() rowSelectionMode: any;
  @Input() column: any;
  @Output() dataChanged = new EventEmitter<any>();
  @Output() eventFromGrid = new EventEmitter<any>();
  // @Output() cellValueChanged = new EventEmitter<CellValueChangedEvent>();
  // @Output() rowSelected = new EventEmitter<RowSelectedEvent>();
  // @Output() cellClicked = new EventEmitter<CellClickedEvent>();
  @Output() gridReady = new EventEmitter<GridReadyEvent>();
  // pagesizeselector: any = [10, 20, 30]
  private gridApi!: GridApi;
  // getRowId = (params: { data: any }) => params.data._id;
  getRowId = (params: { data: any }) => params.data.id;

  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    editable: (params) => this.editingRowId === params.data.id
  };

  theme = themeQuartz;

  rowSelection: any;
  @Input() gridHeight: any;
  @Input() gridWidth: any
  @Input() padding: any
  ngOnInit(): void {
    this.gridHeight = this.gridHeight ? this.gridHeight : '500px'
    this.gridWidth = this.gridWidth ? this.gridWidth : '100%'
    this.padding = this.padding ? this.padding : '0 0px'

    if (!this.column || this.column.length === 0) {
      this.columnDefs = this.generateDefaultColumns(this.rowData);
    } else {
      this.columnDefs = this.column; // Use input columns directly
    }
    this.rowSelection = {
      mode: this.rowSelectionMode // Use the input row selection mode
    };
    // this.addActionButtonCol()
  }

  addActionButtonCol() {
    const alreadyExists = this.column?.some((col: ColDef) => col.colId === 'actionButtons');
    if (alreadyExists) return;
    this.column.push({
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: ActionbuttonsComponent,
      editable: false,
      colId: 'actionButtons',
      cellRendererParams: {
        context: {
          isRowEditing: (id: string | number) => this.editingRowId === id,
          startEditingRow: (rowData: any) => this.startEditingRow(rowData),
          saveRow: (rowData: any) => this.saveRow(rowData),
          cancelEditingRow: (rowData: any) => this.cancelEditingRow(rowData),
          deleteRow: (rowData: any) => this.deleteRow(rowData),
        }
      },
      pinned: 'right',
      width: 160,
    });
  }


  editingRowId: number | null = null;
  originalRowData: any = {};

  startEditingRow(rowData: any) {
    if (!this.gridApi) return;
    this.editingRowId = rowData.id;
    this.originalRowData = { ...rowData };
    this.gridApi.startEditingCell({ rowIndex: this.getRowIndex(rowData), colKey: 'email' });
  }

  saveRow(rowData: any) {
    this.gridApi.stopEditing();
    this.editingRowId = null;
    this.dataChanged.emit({ type: 'save', data: rowData });
  }

  cancelEditingRow(rowData: any) {
    const rowIndex = this.getRowIndex(rowData);
    if (rowIndex >= 0) {
      const restoredRow = { ...this.originalRowData };
      this.rowData[rowIndex] = restoredRow;
      this.gridApi.applyTransaction({ update: [restoredRow] });
      this.editingRowId = null;
    }
  }


  deleteRow(rowData: any) {
    this.rowData = this.rowData.filter(row => row.id !== rowData.id);
    this.gridApi.applyTransaction({ remove: [rowData] });
    this.dataChanged.emit({ type: 'delete', data: rowData });
  }

  getRowIndex(rowData: any): number {
    return this.rowData.findIndex(row => row.id === rowData.id);
  }


  generateDefaultColumns(data: any[]): ColDef[] {
    if (data && data.length > 0) { // Check if data is valid and has length
      return Object.keys(data[0]).map(key => ({
        headerName: key.charAt(0).toUpperCase() + key.slice(1),
        field: key
      }));
    }
    return [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.rowData = Array.isArray(changes['data'].currentValue)
        ? changes['data'].currentValue
        : [];
    }
    if (changes['column'] && changes['column'].currentValue) {
      this.columnDefs = changes['column'].currentValue;
    }
    if (changes['rowSelectionMode'] && changes['rowSelectionMode'].currentValue) {
      this.rowSelection = { mode: changes['rowSelectionMode'].currentValue };
    }
  }

  onCellValueChanged(event: CellValueChangedEvent) {
    // this.cellValueChanged.emit(event)
    this.eventFromGrid.emit({ "eventType": 'onCellValueCHanged', 'event': event });
  }

  onRowSelected(event: RowSelectedEvent) {
    this.eventFromGrid.emit({ "eventType": 'RowSelectedEvent', 'event': event });

    // this.rowSelected.emit(event); // Emit rowSelected event
  }

  onCellClicked(event: CellClickedEvent) {
    this.eventFromGrid.emit({ "eventType": 'CellClickedEvent', 'event': event });
    // this.cellClicked.emit(event);
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api; // 💥 This line assigns the Grid API correctly
    this.eventFromGrid.emit({ "eventType": 'GridReadyEvent', 'event': event });
  }

  exportToCSV() {
    this.gridApi.exportDataAsCsv();
  }

  onGridApiReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridReady.emit(params); // Also emit gridReady when Grid API is ready
  }

  // theme = themeQuartz.withPart(colorSchemeDark).withParams({
  //   fontFamily: 'IBM Plex Sans, DM Sans, Kanit, sans-serif',
  //   headerFontFamily: 'Kanit, sans-serif',
  //   cellFontFamily: 'DM Sans, sans-serif',
  //   wrapperBorder: false,
  //   headerRowBorder: false,
  //   columnBorder: { style: 'dashed', color: '#9696C8' },
  // });

  // get theme() {
  // let theme = themeQuartz;
  // theme = theme.withPart(iconSetQuartzBold);
  // theme = theme.withPart(colorSchemeDarkBlue);
  // return theme.withParams({
  //   fontFamily: 'IBM Plex Sans, DM Sans, Kanit, sans-serif',
  //   headerFontFamily: 'Kanit, sans-serif',
  //   cellFontFamily: 'DM Sans, sans-serif',
  //   wrapperBorder: true,
  //   headerRowBorder: true,
  //   columnBorder: { style: 'dashed', color: '#9696C8' },
  // });
  // }

  // gridOptions: GridOptions = {
  //   theme: 'ag-theme-my-custom-theme', // Apply your custom theme
  // };
  // get theme() {
  //   let theme = themeQuartz;
  //   // if (this.iconSet) {
  //   // theme = theme.withPart(this.iconSet);
  //   theme = theme.withPart(iconSetQuartzBold);
  //   // }
  //   // if (this.colorScheme) {
  //   // theme = theme.withPart(this.colorScheme);
  //   theme = theme.withPart(colorSchemeDarkBlue);
  //   // }

  //   return theme.withParams({
  //     fontFamily: 'IBM Plex Sans, DM Sans, Kanit, sans-serif',
  //     headerFontFamily: 'Kanit, sans-serif',
  //     cellFontFamily: 'DM Sans, sans-serif',
  //     wrapperBorder: true,
  //     headerRowBorder: true,
  //     columnBorder: { style: 'dashed', color: '#9696C8' },
  //   });
  // }


}

//
//
/*
value gettter in aggrid to handle the data with multiple col
ex=  valueGetter:(o:any)=>o.col1+o.col2


// value formatter to convert to string
ex = valueFormatter:(i:any)=>'rupee'+i.value.toString()
*/


// best thermes
/*
  baseThemes = [
    { id: "themeQuartz", value: themeQuartz },
    { id: "themeBalham", value: themeBalham },
    { id: "themeAlpine", value: themeAlpine },
  ];
  baseTheme = themeQuartz;

  colorSchemes = [
    { id: "(unchanged)", value: null },
    { id: "colorSchemeLight", value: colorSchemeLight },
    { id: "colorSchemeLightCold", value: colorSchemeLightCold },
    { id: "colorSchemeLightWarm", value: colorSchemeLightWarm },
    { id: "colorSchemeDark", value: colorSchemeDark },
    { id: "colorSchemeDarkWarm", value: colorSchemeDarkWarm },
    { id: "colorSchemeDarkBlue", value: colorSchemeDarkBlue },
    { id: "colorSchemeVariable", value: colorSchemeVariable },
  ];
  colorScheme = null;

  iconSets = [
    { id: "(unchanged)", value: null },
    { id: "iconSetQuartzLight", value: iconSetQuartzLight },
    { id: "iconSetQuartzRegular", value: iconSetQuartzRegular },
    { id: "iconSetQuartzBold", value: iconSetQuartzBold },
    { id: "iconSetAlpine", value: iconSetAlpine },
    { id: "iconSetMaterial", value: iconSetMaterial },
  ];
  iconSet = null;
*/