// src/app/core/services/invoice.service.ts (or billing module)
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class InvoiceService extends BaseApiService {

  getAllinvoiceData(filterParams?:any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/v1/invoices`,{ params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllinvoiceData', error)));
  }

  getinvoiceDataWithId(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/v1/invoices/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getinvoiceDataWithId', error)));
  }

  createNewinvoice(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/invoices`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createNewinvoice', error)));
  }

   getProductSales(data: any): Observable<any> {
     return this.http.post(`${this.baseUrl}/v1/invoices/productSales`, data)
       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getProductSales', error)));
   }

  updateinvoice(invoiceId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/invoices/${invoiceId}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updateinvoice', error)));
  }

  deleteinvoices(invoiceIds: string[]): Observable<any> {
    const endpoint = `${this.baseUrl}/v1/invoices/deletemany`;
    const body = { ids: invoiceIds };
    return this.http.delete(endpoint, { body: body })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deleteinvoices', error))); // Corrected operation name
  }
}