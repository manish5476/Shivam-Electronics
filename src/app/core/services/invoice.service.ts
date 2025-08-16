import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

// Define an interface for the Invoice for type safety
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

  getAllinvoiceData(filterParams?: any): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.baseUrl}${this.endpoint}`, { params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllinvoiceData', error)));
  }

  getinvoiceDataWithId(id: any): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.baseUrl}${this.endpoint}/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getinvoiceDataWithId', error)));
  }

  // This function now supports sending a single object or an array of objects
  createNewinvoice(data: Invoice | Invoice[]): Observable<any> {
    return this.http.post(`${this.baseUrl}${this.endpoint}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createNewinvoice', error)));
  }

  updateinvoice(invoiceId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}${this.endpoint}/${invoiceId}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updateinvoice', error)));
  }

  /**
   * Deletes one or more invoices in a single bulk operation.
   * @param invoiceIds An array of invoice IDs to delete.
   */
  deleteinvoices(invoiceIds: string[]): Observable<any> {
    // This now correctly calls the unified DELETE endpoint without an ID in the URL
    const url = `${this.baseUrl}${this.endpoint}`;
    const body = { ids: invoiceIds };
    return this.http.delete(url, { body })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deleteinvoices', error)));
  }

  // --- Custom, Non-Standard Methods ---
  getProductSales(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${this.endpoint}/productSales`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getProductSales', error)));
  }
}

// // src/app/core/services/invoice.service.ts (or billing module)
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { BaseApiService } from './base-api.service';
// import { HttpErrorResponse } from '@angular/common/http';

// @Injectable({ providedIn: 'root' })
// export class InvoiceService extends BaseApiService {

//   getAllinvoiceData(filterParams?:any): Observable<any[]> {
//     return this.http.get<any[]>(`${this.baseUrl}/v1/invoices`,{ params: this.createHttpParams(filterParams) })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllCustomerData', error)));
//   }
  
//   getinvoiceDataWithId(id: any): Observable<any> {
//     return this.http.get<any>(`${this.baseUrl}/v1/invoices/${id}`)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getinvoiceDataWithId', error)));
//   }

//   createNewinvoice(data: any): Observable<any> {
//     return this.http.post(`${this.baseUrl}/v1/invoices`, data)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createNewinvoice', error)));
//   }

//    getProductSales(data: any): Observable<any> {
//      return this.http.post(`${this.baseUrl}/v1/invoices/productSales`, data)
//        .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getProductSales', error)));
//    }

//   updateinvoice(invoiceId: string, data: any): Observable<any> {
//     return this.http.patch(`${this.baseUrl}/v1/invoices/${invoiceId}`, data)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updateinvoice', error)));
//   }

//   deleteinvoices(invoiceIds: string[]): Observable<any> {
//     const endpoint = `${this.baseUrl}/v1/invoices/deletemany`;
//     const body = { ids: invoiceIds };
//     return this.http.delete(endpoint, { body: body })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deleteinvoices', error))); // Corrected operation name
//   }
// }