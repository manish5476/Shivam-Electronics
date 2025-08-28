import { Component } from '@angular/core';
import { TransactionService } from '../../../../core/services/transaction.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { Card } from "primeng/card";
import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';


@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [FormsModule, CommonModule, SelectModule, TableModule,TagModule,ButtonModule,InputTextModule,IconFieldModule,InputIconModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent {
  transactions: any[];
  filters: { startDate: string; endDate: string; type: string; };

  type: any[] = [
    { label: 'All', value: '' },
    { label: "Sales", value: "sales" },
    { label: "Payments", value: "payments" },
    { label: "Products", value: "products" },
    { label: "Customers", value: "customers" },
    { label: "Sellers", value: "sellers" },
  ];

  constructor(private transactionService: TransactionService) {
    this.transactions = [];
    this.filters = { startDate: '', endDate: '', type: '' };
  }


  ngOnInit() {
    this.fetchTransactions();
  }


  // state for table
  loading = false;
  searchValue?: string;

  // clear search/filters in table
  clear(table: Table) {
    table.clear();
    this.searchValue = '';
  }

// chip colors for Type
getTypeSeverity(type?: string) {
  switch ((type || '').toLowerCase()) {
    case 'sale': return 'info';
    case 'payment': return 'success';
    case 'refund': return 'warn';   // ✅ instead of "warning"
    default: return 'secondary';
  }
}

// chip colors for Status
getStatusSeverity(status?: string) {
  switch ((status || '').toLowerCase()) {
    case 'completed': return 'success';
    case 'pending':   return 'warn';   // ✅ instead of "warning"
    case 'failed':    return 'danger';
    default:          return 'secondary';
  }
}


  fetchTransactions() {
    this.transactionService.getTransactions(this.filters).subscribe(res => {
      if (!res.error) this.transactions = res.data;
    });
  }
}

// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { TransactionService } from '../../../../core/services/transaction.service';

// // PrimeNG imports
// import { TableModule } from 'primeng/table';
// import { DropdownModule } from 'primeng/dropdown';
// import { CalendarModule } from 'primeng/calendar';
// import { ButtonModule } from 'primeng/button';

// @Component({
//   selector: 'app-transactions',
//   standalone: true,
//   imports: [CommonModule, FormsModule, TableModule, DropdownModule, CalendarModule, ButtonModule],
//   templateUrl: './transactions.component.html',
//   styleUrls: ['./transactions.component.css']
// })
// export class TransactionsComponent implements OnInit {
//   transactions: any[] = [];
//   filters = { startDate: null, endDate: null, type: null };

//   typeOptions = [
//     { label: 'All', value: null },
//     { label: 'Sales', value: 'sales' },
//     { label: 'Payments', value: 'payments' },
//     { label: 'Products', value: 'products' },
//     { label: 'Customers', value: 'customers' },
//     { label: 'Sellers', value: 'sellers' }
//   ];

//   constructor(private transactionService: TransactionService) {}

//   ngOnInit() {
//     this.fetchTransactions();
//   }

//   fetchTransactions() {
//     this.transactionService.getTransactions(this.filters).subscribe(res => {
//       if (!res.error) {
//         this.transactions = res.data;
//       }
//     });
//   }
// }

// // import { Component } from '@angular/core';
// // import { TransactionService } from '../../../../core/services/transaction.service';
// // import { FormsModule } from '@angular/forms';
// // import { CommonModule } from '@angular/common';
// // import { Select } from 'primeng/select';

// // @Component({
// //   selector: 'app-transactions',
// //   imports: [FormsModule, CommonModule, Select],
// //   templateUrl: './transactions.component.html',
// //   styleUrl: './transactions.component.css'
// // })
// // export class TransactionsComponent {
// //   transactions: any[];
// //   filters: { startDate: string; endDate: string; type: string; };
// //   type: any = [
// //     { label: 'All' },
// //     { label: "sales" },
// //     { label: "payments" },
// //     { label: "products" },
// //     { label: "customers" },
// //     { label: "sellers" },
// //   ]
// //   constructor(private transactionService: TransactionService) {
// //     this.transactionService = transactionService;
// //     this.transactions = [];
// //     this.filters = { startDate: '', endDate: '', type: '' };
// //   }

// //   ngOnInit() { this.fetchTransactions(); }
// //   fetchTransactions() {
// //     this.transactionService.getTransactions(this.filters).subscribe(res => {
// //       if (!res.error) this.transactions = res.data;
// //     });
// //   }
// // }