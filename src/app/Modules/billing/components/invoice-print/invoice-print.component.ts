import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
import html2canvas from 'html2canvas-pro';
import { InvoiceService } from '../../../../core/services/invoice.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-invoice-print',
  imports: [CommonModule],
  templateUrl: './invoice-print.component.html',
  styleUrl: './invoice-print.component.css'
})

export class InvoicePrintComponent implements OnInit, OnChanges {
  @Input() Id: any;
  invoiceData: any
  ngOnInit(): void {
    if (!this.Id) {
      console.error('Invoice data is required for PrintableInvoiceComponent');
    } else {
      this.getInvoiceWithId()
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.Id) {
      console.error('Invoice data is required for PrintableInvoiceComponent');
    } else {
      this.getInvoiceWithId()
    }
  }

  constructor(private InvoiceService: InvoiceService) { }

  convertNumberToWords(num: number | undefined): string {
    if (num === undefined) return ''; // Handle undefined case

    const ones = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
      "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    function convertToWords(n: number): string {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
      if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convertToWords(n % 100) : "");
      if (n < 100000) return convertToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convertToWords(n % 1000) : "");
      if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + convertToWords(n % 100000) : "");
      if (n < 1000000000) return convertToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + convertToWords(n % 10000000) : "");
      return "Number too large";
    }

    return convertToWords(Math.round(num)); // Round to handle decimal amounts appropriately
  }

  getInvoiceWithId() {
    this.InvoiceService.getinvoiceDataWithId(this.Id).subscribe({
      next: (res: any) => {
        this.invoiceData = res.data;
      },
      error: (err: any) => {
        console.error('Error fetching invoice:', err);
      }
    })
  }


  downloadPDF() {
    setTimeout(() => {
      const element = document.querySelector('.invoice-container') as HTMLElement;

      if (!element) {
        console.error('Invoice container not found');
        return;
      }

      // Use `as unknown as Parameters<typeof html2canvas>[1]` to avoid TypeScript errors
      const options = { scale: window.devicePixelRatio || 2 } as unknown as Parameters<typeof html2canvas>[1];

      html2canvas(element, options).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        this.addAdvertisementPage(pdf)
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
        pdf.save(`invoice-${this.invoiceData?.invoiceNumber || 'download'}.pdf`);
      }).catch(error => {
        console.error('Error generating PDF:', error);
      });
    }, 500);
  }

  addAdvertisementPage(pdf: jsPDF) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFillColor('#e0f7fa'); // Light cyan
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    try {
      const logoData = require('../../assets/shivam-electronics-logo.png'); // Adjust path
      pdf.addImage(logoData, 'PNG', pageWidth / 2 - 50, 30, 100, 100);
    } catch (error) {
      console.warn("Logo image not found, using placeholder text.");
      pdf.setFontSize(36);
      pdf.setTextColor('#00796b'); // Dark Teal
      pdf.text("Shivam Electronics", pageWidth / 2, 80, { align: 'center' });
    }

    // Main Heading
    pdf.setFontSize(30);
    pdf.setTextColor('#004d40'); // Darker Teal
    pdf.text('Your Trusted Electronics Partner', pageWidth / 2, 150, { align: 'center' });

    // Slogan/Tagline
    pdf.setFontSize(18);
    pdf.setTextColor('#00695c'); // Medium Teal
    pdf.text('Quality & Reliability You Can Count On', pageWidth / 2, 180, { align: 'center' });

    // Product Images (Replace with your actual image paths and adjust positions)
    try {
      const product1Data = require('../../assets/product1.png'); // Example product image
      pdf.addImage(product1Data, 'PNG', 20, 220, 100, 100);

      const product2Data = require('../../assets/product2.png'); // Example product image
      pdf.addImage(product2Data, 'PNG', pageWidth - 120, 220, 100, 100);
    } catch (error) {
      console.warn("Product images not found, using placeholder rectangles.");
      pdf.setFillColor('#b2dfdb'); // Light Teal
      pdf.rect(20, 220, 100, 100, 'F');
      pdf.rect(pageWidth - 120, 220, 100, 100, 'F');
    }

    // Contact Information
    pdf.setFontSize(14);
    pdf.setTextColor('#004d40');
    pdf.text('Contact Us:', 20, 350);
    pdf.text('Phone: YOUR_PHONE_NUMBER', 20, 370);
    pdf.text('Email: YOUR_EMAIL_ADDRESS', 20, 390);

    // Website Link (clickable)
    pdf.setTextColor('#1976d2'); // Blue for link
    pdf.textWithLink('Visit our website: YOUR_WEBSITE_LINK', pageWidth / 2, 380, { url: 'YOUR_WEBSITE_LINK', align: 'center' });

    // Footer Message
    pdf.setFontSize(12);
    pdf.setTextColor('#00695c');
    pdf.text('© ' + new Date().getFullYear() + ' Shivam Electronics. All rights reserved.', pageWidth / 2, pageHeight - 20, { align: 'center' });

    pdf.addPage(); // Add a new page for the invoice
  }



  ngAfterViewInit() {
    setTimeout(() => {
      const qrElement = document.getElementById("upi-qrcode") as HTMLCanvasElement;
      if (qrElement) {
        QRCode.toCanvas(qrElement, "YOUR_UPI_PAYMENT_LINK_OR_UPI_ID", {
          width: 100,
          color: {
            dark: "#000000",
            light: "#ffffff"
          }
        }, (error) => {
          if (error) {
            console.error("Error generating QR Code:", error);
          }
        });
      } else {
        console.error("QR Code container not found");
      }
    }, 500);
  }
}
  // downloadPDF() {
  //   setTimeout(() => {
  //     const element = document.querySelector('.invoice-container') as HTMLElement;

  //     if (!element) {
  //       console.error('Invoice container not found');
  //       return;
  //     }
  //     html2canvas(element, { scale: 2 }).then(canvas => {
  //       const imgData = canvas.toDataURL('image/png');
  //       const pdf = new jsPDF({
  //         orientation: 'portrait',
  //         unit: 'mm',
  //         format: 'a4'
  //       });

  //       const pdfWidth = pdf.internal.pageSize.getWidth();
  //       const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Maintain aspect ratio

  //       pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
  //       pdf.save(`invoice-${this.invoiceData?.invoiceNumber || 'download'}.pdf`);
  //     }).catch(error => {
  //       console.error('Error generating PDF:', error);
  //     });

  //   }, 500); // Small delay to ensure rendering
  // }

// downloadPDF() {
//   const element = document.querySelector('.invoice-container') as HTMLElement;
//   html2canvas(element, { scale: 2 }).then(canvas => {
//     const imgData = canvas.toDataURL('image/png');
//     const pdf = new jsPDF({
//       orientation: 'portrait',
//       unit: 'mm',
//       format: 'a4'
//     });
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
//     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//     pdf.save('invoice.pdf');
//   });
// }

// downloadPDF() {
//   const element = document.querySelector('.invoice-container') as HTMLElement;
//   if (!element) {
//     console.error('Invoice container not found');
//     return;
//   }

//   html2canvas(element, { scale: 2 }).then(canvas => {
//     const imgData = canvas.toDataURL('image/png');
//     const pdf = new jsPDF({
//       orientation: 'portrait',
//       unit: 'mm',
//       format: 'a4'
//     });
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Maintain aspect ratio
//     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//     pdf.save('invoice.pdf');
//   }).catch(error => {
//     console.error('Error generating PDF:', error);
//   });
// }

// convertNumberToWords(num: number): string {
//   // Your implementation for converting numbers to words
//   return 'Your Conversion Logic Here';
// }
// downloadPDF() {
//   const DATA = document.querySelector('.invoice-container') as HTMLElement;
//   html2canvas(DATA).then(canvas => {
//     const fileWidth = 210; // A4 size paper width in mm
//     const fileHeight = 297; // A4 size paper height in mm
//     const contentDataURL = canvas.toDataURL('image/png')
//     let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
//     var width = pdf.internal.pageSize.getWidth();
//     var height = pdf.internal.pageSize.getHeight();
//     pdf.addImage(contentDataURL, 'PNG', 0, 0, width, height);
//     pdf.save('invoice.pdf');
//   });
// }

