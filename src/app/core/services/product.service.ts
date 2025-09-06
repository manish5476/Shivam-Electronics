import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

// Define an interface for the Product for type safety

@Injectable({ providedIn: 'root' })
export class ProductService extends BaseApiService {

  private endpoint = '/v1/products';

  getAutopopulateData(): Observable<any> {
    return this.http.get(`${this.baseUrl}${this.endpoint}/autopopulate`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAutopopulateData', error)));
  }

  getAllProductData(filterParams?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}${this.endpoint}`, { params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllProductData', error)));
  }

  getProductDataWithId(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.endpoint}/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getProductDataWithId', error)));
  }

  // This function now supports sending a single object or an array of objects
  createNewProduct(data: any | any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}${this.endpoint}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createNewProduct', error)));
  }

  updateProduct(productId: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}${this.endpoint}/${productId}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updateProduct', error)));
  }

  /**
   * Deletes a single product by its ID.
   * @param id The ID of the product to delete.
   */
  deleteSingleProduct(id: string): Observable<any> {
    const url = `${this.baseUrl}${this.endpoint}/${id}`;
    return this.http.delete(url)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deleteSingleProduct', error)));
  }

  deleteProduct(productIds: string[]): Observable<any> {
    // This now correctly calls the unified DELETE endpoint without an ID in the URL
    const url = `${this.baseUrl}${this.endpoint}`;
    const body = { ids: productIds };
    return this.http.delete(url, { body })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deleteProduct', error)));
  }



  uploadProductImage(formData: FormData, productId: string): Observable<any> {
    const apiUrl = `${this.baseUrl}${this.endpoint}/${productId}/image`;
    return this.http.post(apiUrl, formData).pipe(
      catchError((error: any) =>
        this.errorhandler.handleError("uploadProductImage", error)
      )
    );
  }

}

// // src/app/core/services/product.service.ts (or product module)
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { BaseApiService } from './base-api.service';
// import { HttpErrorResponse } from '@angular/common/http';

// @Injectable({ providedIn: 'root' })
// export class ProductService extends BaseApiService {

//   getAutopopulateData(): Observable<any> {
//     return this.http.get(`${this.baseUrl}/v1/products/autopopulate`)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAutopopulateData', error)));
//   }

//   getAllProductData(filterParams?: any): Observable<any[]> {
//     return this.http.get<any[]>(`${this.baseUrl}/v1/products`, { params: this.createHttpParams(filterParams) })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllProductData', error)));
//   }

//   getProductDataWithId(id: string): Observable<any> {
//     return this.http.get<any>(`${this.baseUrl}/v1/products/${id}`)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getProductDataWithId', error)));
//   }

//   createNewProduct(data: any): Observable<any> {
//     return this.http.post(`${this.baseUrl}/v1/products`, data)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('createNewProduct', error)));
//   }

//   updateProduct(productId: string, data: any): Observable<any> {
//     return this.http.patch(`${this.baseUrl}/v1/products/${productId}`, data)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updateProduct', error)));
//   }

//   deleteSingleProduct(id: string): Observable<any> { // Changed param type from any to string
//     const endpoint = `${this.baseUrl}/v1/products/${id}`;
//     return this.http.delete(endpoint)
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deleteSingleProduct', error))); // Corrected operation name
//   }

//   deleteProduct(productIds: string[]): Observable<any> {
//     const endpoint = `${this.baseUrl}/v1/products/deletemany`;
//     const body = { ids: productIds };
//     // Note: HttpClient delete method syntax for body might vary slightly across versions,
//     // but { body: body } is common for Angular versions using RxJS 6+.
//     return this.http.delete(endpoint, { body: body })
//       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deleteProduct', error))); // Corrected operation name
//   }
// }