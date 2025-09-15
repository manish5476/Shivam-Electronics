
import { SharedGridComponent } from '../../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
// import { SelectItem } from 'primeng/api';

import { DashboardService } from '../../../../../core/services/dashboard.service';
import { SelectItem } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-logs',
  templateUrl: './auth-logs.component.html',
  styleUrls: ['./auth-logs.component.css'],
  imports: [SharedGridComponent, SelectModule, FormsModule, CommonModule],
})
export class AuthLogsComponent implements OnInit {
  column: any;
  rowSelectionMode = 'singleRow';
  data: any[] = [];
  selectedLogFile: string = 'combined.log';
  currentPage: number = 1;
  itemsPerPage: number = 100;
  totalLogs: number = 0;

  logFileOptions: SelectItem[] = [
    { label: 'Combined Logs', value: 'combined.log' },
    { label: 'Error Logs', value: 'error.log' },
    { label: 'Auth Logs', value: 'auth.log' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    this.getColumn();
    this.fetchLogs();
  }

  fetchLogs(): void {
    const params = {
      file: this.selectedLogFile,
      page: this.currentPage,
      limit: this.itemsPerPage,
    };

    // this.dashboardService.getDashboardLogsDetails(params).subscribe(
    //   (res: any) => {
    //     const logs =
    //       Array.isArray(res.data) && res.data.length > 0
    //         ? res.data
    //         : res.data;

    //     this.data = Array.isArray(logs) ? logs : [];
    //     this.totalLogs = res.totalLogs || 0;
    //     this.cdr.markForCheck(); // triggers UI update if using OnPush
    //   },
    //   (error) => {
    //     console.error('Error fetching logs:', error);
    //     this.data = [];
    //   }
    // );
  }


  onFileSelect(event: { originalEvent: Event; value: string }): void {
    this.currentPage = 1;
    this.getColumn();
    this.fetchLogs();
  }

  onPageChange(newPage: number): void {
    const totalPages = Math.ceil(this.totalLogs / this.itemsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
      this.currentPage = newPage;
      this.fetchLogs();
      this.getColumn();
    }
  }

  eventFromGrid(event: any) {
    // handle grid row events if needed
  }

  getColumn() {
    if (this.selectedLogFile === 'combined.log' || this.selectedLogFile === 'auth.log') {
      this.column = [
        { field: 'level', headerName: 'Level', flex: 1, sortable: true, filter: true, resizable: true },
        { field: 'message', headerName: 'Message', flex: 2, sortable: true, filter: true, resizable: true },
        { field: 'timestamp', headerName: 'Timestamp', flex: 1, sortable: true, filter: true, resizable: true },
      ];
    } else if (this.selectedLogFile === 'error.log') {
      this.column = [
        { field: 'status', headerName: 'Status', sortable: true, filter: true, resizable: true },
        { field: 'message', headerName: 'Message', sortable: true, filter: true, resizable: true },
        { field: 'errors', headerName: 'Errors', sortable: true, filter: true, resizable: true },
      ];
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalLogs / this.itemsPerPage);
  }
}
