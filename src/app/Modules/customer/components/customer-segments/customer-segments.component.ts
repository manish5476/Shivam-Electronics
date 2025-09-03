import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { SharedGridComponent } from "../../../../shared/AgGrid/grid/shared-grid/shared-grid.component";
import { ColDef, CellStyle } from 'ag-grid-community'; // Import CellStyle
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-customer-segments',
  standalone: true,
  imports: [FormsModule, CommonModule, TabViewModule, TagModule, SharedGridComponent, CardModule, ToastModule, CurrencyPipe],
  templateUrl: './customer-segments.component.html',
  styleUrl: './customer-segments.component.css',
  providers: [MessageService]
})
export class CustomerSegmentsComponent implements OnInit {
  customerSegments: any;
  salesForecast: any
  loading = false;

  constructor(
    private analyticsService: AnalyticsService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.fetchCustomerSegments();
    this.getSalesForecast();
  }

  formatCurrency(amount: number | null | undefined): string {
    if (amount == null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  highValueColumns: ColDef[] = [
    { field: 'fullname', headerName: 'Full Name', sortable: true, filter: true },
    { field: 'email', headerName: 'Email', sortable: true, filter: true },
    {
      field: 'totalSpent', headerName: 'Total Spent', sortable: true, filter: true,
      valueFormatter: (params) => this.formatCurrency(params.value)
    },
    {
      field: 'lastPurchaseDate', headerName: 'Last Purchase', sortable: true, filter: 'agDateColumnFilter',
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : ''
    }
  ];

  // FIX: Explicitly typed as ColDef[]
  recentColumns: ColDef[] = [
    { field: 'fullname', headerName: 'Full Name', sortable: true, filter: true },
    { field: 'email', headerName: 'Email', sortable: true, filter: true },
    {
      field: 'totalSpent',
      headerName: 'Total Spent',
      sortable: true,
      filter: 'agNumberColumnFilter',
      cellStyle: (params): CellStyle => { // Return type is now explicit
        const value = params.value || 0;
        if (value > 100000) return { color: '#166534', fontWeight: 'bold', background: '#dcfce7' };
        if (value > 50000) return { color: '#1e40af', fontWeight: 'bold', background: '#dbeafe' };
        if (value > 10000) return { color: '#92400e', fontWeight: 'bold', background: '#fef3c7' };
        if (value > 0) return { color: '#9ca3af', background: '#f3f4f6' };
        return { color: '#6b7280', fontStyle: 'italic' };
      },
      valueFormatter: (params) => this.formatCurrency(params.value)
    },
    {
      field: 'lastPurchaseDate',
      headerName: 'Last Purchase',
      filter: 'agDateColumnFilter',
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'
    }
  ];

  atRiskColumns: ColDef[] = [...this.recentColumns];

  salesColumns: ColDef[] = [
    { field: '_id.month', headerName: 'Month', valueGetter: (p: any) => p.data._id.month, sortable: true },
    { field: '_id.year', headerName: 'Year', valueGetter: (p: any) => p.data._id.year, sortable: true },
    {
      field: 'totalSales', headerName: 'Total Sales', sortable: true, filter: true,
      valueFormatter: (params) => this.formatCurrency(params.value)
    }
  ];

  fetchCustomerSegments(): void {
    this.loading = true;
    this.analyticsService.getcustomerSegment().subscribe({
      next: (res: any) => {
        this.customerSegments = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch customer segments.' });
      },
    });
  }

  getSalesForecast(): void {
    this.loading = true;
    this.analyticsService.getsalesForcast().subscribe({
      next: (res: any) => {
        this.salesForecast = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch sales forecast.' });
      },
    });
  }

  eventFromGrid(event: any) {
    // Handle grid events if necessary
    console.log('Event from grid:', event);
  }
}
