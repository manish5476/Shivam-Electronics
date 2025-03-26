// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-invoice-detailsview',
//   imports: [],
//   templateUrl: './invoice-detailsview.component.html',
//   styleUrl: './invoice-detailsview.component.css'
// })
// export class InvoiceDetailsviewComponent {

// }

import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
// import { SharedGridComponent } from '../../../../shared/AgGrid/grid/shared-grid/shared-grid.component';
// import { ToolbarComponent } from "../../../../shared/Components/toolbar/toolbar.component";
@Component({
  selector: 'app-invoice-detail-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-detailsview.component.html',
  styleUrl: './invoice-detailsview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush // Add ChangeDetectionStrategy for better performance
})
export class InvoiceDetailCardComponent implements OnInit {

  @Input() Id: string | undefined; // Input to receive the invoice ID
  invoiceData: any; // To store fetched invoice data
  loading: boolean = true; // Add a loading flag

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) { } // Inject ApiService and ChangeDetectorRef

  ngOnInit(): void {
    this.getCustomerdata()
  }

  getCustomerdata() {
    if (this.Id) {
      this.loading = true;
      this.apiService.getinvoiceDataWithId(this.Id).subscribe({
        next: (res: any) => {
          this.invoiceData = res.data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error fetching invoice data:', error);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      console.error('Invoice ID is missing!');
      this.loading = false;
    }
  }
}



// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// @Component({
//   selector: 'app-invoice-detailsview',
//   imports: [CommonModule, FormsModule],
//   templateUrl: './invoice-detailsview.component.html',
//   styleUrl: './invoice-detailsview.component.css'
// })
// export class InvoiceDetailsviewComponent {
//   // @Input() invoiceData: any;
//   invoiceData = {
//     "_id": "67a24dbfc762f5655f478a72",
//     "invoiceNumber": "INV-2025-006",
//     "invoiceDate": "2025-02-04T00:00:00.000Z",
//     "dueDate": "2025-02-14T00:00:00.000Z",
//     "seller": "67a238fb37ecc9087db9f52b",
//     "buyer": "678cc6e2ac1c4d9126b458ef",
//     "items": [
//       {
//         "product": "6787cc8facb090dbb35b773a",
//         "quantity": 2,
//         "discount": 50,
//         "rate": 1500,
//         "taxableValue": 3000,
//         "cgstRate": 9,
//         "sgstRate": 9,
//         "cgstAmount": 270,
//         "sgstAmount": 270,
//         "amount": 3540,
//         "_id": "67a24dbfc762f5655f478a73"
//       },
//       {
//         "product": "6787cc8facb090dbb35b773a",
//         "quantity": 1,
//         "discount": 0,
//         "rate": 2000,
//         "taxableValue": 2000,
//         "cgstRate": 6,
//         "sgstRate": 6,
//         "cgstAmount": 120,
//         "sgstAmount": 120,
//         "amount": 2240,
//         "_id": "67a24dbfc762f5655f478a74"
//       }
//     ],
//     "subTotal": 5000,
//     "totalDiscount": 50,
//     "igst": 0,
//     "cess": 0,
//     "totalAmount": 5730,
//     "paymentTerms": "Net 10 days",
//     "notes": "Thank you for your purchase!",
//     "placeOfSupply": "Maharashtra",
//     "status": "unpaid",
//     "metadata": {
//       "orderReference": "ORD-5678",
//       "paymentMethod": "UPI"
//     },
//     "createdAt": "2025-02-04T17:26:23.574Z",
//     "updatedAt": "2025-02-04T17:26:23.574Z",
//     "__v": 0,
//     "sellerDetails": {
//       "_id": "67a238fb37ecc9087db9f52b",
//       "name": "Aarav Sharma",
//       "shopname": "Sharma Electronics",
//       "address": "12B, Connaught Place, New Delhi 110001",
//       "gstin": "07ABCDE1234F1Z5",
//       "pan": "ABCDE1234F",
//       "contactNumber": "9876543210",
//       "createdAt": "2025-02-04T15:57:47.042Z",
//       "updatedAt": "2025-02-04T15:57:47.042Z",
//       "salesHistory": []
//     },
//     "buyerDetails": {
//       "cart": {
//         "items": []
//       },
//       "_id": "678cc6e2ac1c4d9126b458ef",
//       "status": "inactive",
//       "email": "msms5476m@gmail.com",
//       "fullname": "Manish Singh",
//       "phoneNumbers": [
//         {
//           "number": "7160966299",
//           "type": "home",
//           "primary": false,
//           "_id": "67a4f0372fd550a824ff8f71"
//         }
//       ],
//       "addresses": [
//         {
//           "street": "69 balaji green city near noorie media",
//           "city": "surat",
//           "state": "GUJARAT",
//           "zipCode": "394327",
//           "country": "India",
//           "type": "home",
//           "isDefault": false,
//           "_id": "67a4f0372fd550a824ff8f72"
//         }
//       ],
//       "guaranteerId": "6787cc8facb090dbb35b773a",
//       "totalPurchasedAmount": 0,
//       "remainingAmount": 0,
//       "paymentHistory": [],
//       "metadata": {},
//       "createdAt": "2025-01-19T09:33:22.830Z",
//       "updatedAt": "2025-02-06T17:24:24.643Z",
//       "profileImg": ""
//     },
//     "itemDetails": [
//       {
//         "dimensions": {
//           "width": 12,
//           "height": 12,
//           "depth": 21
//         },
//         "meta": {
//           "createdAt": "2025-01-15T14:55:08.861Z",
//           "updatedAt": "2025-01-15T14:55:08.861Z",
//           "barcode": "jdvj",
//           "qrCode": "sjnfaewnon"
//         },
//         "_id": "6787cc8facb090dbb35b773a",
//         "title": "manish singh nehal",
//         "description": "manish singh nehal",
//         "detailedDescriptions": [
//           {
//             "id": "1",
//             "detail": " sbeheb",
//             "_id": "6787cc8facb090dbb35b773b"
//           }
//         ],
//         "category": "manish",
//         "rate": 223,
//         "cgst": 9,
//         "sgst": 9,
//         "price": 12,
//         "discountPercentage": 12,
//         "ratingAverage": 1,
//         "ratingQuantity": 1,
//         "stock": 234,
//         "tags": [
//           "b'i;"
//         ],
//         "brand": "kjnbjk",
//         "sku": "kbbipu;",
//         "weight": 12,
//         "warrantyInformation": "kjbkjbkb",
//         "shippingInformation": "kbjkb",
//         "availabilityStatus": "In Stock",
//         "returnPolicy": "ubuibiubiu",
//         "minimumOrderQuantity": 12,
//         "images": [
//           {
//             "id": "1",
//             "detail": "n j ",
//             "link": "k'bib",
//             "_id": "6787cc8facb090dbb35b773c"
//           },
//           {
//             "id": "12",
//             "detail": "kjbnkjn",
//             "link": "nonb",
//             "_id": "6787cc8facb090dbb35b773d"
//           }
//         ],
//         "thumbnail": "manish",
//         "salesPerson": [
//           "manfiaquwb"
//         ],
//         "finalPrice": 10.56,
//         "id": "6787cc8facb090dbb35b773a"
//       },
//       {
//         "dimensions": {
//           "width": 12,
//           "height": 12,
//           "depth": 21
//         },
//         "meta": {
//           "createdAt": "2025-01-15T14:55:08.861Z",
//           "updatedAt": "2025-01-15T14:55:08.861Z",
//           "barcode": "jdvj",
//           "qrCode": "sjnfaewnon"
//         },
//         "_id": "6787cc8facb090dbb35b773a",
//         "title": "manish singh nehal",
//         "description": "manish singh nehal",
//         "detailedDescriptions": [
//           {
//             "id": "1",
//             "detail": " sbeheb",
//             "_id": "6787cc8facb090dbb35b773b"
//           }
//         ],
//         "category": "manish",
//         "rate": 223,
//         "cgst": 9,
//         "sgst": 9,
//         "price": 12,
//         "discountPercentage": 12,
//         "ratingAverage": 1,
//         "ratingQuantity": 1,
//         "stock": 234,
//         "tags": [
//           "b'i;"
//         ],
//         "brand": "kjnbjk",
//         "sku": "kbbipu;",
//         "weight": 12,
//         "warrantyInformation": "kjbkjbkb",
//         "shippingInformation": "kbjkb",
//         "availabilityStatus": "In Stock",
//         "returnPolicy": "ubuibiubiu",
//         "minimumOrderQuantity": 12,
//         "images": [
//           {
//             "id": "1",
//             "detail": "n j ",
//             "link": "k'bib",
//             "_id": "6787cc8facb090dbb35b773c"
//           },
//           {
//             "id": "12",
//             "detail": "kjbnkjn",
//             "link": "nonb",
//             "_id": "6787cc8facb090dbb35b773d"
//           }
//         ],
//         "thumbnail": "manish",
//         "salesPerson": [
//           "manfiaquwb"
//         ],
//         "finalPrice": 10.56,
//         "id": "6787cc8facb090dbb35b773a"
//       }
//     ],
//     "id": "67a24dbfc762f5655f478a72"
//   }
// }
