import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { EmiService, EmiCreationPayload } from '../../../core/services/emi.service';
import { InvoiceService } from '../../../core/services/invoice.service';

interface InvoiceItem {
  _id: string;
  customTitle?: string;
  amount: number;
}

interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount?: number;
  status: string;
  buyerDetails: any;
  items: InvoiceItem[];
}

@Component({
  selector: 'app-emi-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    DatePickerModule,
    TagModule,
    ToastModule
  ],
  templateUrl: './create-emi.component.html',
  styleUrl: './create-emi.component.css'
})
export class EmiCreateComponent implements OnChanges {
  private emiService = inject(EmiService);
  private invoiceService = inject(InvoiceService);
  private toast = inject(MessageService);

  @Input() visible = false;
  @Input() invoiceId!: string | null;  // Must be string
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() emiCreated = new EventEmitter<any>();
private invoiceLoadedForId: string | null = null;

  invoice = signal<InvoiceData | null>(null);
  loading = signal(false);
  creating = signal(false);
  today = new Date();

  // Form signals
  numberOfInstallments = signal(3);
  downPayment = signal(0);
  startDate = signal(new Date());

  // === COMPUTED VALUES ===
  outstanding = computed(() => {
    const inv = this.invoice();
    return inv ? (inv.totalAmount || 0) - (inv.paidAmount || 0) : 0;
  });

  remainingAfterDown = computed(() => {
    return Math.max(0, this.outstanding() - (this.downPayment() || 0));
  });

  emiAmount = computed(() => {
    const remaining = this.remainingAfterDown();
    const months = this.numberOfInstallments() || 1;
    return remaining > 0 ? remaining / months : 0;
  });

  firstDueDate = computed(() => {
    const d = new Date(this.startDate());
    d.setMonth(d.getMonth() + 1);
    return d;
  });

  // FIXED: canCreate logic
  canCreate = computed(() => {
    const inv = this.invoice();
    if (!inv || !this.invoiceId) return false;
    if (this.outstanding() <= 0) return false;
    if (this.remainingAfterDown() <= 0) return false;
    if (this.numberOfInstallments() < 1) return false;
    return true;
  });

  // === LIFECYCLE ===
  // ngOnChanges(changes: SimpleChanges) {
  //   const idChanged = changes['invoiceId'];
  //   const visChanged = changes['visible'];

  //   // Load invoice when both visible and invoiceId are present
  //   if (this.visible && this.invoiceId) {
  //     if (idChanged || visChanged) {
  //       this.loadInvoice();
  //     }
  //   } else {
  //     // Reset if dialog opens without ID
  //     if (visChanged?.currentValue === true && !this.invoiceId) {
  //       this.toast.add({ severity: 'warn', summary: 'No invoice selected' });
  //       this.close();
  //     }
  //   }
  // }
ngOnChanges(changes: SimpleChanges) {
  const idChanged = changes['invoiceId'];
  const visChanged = changes['visible'];

  if (this.visible && this.invoiceId) {
    const shouldLoad =
      (idChanged && idChanged.currentValue !== this.invoiceLoadedForId) ||
      (visChanged && visChanged.currentValue === true && this.invoiceLoadedForId !== this.invoiceId);

    if (shouldLoad) {
      this.invoiceLoadedForId = this.invoiceId;
      this.loadInvoice();
    }
  } else if (visChanged?.currentValue === false) {
    this.invoiceLoadedForId = null; // reset when closed
  } else if (visChanged?.currentValue === true && !this.invoiceId) {
    this.toast.add({ severity: 'warn', summary: 'No invoice selected' });
    this.close();
  }
}
  loadInvoice() {
    if (!this.invoiceId) return;
    this.loading.set(true);
    this.invoiceService.getInvoiceById(this.invoiceId).subscribe({
      next: (res: any) => {
        this.invoice.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Failed to load invoice' });
        this.loading.set(false);
        this.close();
      }
    });
  }

  // createEmi() {
  //   if (!this.canCreate() || !this.invoiceId) return;

  //   this.creating.set(true);

  //   const payload: EmiCreationPayload = {
  //     numberOfInstallments: this.numberOfInstallments(),
  //     startDate: this.startDate().toISOString().split('T')[0],
  //     downPayment: this.downPayment() || undefined
  //   };

  //   this.emiService.createEmiFromInvoice(this.invoiceId, payload).subscribe({
  //     next: (res) => {
  //       this.toast.add({ severity: 'success', summary: 'EMI Plan Created!' });
  //       this.emiCreated.emit(res);
  //       this.close();
  //       this.invoiceId=null
  //     },
  //     error: (err) => {
  //       this.toast.add({
  //         severity: 'error',
  //         summary: 'Failed',
  //         detail: err.error?.message || 'Server error'
  //       });
  //       this.creating.set(false);
  //     },
  //     complete: () => this.creating.set(false)
  //   });
  // }
createEmi() {
  if (!this.canCreate() || !this.invoiceId || this.creating()) return;

  this.creating.set(true);

  const payload: EmiCreationPayload = {
    numberOfInstallments: this.numberOfInstallments(),
    startDate: this.startDate().toISOString().split('T')[0],
    downPayment: this.downPayment() || undefined
  };

  this.emiService.createEmiFromInvoice(this.invoiceId, payload).subscribe({
    next: (res) => {
      this.toast.add({ severity: 'success', summary: 'EMI Plan Created!' });
      this.emiCreated.emit(res);
      this.close(); // Safe reset
    },
    error: (err) => {
      this.toast.add({
        severity: 'error',
        summary: 'Failed',
        detail: err.error?.message || 'Server error'
      });
      this.creating.set(false);
    },
    complete: () => this.creating.set(false)
  });
}
  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.reset();
  }

  reset() {
    this.numberOfInstallments.set(3);
    this.downPayment.set(0);
    this.startDate.set(new Date());
    this.invoice.set(null);
  }
}