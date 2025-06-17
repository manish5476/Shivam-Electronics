import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';

import {
  ApiResponse, ConsolidatedSummaryData, CustomerInsightData, DateRangeParams, InventoryValueData, ListParams, LowStockParams, PaymentMethodData, ProductInsightData, ProductListParams, ReviewData, SalesChartData, SalesChartParams, SalesSummaryData, SalesTrendData,
} from '../Models/dashboard-models'; // Adjust this import to your actual model location
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseApiService {
  private apiUrl = `${this.baseUrl}/v1/dashboard`;
  // Consolidated Summary
  getDashboardSummary(params: DateRangeParams & { lowStockThreshold?: number; listLimits?: number }): Observable<ApiResponse<ConsolidatedSummaryData>> {
    return this.http.get<ApiResponse<ConsolidatedSummaryData>>(`${this.apiUrl}/summary`, {
      params: this.createHttpParams(params),
    }).pipe(catchError(err => this.errorhandler.handleError('getDashboardSummary', err)));
  }

   getDashboardLogsDetails(params: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/logs`, { params: this.createHttpParams(params), })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getDashboardLogsDetails', error)));
  }
  // --- Sales ---
  getTotalRevenue(params: DateRangeParams): Observable<ApiResponse<{ totalRevenue: number }>> {
    return this.http.get<ApiResponse<{ totalRevenue: number }>>(`${this.apiUrl}/sales/revenue`, {
      params: this.createHttpParams(params),
    }).pipe(catchError(err => this.errorhandler.handleError('getTotalRevenue', err)));
  }

  getSalesCount(params: DateRangeParams): Observable<ApiResponse<{ salesCount: number }>> {
    return this.http.get<ApiResponse<{ salesCount: number }>>(`${this.apiUrl}/sales/count`, {
      params: this.createHttpParams(params),
    }).pipe(catchError(err => this.errorhandler.handleError('getSalesCount', err)));
  }

  getAverageOrderValue(params: DateRangeParams): Observable<ApiResponse<{ averageOrderValue: number }>> {
    return this.http.get<ApiResponse<{ averageOrderValue: number }>>(`${this.apiUrl}/sales/average-order-value`, {
      params: this.createHttpParams(params),
    }).pipe(catchError(err => this.errorhandler.handleError('getAverageOrderValue', err)));
  }

  getSalesTrends(params: { days?: number }): Observable<ApiResponse<SalesTrendData[]>> {
    return this.http.get<ApiResponse<SalesTrendData[]>>(`${this.apiUrl}/sales/trends`, {
      params: this.createHttpParams(params),
    }).pipe(catchError(err => this.errorhandler.handleError('getSalesTrends', err)));
  }

  // --- Products ---
  getLowStockProducts(params: LowStockParams): Observable<ApiResponse<ProductInsightData[]>> {
    return this.http.get<ApiResponse<ProductInsightData[]>>(`${this.apiUrl}/products/low-stock`, {
      params: this.createHttpParams(params),
    }).pipe(catchError(err => this.errorhandler.handleError('getLowStockProducts', err)));
  }

  getOutOfStockProducts(params: { limit?: number }): Observable<ApiResponse<ProductInsightData[]>> {
    return this.http.get<ApiResponse<ProductInsightData[]>>(`${this.apiUrl}/products/out-of-stock`, {
      params: this.createHttpParams(params),
    }).pipe(catchError(err => this.errorhandler.handleError('getOutOfStockProducts', err)));
  }

  getTopSellingProducts(params: ProductListParams): Observable<ApiResponse<ProductInsightData[]>> {
    return this.http.get<ApiResponse<ProductInsightData[]>>(`${this.apiUrl}/products/top-selling`, {
      params: this.createHttpParams(params),
    }).pipe(catchError(err => this.errorhandler.handleError('getTopSellingProducts', err)));
  }

  getTotalInventoryValue(): Observable<ApiResponse<InventoryValueData>> {
    return this.http.get<ApiResponse<InventoryValueData>>(`${this.apiUrl}/products/inventory-value`)
      .pipe(catchError(err => this.errorhandler.handleError('getTotalInventoryValue', err)));
  }

  // --- Customers ---
  getCustomersWithOutstandingPayments(params: { limit?: number }): Observable<ApiResponse<CustomerInsightData[]>> {
    return this.http.get<ApiResponse<CustomerInsightData[]>>(`${this.apiUrl}/customers/outstanding-payments`, {
      params: this.createHttpParams(params),
    }).pipe(catchError(err => this.errorhandler.handleError('getCustomersWithOutstandingPayments', err)));
  }

  getTopCustomersByPurchase(params: ListParams): Observable<ApiResponse<CustomerInsightData[]>> {
    return this.http.get<ApiResponse<CustomerInsightData[]>>(`${this.apiUrl}/customers/top-by-purchase`, {
      params: this.createHttpParams(params),
    }).pipe(catchError(err => this.errorhandler.handleError('getTopCustomersByPurchase', err)));
  }

  getNewCustomersCount(params: DateRangeParams): Observable<ApiResponse<{ newCustomersCount: number }>> {
    return this.http.get<ApiResponse<{ newCustomersCount: number }>>(`${this.apiUrl}/customers/new-count`, {
      params: this.createHttpParams(params),
    }).pipe(catchError(err => this.errorhandler.handleError('getNewCustomersCount', err)));
  }

  // --- Payments ---
  getTotalPaymentsReceived(params: DateRangeParams): Observable<ApiResponse<{ totalPaymentsReceived: number }>> {
    return this.http.get<ApiResponse<{ totalPaymentsReceived: number }>>(`${this.apiUrl}/payments/total-received`, {
      params: this.createHttpParams(params),
    }).pipe(catchError(err => this.errorhandler.handleError('getTotalPaymentsReceived', err)));
  }

  getPaymentsByMethod(params: DateRangeParams): Observable<ApiResponse<PaymentMethodData[]>> {
    return this.http.get<ApiResponse<PaymentMethodData[]>>(`${this.apiUrl}/payments/by-method`, {
      params: this.createHttpParams(params),
    }).pipe(catchError(err => this.errorhandler.handleError('getPaymentsByMethod', err)));
  }
  // chart

  getSalesDataForCharts(params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
    return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/charts`, { params: this.createHttpParams(params), })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesDataForCharts', error)));
  }


  //  * @queryparam {Number} [ ] - The year to fetch sales for (default: current year)
  getSalesDataForChartsYearly(params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
    return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/yearly`, { params: this.createHttpParams(params), })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesDataForCharts', error)));
  }

  //  * @queryparam {Number} [ ] - The year to fetch sales for (default: current year)
  getSalesDataForChartsMonthly(params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
    return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/monthly`, { params: this.createHttpParams(params), })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesDataForCharts', error)));
  }
  //  * @queryparam {Number} [ ] - The year to fetch sales for (default: current year)
  getSalesDataForChartsWeekly(params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
    return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/weekly`, { params: this.createHttpParams(params), })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesDataForCharts', error)));
  }
   getSalesDataForChartsCombo(params: SalesChartParams): Observable<ApiResponse<SalesChartData>> {
    return this.http.get<ApiResponse<SalesChartData>>(`${this.apiUrl}/sales/charts`, { params: this.createHttpParams(params), })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSalesDataForCharts', error)));
  }
}



// import { Injectable } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';
// // import { environment } from '; // Your environment file
// import { environment } from '../../../environments/environment';
// import { BaseApiService } from './base-api.service';
// // --- Request Parameter Interfaces (Optional but good for clarity) ---
// export interface DateRangeParams {
//   period?: 'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'year' | string; // Allow other custom strings if backend supports
//   startDate?: string; // YYYY-MM-DD
//   endDate?: string; // YYYY-MM-DD
// }

// export interface ListParams extends DateRangeParams {
//   limit?: number;
// }

// export interface ProductListParams extends ListParams {
//   sortBy?: 'revenue' | 'quantity';
// }

// export interface LowStockParams {
//   threshold?: number;
//   limit?: number;
// }

// // --- Response Data Interfaces (align with backend responses) ---
// export interface SalesSummaryData {
//   totalRevenue: number;
//   numberOfSales: number;
//   averageOrderValue: number;
// }

// export interface ProductInsightData {
//   productId: string;
//   title: string;
//   slug?: string;
//   thumbnail?: string;
//   totalRevenue?: number;
//   totalQuantitySold?: number;
//   stock?: number; // For low/out of stock
//   sku?: string;
//   availabilityStatus?: string;
// }

// export interface CustomerInsightData {
//   _id: string;
//   fullname: string;
//   email?: string;
//   mobileNumber?: string;
//   remainingAmount?: number;
//   totalPurchasedAmount?: number; // Overall
//   periodPurchasedAmount?: number; // If calculated for a period
//   totalPurchasedAmountGlobal?: number; // For dynamic top customer
// }

// export interface PaymentMethodData {
//   _id: string; // paymentMethod
//   totalAmount: number;
//   count: number;
// }

// export interface ReviewData {
//   _id: string;
//   rating: number;
//   userreview: string;
//   createdAt: string; // ISO Date string
//   user: { _id: string; fullname: string; email?: string; };
//   product: { _id: string; title: string; thumbnail?: string; slug?: string; };
// }

// export interface SalesTrendData {
//   _id: string; // Date string YYYY-MM-DD
//   dailyRevenue: number;
//   dailySalesCount: number;
// }

// export interface InventoryValueData {
//   totalValue: number;
//   totalItemsInStock: number;
// }

// export interface ApiResponse<T> { // Generic API response wrapper
//   success: boolean;
//   data: T;
//   message?: string; // For errors
// }

// // For Consolidated Summary
// export interface ConsolidatedSummaryData {
//   sales: SalesSummaryData;
//   products: {
//     lowStock: ProductInsightData[];
//     topSelling: ProductInsightData[];
//   };
//   customers: {
//     outstandingPayments: CustomerInsightData[];
//     newCustomersCount: number;
//   };
//   payments: {
//     totalReceived: number;
//   };
//   // You can add more sections here like recentReviews if fetched in summary
// }


// @Injectable({
//   providedIn: 'root'
// })
// export class DashboardService extends BaseApiService {
//   private apiUrl = `${this.baseUrl}/v1/dashboard`; // e.g., http://localhost:3000/api/v1/dashboard


//   private buildParams(paramsObj: any): HttpParams {
//     let httpParams = new HttpParams();
//     for (const key in paramsObj) {
//       if (paramsObj.hasOwnProperty(key) && paramsObj[key] !== undefined && paramsObj[key] !== null) {
//         httpParams = httpParams.set(key, paramsObj[key].toString());
//       }
//     }
//     return httpParams;
//   }

//   getDashboardGraph(filterParams?: any): Observable<any[]> {
//     return this.http.get<any[]>(`${this.baseUrl}/v1/customers`, { params: this.buildParams(filterParams) })
//       // .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllCustomerData', error)));
//   }

//   // Consolidated Summary
//   getDashboardSummary(params: DateRangeParams & { lowStockThreshold?: number; listLimits?: number }): Observable<ApiResponse<ConsolidatedSummaryData>> {
//     return this.http.get<ApiResponse<ConsolidatedSummaryData>>(`${this.apiUrl}/summary`, { params: this.buildParams(params) });
//   }

//   // --- Sales ---
//   getTotalRevenue(params: DateRangeParams): Observable<ApiResponse<{ totalRevenue: number }>> {
//     return this.http.get<ApiResponse<{ totalRevenue: number }>>(`${this.apiUrl}/sales/revenue`, { params: this.buildParams(params) });
//   }

//   getSalesCount(params: DateRangeParams): Observable<ApiResponse<{ salesCount: number }>> {
//     return this.http.get<ApiResponse<{ salesCount: number }>>(`${this.apiUrl}/sales/count`, { params: this.buildParams(params) });
//   }

//   getAverageOrderValue(params: DateRangeParams): Observable<ApiResponse<{ averageOrderValue: number }>> {
//     return this.http.get<ApiResponse<{ averageOrderValue: number }>>(`${this.apiUrl}/sales/average-order-value`, { params: this.buildParams(params) });
//   }

//   getSalesTrends(params: { days?: number }): Observable<ApiResponse<SalesTrendData[]>> {
//     return this.http.get<ApiResponse<SalesTrendData[]>>(`${this.apiUrl}/sales/trends`, { params: this.buildParams(params) });
//   }

//   // --- Products ---
//   getLowStockProducts(params: LowStockParams): Observable<ApiResponse<ProductInsightData[]>> {
//     return this.http.get<ApiResponse<ProductInsightData[]>>(`${this.apiUrl}/products/low-stock`, { params: this.buildParams(params) });
//   }

//   getOutOfStockProducts(params: { limit?: number }): Observable<ApiResponse<ProductInsightData[]>> {
//     return this.http.get<ApiResponse<ProductInsightData[]>>(`${this.apiUrl}/products/out-of-stock`, { params: this.buildParams(params) });
//   }

//   getTopSellingProducts(params: ProductListParams): Observable<ApiResponse<ProductInsightData[]>> {
//     return this.http.get<ApiResponse<ProductInsightData[]>>(`${this.apiUrl}/products/top-selling`, { params: this.buildParams(params) });
//   }

//   getTotalInventoryValue(): Observable<ApiResponse<InventoryValueData>> {
//     return this.http.get<ApiResponse<InventoryValueData>>(`${this.apiUrl}/products/inventory-value`);
//   }

//   // --- Customers ---
//   getCustomersWithOutstandingPayments(params: { limit?: number }): Observable<ApiResponse<CustomerInsightData[]>> {
//     return this.http.get<ApiResponse<CustomerInsightData[]>>(`${this.apiUrl}/customers/outstanding-payments`, { params: this.buildParams(params) });
//   }

//   getTopCustomersByPurchase(params: ListParams): Observable<ApiResponse<CustomerInsightData[]>> {
//     return this.http.get<ApiResponse<CustomerInsightData[]>>(`${this.apiUrl}/customers/top-by-purchase`, { params: this.buildParams(params) });
//   }

//   getNewCustomersCount(params: DateRangeParams): Observable<ApiResponse<{ newCustomersCount: number }>> {
//     return this.http.get<ApiResponse<{ newCustomersCount: number }>>(`${this.apiUrl}/customers/new-count`, { params: this.buildParams(params) });
//   }

//   // --- Payments ---
//   getTotalPaymentsReceived(params: DateRangeParams): Observable<ApiResponse<{ totalPaymentsReceived: number }>> {
//     return this.http.get<ApiResponse<{ totalPaymentsReceived: number }>>(`${this.apiUrl}/payments/total-received`, { params: this.buildParams(params) });
//   }

//   getPaymentsByMethod(params: DateRangeParams): Observable<ApiResponse<PaymentMethodData[]>> {
//     return this.http.get<ApiResponse<PaymentMethodData[]>>(`${this.apiUrl}/payments/by-method`, { params: this.buildParams(params) });
//   }

//   getFailedPaymentsCount(params: DateRangeParams): Observable<ApiResponse<{ failedPaymentsCount: number }>> {
//     return this.http.get<ApiResponse<{ failedPaymentsCount: number }>>(`${this.apiUrl}/payments/failed-count`, { params: this.buildParams(params) });
//   }

//   // --- Reviews ---
//   getOverallAverageRating(): Observable<ApiResponse<{ overallAverage: number, totalReviewsConsidered: number }>> {
//     return this.http.get<ApiResponse<{ overallAverage: number, totalReviewsConsidered: number }>>(`${this.apiUrl}/reviews/overall-average-rating`);
//   }

//   getRecentReviews(params: { limit?: number }): Observable<ApiResponse<ReviewData[]>> {
//     return this.http.get<ApiResponse<ReviewData[]>>(`${this.apiUrl}/reviews/recent`, { params: this.buildParams(params) });
//   }
// }