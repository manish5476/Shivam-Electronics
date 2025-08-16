import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

// Define an interface for the Payment for type safety
export interface Payment {
  _id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  // ... add other payment fields as needed
}

@Injectable({ providedIn: 'root' })
export class PaymentService extends BaseApiService {

  private endpoint = '/v1/payments';

  getAllpaymentData(filterParams?: any): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}${this.endpoint}`, { params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllpaymentData', error)));
  }

  getpaymentDataWithId(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}${this.endpoint}/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getpaymentDataWithId', error)));
  }

  // This function now supports sending a single object or an array of objects
  createNewpayment(data: any | any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}${this.endpoint}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createNewpayment', error)));
  }

  updatepayment(paymentId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}${this.endpoint}/${paymentId}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updatepayment', error)));
  }

  /**
   * Deletes one or more payments in a single bulk operation.
   * @param paymentIds An array of payment IDs to delete.
   */
  deletepayments(paymentIds: string[]): Observable<any> {
    // This now correctly calls the unified DELETE endpoint without an ID in the URL
    const url = `${this.baseUrl}${this.endpoint}`;
    const body = { ids: paymentIds };
    return this.http.delete(url, { body })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deletepayments', error)));
  }
}

// // src/app/core/services/payment.service.ts (or payment module)
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { BaseApiService } from './base-api.service';
// import { HttpErrorResponse } from '@angular/common/http';

// @Injectable({ providedIn: 'root' })
// export class PaymentService extends BaseApiService {

//   getAllpaymentData(filterParams?:any): Observable<any[]> {
//     return this.http.get<any[]>(`${this.baseUrl}/v1/payments`,{ params: this.createHttpParams(filterParams) })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllpaymentData', error)));
//   }

//   getpaymentDataWithId(id: string): Observable<any> {
//     return this.http.get<any>(`${this.baseUrl}/v1/payments/${id}`)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getpaymentDataWithId', error)));
//   }

//   createNewpayment(data: any): Observable<any> {
//     return this.http.post(`${this.baseUrl}/v1/payments`, data)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createNewpayment', error)));
//   }

//   updatepayment(paymentId: string, data: any): Observable<any> {
//     return this.http.patch(`${this.baseUrl}/v1/payments/${paymentId}`, data)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updatepayment', error)));
//   }

//   deletepayments(paymentIds: string[]): Observable<any> {
//     const endpoint = `${this.baseUrl}/v1/payments/deletemany`;
//     const body = { ids: paymentIds };
//     return this.http.delete(endpoint, { body: body })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deletepayments', error))); // Corrected operation name
//   }
// }