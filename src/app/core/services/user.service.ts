// src/app/core/services/user.service.ts (or potentially auth/admin module)
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse

@Injectable({ providedIn: 'root' })
export class UserService extends BaseApiService {

  getUserData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/users/me`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getUserData', error)));
  }

  deleteUser(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/v1/users/me`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('deleteUser', error)));
  }

  getAllUserData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/users/allusers`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllUserData', error)));
  }

  updatePassword(data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/v1/users/updatePassword`, data)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updatePassword', error)));
  }
}