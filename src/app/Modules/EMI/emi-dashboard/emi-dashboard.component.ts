// src/app/Modules/EMI/emi-dashboard/emi-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { EmiPaymentPayload, EmiService } from '../../../core/services/emi.service';

interface Installment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  _id: string;
  emiId?: string;
}

interface EmiPlan {
  _id: string;
  customer: { fullname: string };
  invoice: string;
  invoiceNumber?: string;
  totalAmount: number;
  numberOfInstallments: number;
  startDate: string;
  installments: Installment[];
  status: string;
}

interface Payment {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
  transactionId: string;
  customerId: string;
  description?: string;
}

interface EmiReport {
  dueToday: EmiPlan[];
  overdue: EmiPlan[];
  upcoming: EmiPlan[];
  payments: Payment[]
}

interface PaymentMethod {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-emi-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    ButtonModule,
    CardModule,
    BadgeModule,
    TooltipModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ToastModule,
    DropdownModule,
    CurrencyPipe,
    DatePipe
  ],
  providers: [MessageService],
  templateUrl: './emi-dashboard.component.html',
  styleUrl: './emi-dashboard.component.css'
})
export class EmiDashboardComponent implements OnInit {
  report: EmiReport = { dueToday: [], overdue: [], upcoming: [], payments: [] };
  loading = true;
  creating = false;
  paymentSuccess = false;

  // Payment Dialog
  paymentDialog = false;
  selectedInstallment!: Installment;
  paymentForm: EmiPaymentPayload = { paymentMethod: 'upi' };

  paymentMethods: PaymentMethod[] = [
    { label: 'UPI', value: 'upi', icon: 'pi pi-mobile' },
    { label: 'Card', value: 'card', icon: 'pi pi-credit-card' },
    { label: 'Cash', value: 'cash', icon: 'pi pi-money-bill' },
    { label: 'Bank Transfer', value: 'bank_transfer', icon: 'pi pi-building' }
  ];

  constructor(
    private emiService: EmiService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.loading = true;
    this.emiService.getEmiStatusReport().subscribe({
      next: (res: any) => {
        this.report.dueToday = res.data.dueToday;
        this.report.overdue = res.data.overdue;
        this.calculateUpcoming();
        this.extractPayments();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Failed to load EMI report' });
      }
    });
  }

  calculateUpcoming() {
    const today = new Date();
    const next7 = new Date(today);
    next7.setDate(today.getDate() + 7);

    const upcomingInstallments = this.report.dueToday
      .flatMap(emi => emi.installments.map(inst => ({ ...inst, emiId: emi._id })))
      .filter(inst => {
        const due = new Date(inst.dueDate);
        return due > today && due <= next7 && inst.status === 'pending';
      });

    const grouped = upcomingInstallments.reduce((acc: any, inst) => {
      const emi = this.report.dueToday.find(e => e._id === inst.emiId);
      if (emi) {
        if (!acc[emi._id]) acc[emi._id] = { ...emi, installments: [] };
        acc[emi._id].installments.push(inst);
      }
      return acc;
    }, {});

    this.report.upcoming = Object.values(grouped);
  }

  extractPayments() {
    const payments: Payment[] = [];
    this.report.dueToday.forEach(emi => {
      emi.installments.forEach(inst => {
        if (inst.status === 'paid') {
          payments.push({
            _id: inst._id + '-pay',
            amount: inst.amount,
            status: 'completed',
            createdAt: new Date().toISOString(),
            transactionId: 'TX-' + Math.random().toString(36).substr(2, 9),
            customerId: emi.customer.fullname
          });
        }
      });
    });
    this.report.payments = payments.slice(0, 5);
  }

  openPaymentDialog(installment: Installment) {
    const emi = [...this.report.dueToday, ...this.report.overdue].find(e =>
      e.installments.some(i => i._id === installment._id)
    );
    if (!emi) return;

    this.selectedInstallment = { ...installment, emiId: emi._id };
    this.paymentForm = { paymentMethod: 'upi' };
    this.paymentSuccess = false;
    this.paymentDialog = true;
  }

  submitPayment() {
    if (!this.selectedInstallment.emiId || this.creating) return;

    this.creating = true;
    this.paymentSuccess = false;

    this.emiService
      .recordEmiPayment(this.selectedInstallment.emiId, this.selectedInstallment._id, this.paymentForm)
      .subscribe({
        next: () => {
          this.creating = false;
          this.paymentSuccess = true;
          this.messageService.add({
            severity: 'success',
            summary: 'Payment Recorded',
            detail: `₹${this.selectedInstallment.amount} paid successfully!`
          });
          setTimeout(() => {
            this.paymentDialog = false;
            this.loadReport();
          }, 1500);
        },
        error: () => {
          this.creating = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Payment Failed',
            detail: 'Please try again.'
          });
        }
      });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    this.messageService.add({ severity: 'info', summary: 'Copied!', life: 1000 });
  }

  // === HELPERS ===
  getSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'danger';
      default: return 'info';
    }
  }

  getCustomerName(installment: Installment): string {
    const emi = [...this.report.dueToday, ...this.report.overdue, ...(this.report.upcoming || [])]
      .find(e => e.installments.some(i => i._id === installment._id));
    return emi?.customer?.fullname || 'Unknown';
  }

  getInvoiceNumber(installment: Installment): string {
    const emi = [...this.report.dueToday, ...this.report.overdue, ...(this.report.upcoming || [])]
      .find(e => e.installments.some(i => i._id === installment._id));
    return emi?.invoiceNumber || 'N/A';
  }

  getDaysOverdue(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 0;
  }

  getDueTodayCount(): number {
    const today = new Date();
    return this.report.dueToday
      .flatMap(e => e.installments)
      .filter(i => new Date(i.dueDate).toDateString() === today.toDateString() && i.status === 'pending')
      .length;
  }

  getUpcomingCount(): number {
    return (this.report.upcoming || [])
      .flatMap(e => e.installments)
      .filter(i => i.status === 'pending')
      .length;
  }

  getOverdueCount(): number {
    return this.report.overdue
      .flatMap(e => e.installments)
      .filter(i => i.status === 'pending')
      .length;
  }

  getDueTodayInstallments(): Installment[] {
    const today = new Date();
    return this.report.dueToday
      .flatMap(e => e.installments)
      .filter(i => new Date(i.dueDate).toDateString() === today.toDateString() && i.status === 'pending');
  }

  getUpcomingInstallments(): Installment[] {
    return (this.report.upcoming || [])
      .flatMap(e => e.installments)
      .filter(i => i.status === 'pending');
  }

  getOverdueInstallments(): Installment[] {
    return this.report.overdue
      .flatMap(e => e.installments)
      .filter(i => i.status === 'pending');
  }
}


// // src/app/Modules/EMI/emi-dashboard/emi-dashboard.component.ts
// import { Component, OnInit } from '@angular/core';
// import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
// import { TableModule } from 'primeng/table';
// import { TagModule } from 'primeng/tag';
// import { ButtonModule } from 'primeng/button';
// import { CardModule } from 'primeng/card';
// import { BadgeModule } from 'primeng/badge';
// import { TooltipModule } from 'primeng/tooltip';
// import { DialogModule } from 'primeng/dialog';
// import { InputTextModule } from 'primeng/inputtext';
// import { FormsModule } from '@angular/forms';
// import { MessageService } from 'primeng/api';
// import { ToastModule } from 'primeng/toast';
// import { EmiPaymentPayload, EmiService } from '../../../core/services/emi.service';

// interface Installment {
//   installmentNumber: number;
//   dueDate: string;
//   amount: number;
//   status: 'pending' | 'paid' | 'overdue';
//   _id: string;
//   emiId?: string;
// }

// interface EmiPlan {
//   _id: string;
//   customer: { fullname: string };
//   invoice: string;
//   invoiceNumber?: string;
//   totalAmount: number;
//   numberOfInstallments: number;
//   startDate: string;
//   installments: Installment[];
//   status: string;
// }

// interface Payment {
//   _id: string;
//   amount: number;
//   status: string;
//   createdAt: string;
//   transactionId: string;
//   customerId: string;
//   description?: string;
// }

// interface EmiReport {
//   dueToday: EmiPlan[];
//   overdue: EmiPlan[];
//   upcoming: EmiPlan[];
//   payments: Payment[]
// }

// @Component({
//   selector: 'app-emi-dashboard',
//   standalone: true,
//   imports: [
//     CommonModule,
//     TableModule,
//     TagModule,
//     ButtonModule,
//     CardModule,
//     BadgeModule,
//     TooltipModule,
//     DialogModule,
//     InputTextModule,
//     FormsModule,
//     ToastModule,
//     CurrencyPipe,
//     DatePipe
//   ],
//   providers: [MessageService],
//   templateUrl: './emi-dashboard.component.html',
//   styleUrl: './emi-dashboard.component.css'
// })
// export class EmiDashboardComponent implements OnInit {
//   report: EmiReport = { dueToday: [], overdue: [], upcoming: [], payments: [] };
//   loading = true;

//   // Payment Dialog
//   paymentDialog = false;
//   selectedInstallment!: Installment;
//   paymentForm: EmiPaymentPayload = { paymentMethod: 'upi' };

//   constructor(
//     private emiService: EmiService,
//     private messageService: MessageService
//   ) {}

//   ngOnInit() {
//     this.loadReport();
//   }

//   loadReport() {
//     this.loading = true;
//     this.emiService.getEmiStatusReport().subscribe({
//       next: (res: any) => {
//         this.report.dueToday = res.data.dueToday;
//         this.report.overdue = res.data.overdue;
//         this.calculateUpcoming();
//         this.extractPayments();
//         this.loading = false;
//       },
//       error: () => {
//         this.loading = false;
//         this.messageService.add({ severity: 'error', summary: 'Failed to load EMI report' });
//       }
//     });
//   }

//   // === UPCOMING EMIs (Next 7 days) ===
//   calculateUpcoming() {
//     const today = new Date();
//     const next7 = new Date(today);
//     next7.setDate(today.getDate() + 7);

//     const upcomingInstallments = this.report.dueToday
//       .flatMap(emi => emi.installments.map(inst => ({ ...inst, emiId: emi._id })))
//       .filter(inst => {
//         const due = new Date(inst.dueDate);
//         return due > today && due <= next7 && inst.status === 'pending';
//       });

//     // Group by EMI plan
//     const grouped = upcomingInstallments.reduce((acc: any, inst) => {
//       const emi = this.report.dueToday.find(e => e._id === inst.emiId);
//       if (emi) {
//         if (!acc[emi._id]) acc[emi._id] = { ...emi, installments: [] };
//         acc[emi._id].installments.push(inst);
//       }
//       return acc;
//     }, {});

//     this.report.upcoming = Object.values(grouped);
//   }

//   // === EXTRACT PAYMENTS ===
//   extractPayments() {
//     const payments: Payment[] = [];
//     this.report.dueToday.forEach(emi => {
//       emi.installments.forEach(inst => {
//         if (inst.status === 'paid') {
//           // Simulate payment from history or fetch separately
//           payments.push({
//             _id: inst._id + '-pay',
//             amount: inst.amount,
//             status: 'completed',
//             createdAt: new Date().toISOString(),
//             transactionId: 'TX-' + Math.random().toString(36).substr(2, 9),
//             customerId: emi.customer.fullname
//           });
//         }
//       });
//     });
//     this.report.payments = payments.slice(0, 5); // Last 5
//   }

//   // === PAYMENT DIALOG ===
//   openPaymentDialog(installment: Installment) {
//     const emi = [...this.report.dueToday, ...this.report.overdue].find(e =>
//       e.installments.some(i => i._id === installment._id)
//     );
//     if (!emi) return;

//     this.selectedInstallment = { ...installment, emiId: emi._id };
//     this.paymentForm = { paymentMethod: 'upi' };
//     this.paymentDialog = true;
//   }

//   submitPayment() {
//     if (!this.selectedInstallment.emiId) return;

//     this.emiService
//       .recordEmiPayment(this.selectedInstallment.emiId, this.selectedInstallment._id, this.paymentForm)
//       .subscribe({
//         next: () => {
//           this.messageService.add({
//             severity: 'success',
//             summary: 'Payment Recorded',
//             detail: `₹${this.selectedInstallment.amount} paid successfully!`
//           });
//           this.paymentDialog = false;
//           this.loadReport(); // Refresh
//         },
//         error: () => {
//           this.messageService.add({
//             severity: 'error',
//             summary: 'Payment Failed',
//             detail: 'Please try again.'
//           });
//         }
//       });
//   }

//   // === HELPERS ===
//   getSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
//     switch (status) {
//       case 'paid': return 'success';
//       case 'pending': return 'warning';
//       case 'overdue': return 'danger';
//       default: return 'info';
//     }
//   }

//   getCustomerName(installment: Installment): string {
//     const emi = [...this.report.dueToday, ...this.report.overdue, ...(this.report.upcoming || [])]
//       .find(e => e.installments.some(i => i._id === installment._id));
//     return emi?.customer?.fullname || 'Unknown';
//   }

//   getInvoiceNumber(installment: Installment): string {
//     const emi = [...this.report.dueToday, ...this.report.overdue, ...(this.report.upcoming || [])]
//       .find(e => e.installments.some(i => i._id === installment._id));
//     return emi?.invoiceNumber || 'N/A';
//   }

//   getDaysOverdue(dueDate: string): number {
//     const due = new Date(dueDate);
//     const today = new Date();
//     const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 3600 * 24));
//     return diff > 0 ? diff : 0;
//   }

//   formatDate(date: string): string {
//     return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
//   }

//   // FIXED: Move complex logic to methods
//   getDueTodayCount(): number {
//     const today = new Date();
//     return this.report.dueToday
//       .flatMap(e => e.installments)
//       .filter(i => new Date(i.dueDate).toDateString() === today.toDateString() && i.status === 'pending')
//       .length;
//   }

//   getUpcomingCount(): number {
//     return (this.report.upcoming || [])
//       .flatMap(e => e.installments)
//       .filter(i => i.status === 'pending')
//       .length;
//   }

//   getOverdueCount(): number {
//     return this.report.overdue
//       .flatMap(e => e.installments)
//       .filter(i => i.status === 'pending')
//       .length;
//   }

//   getDueTodayInstallments(): Installment[] {
//     const today = new Date();
//     return this.report.dueToday
//       .flatMap(e => e.installments)
//       .filter(i => new Date(i.dueDate).toDateString() === today.toDateString() && i.status === 'pending');
//   }

//   getUpcomingInstallments(): Installment[] {
//     return (this.report.upcoming || [])
//       .flatMap(e => e.installments)
//       .filter(i => i.status === 'pending');
//   }

//   getOverdueInstallments(): Installment[] {
//     return this.report.overdue
//       .flatMap(e => e.installments)
//       .filter(i => i.status === 'pending');
//   }
// }