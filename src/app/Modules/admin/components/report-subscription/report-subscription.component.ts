import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ColDef } from 'ag-grid-community';
import { Observable } from 'rxjs';

// Project-specific imports
import { ReportSubscription, SubscriptionService, SubscriptionApiResponse } from '../../../../core/services/subscription.service';
import { ActionbuttonsComponent } from '../../../../shared/AgGrid/AgGridcomponents/actionbuttons/actionbuttons.component';
import { GridContext } from '../../../../interfaces/grid-context.interface';
import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-report-subscription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedGridComponent, CardModule, DropdownModule, ButtonModule, TagModule, ToastModule],
  templateUrl: './report-subscription.component.html',
  styleUrl: './report-subscription.component.css',
  providers: [MessageService]
})
export class ReportSubscriptionComponent implements OnInit {
  eventFromGrid($event: any) {
    throw new Error('Method not implemented.');
  }
  private fb = inject(FormBuilder);
  private subscriptionService = inject(SubscriptionService);
  private messageService = inject(MessageService);

  subscriptionForm!: FormGroup;
  subscriptions$!: Observable<SubscriptionApiResponse>;

  reportTypes = [
    { label: 'Weekly Sales Summary', value: 'WEEKLY_SALES_SUMMARY' },
    { label: 'Monthly Overdue Invoices', value: 'MONTHLY_OVERDUE_INVOICES' }
  ];

  schedules = [
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Monthly', value: 'MONTHLY' }
  ];

  colDefs: ColDef[] = [
    {
      headerName: 'Report Type', field: 'reportType', flex: 2,
      cellRenderer: (params: any) => this.getReportTypeLabel(params.value),
      sortable: true, filter: true
    },
    {
      headerName: 'Schedule', field: 'schedule', flex: 1,
      cellRenderer: (params: any) => {
        const severity = params.value === 'WEEKLY' ? 'info' : 'warning';
        return `<p-tag value="${params.value}" severity="${severity}"></p-tag>`;
      },
      sortable: true, filter: true
    },
    {
      headerName: 'Recipients', field: 'recipients', flex: 3,
      cellRenderer: (params: any) => params.value.join(', '),
      wrapText: true,
      autoHeight: true
    },
    {
      headerName: 'Status', field: 'isActive', flex: 1,
      cellRenderer: (params: any) => {
        const severity = params.value ? 'success' : 'danger';
        const text = params.value ? 'Active' : 'Inactive';
        return `<p-tag value="${text}" severity="${severity}"></p-tag>`;
      },
      sortable: true
    },
    {
      headerName: 'Actions',
      field: 'action',
      cellRenderer: ActionbuttonsComponent,
      cellRendererParams: {
        context: this,
        buttons: [{
          label: 'Unsubscribe',
          icon: 'pi pi-trash',
          class: 'p-button-danger p-button-sm',
          action: 'unsubscribe'
        }]
      }
    }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadSubscriptions();
  }

  initializeForm(): void {
    this.subscriptionForm = this.fb.group({
      reportType: [null, [Validators.required]],
      schedule: [null, [Validators.required]],
      recipients: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  loadSubscriptions(): void {
    this.subscriptions$ = this.subscriptionService.getMySubscriptions();
  }

  onSubmit(): void {
    if (this.subscriptionForm.invalid) {
      this.subscriptionForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill in all required fields.' });
      return;
    }

    this.subscriptionService.subscribeToReport(this.subscriptionForm.value).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Subscription created successfully!' });
        this.loadSubscriptions(); // Refresh the grid
        this.subscriptionForm.reset();
        Object.keys(this.subscriptionForm.controls).forEach(key => {
          this.subscriptionForm.get(key)?.setErrors(null);
        });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to create subscription.' });
      }
    });
  }

  handleGridAction(event: { action: string, data: ReportSubscription }): void {
    if (event.action === 'unsubscribe') {
      this.onUnsubscribe(event.data._id);
    }
  }

  onUnsubscribe(id: string): void {
    this.subscriptionService.unsubscribeFromReport(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Successfully unsubscribed.' });
        this.loadSubscriptions(); // Refresh the grid
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to unsubscribe.' });
      }
    });
  }

  getReportTypeLabel(value: string): string {
    const report = this.reportTypes.find(rt => rt.value === value);
    return report ? report.label : value;
  }
}
