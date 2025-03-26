import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ErrorhandlingService } from './errorhandling.service';
import { environment } from '../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class ApiService {

  // private baseUrl='https://4000-idx-backend-1737022093659.cluster-7ubberrabzh4qqy2g4z7wgxuw2.cloudworkstations.dev/api'
  // private baseUrl = 'https://4000-idx-backend-1737022093659.cluster-7ubberrabzh4qqy2g4z7wgxuw2.cloudworkstations.dev/api';
  // private baseUrl = 'http://localhost:4002/api'
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService, private errorhandler: ErrorhandlingService) { }

  private createHttpParams(filterParams?: any): HttpParams {
    let params = new HttpParams();
    if (filterParams) {
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value as string);
        }
      });
    }
    return params;
  }


  // 
  private handleError(operation = 'operation', error: HttpErrorResponse) {
    console.error(`${operation} failed: $ {error.message}`);
    return throwError(() => error);
  }


  // === User Authentication Methods ===
  getUserData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/users/me`) // Interceptor will add headers.pipe(catchError((error) => this.errorhandler.handleError('getUserData', error)));
  }

  // updateUserPassword(): Observable<any> {
  //   return this.http
  //     .get(`${this.baseUrl}/v1/users/me`) // Interceptor will add headers
  //     .pipe(catchError((error) => this.errorhandler.handleError('getUserData', error)));
  // }

  // getCustomers(): Observable<any> {
  //   return this.http
  //   .get(`${this.baseUrl}/v1/customers`) 
  //   .pipe(catchError((error) => this.errorhandler.handleError('getCustomers', error)));
  // }

  // getCustomerById(id: string): Observable<any> {
  //   return this.http.get<any>(`${this.baseUrl}/v1/customers/${id}`);
  // }

  // updateCustomer(id: string, customer: any): Observable<any> {
  //   return this.http.put<any>(`${this.baseUrl}/v1/customers/${id}`, customer);
  // }

  deleteUser(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/v1/users/me`) // Interceptor will add headers.pipe(catchError((error) => this.errorhandler.handleError('getUserData', error)));
  }

  getAllUserData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/users/allusers`) // Interceptor will add headers.pipe(catchError((error) => this.errorhandler.handleError('getUserData', error)));
  }

  updatePassword(data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/users/updatePassword`, data) // Interceptor will add headers.pipe(catchError((error) => this.errorhandler.handleError('updatePassword', error)));
  }

  // -----------------------------------------------------------------------------------------------------------------------------------------------------------
  // === Product CRUD Methods ===
  getAutopopulateData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/products/autopopulate`).pipe(catchError((error) => this.errorhandler.handleError('getAutopopulateData', error)));
  }

  // -----------------------------------------------------------------------------------------------------------------------------------------------------------
  getAllProductData(filterParams?: any): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}/v1/products`, { params: this.createHttpParams(filterParams) })
      .pipe(catchError((error) => this.errorhandler.handleError('getAllProductData', error as HttpErrorResponse)));
  }


  getProductDataWithId(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/v1/products/${id}`).pipe(catchError((error) => this.errorhandler.handleError('getProductDataWithId', error)));
  }

  createNewProduct(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/products`, data).pipe(catchError((error) => this.errorhandler.handleError('createNewProduct', error)));
  }

  updateProduct(productId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/products/${productId}`, data).pipe(catchError((error) => this.errorhandler.handleError('updateProduct', error)));
  }


  deleteSingleProduct(id: any): Observable<any> {
    const endpoint = `${this.baseUrl}/v1/products/${id}`
    return this.http
      .delete(endpoint)
      .pipe(catchError((error) => this.errorhandler.handleError('deletecustomer', error)));
  }


  deleteProduct(productIds: string[]): Observable<any> {
    const endpoint = `${this.baseUrl}/v1/products/deletemany`;
    const body = { ids: productIds };
    return this.http
      .delete(endpoint, { body: body }
        //   {
        //   headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        //   body, // Pass the body correctly
        // }
      )
      .pipe(catchError((error) => this.errorhandler.handleError('deletecustomer', error)));
  }
  // === Customer Service  ===

  getAllCustomerData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/v1/customers`).pipe(catchError((error) => this.errorhandler.handleError('getAllcustomerData', error)));
  }

  // updateCustomerImage(data:any,customerid:any){
  //   return this.http
  //.post(`${this.baseUrl}/v1/customers/${customerid}`, data)
  //   .pipe(catchError((error) => this.errorhandler.handleError('createNewcustomer', error)));
  // }
  // uploadProfileImage(formData: FormData, customerId: string) {
  //   const apiUrl = `/api/customers/${customerId}/profile-image`;  // Replace with your actual API URL
  //   return this.h.post(apiUrl, formData);
  // }

  uploadProfileImage(formData: FormData, customerId: string): Observable<any> {
    const apiUrl = `http://localhost:4000/api/customers/${customerId}/profile-image`; // Backend endpoint
    return this.http.post(apiUrl, formData).pipe(
      catchError((error: any) => {
        console.error('Upload Error:', error);
        return error
      })
    );
  }


  getCustomerDataWithId(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/v1/customers/${id}`).pipe(catchError((error) => this.errorhandler.handleError('getcustomerDataWithId', error)));
  }

  createNewCustomer(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/customers/`, data).pipe(catchError((error) => this.errorhandler.handleError('createNewcustomer', error)));
  }

  updateCustomer(customerId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/customers/${customerId}`, data).pipe(catchError((error) => this.errorhandler.handleError('updatecustomer', error)));
  }

  deleteCustomerID(customerIds: string[]): Observable<any> {
    const endpoint = `${this.baseUrl}/v1/customers/${customerIds}`;
    return this.http.delete(endpoint).pipe(catchError((error) => this.errorhandler.handleError('deleteProduct', error)));
  }

  deleteCustomers(customerIds: string[]): Observable<any> {
    const endpoint = `${this.baseUrl}/v1/customers/deletemany`;
    const body = { ids: customerIds };
    return this.http.delete(endpoint, { body: body }).pipe(catchError((error) => this.errorhandler.handleError('deleteProduct', error)));
  }

  getCustomerDropDown(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/v1/customers/customerDropDown`).pipe(catchError((error) => this.errorhandler.handleError('getCustomerDropDown', error)));
  }


  // -=================================== seller ================================

  getSellerDataWithId(id: any): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/v1/sellers/${id}`).pipe(catchError((error) => this.errorhandler.handleError('getSellerDataWithId', error)));
  }

  createNewSeller(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/sellers/`, data).pipe(catchError((error) => this.errorhandler.handleError('createNewSeller', error)));
  }
  getAllSellersdata(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/v1/sellers`).pipe(catchError((error) => this.errorhandler.handleError('getAllSellersdata', error)));
  }
  updateSellersdata(SellersId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/sellers/${SellersId}`, data).pipe(catchError((error) => this.errorhandler.handleError('updateSellersdata', error)));
  }

  //////////////////---------------------- Payment ----------------------\\\\\\\\\\\\\

  getAllpaymentData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/v1/payments`).pipe(catchError((error) => this.errorhandler.handleError('getAllpaymentData', error)));
  }

  getpaymentDataWithId(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/v1/payments/${id}`).pipe(catchError((error) => this.errorhandler.handleError('getpaymentDataWithId', error)));
  }

  createNewpayment(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/payments`, data).pipe(catchError((error) => this.errorhandler.handleError('createNewpayment', error)));
  }

  updatepayment(paymentId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/payments/${paymentId}`, data).pipe(catchError((error) => this.errorhandler.handleError('updatepayment', error)));
  }

  deletepayments(paymentIds: string[]): Observable<any> {
    const endpoint = `${this.baseUrl}/v1/payments/deletemany`;
    const body = { ids: paymentIds };
    return this.http.delete(endpoint, { body: body }).pipe(catchError((error) => this.errorhandler.handleError('delete payment ', error)));
  }

  // ======================================================INVOICE=====================================================================

  getAllinvoiceData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/v1/invoices`).pipe(catchError((error) => this.errorhandler.handleError('getAllinvoiceData', error)));
  }

  getinvoiceDataWithId(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/v1/invoices/${id}`).pipe(catchError((error) => this.errorhandler.handleError('getinvoiceDataWithId', error)));
  }

  createNewinvoice(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/invoices`, data).pipe(catchError((error) => this.errorhandler.handleError('createNewinvoice', error)));
  }

  getProductSales(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/invoices/productSales`, data).pipe(catchError((error) => this.errorhandler.handleError('getProductSales', error)));
  }
  updateinvoice(invoiceId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/invoices/${invoiceId}`, data).pipe(catchError((error) => this.errorhandler.handleError('updateinvoice', error)));
  }

  deleteinvoices(invoiceIds: string[]): Observable<any> {
    const endpoint = `${this.baseUrl}/v1/invoices/deletemany`;
    const body = { ids: invoiceIds };
    return this.http.delete(endpoint, { body: body }).pipe(catchError((error) => this.errorhandler.handleError('delete invoice ', error)));
  }



}
