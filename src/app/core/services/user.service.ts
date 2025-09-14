// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseApiService {

  // --------------------------
  // PUBLIC APIs
  // --------------------------
  signup(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/users/signup`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('signup', error)));
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/users/login`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('login', error)));
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/users/forgotPassword`, { email })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('forgotPassword', error)));
  }

  resetPassword(token: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/users/resetPassword/${token}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('resetPassword', error)));
  }

  // --------------------------
  // PROTECTED APIs (logged-in user)
  // --------------------------
  getUserData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/users/me`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getUserData', error)));
  }

  updatePassword(data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/users/updatePassword`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updatePassword', error)));
  }

  updateMe(data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/users/updateMe`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updateMe', error)));
  }

  deleteMe(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/v1/users/deleteMe`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deleteMe', error)));
  }

  // --------------------------
  // ADMIN / ROLE-BASED APIs
  // --------------------------
  getAllUserData(filterParams?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/users/allusers`, { params: this.createHttpParams(filterParams) })
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllUserData', error)));
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/users/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getUserById', error)));
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/users/updateUser/${id}`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updateUser', error)));
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/v1/users/deleteUser/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deleteUser', error)));
  }
}
