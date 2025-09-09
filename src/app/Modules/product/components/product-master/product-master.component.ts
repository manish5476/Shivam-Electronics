import { Component, Inject, Input, PLATFORM_ID, SimpleChanges, OnInit } from '@angular/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { ProductService } from '../../../../core/services/product.service';
import { SelectModule } from 'primeng/select';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmationService, MessageService } from 'primeng/api';
import lodash from 'lodash';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { Toast } from "primeng/toast";
import {
  STOCK_STATUS
} from '../../../../interfaces/master-list.component';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { AvatarModule } from 'primeng/avatar';

interface Product {
  _id?: string;
  title: string;
  description: string;
  category: string;
  tags: string[] | string;
  brand: string;
  sku: string;
  thumbnail: string;
  rate: number;
  price?: number;
  gstRate: number;
  discountPercentage?: number;
  stock: number;
  availabilityStatus: 'In Stock'| 'Low Stock'| 'Out of Stock';
  finalPrice?: number;
  reviews?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

@Component({
  selector: 'app-product-master',
  standalone: true,
  imports: [
    FloatLabelModule,
    SelectModule,
    DropdownModule,
    FormsModule,
    CommonModule,
    RouterModule,AvatarModule,
    InputTextModule,
    TextareaModule,FileUpload,
FileUploadModule,
    ButtonModule,
    Toast
  ],
  templateUrl: './product-master.component.html',
  styleUrl: './product-master.component.css',
  providers: [ConfirmationService, MessageService]
})
export class ProductMasterComponent implements OnInit {
  isDarkMode = false;

  product: Product = {
    title: '',
    description: '',
    category: '',
    tags: [],
    brand: '',
    sku: '',
    thumbnail: '',
    rate: 0,
    gstRate: 18,
    discountPercentage: 0,
    stock: 0,
    availabilityStatus: 'In Stock'
  };

  @Input() redirectedData: any;
  public productsForDropdown: any[] = [];
  public selectedProductId: string | null = null;
  public availabilityOptions = STOCK_STATUS;

  constructor(
    private productService: ProductService,
    private autoPopulate: AutopopulateService,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark', this.isDarkMode);
    }
    this.autopopulatedata();
  }

  autopopulatedata() {
    this.autoPopulate.getModuleData('products').subscribe((data: any) => {
      this.productsForDropdown = data;
    });
  }

  calculatePrice() {
    if (this.product?.rate != null && this.product?.gstRate != null) {
      this.product.price = this.product.rate + (this.product.rate * this.product.gstRate) / 100;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['redirectedData'] && this.redirectedData) {
      this.product = { ...this.product, ...this.redirectedData };
    }
  }

  updateProduct() {
    if (!this.selectedProductId) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No product selected for update.', life: 3000 });
      return;
    }

    const payload = { ...this.product };
    if (typeof payload.tags === 'string') {
      payload.tags = payload.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    }

    this.productService.updateProduct(this.selectedProductId, payload).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product updated successfully!', life: 3000 });
        this.product = res.data || res;
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update product. ' + (err.error?.message || err.message), life: 3000 });
      }
    });
  }

  fetchProductDetails() {
    if (this.selectedProductId) {
      this.productService.getProductDataWithId(this.selectedProductId).subscribe({
        next: (res: any) => {
          if (res && res.data) {
            this.product = res.data;
            if (Array.isArray(res.data.tags)) {
              this.product.tags = res.data.tags.join(', ');
            }
            this.messageService.add({ severity: 'info', summary: 'Fetched', detail: 'Product data loaded.', life: 3000 });
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch product data.', life: 3000 });
        }
      });
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    this.product = {
      title: '',
      description: '',
      category: '',
      tags: [],
      brand: '',
      sku: '',
      thumbnail: '',
      rate: 0,
      gstRate: 18,
      discountPercentage: 0,
      stock: 0,
      availabilityStatus: 'In Stock'
    };
    this.selectedProductId = null;
  }

  submitProduct() {
    const payload = { ...this.product };
    if (typeof payload.tags === 'string') {
      payload.tags = payload.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    }

    this.productService.createNewProduct(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product created successfully!', life: 3000 });
        this.resetForm();
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create product. ' + (err.error?.message || err.message), life: 3000 });
      }
    });
  }

  handleProductFileUpload(event: any): void {
    const file = event.files[0];
    if (!file || !this.selectedProductId) return;

    const formData = new FormData();
    formData.append('productImg', file);

    this.productService.uploadProductImage(formData, this.selectedProductId).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          const newImageUrl = res.data.product.thumbnail; // 🔑 use thumbnail field
          this.product.thumbnail = newImageUrl + '?t=' + new Date().getTime();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product image updated!' });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload product image.' });
      }
    });
  }
}

// import { Component, Inject, Input, PLATFORM_ID, SimpleChanges, OnInit } from '@angular/core';
// import { FloatLabelModule } from 'primeng/floatlabel';
// import { FormsModule } from '@angular/forms';
// import { RouterModule } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { InputTextModule } from 'primeng/inputtext';
// import { ButtonModule } from 'primeng/button';
// import { TextareaModule } from 'primeng/textarea';
// import { ProductService } from '../../../../core/services/product.service';
// import { Select, SelectModule } from 'primeng/select'; // Assuming p-select is from primeng/select or similar
// import { DropdownModule } from 'primeng/dropdown'; // For availabilityStatus
// import { ConfirmationService, MessageService } from 'primeng/api';
// import lodash from 'lodash';
// import { AutopopulateService } from '../../../../core/services/autopopulate.service';
// import { Toast } from "primeng/toast";
// import {
//   PRODUCT_TYPES, PRODUCT_BRANDS, PRODUCT_STATUS, PAYMENT_STATUS, ORDER_STATUS, DELIVERY_STATUS, STOCK_STATUS, CUSTOMER_TYPES, USER_ROLES, SHIPPING_METHODS, RATINGS
// } from '../../../../interfaces/master-list.component'; 

// interface Product {
//   _id?: string;
//   title: string;
//   slug?: string; // Auto-generated by backend
//   description: string;
//   category: string;
//   tags: string[]; // Input as comma-separated string, convert in service/onSubmit if needed
//   brand: string;
//   sku: string;
//   thumbnail: string;
//   rate: number;
//   price?: number; // Calculated by backend (rate + gstAmount)
//   gstRate: number;
//   discountPercentage?: number;
//   stock: number;
//   availabilityStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
//   finalPrice?: number; // Virtual, read-only from backend
//   reviews?: any[]; // Virtual, populated from backend
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// @Component({
//   selector: 'app-product-master',
//   standalone: true,
//   imports: [
//     FloatLabelModule,
//     SelectModule,
//     DropdownModule,
//     FormsModule,
//     CommonModule,
//     RouterModule,
//     InputTextModule,
//     TextareaModule,
//     ButtonModule,
//     Toast
//   ],
//   templateUrl: './product-master.component.html',
//   styleUrl: './product-master.component.css',
//   providers: [ConfirmationService, MessageService]
// })
// export class ProductMasterComponent implements OnInit {
//   isDarkMode: boolean = false; // Default to light mode

//   product: Product = {
//     title: '',
//     description: '',
//     category: '',
//     tags: [],
//     brand: '',
//     sku: '',
//     thumbnail: '',
//     rate: 0,
//     // price: 0, // Will be calculated/fetched or set by backend logic
//     gstRate: 18, // Default from schema
//     discountPercentage: 0, // Default from schema
//     stock: 0,
//     availabilityStatus: 'In Stock', // Default from schema
//   };

//   @Input() redirectedData: any;
//   public productdata: any;
//   public productdropdwn: any[] = [];
//   public selectedProductId: any;
//   public availabilityOptions = STOCK_STATUS
//   public productsForDropdown: any[] = [];
//   constructor(
//     private productService: ProductService,
//     private autoPopulate: AutopopulateService,
//     private messageService: MessageService,
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) { }

//   ngOnInit() {
//     if (typeof document !== 'undefined') {
//       document.body.classList.toggle('dark', this.isDarkMode);
//     }
//     this.autopopulatedata();
//   }

  
//   autopopulatedata() {
//     // this.autoPopulate.getModuleData('products').subscribe((data:any) => {
//     //   this.productdrop = data;
//     // });
//     // this.autoPopulate.getModuleData('sellers').subscribe((data:any) => {
//     //   this.sellersDrop = data;
//     // });
//     this.autoPopulate.getModuleData('products').subscribe((data: any) => {
//       this.productsForDropdown = data;
//     });
//   }

//   calculatePrice() {
//     if (this.product?.rate != null && this.product?.gstRate != null) {
//       this.product.price = this.product.rate + (this.product.rate * this.product.gstRate) / 100;
//     }
//   }

//   toggleDarkMode() {
//     this.isDarkMode = !this.isDarkMode;
//     if (typeof document !== 'undefined') {
//       document.body.classList.toggle('dark', this.isDarkMode);
//     }
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['redirectedData'] && this.redirectedData) {
//       this.product = { ...this.product, ...this.redirectedData };
//     }
//   }

//   updateProduct() {
//     if (!this.selectedProductId) {
//       this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No product selected for update.', life: 3000 });
//       return;
//     }

//     const payload = { ...this.product };
//     if (typeof payload.tags === 'string') {
//       payload.tags = (payload.tags as unknown as string).split(',').map(tag => tag.trim()).filter(tag => tag !== '');
//     }

//     this.productService.updateProduct(this.selectedProductId, payload).subscribe({
//       next: (res: any) => {
//         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product updated successfully!', life: 3000 });
//         this.product = res.data || res; // Assuming response contains the updated product
//       },
//       error: (err: any) => {
//         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update product. ' + (err.error?.message || err.message), life: 3000 });
//         console.error('Error updating product:', err);
//       }
//     });
//   }

//   fetchProductDetails() {
//     if (this.selectedProductId) {
//       this.productService.getProductDataWithId(this.selectedProductId).subscribe({
//         next: (res: any) => {
//           if (res && res.data) {
//             this.product = res.data;
//             // Handle tags: if it's an array, join for display in text input, or use a chip component
//             if (Array.isArray(res.data.tags)) {
//               this.product.tags = res.data.tags.join(', ') as any; // Temporarily cast for ngModel if input is text
//             }
//             this.messageService.add({ severity: 'info', summary: 'Fetched', detail: 'Product data loaded.', life: 3000 });
//           } else {
//             this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No data found for the selected product.', life: 3000 });
//           }
//         },
//         error: (error: any) => {
//           this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch product data.', life: 3000 });
//           console.error('Error fetching product data:', error);
//         }
//       });
//     } else {
//       this.resetForm();
//       this.messageService.add({ severity: 'info', summary: 'Info', detail: 'No product selected. Form reset.', life: 3000 });
//     }
//   }

//   resetForm() {
//     this.product = {
//       title: '',
//       description: '',
//       category: '',
//       tags: [],
//       brand: '',
//       sku: '',
//       thumbnail: '',
//       rate: 0,
//       gstRate: 18,
//       discountPercentage: 0,
//       stock: 0,
//       availabilityStatus: 'In Stock',
//     };
//     this.selectedProductId = null;
//   }


//   submitProduct() {
//     // Ensure tags are an array if input is string
//     const payload = { ...this.product };
//     if (typeof payload.tags === 'string') {
//       payload.tags = (payload.tags as unknown as string).split(',').map(tag => tag.trim()).filter(tag => tag !== '');
//     } else if (!Array.isArray(payload.tags)) {
//       payload.tags = [];
//     }


//     this.productService.createNewProduct(payload).subscribe({
//       next: (res: any) => {
//         this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product created successfully!', life: 3000 });
//         // Optionally reset form or navigate
//         this.resetForm();
//       },
//       error: (err: any) => {
//         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create product. ' + (err.error?.message || err.message), life: 3000 });
//         console.error('Error creating product:', err);
//       }
//     });
//   }

//   handleProductFileUpload(event: any): void {
//   const file = event.files[0];
//   if (!file || !this.selectedProductId) return;

//   const formData = new FormData();
//   formData.append('productImg', file);

//   this.productService.uploadProductImage(formData, this.selectedProductId).subscribe({
//     next: (res) => {
//       if (res.status === 'success') {
//         const newImageUrl = res.data.product.image;
//         this.displayProduct.image = newImageUrl + '?t=' + new Date().getTime(); // cache-bust
//         this.productForm.patchValue({ thumbnail: newImageUrl });
//         // this.messageService.('Success', 'Product image updated!');
//       }
//     },
//     error: () => {
//       this.messageService.showError('Error', 'Failed to upload product image.');
//     },
//   });
// }

// }