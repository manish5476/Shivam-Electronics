// src/app/core/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, switchMap, shareReplay } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { ErrorhandlingService } from './errorhandling.service';

@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseApiService {

  private endpoint = '/v1/dashboard';
  private cache = new Map<string, any>();

 constructor(
    protected override http: HttpClient,
    protected override errorhandler: ErrorhandlingService
) {
    super();
}


  // ------------------------
  // Generic caching helper
  // ------------------------
  private getCachedOrFetch<T>(key: string, fetchFn: () => Observable<T>, forceRefresh = false): Observable<T> {
    if (!forceRefresh && this.cache.has(key)) {
      return of(this.cache.get(key));
    }
    return fetchFn().pipe(
      map(res => {
        this.cache.set(key, res);
        return res;
      }),
      catchError(err => this.errorhandler.handleError(key, err))
    );
  }

  // ------------------------
  // Helper to build query params
  // ------------------------
  private _buildParams(paramsObj: { [k: string]: any }): HttpParams {
    let params = new HttpParams();
    for (const key in paramsObj) {
      const value = paramsObj[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return params;
  }

  // ------------------------
  // Dashboard APIs
  // ------------------------
  getEnhancedKpiSummary(period?: string, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
    const key = `enhancedSummary|${period}|${startDate}|${endDate}`;
    return this.getCachedOrFetch(key, () => {
      const params = this._buildParams({ period, startDate, endDate });
      return this.http.get<any>(`${this.baseUrl}${this.endpoint}/enhanced-summary`, { params });
    }, forceRefresh);
  }

  getKpiSummary(period?: string, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
    const key = `kpiSummary|${period}|${startDate}|${endDate}`;
    return this.getCachedOrFetch(key, () => {
      const params = this._buildParams({ period, startDate, endDate });
      return this.http.get<any>(`${this.baseUrl}${this.endpoint}/kpi-summary`, { params });
    }, forceRefresh);
  }

  getDashboardOverview(period?: string, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
    const key = `overview|${period}|${startDate}|${endDate}`;
    return this.getCachedOrFetch(key, () => {
      const params = this._buildParams({ period, startDate, endDate });
      return this.http.get<any>(`${this.baseUrl}${this.endpoint}/overview`, { params });
    }, forceRefresh);
  }

  downloadReport(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${this.endpoint}/download`, { responseType: 'blob' })
      .pipe(catchError(err => this.errorhandler.handleError('downloadReport', err)));
  }

  getProductAnalytics(period?: string, limit: number = 10, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
    const key = `productAnalytics|${period}|${limit}|${startDate}|${endDate}`;
    return this.getCachedOrFetch(key, () => {
      const params = this._buildParams({ period, limit, startDate, endDate });
      return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/products`, { params });
    }, forceRefresh);
  }

  getCustomerAnalytics(period?: string, limit: number = 10, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
    const key = `customerAnalytics|${period}|${limit}|${startDate}|${endDate}`;
    return this.getCachedOrFetch(key, () => {
      const params = this._buildParams({ period, limit, startDate, endDate });
      return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/customers`, { params });
    }, forceRefresh);
  }

  getPaymentAnalytics(period?: string, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
    const key = `paymentAnalytics|${period}|${startDate}|${endDate}`;
    return this.getCachedOrFetch(key, () => {
      const params = this._buildParams({ period, startDate, endDate });
      return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/payments`, { params });
    }, forceRefresh);
  }

  getInventoryTurnover(period?: string, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
    const key = `inventoryTurnover|${period}|${startDate}|${endDate}`;
    return this.getCachedOrFetch(key, () => {
      const params = this._buildParams({ period, startDate, endDate });
      return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/inventory-turnover`, { params });
    }, forceRefresh);
  }

  getSalesForecast(period?: string, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
    const key = `salesForecast|${period}|${startDate}|${endDate}`;
    return this.getCachedOrFetch(key, () => {
      const params = this._buildParams({ period, startDate, endDate });
      return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/sales-forecast`, { params });
    }, forceRefresh);
  }

  getSalesTrends(period?: string, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
    const key = `salesTrends|${period}|${startDate}|${endDate}`;
    return this.getCachedOrFetch(key, () => {
      const params = this._buildParams({ period, startDate, endDate });
      return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/trends`, { params });
    }, forceRefresh);
  }

  getSalesCharts(period?: string, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
    const key = `salesCharts|${period}|${startDate}|${endDate}`;
    return this.getCachedOrFetch(key, () => {
      const params = this._buildParams({ period, startDate, endDate });
      return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/charts`, { params });
    }, forceRefresh);
  }

  getYearlySales(period?: string, startDate?: string | undefined, endDate?: string | undefined, forceRefresh = false): Observable<any> {
    const key = `yearlySales|${period}`;
    return this.getCachedOrFetch(key, () => {
      const params = this._buildParams({ period });
      return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/yearly`, { params });
    }, forceRefresh);
  }

  getMonthlySales(period?: string, forceRefresh = false): Observable<any> {
    const key = `monthlySales|${period}`;
    return this.getCachedOrFetch(key, () => {
      const params = this._buildParams({ period });
      return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/monthly`, { params });
    }, forceRefresh);
  }

  getWeeklySales(period?: string, forceRefresh = false): Observable<any> {
    const key = `weeklySales|${period}`;
    return this.getCachedOrFetch(key, () => {
      const params = this._buildParams({ period });
      return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/weekly`, { params });
    }, forceRefresh);
  }

  // ------------------------
  // Optional: Live auto-refresh streams (every X seconds)
  // ------------------------
getLiveKpiSummary(period?: string, intervalMs: number = 30000): Observable<any> {
  return timer(0, intervalMs).pipe(
    switchMap(() => this.getKpiSummary(period, undefined, undefined, true)),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}


  getLiveDashboardOverview(period?: string, intervalMs: number = 30000): Observable<any> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.getDashboardOverview(period, undefined, undefined, true)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  // ------------------------
  // Cache management
  // ------------------------
  clearCacheKey(keyPrefix: string) {
    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(keyPrefix)) this.cache.delete(key);
    }
  }

  clearAllCache() {
    this.cache.clear();
  }
}



// // src/app/core/services/dashboard.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
// import { Observable, of } from 'rxjs';
// import { map, catchError } from 'rxjs/operators';
// import { BaseApiService } from './base-api.service';
// import { ErrorhandlingService } from './errorhandling.service';
// @Injectable({ providedIn: 'root' })
// export class DashboardService extends BaseApiService {
//   private endpoint = '/v1/dashboard';
//   private cache = new Map<string, any>();

//   // constructor(private override http: HttpClient, private override errorhandler: ErrorhandlingService) {
//   // }

//   // --- Generic cache helper ---
//   private getCachedOrFetch<T>(key: string, fetchFn: () => Observable<T>, forceRefresh = false): Observable<T> {
//     if (!forceRefresh && this.cache.has(key)) {
//       return of(this.cache.get(key));
//     }
//     return fetchFn().pipe(
//       map((res: any) => {
//         this.cache.set(key, res);
//         return res;
//       })
//     );
//   }

//   // --- Helper to build params ---
//   private _buildParams(paramsObj: { [k: string]: any }): HttpParams {
//     let params = new HttpParams();
//     for (const key in paramsObj) {
//       const value = paramsObj[key];
//       if (value !== null && value !== undefined && value !== '') {
//         params = params.set(key, String(value));
//       }
//     }
//     return params;
//   }

//   // --- APIs (all accept forceRefresh optional) ---
//   getEnhancedKpiSummary(period?: string, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
//     const key = `enhancedSummary|${period}|${startDate}|${endDate}`;
//     return this.getCachedOrFetch(key, () => {
//       const params = this._buildParams({ period, startDate, endDate });
//       return this.http.get<any>(`${this.baseUrl}${this.endpoint}/enhanced-summary`, { params })
//         .pipe(catchError((err: HttpErrorResponse) => this.errorhandler.handleError('getEnhancedKpiSummary', err)));
//     }, forceRefresh);
//   }

//   getKpiSummary(period?: string, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
//     const key = `kpiSummary|${period}|${startDate}|${endDate}`;
//     return this.getCachedOrFetch(key, () => {
//       const params = this._buildParams({ period, startDate, endDate });
//       return this.http.get<any>(`${this.baseUrl}${this.endpoint}/kpi-summary`, { params })
//         .pipe(catchError((err: HttpErrorResponse) => this.errorhandler.handleError('getKpiSummary', err)));
//     }, forceRefresh);
//   }

//   getDashboardOverview(period?: string, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
//     const key = `overview|${period}|${startDate}|${endDate}`;
//     return this.getCachedOrFetch(key, () => {
//       const params = this._buildParams({ period, startDate, endDate });
//       return this.http.get<any>(`${this.baseUrl}${this.endpoint}/overview`, { params })
//         .pipe(catchError((err: HttpErrorResponse) => this.errorhandler.handleError('getDashboardOverview', err)));
//     }, forceRefresh);
//   }

//   downloadReport(forceRefresh = false): Observable<Blob> {
//     // Not cached because it's direct file download
//     return this.http.get(`${this.baseUrl}${this.endpoint}/download`, { responseType: 'blob' })
//       .pipe(catchError((err: HttpErrorResponse) => this.errorhandler.handleError('downloadReport', err)));
//   }

//   getProductAnalytics(period?: string, limit: number = 10, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
//     const key = `productAnalytics|${period}|${limit}|${startDate}|${endDate}`;
//     return this.getCachedOrFetch(key, () => {
//       const params = this._buildParams({ period, limit: String(limit), startDate, endDate });
//       return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/products`, { params })
//         .pipe(catchError((err: HttpErrorResponse) => this.errorhandler.handleError('getProductAnalytics', err)));
//     }, forceRefresh);
//   }

//   getCustomerAnalytics(period?: string, limit: number = 10, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
//     const key = `customerAnalytics|${period}|${limit}|${startDate}|${endDate}`;
//     return this.getCachedOrFetch(key, () => {
//       const params = this._buildParams({ period, limit: String(limit), startDate, endDate });
//       return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/customers`, { params })
//         .pipe(catchError((err: HttpErrorResponse) => this.errorhandler.handleError('getCustomerAnalytics', err)));
//     }, forceRefresh);
//   }

//   getPaymentAnalytics(period?: string, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
//     const key = `paymentAnalytics|${period}|${startDate}|${endDate}`;
//     return this.getCachedOrFetch(key, () => {
//       const params = this._buildParams({ period, startDate, endDate });
//       return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/payments`, { params })
//         .pipe(catchError((err: HttpErrorResponse) => this.errorhandler.handleError('getPaymentAnalytics', err)));
//     }, forceRefresh);
//   }

//   getInventoryTurnover(period?: string, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
//     const key = `inventoryTurnover|${period}|${startDate}|${endDate}`;
//     return this.getCachedOrFetch(key, () => {
//       const params = this._buildParams({ period, startDate, endDate });
//       return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/inventory-turnover`, { params })
//         .pipe(catchError((err: HttpErrorResponse) => this.errorhandler.handleError('getInventoryTurnover', err)));
//     }, forceRefresh);
//   }

//   getSalesForecast(period?: string, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
//     const key = `salesForecast|${period}|${startDate}|${endDate}`;
//     return this.getCachedOrFetch(key, () => {
//       const params = this._buildParams({ period, startDate, endDate });
//       return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/sales-forecast`, { params })
//         .pipe(catchError((err: HttpErrorResponse) => this.errorhandler.handleError('getSalesForecast', err)));
//     }, forceRefresh);
//   }

//   getSalesTrends(period?: string, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
//     const key = `salesTrends|${period}|${startDate}|${endDate}`;
//     return this.getCachedOrFetch(key, () => {
//       const params = this._buildParams({ period, startDate, endDate });
//       return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/trends`, { params })
//         .pipe(catchError((err: HttpErrorResponse) => this.errorhandler.handleError('getSalesTrends', err)));
//     }, forceRefresh);
//   }

//   getSalesCharts(period?: string, startDate?: string, endDate?: string, forceRefresh = false): Observable<any> {
//     const key = `salesCharts|${period}|${startDate}|${endDate}`;
//     return this.getCachedOrFetch(key, () => {
//       const params = this._buildParams({ period, startDate, endDate });
//       return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/charts`, { params })
//         .pipe(catchError((err: HttpErrorResponse) => this.errorhandler.handleError('getSalesCharts', err)));
//     }, forceRefresh);
//   }

//   getYearlySales(period?: string, forceRefresh = false): Observable<any> {
//     const key = `yearlySales|${period}`;
//     return this.getCachedOrFetch(key, () => {
//       const params = this._buildParams({ period });
//       return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/yearly`, { params })
//         .pipe(catchError((err: HttpErrorResponse) => this.errorhandler.handleError('getYearlySales', err)));
//     }, forceRefresh);
//   }

//   getMonthlySales(period?: string, forceRefresh = false): Observable<any> {
//     const key = `monthlySales|${period}`;
//     return this.getCachedOrFetch(key, () => {
//       const params = this._buildParams({ period });
//       return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/monthly`, { params })
//         .pipe(catchError((err: HttpErrorResponse) => this.errorhandler.handleError('getMonthlySales', err)));
//     }, forceRefresh);
//   }

//   getWeeklySales(period?: string, forceRefresh = false): Observable<any> {
//     const key = `weeklySales|${period}`;
//     return this.getCachedOrFetch(key, () => {
//       const params = this._buildParams({ period });
//       return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/weekly`, { params })
//         .pipe(catchError((err: HttpErrorResponse) => this.errorhandler.handleError('getWeeklySales', err)));
//     }, forceRefresh);
//   }

//   // Optional: clear cache for a key or full
//   clearCacheKey(keyPrefix: string) {
//     for (const key of Array.from(this.cache.keys())) {
//       if (key.startsWith(keyPrefix)) this.cache.delete(key);
//     }
//   }

//   clearAllCache() {
//     this.cache.clear();
//   }
// }


// // import { Injectable } from '@angular/core';
// // import { Observable } from 'rxjs';
// // import { catchError } from 'rxjs/operators';
// // import { BaseApiService } from './base-api.service';
// // import { HttpErrorResponse, HttpParams } from '@angular/common/http';

// // @Injectable({ providedIn: 'root' })
// // export class DashboardService extends BaseApiService {
// //   private endpoint = '/v1/dashboard';

// //   // --- Primary, Enhanced KPI Endpoints ---

// //   getEnhancedKpiSummary(period?: string, startDate?: string, endDate?: string): Observable<any> {
// //     const params = this._buildParams({ period, startDate, endDate });
// //     return this.http
// //       .get<any>(`${this.baseUrl}${this.endpoint}/enhanced-summary`, { params })
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getEnhancedKpiSummary', error)));
// //   }

// //   getKpiSummary(period?: string, startDate?: string, endDate?: string): Observable<any> {
// //     const params = this._buildParams({ period, startDate, endDate });
// //     return this.http
// //       .get<any>(`${this.baseUrl}${this.endpoint}/kpi-summary`, { params })
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getKpiSummary', error)));
// //   }

// //   // --- Overview & Reports ---

// //   getDashboardOverview(period?: string, startDate?: string, endDate?: string): Observable<any> {
// //     const params = this._buildParams({ period, startDate, endDate });
// //     return this.http
// //       .get<any>(`${this.baseUrl}${this.endpoint}/overview`, { params })
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getDashboardOverview', error)));
// //   }

// //   downloadReport(): Observable<Blob> {
// //     return this.http
// //       .get(`${this.baseUrl}${this.endpoint}/download`, { responseType: 'blob' })
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('downloadReport', error)));
// //   }

// //   // --- Analytics ---

// //   getProductAnalytics(period?: string, limit: number = 10, startDate?: string, endDate?: string): Observable<any> {
// //     const params = this._buildParams({ period, limit: String(limit), startDate, endDate });
// //     return this.http
// //       .get<any>(`${this.baseUrl}${this.endpoint}/analytics/products`, { params })
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getProductAnalytics', error)));
// //   }

// //   getCustomerAnalytics(period?: string, limit: number = 10, startDate?: string, endDate?: string): Observable<any> {
// //     const params = this._buildParams({ period, limit: String(limit), startDate, endDate });
// //     return this.http
// //       .get<any>(`${this.baseUrl}${this.endpoint}/analytics/customers`, { params })
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getCustomerAnalytics', error)));
// //   }

// //   getPaymentAnalytics(period?: string, startDate?: string, endDate?: string): Observable<any> {
// //     const params = this._buildParams({ period, startDate, endDate });
// //     return this.http
// //       .get<any>(`${this.baseUrl}${this.endpoint}/analytics/payments`, { params })
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getPaymentAnalytics', error)));
// //   }

// //   getInventoryTurnover(period?: string, startDate?: string, endDate?: string): Observable<any> {
// //     const params = this._buildParams({ period, startDate, endDate });
// //     return this.http
// //       .get<any>(`${this.baseUrl}${this.endpoint}/analytics/inventory-turnover`, { params })
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getInventoryTurnover', error)));
// //   }

// //   getSalesForecast(): Observable<any> {
// //     return this.http
// //       .get<any>(`${this.baseUrl}${this.endpoint}/analytics/sales-forecast`)
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesForecast', error)));
// //   }

// //   // --- Sales Endpoints ---

// //   getSalesTrends(period?: string, startDate?: string, endDate?: string): Observable<any> {
// //     const params = this._buildParams({ period, startDate, endDate });
// //     return this.http
// //       .get<any>(`${this.baseUrl}${this.endpoint}/sales/trends`, { params })
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesTrends', error)));
// //   }

// //   getSalesCharts(period?: string, startDate?: string, endDate?: string): Observable<any> {
// //     const params = this._buildParams({ period, startDate, endDate });
// //     return this.http
// //       .get<any>(`${this.baseUrl}${this.endpoint}/sales/charts`, { params })
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesCharts', error)));
// //   }

// //   getYearlySales(period?: string): Observable<any> {
// //     const params = this._buildParams({ period });
// //     return this.http
// //       .get<any>(`${this.baseUrl}${this.endpoint}/sales/yearly`, { params })
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getYearlySales', error)));
// //   }

// //   getMonthlySales(period?: string): Observable<any> {
// //     const params = this._buildParams({ period });
// //     return this.http
// //       .get<any>(`${this.baseUrl}${this.endpoint}/sales/monthly`, { params })
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getMonthlySales', error)));
// //   }

// //   getWeeklySales(period?: string): Observable<any> {
// //     const params = this._buildParams({ period });
// //     return this.http
// //       .get<any>(`${this.baseUrl}${this.endpoint}/sales/weekly`, { params })
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getWeeklySales', error)));
// //   }

// //   // --- Private Helper ---
// //   private _buildParams(paramsObj: { [key: string]: string | number | undefined | null }): HttpParams {
// //     let params = new HttpParams();
// //     for (const key in paramsObj) {
// //       const value = paramsObj[key];
// //       if (value !== null && value !== undefined) {
// //         params = params.set(key, String(value));
// //       }
// //     }
// //     return params;
// //   }
// // }


// // // import { Injectable } from '@angular/core';
// // // import { Observable } from 'rxjs';
// // // import { catchError } from 'rxjs/operators';
// // // import { BaseApiService } from './base-api.service';
// // // import { HttpErrorResponse, HttpParams } from '@angular/common/http';


// // // @Injectable({ providedIn: 'root' })
// // // export class DashboardService extends BaseApiService {
// // //   private endpoint = '/v1/dashboard';

// // //   // --- Primary, Enhanced KPI Endpoints ---

// // //   /**
// // //    * Fetches the enhanced, all-in-one KPI summary with period-over-period comparisons.
// // //    * This is the recommended method for the main dashboard view.
// // //    */
// // //   getEnhancedKpiSummary(period?: string, startDate?: string, endDate?: string): Observable<any> {
// // //     const params = this._buildParams({ period, startDate, endDate });
// // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/enhanced-summary`, { params })
// // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getEnhancedKpiSummary', error)));
// // //   }

// // //   /**
// // //    * Fetches the comprehensive KPI summary.
// // //    */
// // //   getKpiSummary(period?: string, startDate?: string, endDate?: string): Observable<any> {
// // //     const params = this._buildParams({ period, startDate, endDate });
// // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/kpi-summary`, { params })
// // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getKpiSummary', error)));
// // //   }


// // //   // --- Granular Analytics & Legacy Methods ---

// // //   getDashboardOverview(period?: string, startDate?: string, endDate?: string): Observable<any> {
// // //     const params = this._buildParams({ period, startDate, endDate });
// // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/overview`, { params })
// // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getDashboardOverview', error)));
// // //   }

// // //   getProductAnalytics(period?: string, limit: number = 10, startDate?: string, endDate?: string): Observable<any> {
// // //     const params = this._buildParams({ period, limit: String(limit), startDate, endDate });
// // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/products`, { params })
// // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getProductAnalytics', error)));
// // //   }

// // //   getCustomerAnalytics(period?: string, limit: number = 10, startDate?: string, endDate?: string): Observable<any> {
// // //     const params = this._buildParams({ period, limit: String(limit), startDate, endDate });
// // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/customers`, { params })
// // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getCustomerAnalytics', error)));
// // //   }

// // //   getPaymentAnalytics(period?: string, startDate?: string, endDate?: string): Observable<any> {
// // //     const params = this._buildParams({ period, startDate, endDate });
// // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/payments`, { params })
// // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getPaymentAnalytics', error)));
// // //   }

// // //   getInventoryTurnover(period?: string, startDate?: string, endDate?: string): Observable<any> {
// // //     const params = this._buildParams({ period, startDate, endDate });
// // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/inventory-turnover`, { params })
// // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getInventoryTurnover', error)));
// // //   }

// // //   getSalesForecast(): Observable<any> {
// // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/sales-forecast`)
// // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesForecast', error)));
// // //   }
  
// // //   // --- Private Helper for Building HTTP Parameters ---
// // //   private _buildParams(paramsObj: { [key: string]: string | number | undefined | null }): HttpParams {
// // //     let params = new HttpParams();
// // //     for (const key in paramsObj) {
// // //       const value = paramsObj[key];
// // //       if (value !== null && value !== undefined) {
// // //         params = params.set(key, String(value));
// // //       }
// // //     }
// // //     return params;
// // //   }
// // // }


// // // // import { Injectable } from '@angular/core';
// // // // import { Observable } from 'rxjs';
// // // // import { catchError } from 'rxjs/operators';
// // // // import { BaseApiService } from './base-api.service';
// // // // import { HttpErrorResponse, HttpParams } from '@angular/common/http';

// // // // // Define interfaces for your data to ensure type safety
// // // // export interface DashboardOverview {
// // // //   totalRevenue: number;
// // // //   totalSales: number;
// // // //   newCustomers: number;
// // // // }

// // // // @Injectable({ providedIn: 'root' })
// // // // export class DashboardService extends BaseApiService {
// // // //   private endpoint = '/v1/dashboard';

// // // //   getDashboardOverview(period?: string, startDate?: string, endDate?: string): Observable<any> {
// // // //     let params = new HttpParams();
// // // //     if (period) {
// // // //       params = params.set('period', period);
// // // //     }
// // // //     if (startDate) {
// // // //       params = params.set('startDate', startDate);
// // // //     }
// // // //     if (endDate) {
// // // //       params = params.set('endDate', endDate);
// // // //     }
// // // //     return this.http.get<DashboardOverview>(`${this.baseUrl}${this.endpoint}/overview`, { params })
// // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getDashboardOverview', error)));
// // // //   }

// // // //   getProductAnalytics(period?: string, limit: number = 10, startDate?: string, endDate?: string): Observable<any> {
// // // //     let params = new HttpParams().set('limit', String(limit));
// // // //     if (period) {
// // // //       params = params.set('period', period);
// // // //     }
// // // //     if (startDate) {
// // // //       params = params.set('startDate', startDate);
// // // //     }
// // // //     if (endDate) {
// // // //       params = params.set('endDate', endDate);
// // // //     }
// // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/products`, { params })
// // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getProductAnalytics', error)));
// // // //   }

// // // //   getCustomerAnalytics(period?: string, limit: number = 10, startDate?: string, endDate?: string): Observable<any> {
// // // //     let params = new HttpParams().set('limit', String(limit));
// // // //     if (period) {
// // // //       params = params.set('period', period);
// // // //     }
// // // //     if (startDate) {
// // // //       params = params.set('startDate', startDate);
// // // //     }
// // // //     if (endDate) {
// // // //       params = params.set('endDate', endDate);
// // // //     }
// // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/customers`, { params })
// // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getCustomerAnalytics', error)));
// // // //   }

// // // //   /**
// // // //    * Fetches comprehensive payment and cash flow analytics.
// // // //    */
// // // //   getPaymentAnalytics(period?: string, startDate?: string, endDate?: string): Observable<any> {
// // // //     let params = new HttpParams();
// // // //     if (period) {
// // // //       params = params.set('period', period);
// // // //     }
// // // //     if (startDate) {
// // // //       params = params.set('startDate', startDate);
// // // //     }
// // // //     if (endDate) {
// // // //       params = params.set('endDate', endDate);
// // // //     }
// // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/payments`, { params })
// // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getPaymentAnalytics', error)));
// // // //   }

// // // //   /**
// // // //    * Fetches comprehensive sales analytics, supporting year, period, or custom dates.
// // // //    */
// // // //   // getSalesAnalytics(year?: string, period?: string, startDate?: string, endDate?: string): Observable<any> {
// // // //   //   let params = new HttpParams();
// // // //   //   if (year) {
// // // //   //     params = params.set('year', year);
// // // //   //   }
// // // //   //   if (period) {
// // // //   //     params = params.set('period', period);
// // // //   //   }
// // // //   //   if (startDate) {
// // // //   //     params = params.set('startDate', startDate);
// // // //   //   }
// // // //   //   if (endDate) {
// // // //   //     params = params.set('endDate', endDate);
// // // //   //   }
// // // //   //   return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/sales`, { params })
// // // //   //     .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesAnalytics', error)));
// // // //   // }

// // // //   /**
// // // //    * Fetches inventory turnover analytics.
// // // //    */
// // // //   getInventoryTurnover(period?: string, startDate?: string, endDate?: string): Observable<any> {
// // // //     let params = new HttpParams();
// // // //     if (period) {
// // // //       params = params.set('period', period);
// // // //     }
// // // //     if (startDate) {
// // // //       params = params.set('startDate', startDate);
// // // //     }
// // // //     if (endDate) {
// // // //       params = params.set('endDate', endDate);
// // // //     }
// // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/inventory-turnover`, { params })
// // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getInventoryTurnover', error)));
// // // //   }

// // // //   /**
// // // //    * Fetches sales forecast.
// // // //    */
// // // //   getSalesForecast(): Observable<any> {
// // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/sales-forecast`)
// // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesForecast', error)));
// // // //   }

// // // //   /**
// // // //    * Fetches total revenue for a period or custom dates.
// // // //    */
// // // //   getTotalRevenue(period?: string, startDate?: string, endDate?: string): Observable<any> {
// // // //     let params = new HttpParams();
// // // //     if (period) {
// // // //       params = params.set('period', period);
// // // //     }
// // // //     if (startDate) {
// // // //       params = params.set('startDate', startDate);
// // // //     }
// // // //     if (endDate) {
// // // //       params = params.set('endDate', endDate);
// // // //     }
// // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/total-revenue`, { params })
// // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getTotalRevenue', error)));
// // // //   }

// // // //   /**
// // // //    * Fetches sales count for a period or custom dates.
// // // //    */
// // // //   getSalesCount(period?: string, startDate?: string, endDate?: string): Observable<any> {
// // // //     let params = new HttpParams();
// // // //     if (period) {
// // // //       params = params.set('period', period);
// // // //     }
// // // //     if (startDate) {
// // // //       params = params.set('startDate', startDate);
// // // //     }
// // // //     if (endDate) {
// // // //       params = params.set('endDate', endDate);
// // // //     }
// // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/count`, { params })
// // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesCount', error)));
// // // //   }

// // // //   /**
// // // //    * Fetches average order value for a period or custom dates.
// // // //    */
// // // //   getAverageOrderValue(period?: string, startDate?: string, endDate?: string): Observable<any> {
// // // //     let params = new HttpParams();
// // // //     if (period) {
// // // //       params = params.set('period', period);
// // // //     }
// // // //     if (startDate) {
// // // //       params = params.set('startDate', startDate);
// // // //     }
// // // //     if (endDate) {
// // // //       params = params.set('endDate', endDate);
// // // //     }
// // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/average-order-value`, { params })
// // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAverageOrderValue', error)));
// // // //   }

// // // //   /**
// // // //    * Fetches sales trends for the specified number of days.
// // // //    */
// // // //   getSalesTrends(days: number = 30): Observable<any> {
// // // //     const params = new HttpParams().set('days', String(days));
// // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/trends`, { params })
// // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesTrends', error)));
// // // //   }

// // // //   /**
// // // //    * Fetches sales data for charts, supporting year or custom dates.
// // // //    */
// // // //   getSalesDataForCharts(year?: string, startDate?: string, endDate?: string): Observable<any> {
// // // //     let params = new HttpParams();
// // // //     if (year) {
// // // //       params = params.set('year', year);
// // // //     }
// // // //     if (startDate) {
// // // //       params = params.set('startDate', startDate);
// // // //     }
// // // //     if (endDate) {
// // // //       params = params.set('endDate', endDate);
// // // //     }
// // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/charts`, { params })
// // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesDataForCharts', error)));
// // // //   }

// // // //   /**
// // // //    * Fetches yearly sales by month, supporting year or custom dates.
// // // //    */
// // // //   getYearlySalesByMonth(year?: string, startDate?: string, endDate?: string): Observable<any> {
// // // //     let params = new HttpParams();
// // // //     if (year) {
// // // //       params = params.set('year', year);
// // // //     }
// // // //     if (startDate) {
// // // //       params = params.set('startDate', startDate);
// // // //     }
// // // //     if (endDate) {
// // // //       params = params.set('endDate', endDate);
// // // //     }
// // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/yearly`, { params })
// // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getYearlySalesByMonth', error)));
// // // //   }

// // // //   /**
// // // //    * Fetches monthly sales by day, supporting year, month, or custom dates.
// // // //    */
// // // //   getMonthlySalesByDay(year?: string, month?: string, startDate?: string, endDate?: string): Observable<any> {
// // // //     let params = new HttpParams();
// // // //     if (year) {
// // // //       params = params.set('year', year);
// // // //     }
// // // //     if (month) {
// // // //       params = params.set('month', month);
// // // //     }
// // // //     if (startDate) {
// // // //       params = params.set('startDate', startDate);
// // // //     }
// // // //     if (endDate) {
// // // //       params = params.set('endDate', endDate);
// // // //     }
// // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/monthly`, { params })
// // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getMonthlySalesByDay', error)));
// // // //   }

// // // //   /**
// // // //    * Fetches weekly sales by day, supporting year, week, or custom dates.
// // // //    */
// // // //   getWeeklySalesByDay(year?: string, week?: string, startDate?: string, endDate?: string): Observable<any> {
// // // //     let params = new HttpParams();
// // // //     if (year) {
// // // //       params = params.set('year', year);
// // // //     }
// // // //     if (week) {
// // // //       params = params.set('week', week);
// // // //     }
// // // //     if (startDate) {
// // // //       params = params.set('startDate', startDate);
// // // //     }
// // // //     if (endDate) {
// // // //       params = params.set('endDate', endDate);
// // // //     }
// // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/sales/weekly`, { params })
// // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getWeeklySalesByDay', error)));
// // // //   }
// // // // }


// // // // // import { Injectable } from '@angular/core';
// // // // // import { Observable } from 'rxjs';
// // // // // import { catchError } from 'rxjs/operators';
// // // // // import { BaseApiService } from './base-api.service';
// // // // // import { HttpErrorResponse, HttpParams } from '@angular/common/http';

// // // // // // Define interfaces for your data to ensure type safety
// // // // // export interface DashboardOverview {
// // // // //   totalRevenue: number;
// // // // //   totalSales: number;
// // // // //   newCustomers: number;
// // // // // }



// // // // // @Injectable({ providedIn: 'root' })
// // // // // export class DashboardService extends BaseApiService {
// // // // //   private endpoint = '/v1/dashboard';


// // // // //   getDashboardOverview(period: any): Observable<any> {
// // // // //     const params = new HttpParams().set('period', period);
// // // // //     return this.http.get<DashboardOverview>(`${this.baseUrl}${this.endpoint}/overview`, { params })
// // // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getDashboardOverview', error),),);
// // // // //   }


// // // // //   getProductAnalytics(period: any, limit: number = 5): Observable<any> {
// // // // //     const params = new HttpParams().set('period', period).set('limit', String(limit));
// // // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/products`, { params })
// // // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getProductAnalytics', error),),);
// // // // //   }


// // // // //   getCustomerAnalytics(period: any, limit: number = 5): Observable<any> {
// // // // //     const params = new HttpParams().set('period', period).set('limit', String(limit));
// // // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/customers`, { params })
// // // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getCustomerAnalytics', error),),);
// // // // //   }

// // // // //   /**
// // // // //    * Fetches comprehensive payment and cash flow analytics.
// // // // //    */
// // // // //   getPaymentAnalytics(period: any): Observable<any> {
// // // // //     const params = new HttpParams().set('period', period);
// // // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/payments`, { params })
// // // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getPaymentAnalytics', error),),);
// // // // //   }


// // // // //   // ---------------------------------------------- analytics Section ----------------------------------------------


// // // // //   /**
// // // // //     * Fetches comprehensive payment and cash flow analytics.
// // // // //     */
// // // // //   dashboardOverView(period: any): Observable<any> {
// // // // //     const params = new HttpParams().set('period', period);
// // // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/overview`, { params })
// // // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('dashboardOverView', error),),);
// // // // //   }

// // // // //   analyticTurnOver(period: any): Observable<any> {
// // // // //     const params = new HttpParams().set('period', period);
// // // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/inventory-turnover`, { params })
// // // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('analyticTurnOver', error),),);
// // // // //   }

// // // // //   salesForecast(period: any): Observable<any> {
// // // // //     const params = new HttpParams().set('period', period);
// // // // //     return this.http.get<any>(`${this.baseUrl}${this.endpoint}/analytics/sales-forecast`, { params })
// // // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('salesForecast', error),),);
// // // // //   }



// // // // // }

// // // // // // import { Injectable } from '@angular/core';
// // // // // // import { Observable } from 'rxjs';
// // // // // // import { catchError } from 'rxjs/operators';
// // // // // // import { BaseApiService } from './base-api.service';
// // // // // // import { HttpErrorResponse } from '@angular/common/http';
// // // // // // import {
// // // // // //   ApiResponse, ConsolidatedSummaryData, CustomerInsightData, DateRangeParams, InventoryValueData, ListParams, LowStockParams, PaymentMethodData, ProductInsightData, ReviewData, SalesChartData, SalesChartParams, SalesTrendData,
// // // // // // } from '../Models/dashboard-models'; // Adjust this import to your actual model location

// // // // // // @Injectable({
// // // // // //   providedIn: 'root',
// // // // // // })
// // // // // // export class DashboardService extends BaseApiService {
// // // // // //   private apiUrl = `${this.baseUrl}/v1/dashboard`;

// // // // // //   // --- Main Summary & Logs ---
// // // // // //   getDashboardSummary(params: DateRangeParams & { lowStockThreshold?: number; listLimits?: number }): Observable<ApiResponse<ConsolidatedSummaryData>> {
// // // // // //     return this.http.get<ApiResponse<ConsolidatedSummaryData>>(`${this.apiUrl}/summary`, {
// // // // // //       params: this.createHttpParams(params),
// // // // // //     }).pipe(catchError(err => this.errorhandler.handleError('getDashboardSummary', err)));
// // // // // //   }

// // // // // //   getDashboardLogsDetails(params: any): Observable<ApiResponse<any>> {
// // // // // //     return this.http.get<ApiResponse<any>>(`${this.apiUrl}/logs`, { params: this.createHttpParams(params) })
// // // // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getDashboardLogsDetails', error)));
// // // // // //   }

// // // // // //   // --- Sales Statistics ---
// // // // // //   getTotalRevenue(params: DateRangeParams): Observable<ApiResponse<{ totalRevenue: number }>> {
// // // // // //     return this.http.get<ApiResponse<{ totalRevenue: number }>>(`${this.apiUrl}/sales/revenue`, {
// // // // // //       params: this.createHttpParams(params),
// // // // // //     }).pipe(catchError(err => this.errorhandler.handleError('getTotalRevenue', err)));
// // // // // //   }

// // // // // //   getSalesCount(params: DateRangeParams): Observable<ApiResponse<{ salesCount: number }>> {
// // // // // //     return this.http.get<ApiResponse<{ salesCount: number }>>(`${this.apiUrl}/sales/count`, {
// // // // // //       params: this.createHttpParams(params),
// // // // // //     }).pipe(catchError(err => this.errorhandler.handleError('getSalesCount', err)));
// // // // // //   }

// // // // // //   getAverageOrderValue(params: DateRangeParams): Observable<ApiResponse<{ averageOrderValue: number }>> {
// // // // // //     return this.http.get<ApiResponse<{ averageOrderValue: number }>>(`${this.apiUrl}/sales/average-order-value`, {
// // // // // //       params: this.createHttpParams(params),
// // // // // //     }).pipe(catchError(err => this.errorhandler.handleError('getAverageOrderValue', err)));
// // // // // //   }

// // // // // //   getSalesTrends(params: { days?: number }): Observable<ApiResponse<SalesTrendData[]>> {
// // // // // //     return this.http.get<ApiResponse<SalesTrendData[]>>(`${this.apiUrl}/sales/trends`, {
// // // // // //       params: this.createHttpParams(params),
// // // // // //     }).pipe(catchError(err => this.errorhandler.handleError('getSalesTrends', err)));
// // // // // //   }

// // // // // //   // --- Product Statistics ---
// // // // // //   getLowStockProducts(params: LowStockParams): Observable<ApiResponse<ProductInsightData[]>> {
// // // // // //     return this.http.get<ApiResponse<ProductInsightData[]>>(`${this.apiUrl}/products/low-stock`, {
// // // // // //       params: this.createHttpParams(params),
// // // // // //     }).pipe(catchError(err => this.errorhandler.handleError('getLowStockProducts', err)));
// // // // // //   }

// // // // // //   getOutOfStockProducts(params: { limit?: number }): Observable<ApiResponse<ProductInsightData[]>> {
// // // // // //     return this.http.get<ApiResponse<ProductInsightData[]>>(`${this.apiUrl}/products/out-of-stock`, {
// // // // // //       params: this.createHttpParams(params),
// // // // // //     }).pipe(catchError(err => this.errorhandler.handleError('getOutOfStockProducts', err)));
// // // // // //   }

// // // // // //   getTopSellingProducts(params: any): Observable<ApiResponse<ProductInsightData[]>> {
// // // // // //     return this.http.get<ApiResponse<ProductInsightData[]>>(`${this.apiUrl}/products/top-selling`, {
// // // // // //       params: this.createHttpParams(params),
// // // // // //     }).pipe(catchError(err => this.errorhandler.handleError('getTopSellingProducts', err)));
// // // // // //   }

// // // // // //   getTotalInventoryValue(): Observable<ApiResponse<InventoryValueData>> {
// // // // // //     return this.http.get<ApiResponse<InventoryValueData>>(`${this.apiUrl}/products/inventory-value`)
// // // // // //       .pipe(catchError(err => this.errorhandler.handleError('getTotalInventoryValue', err)));
// // // // // //   }

// // // // // //   // --- Customer Statistics ---
// // // // // //   getCustomersWithOutstandingPayments(params: { limit?: number }): Observable<ApiResponse<CustomerInsightData[]>> {
// // // // // //     return this.http.get<ApiResponse<CustomerInsightData[]>>(`${this.apiUrl}/customers/outstanding-payments`, {
// // // // // //       params: this.createHttpParams(params),
// // // // // //     }).pipe(catchError(err => this.errorhandler.handleError('getCustomersWithOutstandingPayments', err)));
// // // // // //   }

// // // // // //   getTopCustomersByPurchase(params: ListParams): Observable<ApiResponse<CustomerInsightData[]>> {
// // // // // //     return this.http.get<ApiResponse<CustomerInsightData[]>>(`${this.apiUrl}/customers/top-by-purchase`, {
// // // // // //       params: this.createHttpParams(params),
// // // // // //     }).pipe(catchError(err => this.errorhandler.handleError('getTopCustomersByPurchase', err)));
// // // // // //   }

// // // // // //   getNewCustomersCount(params: DateRangeParams): Observable<ApiResponse<{ newCustomersCount: number }>> {
// // // // // //     return this.http.get<ApiResponse<{ newCustomersCount: number }>>(`${this.apiUrl}/customers/new-count`, {
// // // // // //       params: this.createHttpParams(params),
// // // // // //     }).pipe(catchError(err => this.errorhandler.handleError('getNewCustomersCount', err)));
// // // // // //   }

// // // // // //   // --- Payment Statistics ---
// // // // // //   getTotalPaymentsReceived(params: DateRangeParams): Observable<ApiResponse<{ totalPaymentsReceived: number }>> {
// // // // // //     return this.http.get<ApiResponse<{ totalPaymentsReceived: number }>>(`${this.apiUrl}/payments/total-received`, {
// // // // // //       params: this.createHttpParams(params),
// // // // // //     }).pipe(catchError(err => this.errorhandler.handleError('getTotalPaymentsReceived', err)));
// // // // // //   }

// // // // // //   getPaymentsByMethod(params: DateRangeParams): Observable<ApiResponse<PaymentMethodData[]>> {
// // // // // //     return this.http.get<ApiResponse<PaymentMethodData[]>>(`${this.apiUrl}/payments/by-method`, {
// // // // // //       params: this.createHttpParams(params),
// // // // // //     }).pipe(catchError(err => this.errorhandler.handleError('getPaymentsByMethod', err)));
// // // // // //   }

// // // // // //   // --- Chart Data Methods (Kept as separate functions as requested) ---

// // // // // //   getSalesDataForCharts(params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
// // // // // //     return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/charts`, { params: this.createHttpParams(params) })
// // // // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesDataForCharts', error)));
// // // // // //   }

// // // // // //   getSalesDataForChartsYearly(params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
// // // // // //     return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/yearly`, { params: this.createHttpParams(params) })
// // // // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesDataForChartsYearly', error)));
// // // // // //   }

// // // // // //   getSalesDataForChartsMonthly(params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
// // // // // //     return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/monthly`, { params: this.createHttpParams(params) })
// // // // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesDataForChartsMonthly', error)));
// // // // // //   }

// // // // // //   getSalesDataForChartsWeekly(params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
// // // // // //     return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/weekly`, { params: this.createHttpParams(params) })
// // // // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesDataForChartsWeekly', error)));
// // // // // //   }

// // // // // //     getSalesDataForChartsCombo(params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
// // // // // //     return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/charts`, { params: this.createHttpParams(params) })
// // // // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesDataForChartsCombo', error)));
// // // // // //   }

// // // // // //   // --- Consolidated Chart Method (For Future Use) ---
// // // // // //   /**
// // // // // //    * A single, flexible method for fetching chart data. Can be used in the future to simplify the service.
// // // // // //    * @param granularity - The type of chart data to fetch: 'charts', 'yearly', 'monthly', or 'weekly'.
// // // // // //    * @param params - The query parameters (e.g., year, month, week).
// // // // // //    */
// // // // // //   getSalesChartData(granularity: 'charts' | 'yearly' | 'monthly' | 'weekly', params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
// // // // // //     return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/${granularity}`, { params: this.createHttpParams(params) })
// // // // // //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError(`getSalesChartData (${granularity})`, error)));
// // // // // //   }
// // // // // // }