import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators'; // <-- IMPORT ADDED HERE
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';

export interface ChartOption {
  label: string;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class ChartService extends BaseApiService {
  private endpoint = '/v1/charts';

  /**
   * Fetches the list of available charts to populate UI dropdowns.
   */
  getChartOptions(): Observable<ChartOption[]> {
    return this.http
      .get<{ data: ChartOption[] }>(`${this.baseUrl}${this.endpoint}/options`)
      .pipe(
        // This 'map' will now be recognized
        map(response => response.data),
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getChartOptions', error),
        ),
      );
  }

  /**
   * Fetches the data for a specific chart.
   * @param chartName - The 'value' from the ChartOption (e.g., 'revenueAndProfitTrend').
   * @param period - The time period filter.
   */
  getChartData(chartName: string, period: string): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/${chartName}`, { params })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getChartData', error),
        ),
      );
  }
}

// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { BaseApiService } from './base-api.service';
// import { HttpErrorResponse, HttpParams } from '@angular/common/http';
// import { map } from 'rxjs/operators';
// export interface ChartOption {
//   label: string;
//   value: string;
// }

// @Injectable({ providedIn: 'root' })
// export class ChartService extends BaseApiService {
//   private endpoint = '/v1/charts';

//   /**
//    * Fetches the list of available charts to populate UI dropdowns.
//    */
//   getChartOptions(): Observable<ChartOption[]> {
//     return this.http
//       .get<{ data: ChartOption[] }>(`${this.baseUrl}${this.endpoint}/options`)
//       .pipe(map((response: { data: any; }) => response.data),
//         catchError((error: HttpErrorResponse) =>
//           this.errorhandler.handleError('getChartOptions', error),
//         ),
//       );
//   }

//   /**
//    * Fetches the data for a specific chart.
//    * @param chartName - The 'value' from the ChartOption (e.g., 'revenueAndProfitTrend').
//    * @param period - The time period filter.
//    */
//   getChartData(chartName: string, period: string): Observable<any> {
//     const params = new HttpParams().set('period', period);
//     return this.http
//       .get<any>(`${this.baseUrl}${this.endpoint}/${chartName}`, { params })
//       .pipe(
//         catchError((error: HttpErrorResponse) =>
//           this.errorhandler.handleError('getChartData', error),
//         ),
//       );
//   }
// }