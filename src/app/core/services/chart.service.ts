import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';

export interface ChartOption {
  label: string;
  value: string;
}

export interface ChartDataResponse {
  title: string;
  type: string;
  data: any[]; // Flexible data array based on chart type
}

@Injectable({ providedIn: 'root' })
export class ChartService extends BaseApiService {
  private endpoint = '/v1/charts';

  /**
   * Fetches the list of available charts to populate UI dropdowns or multiselects.
   * This can be cached if needed, but for now, it's a simple GET.
   */
  getChartOptions(): Observable<any[]> {
    return this.http
      .get<{ status: string; data: any[] }>(`${this.baseUrl}${this.endpoint}/options`)
      .pipe(
        map(response => response.data),
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getChartOptions', error),
        ),
      );
  }

  /**
   * Fetches the data for a specific chart or multiple charts in batch.
   * For multiple charts, you can call this in a loop or use forkJoin in the component.
   * Supports period, custom dates, and extra params (e.g., metric for topSellingProducts).
   * @param chartName - The 'value' from the ChartOption (e.g., 'revenueAndProfitTrend').
   * @param period - Optional predefined period filter (e.g., 'last30days').
   * @param startDate - Optional custom start date (YYYY-MM-DD).
   * @param endDate - Optional custom end date (YYYY-MM-DD).
   * @param extraParams - Optional chart-specific params (e.g., { metric: 'quantity' }).
   */
  getChartData(
    chartName: string,
    period?: string,
    startDate?: string,
    endDate?: string,
    extraParams: { [key: string]: string } = {}
  ): Observable<ChartDataResponse> {
    let params = new HttpParams();
    if (period) {
      params = params.set('period', period);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    // Append any extra params (e.g., metric, limit, etc.)
    Object.keys(extraParams).forEach(key => {
      if (extraParams[key] !== undefined) {
        params = params.set(key, extraParams[key]);
      }
    });

    return this.http
      .get<{ status: string; data: ChartDataResponse }>(`${this.baseUrl}${this.endpoint}/${chartName}`, { params })
      .pipe(
        map(response => response.data),
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError(`getChartData for ${chartName}`, error),
        ),
      );
  }
}
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { catchError, map } from 'rxjs/operators'; // <-- IMPORT ADDED HERE
// import { BaseApiService } from './base-api.service';
// import { HttpErrorResponse, HttpParams } from '@angular/common/http';

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
//       .pipe(
//         // This 'map' will now be recognized
//         map(response => response.data),
//         catchError((error: HttpErrorResponse) =>
//           this.errorhandler.handleError('getChartOptions', error),
//         ),
//       );
//   }


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