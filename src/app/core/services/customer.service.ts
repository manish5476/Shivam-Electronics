// src/app/core/services/customer.service.ts (or customer module)
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CustomerService extends BaseApiService {

  getAllCustomerData(filterParams?:any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/v1/customers`,{ params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllCustomerData', error)));
  }

  

  uploadProfileImage(formData: FormData, customerId: string): Observable<any> {
    // FIXME: Review this URL. Should it use this.baseUrl?
    const apiUrl =`${this.baseUrl}/v1/image/postImages`;
    return this.http.post(apiUrl, formData).pipe(
      catchError((error: any) => {
        console.error('Upload Error:', error);
        return this.errorhandler.handleError('uploadProfileImage', error);
      })
    );
  }

  getCustomerDataWithId(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/v1/customers/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getCustomerDataWithId', error)));
  }

  createNewCustomer(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/customers/`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createNewCustomer', error)));
  }

  updateCustomer(customerId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/customers/${customerId}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updateCustomer', error)));
  }

  // WARNING: This method `deleteCustomerID` looks suspicious.
  // Deleting multiple resources usually involves a DELETE request with IDs in the body
  // (like `deleteCustomers`) or multiple individual DELETE requests.
  // Passing an array directly into the URL like this is unconventional and might not work as intended.
  // Prefer `deleteCustomers`.
  /** @deprecated Potentially incorrect implementation. Use deleteCustomers method instead. */
  deleteCustomerID(customerIds: string[]): Observable<any> {
     console.warn('deleteCustomerID is deprecated and likely uses an incorrect API pattern. Prefer deleteCustomers.');
     // This endpoint format is unusual - double-check backend implementation
     const endpoint = `${this.baseUrl}/v1/customers/${customerIds.join(',')}`; // Example assumption
     return this.http.delete(endpoint)
       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deleteCustomerID_DEPRECATED', error)));
  }


  deleteCustomers(customerIds: string[]): Observable<any> {
    const endpoint = `${this.baseUrl}/v1/customers/deletemany`;
    const body = { ids: customerIds };
    return this.http.delete(endpoint, { body: body })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deleteCustomers', error)));
  }

  getCustomerDropDown(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/v1/customers/customerDropDown`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getCustomerDropDown', error)));
  }
}