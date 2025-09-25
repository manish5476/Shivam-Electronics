// 1. The Component TypeScript - Your original logic is preserved and adapted for the new UI
// File: src/app/Modules/customer/components/customer-detailed-list/customer-detailed-list.component.ts

import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { AvatarModule } from 'primeng/avatar';
import {  DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { SkeletonModule } from 'primeng/skeleton';
import { TabsModule, Tabs, TabList, Tab, TabPanels } from 'primeng/tabs';
// App Components & Services
import { InvoicePrintComponent } from "../../../billing/components/invoice-print/invoice-print.component";
import { CustomerService } from '../../../../core/services/customer.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { AutopopulateService } from '../../../../core/services/autopopulate.service';
import { CommonMethodService } from '../../../../core/Utils/common-method.service';
// PrimeNG Modules
import { ChipModule } from "primeng/chip"
import { ProgressBarModule } from "primeng/progressbar"
import { CustomerSnapshotComponent } from "../../customer-snapshot/customer-snapshot.component";
import { BadgeModule } from 'primeng/badge';
import { trigger, transition, style, animate } from '@angular/animations';
import { Panel } from "primeng/panel";

@Component({
  selector: 'app-customer-detailed-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // PrimeNG
    ButtonModule,
    CardModule,
    ToastModule,
    SelectModule,
    AvatarModule,
    TagModule,
    TimelineModule,
    SkeletonModule,
    ChipModule,
    ProgressBarModule,
    BadgeModule,
    // ✅ Use only the new Tabs API (remove TabViewModule completely)
    TabsModule,
    // ✅ Dialog should be imported as a module
    DialogModule,
    // Your own components
    CustomerSnapshotComponent,
    Panel
],
  templateUrl: './customer-detailed-list.component.html',
  styleUrls: ['./customer-detailed-list.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ],
  providers: [MessageService]
})

export class CustomerDetailedListComponent implements OnInit {
  isLoading: boolean = true;
  customer: any;
  customerId: string = '';
  customerIDDropdown: any[] = [];
  activeTab: any
  // Dialog state
  displayInvoiceDialog: boolean = false;
  invoiceIdForDialog: any;
  dynamicComponent: any = InvoicePrintComponent;
  showCustomer:any= false
  constructor(
    private customerService: CustomerService,
    private autoPopulate: AutopopulateService,
    private cdr: ChangeDetectorRef,
    private loadingService: LoadingService,
    public commonMethod: CommonMethodService
  ) { }

  ngOnInit(): void {
    this.autopopulatedata();
  }

  autopopulatedata() {
    this.autoPopulate.getModuleData('customers').subscribe((data: any) => {
      this.customerIDDropdown = data.map((cust: any) => ({
        fullname: cust.fullname,
        _id: cust._id
      }));
      // Optionally, load the first customer by default
      if (this.customerIDDropdown.length > 0) {
        this.customerId = this.customerIDDropdown[0]._id;
        this.getCustomerDetail();
      } else {
        this.isLoading = false;
      }
    });
  }

  getCustomerDetail(): void {
    if (!this.customerId) return;
    this.isLoading = true;
    this.loadingService.show();

    this.customerService.getCustomerDataWithId(this.customerId).subscribe({
      next: (res: any) => {
        this.customer = res.data;
        this.isLoading = false;
        this.loadingService.hide();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error fetching customer data:', error);
        this.isLoading = false;
        this.loadingService.hide();
      }
    });
  }

  openInvoiceDialog(invoiceId: any) {
    this.invoiceIdForDialog = invoiceId;
    this.displayInvoiceDialog = true;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }
  getStatusSeverity(status: string) {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warn';
      case 'delivered':
      case 'paid':
        return 'success';
      case 'cancelled': return 'danger';
      default: return 'info';
    }
  }

  getTotalUnpaidAmount(): number {
    if (!this.customer?.cart?.items) return 0
    return this.customer.cart.items.reduce((total: number, item: any) => {
      const unpaidInvoices = item.invoiceIds?.filter((invoice: any) => invoice.status === "unpaid") || []
      return total + unpaidInvoices.reduce((sum: number, invoice: any) => sum + invoice.totalAmount, 0)
    }, 0)
  }

  getPaymentSuccessRate(): number {
    if (!this.customer?.paymentHistory?.length) return 0
    const completedPayments = this.customer.paymentHistory.filter((p: any) => p.status === "completed").length
    return Math.round((completedPayments / this.customer.paymentHistory.length) * 100)
  }

  toggleTheme(themeName: string): void {
    // Remove existing theme classes
    const themeClasses = [
      "theme-blue",
      "theme-red",
      "theme-green",
      "theme-purple",
      "theme-orange",
      "theme-teal",
      "theme-pink",
      "theme-indigo",
    ]
    themeClasses.forEach((cls) => document.body.classList.remove(cls))

    // Add new theme class
    document.body.classList.add(`theme-${themeName}`)
  }

  toggleDarkMode(): void {
    document.body.classList.toggle("dark-mode")
  }
}

