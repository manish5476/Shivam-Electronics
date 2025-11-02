import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

// It's good practice to define interfaces for your data structures
export interface EmiCreationPayload {
  numberOfInstallments: number;
  startDate: string; // e.g., '2025-09-15'
  downPayment?: number;
}

export interface EmiPaymentPayload {
  paymentMethod: string;
  transactionId?: string;
}

@Injectable({ providedIn: 'root' })
export class EmiService extends BaseApiService {
  private endpoint = '/v1/emis';

  createEmiFromInvoice(invoiceId: string, data: EmiCreationPayload): Observable<any> {
    const url = `${this.baseUrl}${this.endpoint}/from-invoice/${invoiceId}`;
    return this.http
      .post(url, data)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('createEmiFromInvoice', error),
        ),
      );
  }

  /**
   * Records a payment for a specific EMI installment.
   * Corresponds to: POST /:emiId/installments/:installmentId/pay
   * @param emiId The ID of the overall EMI plan.
   * @param installmentId The ID of the specific installment being paid.
   * @param data The details of the payment.
   */
  recordEmiPayment(emiId: string, installmentId: string, data: EmiPaymentPayload): Observable<any> {
    const url = `${this.baseUrl}${this.endpoint}/${emiId}/installments/${installmentId}/pay`;
    return this.http
      .post(url, data)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('recordEmiPayment', error),
        ),
      );
  }

  /**
   * Gets the dashboard report of upcoming and overdue EMIs.
   * Corresponds to: GET /status-report
   */
  getEmiStatusReport(): Observable<any> {
    const url = `${this.baseUrl}${this.endpoint}/status-report`;
    return this.http
      .get(url)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getEmiStatusReport', error),
        ),
      );
  }
  
  getUpcomingEmis(): Observable<any> {
    const url = `${this.baseUrl}/v1/operational/upcoming-emis`;
    return this.http
      .get(url)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getUpcomingEmis', error),
        ),
      );
  }
}