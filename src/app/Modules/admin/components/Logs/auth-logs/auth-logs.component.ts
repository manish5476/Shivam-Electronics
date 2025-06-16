
import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { SharedGridComponent } from '../../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { CellValueChangedEvent } from 'ag-grid-community';
import { DashboardService } from '../../../../../core/services/dashboard.service';
import { SelectModule } from 'primeng/select';
import { SelectItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-auth-logs',
  imports: [SharedGridComponent, FormsModule, SelectModule],
  templateUrl: './auth-logs.component.html',
  styleUrl: './auth-logs.component.css'
})
export class AuthLogsComponent {
  column: any
  rowSelectionMode: any
  data: any[] = [];
  selectedLogFile: string = 'combined.log'; // Default selected log file
  currentPage: number = 1;
  itemsPerPage: number = 50;
  totalLogs: number = 0;

  logFileOptions: SelectItem[] = [
    { label: 'Combined Logs', value: 'combined.log' },
    { label: 'Error Logs', value: 'error.log' },
    { label: 'Auth Logs', value: 'auth.log' }
  ];
  constructor(private cdr: ChangeDetectorRef, private DashboardService: DashboardService) { }

  ngOnInit(): void {
    this.getColumn()
    this.fetchLogs(); // Fetch logs on component initialization
    this.rowSelectionMode = 'singleRow'
  }

  fetchLogs(): void {
    const params = {
      file: this.selectedLogFile,
      page: this.currentPage,
      limit: this.itemsPerPage
    };
    this.DashboardService.getDashboardLogsDetails(params).subscribe(
      (res: any) => {
        this.data = [...res.data]; // Ensures Angular detects changes
        this.totalLogs = res.totalLogs;
        // this.getColumn();
        console.log(this.data);
        this.cdr.markForCheck();
      },
      (error) => {
        console.error('Error fetching logs:', error);
      }
    );
  } 

  onFileSelect(event: { originalEvent: Event; value: string }): void {
    this.currentPage = 1;
    this.fetchLogs();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 1 && newPage <= Math.ceil(this.totalLogs / this.itemsPerPage)) {
      this.currentPage = newPage;
      this.fetchLogs();
    }
  }

  eventFromGrid(event: any) { }

  getColumn() {
    if (this.selectedLogFile === 'combined.log' || this.selectedLogFile === 'auth.log') {
      this.column = [
        { field: 'level', flex: 1, sortable: true, filter: true, resizable: true },
        { field: 'message', flex: 2, sortable: true, filter: true, resizable: true },
        { field: 'timestamp', flex: 1, sortable: true, filter: true, resizable: true },
      ];

    }
    else if (this.selectedLogFile === 'error.log') {
      this.column =
        [
          { field: 'status', sortable: true, filter: true, resizable: true, editable: true },
          { field: 'message', sortable: true, filter: true, resizable: true, editable: true },
          { field: 'errors', sortable: true, filter: true, resizable: true, editable: true },
        ];
    }

  }


}