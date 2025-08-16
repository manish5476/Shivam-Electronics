import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppMessageService } from '../services/message.service';
import { AuthService } from '../services/auth.service';

export const ErrorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const messageService = inject(AppMessageService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // --- Handle 401 Unauthorized: Critical for Security ---
      if (error.status === 401) {
        messageService.showError('Session Expired', 'Your session has expired. Please log in again.');
        authService.logout();
        return throwError(() => error); // Stop further processing
      }

      let errorSummary = `Error ${error.status}`;
      let errorMessage = 'An unknown error occurred. Please try again later.';

      // Priority 1: Use the specific, user-friendly message from our backend API.
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = error.error.message;
      }
      // Priority 2: Handle client-side or network errors.
      else if (error.status === 0) {
        errorSummary = 'Network Error';
        errorMessage = 'Could not connect to the server. Please check your internet connection.';
      }
      // Priority 3: Fallback to generic messages for common HTTP status codes.
      else {
        switch (error.status) {
          case 400: errorSummary = 'Bad Request'; break;
          case 403: errorSummary = 'Forbidden'; break;
          case 404: errorSummary = 'Not Found'; break;
          case 500: errorSummary = 'Server Error'; break;
          // You can add more generic cases here if needed
        }
      }

      // --- Display the final error message ONCE ---
      messageService.showError(errorSummary, errorMessage);

      // Log the full technical error to the console for developers
      console.error('HTTP Error Intercepted:', error);

      // Re-throw the error so that the calling service/component can handle it further
      // (e.g., to stop a loading spinner).
      return throwError(() => error);
    })
  );
};
// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Observable, throwError } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
// import { AppMessageService } from '../services/message.service';

// export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
//   const messageService = inject(AppMessageService);

//   return next(req).pipe(
//     map((response: any) => {
//       // Handle successful responses with a body
//       if (response && response.body) {
//         const { status, message, data } = response.body;

//         // if (status === 'success') {
//         //   messageService.showSuccess('Success', message || 'Operation completed successfully.');
//         //   // Return only the data portion (or full response if no data field)
//         //   return data || response;
//         // } else 
//           if (status === 'fail' || status === 'error') {
//           // Display error message and throw to trigger error handling
//           const errorSummary = response.body.error?.statusCode ? `Error ${response.body.error.statusCode}` : 'Error';
//           messageService.showError(errorSummary, message || 'An error occurred.');
//           throw new Error(message || 'API error occurred.');
//         }
//       }
//       // Return response unchanged if no specific status handling applies
//       return response;
//     }),
//     catchError((error) => {
//       let errorMessage = 'An unknown error occurred';
//       let errorSummary = 'Error';

//       // Handle HTTP errors or API errors with status in body
//       if (error.error && (error.error.status === 'fail' || error.error.status === 'error') && error.error.message) {
//         errorSummary = error.error.error?.statusCode ? `Error ${error.error.error.statusCode}` : 'Error';
//         errorMessage = error.error.message;
//       } else {
//         // Fallback to HTTP status code handling
//         switch (error.status) {
//           case 400:
//             errorMessage = 'Bad Request: The request could not be understood or was missing required parameters.';
//             errorSummary = 'Bad Request';
//             break;
//           case 401:
//             errorMessage = 'Unauthorized: Access is denied due to invalid credentials.';
//             errorSummary = 'Unauthorized';
//             break;
//           case 403:
//             errorMessage = 'Forbidden: You do not have permission to access this resource.';
//             errorSummary = 'Forbidden';
//             break;
//           case 404:
//             errorMessage = 'Not Found: The requested resource could not be found.';
//             errorSummary = 'Not Found';
//             break;
//           case 405:
//             errorMessage = 'Method Not Allowed: The HTTP method used is not allowed for this endpoint.';
//             errorSummary = 'Method Not Allowed';
//             break;
//           case 408:
//             errorMessage = 'Request Timeout: The server took too long to respond.';
//             errorSummary = 'Request Timeout';
//             break;
//           case 409:
//             errorMessage = 'Conflict: The request could not be processed due to a conflict with the current state of the resource.';
//             errorSummary = 'Conflict';
//             break;
//           case 413:
//             errorMessage = 'Payload Too Large: The request payload is too large for the server to process.';
//             errorSummary = 'Payload Too Large';
//             break;
//           case 415:
//             errorMessage = 'Unsupported Media Type: The server does not support the media type transmitted in the request.';
//             errorSummary = 'Unsupported Media Type';
//             break;
//           case 429:
//             errorMessage = 'Too Many Requests: You have sent too many requests in a short period.';
//             errorSummary = 'Rate Limit Exceeded';
//             break;
//           case 500:
//             errorMessage = 'Internal Server Error: Something went wrong on the server.';
//             errorSummary = 'Server Error';
//             break;
//           case 502:
//             errorMessage = 'Bad Gateway: The server received an invalid response from the upstream server.';
//             errorSummary = 'Bad Gateway';
//             break;
//           case 503:
//             errorMessage = 'Service Unavailable: The server is currently unable to handle the request due to maintenance or overloading.';
//             errorSummary = 'Service Unavailable';
//             break;
//           case 504:
//             errorMessage = 'Gateway Timeout: The server did not receive a timely response from the upstream server.';
//             errorSummary = 'Gateway Timeout';
//             break;
//           default:
//             errorMessage = `Unexpected Error (Status ${error.status || 'unknown'}): ${error.statusText || 'No status text'}`;
//             errorSummary = 'Unexpected Error';
//             break;
//         }
//       }

//       console.error(`Error ${error.status || 'unknown'}: ${errorMessage}`);
//       messageService.showError(errorSummary, errorMessage);
//       return throwError(() => new Error(errorMessage));
//     })
//   );
// };