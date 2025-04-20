// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-customerdetails',
//   imports: [],
//   templateUrl: './customerdetails.component.html',
//   styleUrl: './customerdetails.component.css'
// })
// export class CustomerdetailsComponent {

// }
import { Component, HostBinding } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CustomerService } from '../../../../core/services/customer.service';
import { SelectModule } from 'primeng/select';
import { TabViewModule } from 'primeng/tabview';
import { PrimeIcons } from 'primeng/api';
// import * as lodash from 'lodash';
import { ProductService } from '../../../../core/services/product.service';
import { AppMessageService } from '../../../../core/services/message.service';
@Component({
  selector: 'app-customerdetails',
  standalone: true,
  imports: [CardModule, SelectModule, TableModule, TabViewModule, CommonModule, FormsModule],
  templateUrl: './customerdetails.component.html',
  styleUrl: './customerdetails.component.css',
  providers: [PrimeIcons],
})

export class CustomerdetailsComponent {
  @HostBinding('class.dark') darkMode = false;

  customerId!: string;
  customerIDDropdown: any[] = [];
  customer: any = null;
  products: any[] = [];
  activeTabIndex: number = 0;

  constructor(
    private ProductService: ProductService,
    private messageService: AppMessageService, // Inject AppMessageService
    private CustomerService: CustomerService, // Injected class
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.autopopulatedata();
  }

  autopopulatedata() {
    const autopopulate: any = JSON.parse(sessionStorage.getItem('autopopulate') || '{}');
    if (autopopulate && Array.isArray(autopopulate.customersdrop)) {
    } else {
      this.customerIDDropdown = [];
      this.messageService.showWarn('Warning', 'No valid customer dropdown data found'); // Use AppMessageService
    }
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
  }

  onTabChange(index: number) {
    this.activeTabIndex = index;
  }

  fetchCustomerData() {
    this.CustomerService.getCustomerDataWithId(this.customerId).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.customer = response.data;
          this.fetchProductDetails();
        } else if (response.status === 'fail') {
          this.messageService.showError('Error', response.message || 'Failed to load customer data.'); // Display error message from response, or generic message
        } else {
          this.messageService.showError('Error', 'Unexpected response status from server.'); // Handle unexpected status
          console.error('Unexpected response status:', response); // Log unexpected response for debugging
        }
      },
      error: (error: any) => {
        console.error('HTTP Error fetching customer data:', error);
        this.messageService.showError('Error', 'Failed to load customer data due to a network error.'); // Generic network error message
      }
    });
  }

  fetchProductDetails() {
    const productIds = this.customer.cart.items.map((item: any) => item.productId);
    if (productIds.length > 0) {
      this.ProductService.getProductDataWithId(productIds).subscribe(
        (response: any) => {
          this.products = response.data;
        },
        (error: any) => {
          console.error('Error fetching product details:', error);
          this.messageService.showError('Error', 'Failed to load product details.'); // Use AppMessageService
        }
      );
    }
  }
}

// Define the interface with a different name
// interface CustomerServiceInterface {
//   // getCustomerDataWithId(id: string): any;
//   getProductsByIds(ids: string[]): any;
// }
// import { Component, HostBinding, Input } from '@angular/core';
// import { CardModule } from 'primeng/card';
// import { TableModule } from 'primeng/table';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute } from '@angular/router';
// import { HttpClient } from '@angular/common/http';
// import { CustomerService } from '../../../../core/services/api.service';
// import { SelectModule } from 'primeng/select';
// import { TabViewModule } from 'primeng/tabview';
// import { PrimeIcons } from 'primeng/api';
// import lodash from 'lodash'
// @Component({
//   selector: 'app-customerdetails',
//   imports: [CardModule, SelectModule, TableModule, TabViewModule, CommonModule, FormsModule],
//   templateUrl: './customerdetails.component.html',
//   styleUrl: './customerdetails.component.css',
//   providers: [PrimeIcons] // Add PrimeIcons to providers if needed for component-level injection


// })
// export class CustomerdetailsComponent {
//   customerId!: string;
//   customerIDDropdown: any;
//   messageService: any;
//   selectedGuaranteer: any = ''

//   @HostBinding('class.dark') darkMode = false;
//   // @Input() customer: any; // Input to receive customer data
//   activeTabIndex: number = 0; // For TabView
//   toggleDarkMode() {
//     this.darkMode = !this.darkMode;
//   }

//   constructor(private route: ActivatedRoute, private CustomerService: CustomerService, private http: HttpClient) { }
//   ngOnInit(): void {
//     this.autopopulatedata()
//   }
//   autopopulatedata() {
//     const autopopulate: any = JSON.parse(sessionStorage.getItem('autopopulate') || '{}');
//     //     if (autopopulate && Array.isArray(autopopulate.customersdrop)) {
//       this.customerIDDropdown = lodash.cloneDeep(autopopulate.customersdrop)
//       //     } else {
//       this.customerIDDropdown = [];
//       this.messageService.add({
//         severity: 'info',
//         summary: 'Info',
//         detail: 'No valid customer data found',
//         life: 3000
//       });
//     }
//   }


//   onTabChange(index: number) {
//     this.activeTabIndex = index;
//   }

//   public customer: any

//   data: any = {
//     _id: "678cc6e2ac1c4d9126b458ef",
//     status: "inactive",
//     profileImg: "",
//     email: "msms5476m@gmail.com",
//     fullname: "Manish Singh",
//     phoneNumbers: [
//       { number: "7160966299", type: "home", primary: false }
//     ],
//     addresses: [
//       { street: "69 balaji green city near noorie media", city: "surat", state: "GUJARAT", zipCode: "394327", country: "India", type: "home" }
//     ],
//     guaranteerId: "6787cc8facb090dbb35b773a",
//     totalPurchasedAmount: 0,
//     remainingAmount: 0,
//     cart: { items: [] },
//     paymentHistory: [],
//     createdAt: "2025-01-19T09:33:22.830Z",
//     updatedAt: "2025-02-06T17:24:24.643Z"
//   };


//   fetchCustomerData() {
//     this.CustomerService.getCustomerDataWithId(this.customerId).subscribe(
//       (response) => {
//         this.customer = response.data;
//         //       },
//       (error) => {
//         console.error('Error fetching customer data:', error);
//       }
//     );
//   }
// }