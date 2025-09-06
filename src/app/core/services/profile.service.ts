import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class profileService extends BaseApiService {
  private endpoint = '/v1/profile';

  getUserProfile(): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/me`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getUserProfile', error),
        ),
      );
  }

  uploadProfilePhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file, file.name);

    return this.http.patch<any>(`${this.baseUrl}${this.endpoint}/me/photo`, formData)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('uploadProfilePhoto', error)
        )
      );
  }

}
