import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { InvoiceService } from '../../../../core/services/invoice.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-invoice-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-print.component.html',
  styleUrls: ['./invoice-print.component.css']
})
export class InvoicePrintComponent implements OnInit, OnChanges {
  @Input() Id: string | null = null;
  invoiceData: any;

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit() {
    if (this.Id) {
      this.getInvoiceWithId();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['Id'] && this.Id) {
      this.getInvoiceWithId();
    }
  }

  private getInvoiceWithId() {
    this.invoiceService.getInvoiceById(this.Id!).subscribe({
      next: (res: any) => {
        this.invoiceData = res.data;
        this.generateQRCode();
      },
      error: (err: any) => console.error('Error fetching invoice:', err)
    });
  }

  convertNumberToWords(num: number | undefined): string {
    if (!num) return '';
    const ones = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
      'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

    function convertToWords(n: number): string {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertToWords(n % 100) : '');
      if (n < 100000) return convertToWords(Math.floor(n / 1000)) + ' Thousand ' + (n % 1000 ? convertToWords(n % 1000) : '');
      if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + ' Lakh ' + (n % 100000 ? convertToWords(n % 100000) : '');
      if (n < 1000000000) return convertToWords(Math.floor(n / 10000000)) + ' Crore ' + (n % 10000000 ? convertToWords(n % 10000000) : '');
      return 'Number too large';
    }
    return convertToWords(Math.round(num));
  }

  private generateQRCode() {
    setTimeout(() => {
      const qrElement = document.getElementById('upi-qrcode') as HTMLCanvasElement;
      if (qrElement && this.invoiceData?.sellerDetails?.bankDetails?.accountNumber) {
        const upiString = this.invoiceData.sellerDetails?.bankDetails?.accountHolderName || 'shivamelectronics@upi';
        QRCode.toCanvas(qrElement, upiString, { width: 140, scale: 2 }, (error) => {
          if (error) console.error('Error generating QR Code:', error);
        });
      }
    }, 200);
  }

  downloadPDF() {
    const element = document.querySelector('.invoice.doc-surface') as HTMLElement;
    if (!element) return;

    const options = { scale: 3, useCORS: true };
    html2canvas(element, options).then(canvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${this.invoiceData?.invoiceNumber || 'download'}.pdf`);
    });
  }

  printInvoice() {
    window.print();
  }
}


// import { CommonModule } from '@angular/common';
// import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas-pro';
// import { InvoiceService } from '../../../../core/services/invoice.service';
// import * as QRCode from 'qrcode';

// @Component({
//   selector: 'app-invoice-print',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './invoice-print.component.html',
//   styleUrls: ['./invoice-print.component.css']
// })
// export class InvoicePrintComponent implements OnInit, OnChanges {
//   @Input() Id: number | any;
//   @Input() invoiceId: any
//   invoiceData: any;
//   constructor(private invoiceService: InvoiceService) { }
//   ngOnInit() {
//     console.log(this.Id);
//     if (!this.Id) {
//       console.error('Invoice ID is required');
//       return;
//     }
//     this.getInvoiceWithId();
//   }

//   ngOnChanges(changes: SimpleChanges) {
//     if (changes['Id'] && this.Id) {
//       this.getInvoiceWithId();
//     }
//   }

//   private getInvoiceWithId() {
//     this.invoiceService.getInvoiceById(this.Id).subscribe({
//       next: (res: any) => {
//         this.invoiceData = res.data;
//         console.log(res.data);
//         this.generateQRCode();
//       },
//       error: (err: any) => {
//         console.error('Error fetching invoice:', err);
//       }
//     });
//   }

//   convertNumberToWords(num: number | undefined): string {
//     if (!num) return '';

//     const ones = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
//       'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
//     const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

//     function convertToWords(n: number): string {
//       if (n < 20) return ones[n];
//       if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
//       if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertToWords(n % 100) : '');
//       if (n < 100000) return convertToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertToWords(n % 1000) : '');
//       if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertToWords(n % 100000) : '');
//       if (n < 1000000000) return convertToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convertToWords(n % 10000000) : '');
//       return 'Number too large';
//     }

//     return convertToWords(Math.round(num));
//   }

//   private generateQRCode() {
//     setTimeout(() => {
//       const qrElement = document.getElementById('upi-qrcode') as HTMLCanvasElement;
//       if (qrElement) {
//         QRCode.toCanvas(qrElement, this.invoiceData?.upiId || 'contact@shivamelectronics.com', {
//           width: 200,
//           scale: 2,
//           color: { dark: '#000000', light: '#FFFFFF' }
//         }, error => {
//           if (error) {
//             console.error('Error generating QR Code:', error);
//           }
//         });
//       }
//     }, 100);
//   }

//   downloadPDF() {
//     try {
//       const element = document.querySelector('.invoice-container') as HTMLElement;
//       if (!element) {
//         throw new Error('Invoice container not found');
//       }

//       const options = { scale: 4, useCORS: true, logging: false };
//       html2canvas(element, options).then(canvas => {
//         const pdf = new jsPDF({
//           orientation: 'portrait',
//           unit: 'in',
//           format: 'a4'
//         });

//         // this.addAdvertisementPage(pdf);

//         const pdfWidth = pdf.internal.pageSize.getWidth();
//         const pdfHeight = (canvas.height / canvas.width) * pdfWidth;
//         const imgData = canvas.toDataURL('image/jpeg', 1.0);
//         pdf.addImage(imgData, 'JPEG', 0, 0.2, pdfWidth, pdfHeight);
//         pdf.save(`invoice-${this.invoiceData?.invoiceNumber || 'download'}.pdf`);
//       }).catch(error => {
//         console.error('Error generating PDF:', error);
//       });
//     } catch (error) {
//       console.error('PDF generation failed:', error);
//     }
//   }
// }