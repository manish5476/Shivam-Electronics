import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { BaseApiService } from './base-api.service';

// Define the interface for the subscription payload
export interface ReportSubscriptionPayload {
  reportType: 'WEEKLY_SALES_SUMMARY' | 'MONTHLY_OVERDUE_INVOICES';
  schedule: 'WEEKLY' | 'MONTHLY';
  recipients: string[];
}

// Define the interface for the subscription object returned from the API
export interface ReportSubscription {
  _id: string;
  owner: string;
  reportType: string;
  schedule: string;
  recipients: string[];
  isActive: boolean;
  lastSent?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the typical API list response
export interface SubscriptionApiResponse {
    status: string;
    results: number;
    data: any[];
}

// Interface for a single subscription API response
export interface SingleSubscriptionApiResponse {
    status: string;
    data: ReportSubscription;
}


@Injectable({
  providedIn: 'root'
})
export class SubscriptionService extends BaseApiService {
  // Define the base endpoint for report subscriptions
  private endpoint = '/v1/reports';

  getMySubscriptions(filterParams?: any): Observable<SubscriptionApiResponse> {
    const url = `${this.baseUrl}${this.endpoint}`;
    return this.http.get<SubscriptionApiResponse>(url, { params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getMySubscriptions', error)));
  }


  subscribeToReport(payload: ReportSubscriptionPayload): Observable<SingleSubscriptionApiResponse> {
    const url = `${this.baseUrl}${this.endpoint}`;
    return this.http.post<SingleSubscriptionApiResponse>(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('subscribeToReport', error)));
  }

  unsubscribeFromReport(id: string): Observable<any> {
    const url = `${this.baseUrl}${this.endpoint}/${id}`;
    return this.http.delete(url)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('unsubscribeFromReport', error)));
  }
}
