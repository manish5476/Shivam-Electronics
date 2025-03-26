import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorhandlingService {

  constructor() { }
  handleError(method: string, error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    let backendErrorCode: string | undefined;
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error in ${method} (Client): ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error in ${method} (Server - Status ${error.status}): `;
      if (error.error) {
        if (typeof error.error === 'string') {
          errorMessage += error.error;
        } else if (typeof error.error === 'object') {
          if (error.error.message) errorMessage += error.error.message;
          if (error.error.code) backendErrorCode = error.error.code;
          if (error.error.errors && Array.isArray(error.error.errors)) {
            errorMessage += '\nValidation Errors:\n';
            error.error.errors.forEach((err: any) => {
              errorMessage += `- ${err.msg || err.message || err.path}: ${err.value}\n`;
            });
          }
        }
      } else {
        errorMessage += 'No error details provided by the server.';
      }

      // MongoDB-specific error handling
      if (Number(backendErrorCode) === 11000) {
        errorMessage = `${method} failed: Duplicate entry detected.`;
      } else if (errorMessage.includes('Cast to ObjectId failed')) {
        errorMessage = `${method} failed: Invalid ID format.`;
      } else if (errorMessage.includes('Path `')) {
        const match = errorMessage.match(/Path `([^`]*)`/);
        if (match) errorMessage = `${method} failed: Invalid value for '${match[1]}'.`;
      }
    }

    console.error(`Error in ${method}:`, error); // Log detailed error to the console
    return throwError(() => new Error(errorMessage));
  }

}
