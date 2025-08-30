import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AppMessageService } from '../services/message.service';
import { AuthService } from '../services/auth.service';

export const ErrorInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(AppMessageService);

  return next(req).pipe(
    retry(1),
    catchError((error: HttpErrorResponse) => {
      // --- Handle 401 Unauthorized: Critical for Security ---
      if (error.status === 401) {
        messageService.showError('Session Expired', 'Please log in again.');
        authService.logout();
        router.navigate(['/auth/login']);
        return throwError(() => error);
      }

      let errorSummary = `Error ${error.status}`;
      let errorMessage = 'An unknown error occurred on the server.';
      let errorBody = error.error;

      // Try to parse the error body if it's a string
      if (typeof errorBody === 'string') {
        try {
          errorBody = JSON.parse(errorBody);
        } catch (e) {
          errorMessage = errorBody;
        }
      }

      // --- Use the specific, user-friendly message from the backend API ---
      if (errorBody && typeof errorBody === 'object' && errorBody.message) {
        errorMessage = errorBody.message;
      }
      // Handle client-side or network errors
      else if (error.status === 0) {
        errorSummary = 'Network Error';
        errorMessage = 'Could not connect to the server. Please check your internet connection.';
      }
      // Fallback to generic messages for common HTTP status codes
      else {
        switch (error.status) {
          case 400: errorSummary = 'Bad Request'; break;
          case 403: errorSummary = 'Forbidden'; break;
          case 404: errorSummary = 'Not Found'; break;
          case 500: errorSummary = 'Server Error'; break;
        }
      }

      // --- Display the final, correct error message ---
      messageService.showError(errorSummary, errorMessage);

      console.error('HTTP Error Intercepted:', error);
      return throwError(() => error);
    })
  );
};
// import {
//   HttpInterceptorFn,
//   HttpErrorResponse,
//   HttpRequest,
//   HttpHandlerFn,
//   HttpEvent
// } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { AppMessageService } from '../services/message.service';
// import { AuthService } from '../services/auth.service';

// export const ErrorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
//   const messageService = inject(AppMessageService);
//   const authService = inject(AuthService);

//   return next(req).pipe(
//     catchError((error: HttpErrorResponse) => {
//       // --- Handle 401 Unauthorized: Critical for Security ---
//       if (error.status === 401) {
//         messageService.showError('Session Expired', 'Your session has expired. Please log in again.');
//         authService.logout();
//         return throwError(() => error);
//       }

//       let errorSummary = `Error ${error.status}`;
//       let errorMessage = 'An unknown error occurred on the server.';
      
//       // NEW: Attempt to get the detailed error body, whether it's an object or a string
//       let errorBody = error.error;

//       // If the error body is a string, try to parse it as JSON
//       if (typeof errorBody === 'string') {
//         try {
//           errorBody = JSON.parse(errorBody);
//         } catch (e) {
//           // If parsing fails, it's just a plain text error message from the server
//           errorMessage = errorBody;
//         }
//       }

//       // --- Use the specific, user-friendly message from our backend API ---
//       // This now checks the (potentially parsed) errorBody
//       if (errorBody && typeof errorBody === 'object' && errorBody.message) {
//         errorMessage = errorBody.message;
//       }
//       // Handle client-side or network errors
//       else if (error.status === 0) {
//         errorSummary = 'Network Error';
//         errorMessage = 'Could not connect to the server. Please check your internet connection.';
//       }
//       // Fallback to generic messages for common HTTP status codes
//       else {
//         switch (error.status) {
//           case 400: errorSummary = 'Bad Request'; break;
//           case 403: errorSummary = 'Forbidden'; break;
//           case 404: errorSummary = 'Not Found'; break;
//           case 500: errorSummary = 'Server Error'; break;
//         }
//       }

//       // --- Display the final, correct error message ---
//       messageService.showError(errorSummary, errorMessage);

//       console.error('HTTP Error Intercepted:', error);
//       return throwError(() => error);
//     })
//   );
// };