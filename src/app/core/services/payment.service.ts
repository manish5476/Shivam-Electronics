// src/app/core/services/payment.service.ts (or payment module)
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PaymentService extends BaseApiService {

  getAllpaymentData(filterParams?:any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/v1/payments`,{ params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllpaymentData', error)));
  }

  getpaymentDataWithId(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/v1/payments/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getpaymentDataWithId', error)));
  }

  createNewpayment(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/payments`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createNewpayment', error)));
  }

  updatepayment(paymentId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/payments/${paymentId}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updatepayment', error)));
  }

  deletepayments(paymentIds: string[]): Observable<any> {
    const endpoint = `${this.baseUrl}/v1/payments/deletemany`;
    const body = { ids: paymentIds };
    return this.http.delete(endpoint, { body: body })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deletepayments', error))); // Corrected operation name
  }
}