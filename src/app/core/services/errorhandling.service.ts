import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorhandlingService {

  constructor() { }

  /**
   * A centralized handler for HTTP errors. It logs the error and returns a user-friendly error message.
   * @param operation - The name of the operation that failed (e.g., 'getAllProducts').
   * @param error - The HttpErrorResponse object.
   * @returns An Observable that throws a new Error with a user-friendly message.
   */
  public handleError(operation: string = 'operation', error: HttpErrorResponse): Observable<never> {
    let userFriendlyMessage: string;

    // Priority 1: Check for a specific, user-friendly message from the backend API.
    if (error.error && typeof error.error === 'object' && error.error.message) {
      userFriendlyMessage = error.error.message;
    }
    // Priority 2: Handle client-side or network errors.
    else if (error.error instanceof ErrorEvent) {
      userFriendlyMessage = `A client-side error occurred: ${error.error.message}`;
    }
    // Priority 3: Handle server-side errors with a generic message.
    else {
      userFriendlyMessage = `Request failed with status ${error.status}. Please try again later.`;
    }
    // Log the detailed technical error to the console for developers.
    console.error(`[${operation}] failed:`, {
      status: error.status,
      message: error.message,
      url: error.url,
      fullError: error
    });

    // Return a new observable that immediately throws the user-friendly error.
    // This allows the component/interceptor to catch it and display it.
    return throwError(() => new Error(userFriendlyMessage));
  }
}

// import { HttpErrorResponse } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable, throwError } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class ErrorhandlingService {

//   constructor() { }
//   handleError(method: string, error: HttpErrorResponse): Observable<never> {
//     let errorMessage = 'An unexpected error occurred';
//     let backendErrorCode: string | undefined;
//     if (error.error instanceof ErrorEvent) {
//       // Client-side error
//       errorMessage = `Error in ${method} (Client): ${error.error.message}`;
//     } else {
//       // Server-side error
//       errorMessage = `Error in ${method} (Server - Status ${error.status}): `;
//       if (error.error) {
//         if (typeof error.error === 'string') {
//           errorMessage += error.error;
//         } else if (typeof error.error === 'object') {
//           if (error.error.message) errorMessage += error.error.message;
//           if (error.error.code) backendErrorCode = error.error.code;
//           if (error.error.errors && Array.isArray(error.error.errors)) {
//             errorMessage += '\nValidation Errors:\n';
//             error.error.errors.forEach((err: any) => {
//               errorMessage += `- ${err.msg || err.message || err.path}: ${err.value}\n`;
//             });
//           }
//         }
//       } else {
//         errorMessage += 'No error details provided by the server.';
//       }

//       // MongoDB-specific error handling
//       if (Number(backendErrorCode) === 11000) {
//         errorMessage = `${method} failed: Duplicate entry detected.`;
//       } else if (errorMessage.includes('Cast to ObjectId failed')) {
//         errorMessage = `${method} failed: Invalid ID format.`;
//       } else if (errorMessage.includes('Path `')) {
//         const match = errorMessage.match(/Path `([^`]*)`/);
//         if (match) errorMessage = `${method} failed: Invalid value for '${match[1]}'.`;
//       }
//     }

//     console.error(`Error in ${method}:`, error); // Log detailed error to the console
//     return throwError(() => new Error(errorMessage));
//   }

// }
