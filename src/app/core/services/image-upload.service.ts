import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService extends BaseApiService {
  private endpoint = '/v1/uploads/image';

  /**
   * Uploads a single image file.
   * @param file The image file to upload.
   */
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file, file.name);

    return this.http
      .post(`${this.baseUrl}${this.endpoint}`, formData)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('uploadImage', error),
        ),
      );
  }
}