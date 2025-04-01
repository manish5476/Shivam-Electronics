// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatCardModule } from '@angular/material/card';
// import { MatGridListModule } from '@angular/material/grid-list';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSelectModule } from '@angular/material/select';
// import { FormsModule } from '@angular/forms';
// import { CommonmethodsComponent } from '../../../../shared/Common/commonmethods/commonmethods.component';
// import { CommonMethodServiceService } from '../../../../core/services/common-method-service.service';
// import { AnalyticsService, SalesPerformance } from '../../../../core/services/analytics.service';

// interface Product {
//   _id: string;
//   title: string;
//   description: string;
//   thumbnail: string;
//   price: number;
//   finalPrice: number | null;
//   id: string;
// }

// interface Invoice {
//   _id: string;
//   invoiceNumber: string;
//   invoiceDate: string;
//   totalAmount: number;
//   status: string;
//   sellerDetails: any;
//   buyerDetails: any;
//   itemDetails: any[];
//   id: string;
// }

// interface CartItem {
//   productId: Product;
//   invoiceIds: Invoice[];
//   _id: string;
// }

// interface Cart {
//   items: CartItem[];
// }

// interface FilterOptions {
//   productId?: string;
//   invoiceStatus?: string;
//   dateRange?: {
//     startDate: string;
//     endDate: string;
//   };
// }

// @Component({
//   selector: 'app-sales-performace',
//   standalone: true,
//   imports: [
//     CommonModule, 
//     MatCardModule, 
//     MatGridListModule, 
//     MatProgressSpinnerModule,
//     MatFormFieldModule,
//     MatSelectModule,
//     FormsModule
//   ],
//   template: `
//     <mat-card>
//       <mat-card-content>
//         <h2>Sales Performance</h2>
        
//         <!-- Filter Section -->
//         <div class="filter-section">
//           <mat-form-field>
//             <mat-label>Product</mat-label>
//             <mat-select [(ngModel)]="selectedProduct" (selectionChange)="applyFilters()">
//               <mat-option [value]="null">All Products</mat-option>
//               <mat-option *ngFor="let product of products" [value]="product._id">
//                 {{product.title}}
//               </mat-option>
//             </mat-select>
//           </mat-form-field>

//           <mat-form-field>
//             <mat-label>Invoice Status</mat-label>
//             <mat-select [(ngModel)]="selectedStatus" (selectionChange)="applyFilters()">
//               <mat-option [value]="null">All Status</mat-option>
//               <mat-option value="paid">Paid</mat-option>
//               <mat-option value="unpaid">Unpaid</mat-option>
//             </mat-select>
//           </mat-form-field>
//         </div>

//         <div *ngIf="loading" class="loading-container">
//           <mat-spinner></mat-spinner>
//         </div>
//         <div *ngIf="!loading && data" class="grid-container">
//           <div class="grid-item">
//             <h3>Total Sales</h3>
//             <p>{{ commonMethod.formatCurrency(data.totalSales) }}</p>
//           </div>
//           <div class="grid-item">
//             <h3>Average Order Value</h3>
//             <p>{{ commonMethod.formatCurrency(data.averageOrderValue) }}</p>
//           </div>
//           <div class="grid-item">
//             <h3>Total Orders</h3>
//             <p>{{ data.totalOrders }}</p>
//           </div>
//           <div class="grid-item">
//             <h3>Unique Customers</h3>
//             <p>{{ data.uniqueCustomerCount }}</p>
//           </div>
//         </div>
//       </mat-card-content>
//     </mat-card>
//   `,
//   styles: [`
//     .loading-container {
//       display: flex;
//       justify-content: center;
//       align-items: center;
//       min-height: 200px;
//     }
//     .grid-container {
//       display: grid;
//       grid-template-columns: repeat(2, 1fr);
//       gap: 1rem;
//       padding: 1rem;
//     }
//     .grid-item {
//       text-align: center;
//       padding: 1rem;
//       background-color: #f5f5f5;
//       border-radius: 4px;
//     }
//     h2 {
//       margin: 0;
//       padding: 1rem;
//       color: #333;
//     }
//     h3 {
//       margin: 0;
//       font-size: 1rem;
//       color: #666;
//     }
//     p {
//       margin: 0.5rem 0 0;
//       font-size: 1.5rem;
//       font-weight: bold;
//       color: #333;
//     }
//     .filter-section {
//       display: flex;
//       gap: 1rem;
//       padding: 1rem;
//     }
//     mat-form-field {
//       min-width: 200px;
//     }
//   `]
// })
// export class SalesPerformaceComponent implements OnInit {
//   data: SalesPerformance | null = null;
//   loading = true;
//   products: Product[] = [];
//   selectedProduct: string | null = null;
//   selectedStatus: string | null = null;

//   constructor(
//     private analyticsService: AnalyticsService,
//     public commonMethod: CommonMethodServiceService
//   ) {}

//   ngOnInit(): void {
//     this.loadData();
//   }

//   private loadData(): void {
//     const today = new Date();
//     const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//     const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

//     const filterOptions: FilterOptions = {
//       dateRange: {
//         startDate: startOfMonth.toISOString().split('T')[0],
//         endDate: endOfMonth.toISOString().split('T')[0]
//       }
//     };

//     if (this.selectedProduct) {
//       filterOptions.productId = this.selectedProduct;
//     }

//     if (this.selectedStatus) {
//       filterOptions.invoiceStatus = this.selectedStatus;
//     }

//     this.analyticsService.getSalesPerformance(filterOptions).subscribe({
//       next: (response: { data: any; }) => {
//         this.data = response.data;
//         this.loading = false;
//       },
//       error: (error: any) => {
//         console.error('Error fetching sales performance:', error);
//         this.loading = false;
//       }
//     });
//   }

//   applyFilters(): void {
//     this.loading = true;
//     this.loadData();
//   }
// } 