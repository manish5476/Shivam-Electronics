// src/app/core/services/seller.service.ts (or seller module)
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SellerService extends BaseApiService {

  getSellerDataWithId(id: string): Observable<any> { // Changed id type from any
    return this.http.get<any>(`${this.baseUrl}/v1/sellers/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getSellerDataWithId', error)));
  }

  createNewSeller(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/sellers/`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createNewSeller', error)));
  }

  getAllSellersdata(filterParams?:any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/v1/sellers`,{ params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllSellersdata', error)));
  }

  updateSellersdata(sellersId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/sellers/${sellersId}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updateSellersdata', error)));
  }
}