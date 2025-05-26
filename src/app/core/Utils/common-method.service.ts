import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppMessageService } from '../services/message.service';

type Severity = "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined;

@Injectable({
  providedIn: 'root'
})
export class CommonMethodService {

  constructor(private messageService:AppMessageService) { }


    public  handleError<T>() {
    return (error: HttpErrorResponse): Observable<T | undefined> => {
      console.error('API Error:', error);
      this.messageService.showError(`Error fetching data: ${error.error?.message || error.message || 'Server error'}`)
      // this.errorMessage = `Error fetching data: ${error.error?.message || error.message || 'Server error'}`;
      // Optionally, return an empty/default observable of the expected type, or rethrow
      // return of(undefined as T); // This will make the subscriber complete without emitting data
      throw error; // Or rethrow to be handled by a global error handler if you have one
    };
  }

  public formatCurrency(value: number | undefined | null): string {
    if (value === undefined || value === null) {
      return 'N/A';
    }
    // Using toLocaleString for currency formatting
    return `₹${value.toLocaleString('en-IN')}`; // 'en-IN' for Indian Rupees format
  }



  public responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];

 public  getSeverity(status: string): Severity {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Unpaid':
        return 'danger';
      default:
        return 'info'; // Fallback for unknown status
    }
  }

  
  public getPaymentStatusSeverity(status: string): Severity {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warn';
      case 'failed':
        return 'danger';
      default:
        return 'info'; // Fallback for unknown status
    }
  }



  // Explicitly define the return type as Severity
  public getInvoiceStatusSeverity(status: string): Severity {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'unpaid':
        return 'danger';
      case 'pending':
        return 'warn';
      default:
        return 'info'; // Fallback for unknown status
    }
  }
}
