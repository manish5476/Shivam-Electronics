import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api'; // Assuming you're using PrimeNG for toasts
export interface Invoice {
  _id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  // ... add other invoice fields as needed
}

@Injectable({ providedIn: 'root' })
export class InvoiceService extends BaseApiService {


  private endpoint = '/v1/invoices';

  // RENAMED for consistency
  getAllInvoices(filterParams?: any): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.baseUrl}${this.endpoint}`, { params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllInvoices', error)));
  }

  // // RENAMED for consistency
  // getInvoicesPrint(id:any): Observable<Invoice[]> {
  //   return this.http.get<Invoice[]>(`${this.baseUrl}${this.endpoint}/${id}/pdf`)
  //     .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getInvoicesPrint', error)));
  // }


  getInvoicesPrint(id: any): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${this.endpoint}/${id}/pdf`, {
      responseType: 'blob'
    }).pipe(
      catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getInvoicesPrint', error))
    );
  }

/**
   * Sends invoice PDF via email to the buyer.
   * @param invoiceId - The ID of the invoice.
   * @returns Observable of the response.
   */
  
  sendInvoiceEmail(invoiceId: string): Observable<any> {
    const url = `${this.baseUrl}${this.endpoint}/${invoiceId}/send-email`;
    return this.http.post(url, {}).pipe(
      map((response: any) => {
        // this.messageService.add({
        //   severity: 'success',
        //   summary: 'Email Sent',
        //   detail: response.message || 'Invoice email sent successfully!'
        // });
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error sending email:', error);
        // this.messageService.add({
        //   severity: 'error',
        //   summary: 'Email Failed',
        //   detail: error.error?.message || 'Failed to send invoice email. Please try again.'
        // });
        return throwError(() => error);
      })
    );
  }

  // RENAMED for consistency
  getInvoiceById(id: any): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.baseUrl}${this.endpoint}/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getInvoiceById', error)));
  }

  // RENAMED for consistency
  createInvoice(data: Invoice | Invoice[]): Observable<any> {
    return this.http.post(`${this.baseUrl}${this.endpoint}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createInvoice', error)));
  }

  // RENAMED for consistency
  updateInvoice(invoiceId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}${this.endpoint}/${invoiceId}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updateInvoice', error)));
  }

  // RENAMED for consistency
  deleteInvoices(invoiceIds: string[]): Observable<any> {
    const url = `${this.baseUrl}${this.endpoint}`;
    const body = { ids: invoiceIds };
    return this.http.delete(url, { body })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deleteInvoices', error)));
  }

  getProductSales(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${this.endpoint}/productSales`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getProductSales', error)));
  }
}

// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { BaseApiService } from './base-api.service';
// import { HttpErrorResponse } from '@angular/common/http';

// // Define an interface for the Invoice for type safety
// export interface Invoice {
//   _id: string;
//   invoiceNumber: string;
//   totalAmount: number;
//   status: string;
//   // ... add other invoice fields as needed
// }

// @Injectable({ providedIn: 'root' })
// export class InvoiceService extends BaseApiService {

//   private endpoint = '/v1/invoices';

//   getAllinvoiceData(filterParams?: any): Observable<Invoice[]> {
//     return this.http.get<Invoice[]>(`${this.baseUrl}${this.endpoint}`, { params: this.createHttpParams(filterParams) })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllinvoiceData', error)));
//   }

//   getinvoiceDataWithId(id: any): Observable<Invoice> {
//     return this.http.get<Invoice>(`${this.baseUrl}${this.endpoint}/${id}`)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getinvoiceDataWithId', error)));
//   }

//   // This function now supports sending a single object or an array of objects
//   createNewinvoice(data: Invoice | Invoice[]): Observable<any> {
//     return this.http.post(`${this.baseUrl}${this.endpoint}`, data)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createNewinvoice', error)));
//   }

//   updateinvoice(invoiceId: string, data: any): Observable<any> {
//     return this.http.patch(`${this.baseUrl}${this.endpoint}/${invoiceId}`, data)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updateinvoice', error)));
//   }

//   /**
//    * Deletes one or more invoices in a single bulk operation.
//    * @param invoiceIds An array of invoice IDs to delete.
//    */
//   deleteinvoices(invoiceIds: string[]): Observable<any> {
//     // This now correctly calls the unified DELETE endpoint without an ID in the URL
//     const url = `${this.baseUrl}${this.endpoint}`;
//     const body = { ids: invoiceIds };
//     return this.http.delete(url, { body })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deleteinvoices', error)));
//   }

//   // --- Custom, Non-Standard Methods ---
//   getProductSales(data: any): Observable<any> {
//     return this.http.post(`${this.baseUrl}${this.endpoint}/productSales`, data)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getProductSales', error)));
//   }
// }