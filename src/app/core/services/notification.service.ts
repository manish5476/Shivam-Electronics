import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends BaseApiService {
  private endpoint = '/v1/notifications';

  getLoginSummary(): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/login-summary`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getLoginSummary', error)
        )
      );
  }

  /**
   * Fetch detailed daily summary for a specific date
   * @param date string in format YYYY-MM-DD
   */
  getDailySummary(date: string): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/daily-summary/${date}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getDailySummary', error)
        )
      );
  }

  /**
   * Fetch calendar heatmap data for a specific month
   * @param year number, e.g., 2025
   * @param month number, 1-12
   */
  getCalendarHeatmap(year: number, month: number): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/calendar-heatmap`, {
        params: this.createHttpParams({ year, month })
      })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getCalendarHeatmap', error)
        )
      );
  }
}
