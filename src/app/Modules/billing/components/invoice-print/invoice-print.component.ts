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
  @Input() Id: number | any;
  @Input() invoiceId: any;
  invoiceData: any;

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit() {
    if (!this.Id) {
      console.error('Invoice ID is required');
      return;
    }
    this.getInvoiceWithId();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['Id'] && this.Id) {
      this.getInvoiceWithId();
    }
  }

  private getInvoiceWithId() {
    this.invoiceService.getInvoiceById(this.Id).subscribe({
      next: (res: any) => {
        this.invoiceData = res.data;
        this.generateQRCode();
      },
      error: (err: any) => {
        console.error('Error fetching invoice:', err);
      }
    });
  }

  /** ✅ Convert number to words for Indian currency */
  convertNumberToWords(num: number | undefined): string {
    if (!num) return '';

    const ones = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convertToWords(n: number): string {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertToWords(n % 100) : '');
      if (n < 100000) return convertToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertToWords(n % 1000) : '');
      if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertToWords(n % 100000) : '');
      if (n < 1000000000) return convertToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convertToWords(n % 10000000) : '');
      return 'Number too large';
    }

    return convertToWords(Math.round(num));
  }

  /** ✅ Generate QR Code for UPI */
  private generateQRCode() {
    setTimeout(() => {
      const qrElement = document.getElementById('upi-qrcode') as HTMLCanvasElement;
      if (qrElement) {
        QRCode.toCanvas(
          qrElement,
          this.invoiceData?.upiId || 'contact@shivamelectronics.com',
          {
            width: 200,
            scale: 2,
            color: { dark: '#000000', light: '#FFFFFF' }
          },
          error => {
            if (error) {
              console.error('Error generating QR Code:', error);
            }
          }
        );
      }
    }, 100);
  }

  /** ✅ Generate a professional invoice PDF */
  downloadPDF() {
    if (!this.invoiceData) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

    // === HEADER ===
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Shivam Electronics', 40, 40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Invoice', 40, 60);
    doc.text(`Invoice No: ${this.invoiceData?.invoiceNumber || '-'}`, 550, 40, { align: 'right' });
    doc.text(`Date: ${this.invoiceData?.date || new Date().toLocaleDateString()}`, 550, 60, { align: 'right' });

    // === CUSTOMER INFO ===
    doc.roundedRect(40, 80, 520, 50, 4, 4, 'S');
    doc.text('Bill To:', 50, 100);
    doc.text(this.invoiceData?.customerName || 'Customer', 50, 115);
    doc.text(this.invoiceData?.customerAddress || 'Address not available', 50, 130);

    // === TABLE HEADER ===
    let startY = 160;
    doc.setFillColor(230, 230, 230);
    doc.rect(40, startY, 520, 20, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Item', 50, startY + 14);
    doc.text('Qty', 300, startY + 14, { align: 'center' });
    doc.text('Price', 400, startY + 14, { align: 'center' });
    doc.text('Total', 550, startY + 14, { align: 'right' });

    // === TABLE ROWS ===
    const items = this.invoiceData?.items || [];
    startY += 30;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    items.forEach((item: any, i: number) => {
      const y = startY + i * 20;
      const total = item.qty * item.price;
      doc.text(item.name, 50, y);
      doc.text(item.qty.toString(), 300, y, { align: 'center' });
      doc.text(item.price.toFixed(2), 400, y, { align: 'center' });
      doc.text(total.toFixed(2), 550, y, { align: 'right' });
    });

    // === TOTALS ===
    const subTotal = items.reduce((acc: number, it: any) => acc + it.qty * it.price, 0);
    const gst = subTotal * 0.18;
    const grandTotal = subTotal + gst;
    const totalY = startY + items.length * 20 + 30;

    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', 450, totalY, { align: 'right' });
    doc.text(subTotal.toFixed(2), 550, totalY, { align: 'right' });

    doc.text('GST (18%):', 450, totalY + 15, { align: 'right' });
    doc.text(gst.toFixed(2), 550, totalY + 15, { align: 'right' });

    doc.setFontSize(12);
    doc.text('Grand Total:', 450, totalY + 35, { align: 'right' });
    doc.text(grandTotal.toFixed(2), 550, totalY + 35, { align: 'right' });

    // === FOOTER ===
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your purchase!', 300, 780, { align: 'center' });

    doc.save(`invoice-${this.invoiceData?.invoiceNumber || 'download'}.pdf`);
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
//  }

  // downloadPDF() {
  //   try {
  //     const element = document.querySelector('.invoice-container') as HTMLElement;
  //     if (!element) {
  //       throw new Error('Invoice container not found');
  //     }

  //     const options = { scale: 4, useCORS: true, logging: false };
  //     html2canvas(element, options).then(canvas => {
  //       const pdf = new jsPDF({
  //         orientation: 'portrait',
  //         unit: 'in',
  //         format: 'a4'
  //       });

  //       // this.addAdvertisementPage(pdf);

  //       const pdfWidth = pdf.internal.pageSize.getWidth();
  //       const pdfHeight = (canvas.height / canvas.width) * pdfWidth;
  //       const imgData = canvas.toDataURL('image/jpeg', 1.0);
  //       pdf.addImage(imgData, 'JPEG', 0, 0.2, pdfWidth, pdfHeight);
  //       pdf.save(`invoice-${this.invoiceData?.invoiceNumber || 'download'}.pdf`);
  //     }).catch(error => {
  //       console.error('Error generating PDF:', error);
  //     });
  //   } catch (error) {
  //     console.error('PDF generation failed:', error);
  //   }
 
