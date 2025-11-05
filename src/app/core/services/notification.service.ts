import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends BaseApiService {
  private endpoint = '/v1/notifications';
  private notesEndpoint = '/v1/notes';

  /**
   * Fetch login summary analytics
   */
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
   * Fetch daily summary data for a specific date
   * @param date - string (YYYY-MM-DD)
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
   * Fetch calendar heatmap data for a given month
   * @param year - e.g. 2025
   * @param month - 1-12
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

  /**
   * 🔹 Fetch notes summary for the given month
   * Used to highlight which days have notes in the calendar
   */
  getNotesForMonth(year: number, month: number): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}${this.notesEndpoint}/calendar-summary`, {
        params: this.createHttpParams({ year, month })
      })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getNotesForMonth', error)
        )
      );
  }

  /**
   * 🔹 Fetch notes for a specific day
   */
  getNotesForDay(date: string): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}${this.notesEndpoint}/day/${date}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getNotesForDay', error)
        )
      );
  }

  /**
   * 🔹 Create or update a note for a specific date
   */
  saveNoteForDay(date: string, note: any): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}${this.notesEndpoint}/day/${date}`, note)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('saveNoteForDay', error)
        )
      );
  }

  /**
   * 🔹 Utility combo call to fetch both heatmap + notes together
   * (Used in the NotificationCalendarComponent)
   */
  getMonthlyOverview(year: number, month: number): Observable<any> {
    return forkJoin({
      heatmap: this.getCalendarHeatmap(year, month),
      notes: this.getNotesForMonth(year, month)
    }).pipe(
      map((res) => ({
        heatmap: res.heatmap?.data ?? [],
        notes: res.notes?.data ?? []
      })),
      catchError((error: HttpErrorResponse) =>
        this.errorhandler.handleError('getMonthlyOverview', error)
      )
    );
  }
}


// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { BaseApiService } from './base-api.service';
// import { HttpErrorResponse } from '@angular/common/http';

// @Injectable({
//   providedIn: 'root'
// })
// export class NotificationService extends BaseApiService {
//   private endpoint = '/v1/notifications';

//   getLoginSummary(): Observable<any> {
//     return this.http
//       .get<any>(`${this.baseUrl}${this.endpoint}/login-summary`)
//       .pipe(
//         catchError((error: HttpErrorResponse) =>
//           this.errorhandler.handleError('getLoginSummary', error)
//         )
//       );
//   }

//   /**
//    * Fetch detailed daily summary for a specific date
//    * @param date string in format YYYY-MM-DD
//    */
//   getDailySummary(date: string): Observable<any> {
//     return this.http
//       .get<any>(`${this.baseUrl}${this.endpoint}/daily-summary/${date}`)
//       .pipe(
//         catchError((error: HttpErrorResponse) =>
//           this.errorhandler.handleError('getDailySummary', error)
//         )
//       );
//   }

//   /**
//    * Fetch calendar heatmap data for a specific month
//    * @param year number, e.g., 2025
//    * @param month number, 1-12
//    */
//   getCalendarHeatmap(year: number, month: number): Observable<any> {
//     return this.http
//       .get<any>(`${this.baseUrl}${this.endpoint}/calendar-heatmap`, {
//         params: this.createHttpParams({ year, month })
//       })
//       .pipe(
//         catchError((error: HttpErrorResponse) =>
//           this.errorhandler.handleError('getCalendarHeatmap', error)
//         )
//       );
//   }

//   // getCalendarHeatmap(year: number, month: number) {
//   //   return this.http.get(`/api/analytics/calendar-heatmap?year=${year}&month=${month}`);
//   // }

//   // getDailySummary(date: string) {
//   //   return this.http.get(`/api/analytics/daily-summary?date=${date}`);
//   // }

//   getNotesForMonth(year: number, month: number) {
//     return this.http.get(`/api/notes/calendar?year=${year}&month=${month}`);
//   }

// }
