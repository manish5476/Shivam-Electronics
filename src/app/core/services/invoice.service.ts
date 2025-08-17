import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

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