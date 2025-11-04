import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

export interface NoteFilterParams {
  date?: string;  // 'YYYY-MM-DD'
  week?: string;  // 'YYYY-MM-DD'
  month?: number; // 1–12
  year?: number;  // YYYY
}

@Injectable({ providedIn: 'root' })
export class NoteService extends BaseApiService {
  private endpoint = '/v1/notes';

  /**
   * 🔹 Fetch notes for a specific time period
   */
  getNotes(filterParams: NoteFilterParams): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}`, {
        params: this.createHttpParams(filterParams),
      })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getNotes', error)
        )
      );
  }

  /**
   * 🔹 Fetch all note days for a given month (calendar summary)
   * Example: /api/v1/notes/calendar-summary?year=2025&month=11
   */
  getNotesForMonth(year: number, month: number): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/calendar-summary`, {
        params: this.createHttpParams({ year, month }),
      })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getNotesForMonth', error)
        )
      );
  }

  /**
   * 🔹 Fetch one note by ID
   */
  getNoteById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}${this.endpoint}/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getNoteById', error)
        )
      );
  }

  /**
   * 🔹 Create a new note
   */
  createNote(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}${this.endpoint}`, data)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('createNote', error)
        )
      );
  }

  /**
   * 🔹 Update an existing note
   */
  updateNote(id: string, data: any): Observable<any> {
    return this.http
      .patch<any>(`${this.baseUrl}${this.endpoint}/${id}`, data)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('updateNote', error)
        )
      );
  }

  /**
   * 🔹 Delete a note
   */
  deleteNote(id: string): Observable<any> {
    return this.http
      .delete<any>(`${this.baseUrl}${this.endpoint}/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('deleteNote', error)
        )
      );
  }

  /**
   * 🔹 Optional helper – fetch login summary from notifications
   */
  getLoginSummary(): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/v1/notifications/login-summary`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.errorhandler.handleError('getLoginSummary', error)
        )
      );
  }
}


// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { BaseApiService } from './base-api.service';
// import { HttpErrorResponse } from '@angular/common/http';

// // 🔹 Optional: Strong typings for Notes
// export interface Note {
//   _id?: string;
//   title: string;
//   content: string;
//   tags?: string[];
//   attachments?: string[];
//   owner?: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface NoteFilterParams {
//   date?: string;  // Format: 'YYYY-MM-DD'
//   week?: string;  // Format: 'YYYY-MM-DD'
//   month?: number; // 1-12
//   year?: number;  // YYYY
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class NoteService extends BaseApiService {
//   private endpoint = '/v1/notes';

//   /**
//    * 🔹 Fetch notes for a specific time period (day, week, month, or year)
//    */
//   getNotes(filterParams: NoteFilterParams): Observable<any> {
//     return this.http
//       .get<any>(`${this.baseUrl}${this.endpoint}`, {
//         params: this.createHttpParams(filterParams),
//       })
//       .pipe(
//         catchError((error: HttpErrorResponse) =>
//           this.errorhandler.handleError('getNotes', error)
//         )
//       );
//   }

//   /**
//    * 🔹 Fetch a single note by ID
//    */
//   getNoteById(id: string): Observable<any> {
//     return this.http
//       .get<any>(`${this.baseUrl}${this.endpoint}/${id}`)
//       .pipe(
//         catchError((error: HttpErrorResponse) =>
//           this.errorhandler.handleError('getNoteById', error)
//         )
//       );
//   }

//   /**
//    * 🔹 Create a new note
//    */
//   createNote(data: Partial<Note>): Observable<any> {
//     return this.http
//       .post(`${this.baseUrl}${this.endpoint}`, data)
//       .pipe(
//         catchError((error: HttpErrorResponse) =>
//           this.errorhandler.handleError('createNote', error)
//         )
//       );
//   }

//   /**
//    * 🔹 Update an existing note by ID
//    */
//   updateNote(id: string, data: Partial<Note>): Observable<any> {
//     return this.http
//       .patch(`${this.baseUrl}${this.endpoint}/${id}`, data)
//       .pipe(
//         catchError((error: HttpErrorResponse) =>
//           this.errorhandler.handleError('updateNote', error)
//         )
//       );
//   }

//   /**
//    * 🔹 Delete a note by ID
//    */
//   deleteNote(id: string): Observable<any> {
//     return this.http
//       .delete(`${this.baseUrl}${this.endpoint}/${id}`)
//       .pipe(
//         catchError((error: HttpErrorResponse) =>
//           this.errorhandler.handleError('deleteNote', error)
//         )
//       );
//   }

//   /**
//    * 🔹 Fetch daily notes (shortcut for ?date=YYYY-MM-DD)
//    */
//   getNotesForDay(date: string): Observable<any> {
//     return this.getNotes({ date });
//   }

//   /**
//    * 🔹 Fetch all days of a month that contain notes
//    * Matches backend route: /api/v1/notes/calendar-summary?year=2025&month=11
//    */
//   getNotesForMonth(year: number, month: number): Observable<any> {
//     return this.http
//       .get<any>(`${this.baseUrl}${this.endpoint}/calendar-summary`, {
//         params: this.createHttpParams({ year, month }),
//       })
//       .pipe(
//         catchError((error: HttpErrorResponse) =>
//           this.errorhandler.handleError('getNotesForMonth', error)
//         )
//       );
//   }

//   /**
//    * 🔹 Fetch summary/insight data for login activity (from notifications)
//    */
//   getLoginSummary(): Observable<any> {
//     return this.http
//       .get<any>(`${this.baseUrl}/v1/notifications/login-summary`)
//       .pipe(
//         catchError((error: HttpErrorResponse) =>
//           this.errorhandler.handleError('getLoginSummary', error)
//         )
//       );
//   }
// }


// // import { Injectable } from '@angular/core';
// // import { Observable } from 'rxjs';
// // import { catchError } from 'rxjs/operators';
// // import { BaseApiService } from './base-api.service';
// // import { HttpErrorResponse } from '@angular/common/http';

// // // Define the query parameters for fetching notes
// // export interface NoteFilterParams {
// //   date?: string;  // Format: 'YYYY-MM-DD'
// //   week?: string;  // Format: 'YYYY-MM-DD'
// //   month?: number; // Format: 1-12
// //   year?: number;  // Format: YYYY
// // }

// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class NoteService extends BaseApiService {
// //   private endpoint = '/v1/notes';

// //   /**
// //    * Fetches notes based on a time period.
// //    * @param filterParams The time period to filter by.
// //    */
// //   getNotes(filterParams: NoteFilterParams): Observable<any> {
// //     return this.http
// //       .get<any>(`${this.baseUrl}${this.endpoint}`, {
// //         params: this.createHttpParams(filterParams),
// //       })
// //       .pipe(
// //         catchError((error: HttpErrorResponse) =>
// //           this.errorhandler.handleError('getNotes', error),
// //         ),
// //       );
// //   }
// //   /**
// //    * Fetches notes based on a time period.
// //    * @param filterParams The time period to filter by.
// //    */
// //   getloginsummary(): Observable<any> {
// //     return this.http
// //       .get<any>(`${this.baseUrl}${"/v1/notifications"}/login-summary`)
// //       .pipe(
// //         catchError((error: HttpErrorResponse) =>
// //           this.errorhandler.handleError('getloginsummary', error),
// //         ),
// //       );
// //   }

// //   /**
// //    * Fetches a single note by its unique ID.
// //    * @param id The ID of the note.
// //    */
// //   getNoteById(id: string): Observable<any> {
// //     return this.http
// //       .get<any>(`${this.baseUrl}${this.endpoint}/${id}`)
// //       .pipe(
// //         catchError((error: HttpErrorResponse) =>
// //           this.errorhandler.handleError('getNoteById', error),
// //         ),
// //       );
// //   }

// //   /**
// //    * Creates a new note.
// //    * @param data The note data to create.
// //    */
// //   createNote(data: any): Observable<any> {
// //     return this.http
// //       .post(`${this.baseUrl}${this.endpoint}`, data)
// //       .pipe(
// //         catchError((error: HttpErrorResponse) =>
// //           this.errorhandler.handleError('createNote', error),
// //         ),
// //       );
// //   }

// //   /**
// //    * NEW: Updates an existing note by its ID.
// //    * @param id The ID of the note to update.
// //    * @param data The updated note data.
// //    */
// //   updateNote(id: string, data: any): Observable<any> {
// //     return this.http
// //       .patch(`${this.baseUrl}${this.endpoint}/${id}`, data)
// //       .pipe(
// //         catchError((error: HttpErrorResponse) =>
// //           this.errorhandler.handleError('updateNote', error),
// //         ),
// //       );
// //   }

// //   /**
// //    * NEW: Deletes a note by its ID.
// //    * @param id The ID of the note to delete.
// //    */
// //   deleteNote(id: string): Observable<any> {
// //     return this.http
// //       .delete(`${this.baseUrl}${this.endpoint}/${id}`)
// //       .pipe(
// //         catchError((error: HttpErrorResponse) =>
// //           this.errorhandler.handleError('deleteNote', error),
// //         ),
// //       );
// //   }
// // }
