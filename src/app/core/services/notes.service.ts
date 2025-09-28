import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

// Define the query parameters for fetching notes
export interface NoteFilterParams {
  date?: string;  // Format: 'YYYY-MM-DD'
  week?: string;  // Format: 'YYYY-MM-DD'
  month?: number; // Format: 1-12
  year?: number;  // Format: YYYY
}

@Injectable({
  providedIn: 'root'
})
export class NoteService extends BaseApiService {
  private endpoint = '/v1/notes';

  /**
   * Fetches notes based on a time period.
   * @param filterParams The time period to filter by.
   */
  getNotes(filterParams: NoteFilterParams): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}`, {
        params: this.createHttpParams(filterParams),
      })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getNotes', error),
        ),
      );
  }

  /**
   * Fetches a single note by its unique ID.
   * @param id The ID of the note.
   */
  getNoteById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getNoteById', error),
        ),
      );
  }

  /**
   * Creates a new note.
   * @param data The note data to create.
   */
  createNote(data: any): Observable<any> {
    return this.http
      .post(`${this.baseUrl}${this.endpoint}`, data)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('createNote', error),
        ),
      );
  }

  /**
   * NEW: Updates an existing note by its ID.
   * @param id The ID of the note to update.
   * @param data The updated note data.
   */
  updateNote(id: string, data: any): Observable<any> {
    return this.http
      .patch(`${this.baseUrl}${this.endpoint}/${id}`, data)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('updateNote', error),
        ),
      );
  }

  /**
   * NEW: Deletes a note by its ID.
   * @param id The ID of the note to delete.
   */
  deleteNote(id: string): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}${this.endpoint}/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('deleteNote', error),
        ),
      );
  }
}

// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { BaseApiService } from './base-api.service';
// import { HttpErrorResponse } from '@angular/common/http';

// // Define the query parameters for fetching notes
// export interface NoteFilterParams {
//   date?: string;  // Format: 'YYYY-MM-DD'
//   week?: string;  // Format: 'YYYY-MM-DD'
//   month?: number; // Format: 1-12
//   year?: number;  // Format: YYYY
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class NoteService extends BaseApiService {
//   private endpoint = '/v1/notes';

//   /**
//    * Fetches notes based on a time period (day, week, or month).
//    * @param filterParams The time period to filter by.
//    */
//   getNotes(filterParams: NoteFilterParams): Observable<any> {
//     return this.http
//       .get<any>(`${this.baseUrl}${this.endpoint}`, {
//         params: this.createHttpParams(filterParams),
//       })
//       .pipe(
//         catchError((error: HttpErrorResponse) =>
//           this.errorhandler.handleError('getNotes', error),
//         ),
//       );
//   }

//   /**
//    * Fetches a single note by its unique ID.
//    * @param id The ID of the note.
//    */
//   getNoteById(id: string): Observable<any> {
//     return this.http
//       .get<any>(`${this.baseUrl}${this.endpoint}/${id}`)
//       .pipe(
//         catchError((error: HttpErrorResponse) =>
//           this.errorhandler.handleError('getNoteById', error),
//         ),
//       );
//   }

//   /**
//    * Creates a new note. The data can be a standard object
//    * or FormData if you are uploading files directly with the note.
//    * @param data The note data to create.
//    */
//   createNote(data: any): Observable<any> {
//     // Note: If 'data' is FormData, HttpClient will set the correct headers automatically.
//     return this.http
//       .post(`${this.baseUrl}${this.endpoint}`, data)
//       .pipe(
//         catchError((error: HttpErrorResponse) =>
//           this.errorhandler.handleError('createNote', error),
//         ),
//       );
//   }
// }