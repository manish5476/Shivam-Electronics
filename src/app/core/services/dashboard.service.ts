import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';

// Define interfaces for your data to ensure type safety
export interface DashboardOverview {
  totalRevenue: number;
  totalSales: number;
  newCustomers: number;
}



@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseApiService {
  private endpoint = '/v1/dashboard';

  /**
   * Fetches the main KPI overview for the dashboard header.
   * @param period - The time period (e.g., 'last7days', 'last30days').
   */
  getDashboardOverview(period: string): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http
      .get<DashboardOverview>(`${this.baseUrl}${this.endpoint}/overview`, { params })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getDashboardOverview', error),
        ),
      );
  }

  /**
   * Fetches comprehensive product and inventory analytics.
   * @param period - The time period.
   * @param limit - The number of top items to return.
   */
  getProductAnalytics(period: string, limit: number = 5): Observable<any> {
    const params = new HttpParams().set('period', period).set('limit', String(limit));
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/analytics/products`, { params })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getProductAnalytics', error),
        ),
      );
  }

  /**
   * Fetches comprehensive customer behavior and RFM analytics.
   */
  getCustomerAnalytics(period: string, limit: number = 5): Observable<any> {
    const params = new HttpParams().set('period', period).set('limit', String(limit));
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/analytics/customers`, { params })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getCustomerAnalytics', error),
        ),
      );
  }

  /**
   * Fetches comprehensive payment and cash flow analytics.
   */
  getPaymentAnalytics(period: string): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/analytics/payments`, { params })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getPaymentAnalytics', error),
        ),
      );
  }


  // ---------------------------------------------- analytics Section ----------------------------------------------


  /**
    * Fetches comprehensive payment and cash flow analytics.
    */
  dashboardOverView(period: string): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/overview`, { params })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('dashboardOverView', error),
        ),
      );
  }

  analyticTurnOver(period: string): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/analytics/inventory-turnover`, { params })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('analyticTurnOver', error),
        ),
      );
  }
  
  salesForecast(period: string): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/analytics/sales-forecast`, { params })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('salesForecast', error),
        ),
      );
  }



}

// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { BaseApiService } from './base-api.service';
// import { HttpErrorResponse } from '@angular/common/http';
// import {
//   ApiResponse, ConsolidatedSummaryData, CustomerInsightData, DateRangeParams, InventoryValueData, ListParams, LowStockParams, PaymentMethodData, ProductInsightData, ReviewData, SalesChartData, SalesChartParams, SalesTrendData,
// } from '../Models/dashboard-models'; // Adjust this import to your actual model location

// @Injectable({
//   providedIn: 'root',
// })
// export class DashboardService extends BaseApiService {
//   private apiUrl = `${this.baseUrl}/v1/dashboard`;

//   // --- Main Summary & Logs ---
//   getDashboardSummary(params: DateRangeParams & { lowStockThreshold?: number; listLimits?: number }): Observable<ApiResponse<ConsolidatedSummaryData>> {
//     return this.http.get<ApiResponse<ConsolidatedSummaryData>>(`${this.apiUrl}/summary`, {
//       params: this.createHttpParams(params),
//     }).pipe(catchError(err => this.errorhandler.handleError('getDashboardSummary', err)));
//   }

//   getDashboardLogsDetails(params: any): Observable<ApiResponse<any>> {
//     return this.http.get<ApiResponse<any>>(`${this.apiUrl}/logs`, { params: this.createHttpParams(params) })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getDashboardLogsDetails', error)));
//   }

//   // --- Sales Statistics ---
//   getTotalRevenue(params: DateRangeParams): Observable<ApiResponse<{ totalRevenue: number }>> {
//     return this.http.get<ApiResponse<{ totalRevenue: number }>>(`${this.apiUrl}/sales/revenue`, {
//       params: this.createHttpParams(params),
//     }).pipe(catchError(err => this.errorhandler.handleError('getTotalRevenue', err)));
//   }

//   getSalesCount(params: DateRangeParams): Observable<ApiResponse<{ salesCount: number }>> {
//     return this.http.get<ApiResponse<{ salesCount: number }>>(`${this.apiUrl}/sales/count`, {
//       params: this.createHttpParams(params),
//     }).pipe(catchError(err => this.errorhandler.handleError('getSalesCount', err)));
//   }

//   getAverageOrderValue(params: DateRangeParams): Observable<ApiResponse<{ averageOrderValue: number }>> {
//     return this.http.get<ApiResponse<{ averageOrderValue: number }>>(`${this.apiUrl}/sales/average-order-value`, {
//       params: this.createHttpParams(params),
//     }).pipe(catchError(err => this.errorhandler.handleError('getAverageOrderValue', err)));
//   }

//   getSalesTrends(params: { days?: number }): Observable<ApiResponse<SalesTrendData[]>> {
//     return this.http.get<ApiResponse<SalesTrendData[]>>(`${this.apiUrl}/sales/trends`, {
//       params: this.createHttpParams(params),
//     }).pipe(catchError(err => this.errorhandler.handleError('getSalesTrends', err)));
//   }

//   // --- Product Statistics ---
//   getLowStockProducts(params: LowStockParams): Observable<ApiResponse<ProductInsightData[]>> {
//     return this.http.get<ApiResponse<ProductInsightData[]>>(`${this.apiUrl}/products/low-stock`, {
//       params: this.createHttpParams(params),
//     }).pipe(catchError(err => this.errorhandler.handleError('getLowStockProducts', err)));
//   }

//   getOutOfStockProducts(params: { limit?: number }): Observable<ApiResponse<ProductInsightData[]>> {
//     return this.http.get<ApiResponse<ProductInsightData[]>>(`${this.apiUrl}/products/out-of-stock`, {
//       params: this.createHttpParams(params),
//     }).pipe(catchError(err => this.errorhandler.handleError('getOutOfStockProducts', err)));
//   }

//   getTopSellingProducts(params: any): Observable<ApiResponse<ProductInsightData[]>> {
//     return this.http.get<ApiResponse<ProductInsightData[]>>(`${this.apiUrl}/products/top-selling`, {
//       params: this.createHttpParams(params),
//     }).pipe(catchError(err => this.errorhandler.handleError('getTopSellingProducts', err)));
//   }

//   getTotalInventoryValue(): Observable<ApiResponse<InventoryValueData>> {
//     return this.http.get<ApiResponse<InventoryValueData>>(`${this.apiUrl}/products/inventory-value`)
//       .pipe(catchError(err => this.errorhandler.handleError('getTotalInventoryValue', err)));
//   }

//   // --- Customer Statistics ---
//   getCustomersWithOutstandingPayments(params: { limit?: number }): Observable<ApiResponse<CustomerInsightData[]>> {
//     return this.http.get<ApiResponse<CustomerInsightData[]>>(`${this.apiUrl}/customers/outstanding-payments`, {
//       params: this.createHttpParams(params),
//     }).pipe(catchError(err => this.errorhandler.handleError('getCustomersWithOutstandingPayments', err)));
//   }

//   getTopCustomersByPurchase(params: ListParams): Observable<ApiResponse<CustomerInsightData[]>> {
//     return this.http.get<ApiResponse<CustomerInsightData[]>>(`${this.apiUrl}/customers/top-by-purchase`, {
//       params: this.createHttpParams(params),
//     }).pipe(catchError(err => this.errorhandler.handleError('getTopCustomersByPurchase', err)));
//   }

//   getNewCustomersCount(params: DateRangeParams): Observable<ApiResponse<{ newCustomersCount: number }>> {
//     return this.http.get<ApiResponse<{ newCustomersCount: number }>>(`${this.apiUrl}/customers/new-count`, {
//       params: this.createHttpParams(params),
//     }).pipe(catchError(err => this.errorhandler.handleError('getNewCustomersCount', err)));
//   }

//   // --- Payment Statistics ---
//   getTotalPaymentsReceived(params: DateRangeParams): Observable<ApiResponse<{ totalPaymentsReceived: number }>> {
//     return this.http.get<ApiResponse<{ totalPaymentsReceived: number }>>(`${this.apiUrl}/payments/total-received`, {
//       params: this.createHttpParams(params),
//     }).pipe(catchError(err => this.errorhandler.handleError('getTotalPaymentsReceived', err)));
//   }

//   getPaymentsByMethod(params: DateRangeParams): Observable<ApiResponse<PaymentMethodData[]>> {
//     return this.http.get<ApiResponse<PaymentMethodData[]>>(`${this.apiUrl}/payments/by-method`, {
//       params: this.createHttpParams(params),
//     }).pipe(catchError(err => this.errorhandler.handleError('getPaymentsByMethod', err)));
//   }

//   // --- Chart Data Methods (Kept as separate functions as requested) ---

//   getSalesDataForCharts(params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
//     return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/charts`, { params: this.createHttpParams(params) })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesDataForCharts', error)));
//   }

//   getSalesDataForChartsYearly(params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
//     return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/yearly`, { params: this.createHttpParams(params) })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesDataForChartsYearly', error)));
//   }

//   getSalesDataForChartsMonthly(params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
//     return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/monthly`, { params: this.createHttpParams(params) })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesDataForChartsMonthly', error)));
//   }

//   getSalesDataForChartsWeekly(params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
//     return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/weekly`, { params: this.createHttpParams(params) })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesDataForChartsWeekly', error)));
//   }

//     getSalesDataForChartsCombo(params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
//     return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/charts`, { params: this.createHttpParams(params) })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesDataForChartsCombo', error)));
//   }

//   // --- Consolidated Chart Method (For Future Use) ---
//   /**
//    * A single, flexible method for fetching chart data. Can be used in the future to simplify the service.
//    * @param granularity - The type of chart data to fetch: 'charts', 'yearly', 'monthly', or 'weekly'.
//    * @param params - The query parameters (e.g., year, month, week).
//    */
//   getSalesChartData(granularity: 'charts' | 'yearly' | 'monthly' | 'weekly', params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
//     return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/${granularity}`, { params: this.createHttpParams(params) })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError(`getSalesChartData (${granularity})`, error)));
//   }
// }