import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AnalyticsService extends BaseApiService {
  private endpoint = '/v1/analytics';

  getSalesPerformance(filterParams?: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales-performance`, { params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getTransactions', error)));
  }

  getCustomerInsights(filterParams?: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.endpoint}/customer-insights`, { params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getTransactions', error)));
  }
  getProductPerformance(filterParams?: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.endpoint}/product-performance`, { params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getTransactions', error)));
  }
  getpaymentPerformance(filterParams?: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.endpoint}/payment-efficiency`, { params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getTransactions', error)));
  }
  getInventoryPerformance(filterParams?: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.endpoint}/inventory-turnover`, { params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getTransactions', error)));
  }
  getsalesForcast(filterParams?: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales-forecast`, { params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getTransactions', error)));
  }
  
  getcustomerSegment(filterParams?: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.endpoint}/customer-segments`, { params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getTransactions', error)));
  }


  // RENAMED for consistency
  createInvoice(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${this.endpoint}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createInvoice', error)));
  }
}
