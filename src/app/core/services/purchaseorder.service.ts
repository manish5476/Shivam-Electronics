import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PurchaseorderService extends BaseApiService {
  private endpoint = '/v1/purchase-orders';

  createPurchaseOrder(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${this.endpoint}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createPurchaseOrder', error)));
  }

  getPurchaseOrders(filterParams?: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.endpoint}`, { params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getPurchaseOrders', error)));
  }

  receiveStock(purchaseOrderId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}${this.endpoint}/${purchaseOrderId}/receive-stock`, {})
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('receiveStock', error)));
  }

  // NEW: Method to update a purchase order (e.g., to change status)
  updatePurchaseOrder(id: string, data: { status: string }): Observable<any> {
    return this.http.patch(`${this.baseUrl}${this.endpoint}/${id}/receive-stock`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updatePurchaseOrder', error)));
  }

  // NEW: Method to delete a purchase order
  deletePurchaseOrder(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${this.endpoint}/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deletePurchaseOrder', error)));
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
// export class PurchaseorderService extends BaseApiService {
//   private endpoint = '/v1/purchase-orders';

//   createPurchaseOrder(data: any): Observable<any> {
//     return this.http.post(`${this.baseUrl}${this.endpoint}`, data)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createPurchaseOrder', error)));
//   }

//   getPurchaseOrders(filterParams?: any): Observable<any> {
//     return this.http.get<any>(`${this.baseUrl}${this.endpoint}`, { params: this.createHttpParams(filterParams) })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getPurchaseOrders', error)));
//   }

//   receiveStock(purchaseOrderId: string): Observable<any> {
//     // Correcting the API call based on your backend controller (PATCH, no body needed)
//     return this.http.patch(`${this.baseUrl}${this.endpoint}/${purchaseOrderId}/receive-stock`, {})
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('receiveStock', error)));
//   }

// }
  // // RENAMED for consistency
  // createPurchaseOrder(data: any): Observable<any> {
  //   return this.http.post(`${this.baseUrl}${this.endpoint}`, data)
  //     .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createPurchase', error)));
  // }
  
  // getPurchaseOrders(filterParams?: any): Observable<any> {
  //   return this.http.get<any>(`${this.baseUrl}${this.endpoint}`, { params: this.createHttpParams(filterParams) })
  //     .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getTransactions', error)));
  // }
  
  // receiveStock(ID?: any): Observable<any> {
  //   return this.http.get<any>(`${this.baseUrl}${this.endpoint}/${ID}`,)
  //     .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getTransactions', error)));
  // }

  // updatePurchaseById(purchaseOrderId: string, data: any): Observable<any> {
  //   return this.http.patch(`${this.baseUrl}${this.endpoint}/${purchaseOrderId}/receive-stock}`, data)
  //     .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updatePurchaseById', error)));
  // }
// }
