import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

// Define an interface for the Seller for type safety
export interface Seller {
  _id: string;
  name: string;
  shopName: string; // CORRECTED: Matched the form's 'shopName' property
  // ... add other seller fields as needed
}

@Injectable({ providedIn: 'root' })
export class SellerService extends BaseApiService {

  private endpoint = '/v1/sellers';

  getAllSellersdata(filterParams?: any): Observable<Seller[]> {
    return this.http.get<Seller[]>(`${this.baseUrl}${this.endpoint}`, { params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllSellersdata', error)));
  }

  getSellerDataWithId(id: string): Observable<Seller> {
    return this.http.get<Seller>(`${this.baseUrl}${this.endpoint}/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSellerDataWithId', error)));
  }

  createNewSeller(data: Seller): Observable<any> {
    return this.http.post(`${this.baseUrl}${this.endpoint}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createNewSeller', error)));
  }

  // CHANGED: Renamed for clarity and consistency
  updateSeller(sellerId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}${this.endpoint}/${sellerId}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updateSeller', error)));
  }

  deleteSellers(sellerIds: string[]): Observable<any> {
    const url = `${this.baseUrl}${this.endpoint}`;
    const body = { ids: sellerIds };
    return this.http.delete(url, { body })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deleteSellers', error)));
  }
}

// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { BaseApiService } from './base-api.service';
// import { HttpErrorResponse } from '@angular/common/http';

// // Define an interface for the Seller for type safety
// export interface Seller {
//   _id: string;
//   name: string;
//   shopname: string;
//   email: string;
//   // ... add other seller fields as needed
// }

// @Injectable({ providedIn: 'root' })
// export class SellerService extends BaseApiService {

//   private endpoint = '/v1/sellers';

//   getAllSellersdata(filterParams?: any): Observable<Seller[]> {
//     return this.http.get<Seller[]>(`${this.baseUrl}${this.endpoint}`, { params: this.createHttpParams(filterParams) })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllSellersdata', error)));
//   }

//   getSellerDataWithId(id: string): Observable<Seller> {
//     return this.http.get<Seller>(`${this.baseUrl}${this.endpoint}/${id}`)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSellerDataWithId', error)));
//   }

//   // This function now supports sending a single object or an array of objects
//   createNewSeller(data: Seller | Seller[]): Observable<any> {
//     return this.http.post(`${this.baseUrl}${this.endpoint}`, data)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createNewSeller', error)));
//   }

//   updateSellersdata(sellersId: string, data: any): Observable<any> {
//     return this.http.patch(`${this.baseUrl}${this.endpoint}/${sellersId}`, data)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updateSellersdata', error)));
//   }

//   /**
//    * Deletes one or more sellers in a single bulk operation.
//    * @param sellerIds An array of seller IDs to delete.
//    */
//   deleteSellers(sellerIds: string[]): Observable<any> {
//     // This now correctly calls the unified DELETE endpoint without an ID in the URL
//     const url = `${this.baseUrl}${this.endpoint}`;
//     const body = { ids: sellerIds };
//     return this.http.delete(url, { body })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deleteSellers', error)));
//   }
// }