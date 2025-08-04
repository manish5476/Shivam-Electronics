
import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { Card } from 'primeng/card';
import { Panel } from 'primeng/panel';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
// import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
import { AppMessageService } from '../../../../core/services/message.service';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
// import { ToolbarComponent } from "../../../../shared/Components/toolbar/toolbar.component";
@Component({
  selector: 'app-invoice-detail-card',
  standalone: true,
  imports: [CommonModule, FormsModule, Tag, SelectModule, TableModule],
  templateUrl: './invoice-detailsview.component.html',
  styleUrl: './invoice-detailsview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush // Add ChangeDetectionStrategy for better performance
})
export class InvoiceDetailCardComponent implements OnInit {
  public autoPopulate = inject(AutopopulateService)
  @Input() Id: string | undefined;
  invoiceData: any;
  loading: boolean = true;
  invoiceDropDown: any;
  constructor(private InvoiceService: InvoiceService, private messageService: AppMessageService, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void {
    this.autoPopulate.getModuleData('invoices').subscribe((data: any) => {
      this.invoiceDropDown = data;
    });
    this.cdr.detectChanges();
    if (this.Id) { this.getCustomerdata() }
  }
  onPrintButtonHover(event: MouseEvent, isHovering: boolean) {
    const button = event.currentTarget as HTMLElement;
    if (isHovering) {
      button.style.backgroundColor = 'var(--theme-button-hover-bg-primary)';
    } else {
      button.style.backgroundColor = 'var(--theme-button-bg-primary)';
    }
  }

  onCardHover(event: MouseEvent, isHovering: boolean) {
    const card = event.currentTarget as HTMLElement;
    if (isHovering) {
      // Example: A slightly stronger shadow on hover
      card.style.boxShadow = '0 4px 10px 0 var(--theme-shadow-color), 0 2px 4px -1px var(--theme-shadow-color)';
    } else {
      // Revert to default shadow (defined by .shadow-md)
      card.style.boxShadow = '0 1px 3px 0 var(--theme-shadow-color), 0 1px 2px -1px var(--theme-shadow-color)';
    }
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'PENDING':
        return 'warn';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'danger';
        break
    }
  }

  printInvoice() {
    const printContent = document.getElementById('invoice-print-section');
    const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=700,toolbar=0,scrollbars=0,status=0');
    if (WindowPrt && printContent) {
      WindowPrt.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>`);
      WindowPrt.document.close();
      WindowPrt.focus();
      WindowPrt.print();
      WindowPrt.close();
    }
  }

  getCustomerdata() {
    this.cdr.detectChanges();
    // console.log(this.Id);
    if (this.Id) {
      this.loading = true;
      this.InvoiceService.getinvoiceDataWithId(this.Id).subscribe({
        next: (res: any) => {
          this.invoiceData = res.data;
          this.loading = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();

        },
        error: (error: any) => {
          this.messageService.showError('Error fetching invoice data:', error)
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.messageService.showError('Invoice ID is missing!')
      this.loading = false;
    }
  }
}

