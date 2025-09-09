import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class MasterListService extends BaseApiService {
  private endpoint = '/v1/masterList';
  // Create new master list type
  createType(data: any): Observable<any> {
    return this.http
      .post(`${this.baseUrl}${this.endpoint}`, data)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('createType', error)
        )
      );
  }

  // Get all master list types with their items
  getAllTypes(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}${this.endpoint}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getAllTypes', error)
        )
      );
  }

  // Get distinct types as label-value pairs
  getTypeOptions(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}${this.endpoint}/types`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getTypeOptions', error)
        )
      );
  }

  // Get one type with items
  getType(type: string): Observable<any> {
    return this.http
      .get(`${this.baseUrl}${this.endpoint}/${type}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getType', error)
        )
      );
  }

  // Update a type (full replace of items, description, etc.)
  // updateType(type: string, data: any): Observable<any> {
  //   return this.http
  //     .put(`${this.baseUrl}${this.endpoint}/${type}`, data)
  //     .pipe(
  //       catchError((error: HttpErrorResponse) =>
  //         this.errorhandler.handleError('updateType', error)
  //       )
  //     );
  // }
  updateType(type: string, data: any): Observable<any> {
    return this.http
      .patch(`${this.baseUrl}${this.endpoint}/${type}`, data)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('updateType', error)
        )
      );
  }


  // Delete entire type
  deleteType(type: string): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}${this.endpoint}/${type}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('deleteType', error)
        )
      );
  }

  //   createType(type: any) {
  //   return this.http.post(`${this.baseUrl}/types`, type);
  // }

  // deleteType(typeValue: string) {
  //   return this.http.delete(`${this.baseUrl}/types/${typeValue}`);
  // }


  /** ---------------------------
   * 🔹 Item CRUD (inside a type)
   * --------------------------- */

  // Add new item to a type
  addItem(type: string, item: any): Observable<any> {
    return this.http
      .post(`${this.baseUrl}${this.endpoint}/${type}/items`, item)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('addItem', error)
        )
      );
  }

  // Update item in a type
  updateItem(type: string, itemId: string, item: any): Observable<any> {
    return this.http
      .put(`${this.baseUrl}${this.endpoint}/${type}/items/${itemId}`, item)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('updateItem', error)
        )
      );
  }

  // Delete item from a type
  deleteItem(type: string, itemId: string): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}${this.endpoint}/${type}/items/${itemId}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('deleteItem', error)
        )
      );
  }
}
