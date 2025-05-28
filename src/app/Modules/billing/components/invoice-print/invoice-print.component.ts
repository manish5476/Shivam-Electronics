import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import jsPDF from 'jspdf';
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
  invoiceData: any;
  constructor(private InvoiceService: InvoiceService) { }
  ngOnInit(): void {
    if (!this.Id) {
      console.error('Invoice data is required for PrintableInvoiceComponent');
    } else {
      this.getInvoiceWithId();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Id'] && this.Id) {
      this.getInvoiceWithId();
    }
  }

  getInvoiceWithId() {
    this.InvoiceService.getinvoiceDataWithId(this.Id).subscribe({
      next: (res: any) => {
        this.invoiceData = res.data;
      },
      error: (err: any) => {
        console.error('Error fetching invoice:', err);
      }
    });
  }

  convertNumberToWords(num: number | undefined): string {
    if (num === undefined) return '';

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

    return convertToWords(Math.round(num));
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const qrElement = document.getElementById("upi-qrcode") as HTMLCanvasElement;
      if (qrElement) {
        QRCode.toCanvas(qrElement, this.invoiceData?.upiId || "contact@shivamelectronics.com", {
          width: 100,
          color: { dark: "#000000", light: "#ffffff" }
        }, (error) => {
          if (error) {
            console.error("Error generating QR Code:", error);
          }
        });
      }
    }, 500);
  }

  downloadPDF() {
    setTimeout(() => {
      const element = document.querySelector('.invoice-container') as HTMLElement;
      if (!element) {
        console.error('Invoice container not found');
        return;
      }

      const options = { scale: window.devicePixelRatio || 2 } as unknown as Parameters<typeof html2canvas>[1];
      html2canvas(element, options).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        this.addAdvertisementPage(pdf);
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
  const margin = 10;
  const gutter = 10;
  const cardWidth = (pageWidth - margin * 2 - gutter) / 2;
  const cardHeight = 70;
  const startY = 30;

  // Background
  pdf.setFillColor(30, 30, 30); // Dark background
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255);
  pdf.text('🔥 Today\'s Top Deals - Shivam Electronics', pageWidth / 2, 20, { align: 'center' });

  const items = [
    {
      title: 'Air Conditioners',
      subtitle: 'Starting at ₹24,490',
      bgColor: [18, 97, 160],
      textColor: [255, 255, 255],
      imageLabel: 'AC',
    },
    {
      title: 'Bestselling TVs',
      subtitle: 'From ₹5,311',
      bgColor: [44, 44, 44],
      textColor: [255, 255, 255],
      imageLabel: 'TV',
    },
    {
      title: 'Irons & Steamers',
      subtitle: 'From ₹499',
      bgColor: [50, 10, 70],
      textColor: [255, 255, 255],
      imageLabel: 'Iron',
    },
    {
      title: 'Audio Devices',
      subtitle: 'Up to 56% Off',
      bgColor: [0, 38, 77],
      textColor: [255, 255, 255],
      imageLabel: 'Speaker',
    },
    {
      title: 'Chargers & Adapters',
      subtitle: 'From ₹246',
      bgColor: [54, 0, 78],
      textColor: [255, 255, 255],
      imageLabel: 'USB',
    },
    {
      title: 'Microwave Ovens',
      subtitle: 'From ₹8,790',
      bgColor: [10, 40, 90],
      textColor: [255, 255, 255],
      imageLabel: 'Oven',
    }
  ];

  let x = margin;
  let y = startY;
  const imageSize = 20;

  items.forEach((item, index) => {
    const [r, g, b] = item.bgColor;
    pdf.setFillColor(r, g, b);
    pdf.roundedRect(x, y, cardWidth, cardHeight, 5, 5, 'F');

    // Image Placeholder
    pdf.setDrawColor(255);
    pdf.rect(x + 10, y + 10, imageSize, imageSize, 'S');
    pdf.setFontSize(9);
    pdf.text(item.imageLabel, x + 10 + imageSize / 2, y + 10 + imageSize / 2 + 2, {
      align: 'center',
      baseline: 'middle'
    });

    // Title and Subtitle
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(item.title, x + imageSize + 20, y + 20);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(item.subtitle, x + imageSize + 20, y + 35);

    // Position for next card
    if ((index + 1) % 2 === 0) {
      x = margin;
      y += cardHeight + gutter;
    } else {
      x += cardWidth + gutter;
    }
  });

  // Footer
  pdf.setTextColor(180);
  pdf.setFontSize(10);
  pdf.text('📍 Shivam Electronics, JB Shopping Center, Jolwa | 📞 +91 98765 43210', pageWidth / 2, pageHeight - 10, { align: 'center' });

  pdf.addPage();
}

}
// import { CommonModule } from '@angular/common';
// import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
// import jsPDF from 'jspdf';
// // import html2canvas from 'html2canvas';
// import html2canvas from 'html2canvas-pro';
// import { InvoiceService } from '../../../../core/services/invoice.service';
// import * as QRCode from 'qrcode';

// @Component({
//   selector: 'app-invoice-print',
//   imports: [CommonModule],
//   templateUrl: './invoice-print.component.html',
//   styleUrl: './invoice-print.component.css'
// })

// export class InvoicePrintComponent implements OnInit, OnChanges {
//   @Input() Id: any;
//   invoiceData: any
//   ngOnInit(): void {
//     if (!this.Id) {
//       console.error('Invoice data is required for PrintableInvoiceComponent');
//     } else {
//       this.getInvoiceWithId()
//     }

//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (!this.Id) {
//       console.error('Invoice data is required for PrintableInvoiceComponent');
//     } else {
//       this.getInvoiceWithId()
//     }
//   }

//   constructor(private InvoiceService: InvoiceService) { }

//   convertNumberToWords(num: number | undefined): string {
//     if (num === undefined) return ''; // Handle undefined case

//     const ones = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
//       "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
//     const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

//     function convertToWords(n: number): string {
//       if (n < 20) return ones[n];
//       if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
//       if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convertToWords(n % 100) : "");
//       if (n < 100000) return convertToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convertToWords(n % 1000) : "");
//       if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + convertToWords(n % 100000) : "");
//       if (n < 1000000000) return convertToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + convertToWords(n % 10000000) : "");
//       return "Number too large";
//     }

//     return convertToWords(Math.round(num)); // Round to handle decimal amounts appropriately
//   }

//   getInvoiceWithId() {
//     this.InvoiceService.getinvoiceDataWithId(this.Id).subscribe({
//       next: (res: any) => {
//         this.invoiceData = res.data;
//       },
//       error: (err: any) => {
//         console.error('Error fetching invoice:', err);
//       }
//     })
//   }


//   downloadPDF() {
//     setTimeout(() => {
//       const element = document.querySelector('.invoice-container') as HTMLElement;

//       if (!element) {
//         console.error('Invoice container not found');
//         return;
//       }

//       // Use `as unknown as Parameters<typeof html2canvas>[1]` to avoid TypeScript errors
//       const options = { scale: window.devicePixelRatio || 2 } as unknown as Parameters<typeof html2canvas>[1];

//       html2canvas(element, options).then(canvas => {
//         const imgData = canvas.toDataURL('image/png');
//         const pdf = new jsPDF({
//           orientation: 'portrait',
//           unit: 'mm',
//           format: 'a4'
//         });
//         this.addAdvertisementPage(pdf)
//         const pdfWidth = pdf.internal.pageSize.getWidth();
//         const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
//         pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
//         pdf.save(`invoice-${this.invoiceData?.invoiceNumber || 'download'}.pdf`);
//       }).catch(error => {
//         console.error('Error generating PDF:', error);
//       });
//     }, 500);
//   }

//   addAdvertisementPage(pdf: jsPDF) {
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const pageHeight = pdf.internal.pageSize.getHeight();
//     pdf.setFillColor('#e0f7fa'); // Light cyan
//     pdf.rect(0, 0, pageWidth, pageHeight, 'F');
//     try {
//       const logoData = require('../../assets/shivam-electronics-logo.png'); // Adjust path
//       pdf.addImage(logoData, 'PNG', pageWidth / 2 - 50, 30, 100, 100);
//     } catch (error) {
//       console.warn("Logo image not found, using placeholder text.");
//       pdf.setFontSize(36);
//       pdf.setTextColor('#00796b'); // Dark Teal
//       pdf.text("Shivam Electronics", pageWidth / 2, 80, { align: 'center' });
//     }

//     // Main Heading
//     pdf.setFontSize(30);
//     pdf.setTextColor('#004d40'); // Darker Teal
//     pdf.text('Your Trusted Electronics Partner', pageWidth / 2, 150, { align: 'center' });

//     // Slogan/Tagline
//     pdf.setFontSize(18);
//     pdf.setTextColor('#00695c'); // Medium Teal
//     pdf.text('Quality & Reliability You Can Count On', pageWidth / 2, 180, { align: 'center' });

//     // Product Images (Replace with your actual image paths and adjust positions)
//     try {
//       const product1Data = require('../../assets/product1.png'); // Example product image
//       pdf.addImage(product1Data, 'PNG', 20, 220, 100, 100);

//       const product2Data = require('../../assets/product2.png'); // Example product image
//       pdf.addImage(product2Data, 'PNG', pageWidth - 120, 220, 100, 100);
//     } catch (error) {
//       console.warn("Product images not found, using placeholder rectangles.");
//       pdf.setFillColor('#b2dfdb'); // Light Teal
//       pdf.rect(20, 220, 100, 100, 'F');
//       pdf.rect(pageWidth - 120, 220, 100, 100, 'F');
//     }

//     // Contact Information
//     pdf.setFontSize(14);
//     pdf.setTextColor('#004d40');
//     pdf.text('Contact Us:', 20, 350);
//     pdf.text('Phone: YOUR_PHONE_NUMBER', 20, 370);
//     pdf.text('Email: YOUR_EMAIL_ADDRESS', 20, 390);

//     // Website Link (clickable)
//     pdf.setTextColor('#1976d2'); // Blue for link
//     pdf.textWithLink('Visit our website: YOUR_WEBSITE_LINK', pageWidth / 2, 380, { url: 'YOUR_WEBSITE_LINK', align: 'center' });

//     // Footer Message
//     pdf.setFontSize(12);
//     pdf.setTextColor('#00695c');
//     pdf.text('© ' + new Date().getFullYear() + ' Shivam Electronics. All rights reserved.', pageWidth / 2, pageHeight - 20, { align: 'center' });

//     pdf.addPage(); // Add a new page for the invoice
//   }



//   ngAfterViewInit() {
//     setTimeout(() => {
//       const qrElement = document.getElementById("upi-qrcode") as HTMLCanvasElement;
//       if (qrElement) {
//         QRCode.toCanvas(qrElement, "YOUR_UPI_PAYMENT_LINK_OR_UPI_ID", {
//           width: 100,
//           color: {
//             dark: "#000000",
//             light: "#ffffff"
//           }
//         }, (error) => {
//           if (error) {
//             console.error("Error generating QR Code:", error);
//           }
//         });
//       } else {
//         console.error("QR Code container not found");
//       }
//     }, 500);
//   }
// }