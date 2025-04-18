import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppMessageService } from '../services/message.service';
export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(AppMessageService);

  return next(req).pipe(
    catchError((error) => {
      let errorMessage = 'An unknown error occurred';
      let errorSummary = 'Error';

      if (error instanceof Response) {
        errorMessage = `HTTP Error: ${error.statusText}`;
      }

      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request: The request could not be understood or was missing required parameters.';
          errorSummary = 'Bad Request';
          break;
        case 401:
          errorMessage = 'Unauthorized: Access is denied due to invalid credentials.';
          errorSummary = 'Unauthorized';
          break;
        case 403:
          errorMessage = 'Forbidden: You do not have permission to access this resource.';
          errorSummary = 'Forbidden';
          break;
        case 404:
          errorMessage = 'Not Found: The requested resource could not be found.';
          errorSummary = 'Not Found';
          break;
        case 405:
          errorMessage = 'Method Not Allowed: The HTTP method used is not allowed for this endpoint.';
          errorSummary = 'Method Not Allowed';
          break;
        case 408:
          errorMessage = 'Request Timeout: The server took too long to respond.';
          errorSummary = 'Request Timeout';
          break;
        case 409:
          errorMessage = 'Conflict: The request could not be processed due to a conflict with the current state of the resource.';
          errorSummary = 'Conflict';
          break;
        case 413:
          errorMessage = 'Payload Too Large: The request payload is too large for the server to process.';
          errorSummary = 'Payload Too Large';
          break;
        case 415:
          errorMessage = 'Unsupported Media Type: The server does not support the media type transmitted in the request.';
          errorSummary = 'Unsupported Media Type';
          break;
        case 429:
          errorMessage = 'Too Many Requests: You have sent too many requests in a short period.';
          errorSummary = 'Rate Limit Exceeded';
          break;
        case 500:
          errorMessage = 'Internal Server Error: Something went wrong on the server.';
          errorSummary = 'Server Error';
          break;
        case 502:
          errorMessage = 'Bad Gateway: The server received an invalid response from the upstream server.';
          errorSummary = 'Bad Gateway';
          break;
        case 503:
          errorMessage = 'Service Unavailable: The server is currently unable to handle the request due to maintenance or overloading.';
          errorSummary = 'Service Unavailable';
          break;
        case 504:
          errorMessage = 'Gateway Timeout: The server did not receive a timely response from the upstream server.';
          errorSummary = 'Gateway Timeout';
          break;
        default:
          errorMessage = `Unexpected Error (Status ${error.status}): ${error.statusText}`;
          errorSummary = 'Unexpected Error';
          break;
      }

      // Log the error
      console.error(`Error ${error.status}: ${errorMessage}`);

      // Display the error message using PrimeNG’s MessageService
      messageService.showError(errorSummary, errorMessage);

      return throwError(() => new Error(errorMessage));
    })
  );
};
