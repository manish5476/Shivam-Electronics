import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { Card } from 'primeng/card';
import { Panel } from 'primeng/panel';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { AppMessageService } from '../../../../core/services/message.service';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { EmiService } from '../../../../core/services/emi.service';
import { signal } from '@angular/core'; // Use signals for reactive Id binding

@Component({
  selector: 'app-invoice-detail-card',
  standalone: true,
  imports: [CommonModule, FormsModule, Tag, SelectModule, TableModule],
  templateUrl: './invoice-detailsview.component.html',
  styleUrl: './invoice-detailsview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceDetailCardComponent implements OnInit {
  public autoPopulate = inject(AutopopulateService);
  @Input() Id: string | undefined;
  invoiceData = signal<any>(null); // Use signal for reactive data
  loading = signal<boolean>(true);
  invoiceDropDown: any[] = [];
  private cdr = inject(ChangeDetectorRef);

  // Reactive effect for Id changes - ensures API call on select
  constructor(private InvoiceService: InvoiceService, public EmiService: EmiService, private messageService: AppMessageService) {
    effect(() => {
      const id = this.Id;
      if (id) {
        console.log('ID changed to:', id); // Debug log
        this.getCustomerdata();
      }
    });
  }

  ngOnInit(): void {
    this.autoPopulate.getModuleData('invoices').subscribe((data: any) => {
      this.invoiceDropDown = data;
      this.cdr.detectChanges();
    });

    if (this.Id) {
      this.getCustomerdata();
    }
  }

  onPrintButtonHover(event: MouseEvent, isHovering: boolean) {
    const button = event.currentTarget as HTMLElement;
    if (isHovering) {
      button.style.backgroundColor = 'var(--theme-hover-bg)';
    } else {
      button.style.backgroundColor = 'transparent';
    }
  }

  onCardHover(event: MouseEvent, isHovering: boolean) {
    const card = event.currentTarget as HTMLElement;
    if (isHovering) {
      card.style.boxShadow = 'var(--ui-shadow-md)';
      card.style.transform = 'var(--ui-translate-hover)';
    } else {
      card.style.boxShadow = 'var(--ui-shadow)';
      card.style.transform = 'none';
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
            body { font-family: var(--font-body); padding: 20px; background: white; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid var(--theme-border-primary); padding: 8px; text-align: left; }
            th { background-color: var(--theme-bg-secondary); color: var(--theme-text-primary); }
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

  getCustomerdata(event?:any) {
    console.log('getCustomerdata called with ID:', this.Id); // Debug: Confirm call
    if (!this.Id) {
      console.warn('No ID provided'); // Debug log
      this.messageService.showError('Invoice ID is missing!');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.InvoiceService.getInvoiceById(this.Id).subscribe({
      next: (res: any) => {
        console.log('API Success:', res); // Debug: Confirm response
        this.invoiceData.set(res.data);
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('API Error:', error); // Debug: Log error
        this.messageService.showError('Error fetching invoice data:', error);
        this.loading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  convertToEmi() {
    const emiPlan: any = {
      numberOfInstallments: 12,
      startDate: '2025-10-01',
      downPayment: 5000
    };
    if (!this.Id) {
      console.error('Cannot create EMI plan: Invoice ID is missing.');
      return;
    }
    const invoiceIdAsString = this.Id.toString();

    this.EmiService.createEmiFromInvoice(invoiceIdAsString, emiPlan)
      .subscribe({
        next: (response) => {
          console.log('EMI Plan Created Successfully!', response);
        },
        error: (err) => {
          console.error('Failed to create EMI plan', err);
        }
      });
  }
}

// import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { InvoiceService } from '../../../../core/services/invoice.service';
// import { Card } from 'primeng/card';
// import { Panel } from 'primeng/panel';
// import { Tag } from 'primeng/tag';
// import { TableModule } from 'primeng/table';
// // import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
// import { AppMessageService } from '../../../../core/services/message.service';
// import { AutopopulateService } from '../../../../core/services/autopopulate.service';
// import { SelectModule } from 'primeng/select';
// import { FormsModule } from '@angular/forms';
// // import { ToolbarComponent } from "../../../../shared/Components/toolbar/toolbar.component";
// import { EmiService } from '../../../../core/services/emi.service';
// @Component({
//   selector: 'app-invoice-detail-card',
//   standalone: true,
//   imports: [CommonModule, FormsModule, Tag, SelectModule, TableModule],
//   templateUrl: './invoice-detailsview.component.html',
//   styleUrl: './invoice-detailsview.component.css',
//   changeDetection: ChangeDetectionStrategy.OnPush // Add ChangeDetectionStrategy for better performance
// })
// export class InvoiceDetailCardComponent implements OnInit {
//   public autoPopulate = inject(AutopopulateService)
//   @Input() Id: string | undefined;
//   invoiceData: any;
//   loading: boolean = true;
//   invoiceDropDown: any;
//   constructor(private InvoiceService: InvoiceService, public EmiService: EmiService, private messageService: AppMessageService, private cdr: ChangeDetectorRef) { }
//   ngOnInit(): void {
//     this.autoPopulate.getModuleData('invoices').subscribe((data: any) => {
//       this.invoiceDropDown = data;
//     });
//     this.cdr.detectChanges();
//     if (this.Id) { this.getCustomerdata() }
//   }
//   onPrintButtonHover(event: MouseEvent, isHovering: boolean) {
//     const button = event.currentTarget as HTMLElement;
//     if (isHovering) {
//       button.style.backgroundColor = 'var(--theme-button-hover-bg-primary)';
//     } else {
//       button.style.backgroundColor = 'var(--theme-button-bg-primary)';
//     }
//   }

//   onCardHover(event: MouseEvent, isHovering: boolean) {
//     const card = event.currentTarget as HTMLElement;
//     if (isHovering) {
//       // Example: A slightly stronger shadow on hover
//       card.style.boxShadow = '0 4px 10px 0 var(--theme-shadow-color), 0 2px 4px -1px var(--theme-shadow-color)';
//     } else {
//       // Revert to default shadow (defined by .shadow-md)
//       card.style.boxShadow = '0 1px 3px 0 var(--theme-shadow-color), 0 1px 2px -1px var(--theme-shadow-color)';
//     }
//   }

//   getStatusSeverity(status: string) {
//     switch (status) {
//       case 'PENDING':
//         return 'warn';
//       case 'DELIVERED':
//         return 'success';
//       case 'CANCELLED':
//         return 'danger';
//       default:
//         return 'danger';
//         break
//     }
//   }

//   printInvoice() {
//     const printContent = document.getElementById('invoice-print-section');
//     const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=700,toolbar=0,scrollbars=0,status=0');
//     if (WindowPrt && printContent) {
//       WindowPrt.document.write(`
//       <html>
//         <head>
//           <title>Invoice</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//             th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//             th { background-color: #f4f4f4; }
//           </style>
//         </head>
//         <body>${printContent.innerHTML}</body>
//       </html>`);
//       WindowPrt.document.close();
//       WindowPrt.focus();
//       WindowPrt.print();
//       WindowPrt.close();
//     }
//   }

//   getCustomerdata() {
//     this.cdr.detectChanges();
//     console.log(this.Id);
//     if (this.Id) {
//       this.loading = true;
//       this.InvoiceService.getInvoiceById(this.Id).subscribe({
//         next: (res: any) => {
//           this.invoiceData = res.data;
//           this.loading = false;
//           this.cdr.markForCheck();
//           this.cdr.detectChanges();

//         },
//         error: (error: any) => {
//           this.messageService.showError('Error fetching invoice data:', error)
//           this.loading = false;
//           this.cdr.detectChanges();
//         }
//       });
//     } else {
//       this.messageService.showError('Invoice ID is missing!')
//       this.loading = false;
//     }
//   }


//   convertToEmi() {
//     const emiPlan: any = { // You can replace 'any' with the EmiCreationPayload interface we defined
//       numberOfInstallments: 12,
//       startDate: '2025-10-01',
//       downPayment: 5000
//     };
//     if (!this.Id) {
//       console.error('Cannot create EMI plan: Invoice ID is missing.');
//       return; 
//     }
//     const invoiceIdAsString = this.Id.toString();

//     // 3. Now, call the service with a guaranteed string value.
//     this.EmiService.createEmiFromInvoice(invoiceIdAsString, emiPlan)
//       .subscribe({
//         next: (response) => {
//           console.log('EMI Plan Created Successfully!', response);
//           // Add success notification for the user
//         },
//         error: (err) => {
//           console.error('Failed to create EMI plan', err);
//           // Add error notification for the user
//         }
//       });
//   }
// }

