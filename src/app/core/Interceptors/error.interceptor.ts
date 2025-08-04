import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppMessageService } from '../services/message.service';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(AppMessageService);

  return next(req).pipe(
    map((response: any) => {
      // Handle successful responses with a body
      if (response && response.body) {
        const { status, message, data } = response.body;

        // if (status === 'success') {
        //   messageService.showSuccess('Success', message || 'Operation completed successfully.');
        //   // Return only the data portion (or full response if no data field)
        //   return data || response;
        // } else 
          if (status === 'fail' || status === 'error') {
          // Display error message and throw to trigger error handling
          const errorSummary = response.body.error?.statusCode ? `Error ${response.body.error.statusCode}` : 'Error';
          messageService.showError(errorSummary, message || 'An error occurred.');
          throw new Error(message || 'API error occurred.');
        }
      }
      // Return response unchanged if no specific status handling applies
      return response;
    }),
    catchError((error) => {
      let errorMessage = 'An unknown error occurred';
      let errorSummary = 'Error';

      // Handle HTTP errors or API errors with status in body
      if (error.error && (error.error.status === 'fail' || error.error.status === 'error') && error.error.message) {
        errorSummary = error.error.error?.statusCode ? `Error ${error.error.error.statusCode}` : 'Error';
        errorMessage = error.error.message;
      } else {
        // Fallback to HTTP status code handling
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
            errorMessage = `Unexpected Error (Status ${error.status || 'unknown'}): ${error.statusText || 'No status text'}`;
            errorSummary = 'Unexpected Error';
            break;
        }
      }

      console.error(`Error ${error.status || 'unknown'}: ${errorMessage}`);
      messageService.showError(errorSummary, errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};
// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Observable, throwError } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
// import { AppMessageService } from '../services/message.service';

// export const ResponseInterceptor: HttpInterceptorFn = (req, next) => {
//   const messageService = inject(AppMessageService);

//   return next(req).pipe(
//     map((response: any) => {
//       // Handle successful responses with a body
//       if (response && response.body) {
//         const { status, message, data } = response.body;

//         if (status === 'success') {
//           // Display success message
//           messageService.showSuccess('Success', message || 'Operation completed successfully.');
//           // Return only the data portion (or full response if no data field)
//           return data || response;
//         } else if (status === 'fail' || status === 'error') {
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
// // import { HttpInterceptorFn } from '@angular/common/http';
// // import { inject } from '@angular/core';
// // import { Observable, throwError } from 'rxjs';
// // import { catchError } from 'rxjs/operators';
// // import { AppMessageService } from '../services/message.service';

// // export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
// //   const messageService = inject(AppMessageService);

// //   return next(req).pipe(
// //     catchError((error) => {
// //       let errorMessage = 'An unknown error occurred';
// //       let errorSummary = 'Error';

// //       // Check if the error response contains a custom message from the backend
// //       if (error.error && error.error.status === 'fail' && error.error.message) {
// //         errorSummary = error.error.error?.statusCode ? `Error ${error.error.error.statusCode}` : 'Error';
// //         errorMessage = error.error.message;
// //       } else {
// //         // Fallback to handling based on HTTP status codes
// //         switch (error.status) {
// //           case 400:
// //             errorMessage = 'Bad Request: The request could not be understood or was missing required parameters.';
// //             errorSummary = 'Bad Request';
// //             break;
// //           case 401:
// //             errorMessage = 'Unauthorized: Access is denied due to invalid credentials.';
// //             errorSummary = 'Unauthorized';
// //             break;
// //           case 403:
// //             errorMessage = 'Forbidden: You do not have permission to access this resource.';
// //             errorSummary = 'Forbidden';
// //             break;
// //           case 404:
// //             errorMessage = 'Not Found: The requested resource could not be found.';
// //             errorSummary = 'Not Found';
// //             break;
// //           case 405:
// //             errorMessage = 'Method Not Allowed: The HTTP method used is not allowed for this endpoint.';
// //             errorSummary = 'Method Not Allowed';
// //             break;
// //           case 408:
// //             errorMessage = 'Request Timeout: The server took too long to respond.';
// //             errorSummary = 'Request Timeout';
// //             break;
// //           case 409:
// //             errorMessage = 'Conflict: The request could not be processed due to a conflict with the current state of the resource.';
// //             errorSummary = 'Conflict';
// //             break;
// //           case 413:
// //             errorMessage = 'Payload Too Large: The request payload is too large for the server to process.';
// //             errorSummary = 'Payload Too Large';
// //             break;
// //           case 415:
// //             errorMessage = 'Unsupported Media Type: The server does not support the media type transmitted in the request.';
// //             errorSummary = 'Unsupported Media Type';
// //             break;
// //           case 429:
// //             errorMessage = 'Too Many Requests: You have sent too many requests in a short period.';
// //             errorSummary = 'Rate Limit Exceeded';
// //             break;
// //           case 500:
// //             errorMessage = 'Internal Server Error: Something went wrong on the server.';
// //             errorSummary = 'Server Error';
// //             break;
// //           case 502:
// //             errorMessage = 'Bad Gateway: The server received an invalid response from the upstream server.';
// //             errorSummary = 'Bad Gateway';
// //             break;
// //           case 503:
// //             errorMessage = 'Service Unavailable: The server is currently unable to handle the request due to maintenance or overloading.';
// //             errorSummary = 'Service Unavailable';
// //             break;
// //           case 504:
// //             errorMessage = 'Gateway Timeout: The server did not receive a timely response from the upstream server.';
// //             errorSummary = 'Gateway Timeout';
// //             break;
// //           default:
// //             errorMessage = `Unexpected Error (Status ${error.status || 'unknown'}): ${error.statusText || 'No status text'}`;
// //             errorSummary = 'Unexpected Error';
// //             break;
// //         }
// //       }

// //       // Log the error for debugging
// //       console.error(`Error ${error.status || 'unknown'}: ${errorMessage}`);

// //       // Display the error message using AppMessageService
// //       messageService.showError(errorSummary, errorMessage);

// //       // Re-throw the error to allow components to handle it if needed
// //       return throwError(() => new Error(errorMessage));
// //     })
// //   );
// // };
// // // import { HttpInterceptorFn } from '@angular/common/http';
// // // import { inject } from '@angular/core';
// // // import { Observable, throwError } from 'rxjs';
// // // import { catchError } from 'rxjs/operators';
// // // import { AppMessageService } from '../services/message.service';
// // // export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
// // //   const messageService = inject(AppMessageService);

// // //   return next(req).pipe(
// // //     catchError((error) => {
// // //       let errorMessage = 'An unknown error occurred';
// // //       let errorSummary = 'Error';

// // //       if (error instanceof Response) {
// // //         errorMessage = `HTTP Error: ${error.statusText}`;
// // //       }

// // //       switch (error.status) {
// // //         case 400:
// // //           errorMessage = 'Bad Request: The request could not be understood or was missing required parameters.';
// // //           errorSummary = 'Bad Request';
// // //           break;
// // //         case 401:
// // //           errorMessage = 'Unauthorized: Access is denied due to invalid credentials.';
// // //           errorSummary = 'Unauthorized';
// // //           break;
// // //         case 403:
// // //           errorMessage = 'Forbidden: You do not have permission to access this resource.';
// // //           errorSummary = 'Forbidden';
// // //           break;
// // //         case 404:
// // //           errorMessage = 'Not Found: The requested resource could not be found.';
// // //           errorSummary = 'Not Found';
// // //           break;
// // //         case 405:
// // //           errorMessage = 'Method Not Allowed: The HTTP method used is not allowed for this endpoint.';
// // //           errorSummary = 'Method Not Allowed';
// // //           break;
// // //         case 408:
// // //           errorMessage = 'Request Timeout: The server took too long to respond.';
// // //           errorSummary = 'Request Timeout';
// // //           break;
// // //         case 409:
// // //           errorMessage = 'Conflict: The request could not be processed due to a conflict with the current state of the resource.';
// // //           errorSummary = 'Conflict';
// // //           break;
// // //         case 413:
// // //           errorMessage = 'Payload Too Large: The request payload is too large for the server to process.';
// // //           errorSummary = 'Payload Too Large';
// // //           break;
// // //         case 415:
// // //           errorMessage = 'Unsupported Media Type: The server does not support the media type transmitted in the request.';
// // //           errorSummary = 'Unsupported Media Type';
// // //           break;
// // //         case 429:
// // //           errorMessage = 'Too Many Requests: You have sent too many requests in a short period.';
// // //           errorSummary = 'Rate Limit Exceeded';
// // //           break;
// // //         case 500:
// // //           errorMessage = 'Internal Server Error: Something went wrong on the server.';
// // //           errorSummary = 'Server Error';
// // //           break;
// // //         case 502:
// // //           errorMessage = 'Bad Gateway: The server received an invalid response from the upstream server.';
// // //           errorSummary = 'Bad Gateway';
// // //           break;
// // //         case 503:
// // //           errorMessage = 'Service Unavailable: The server is currently unable to handle the request due to maintenance or overloading.';
// // //           errorSummary = 'Service Unavailable';
// // //           break;
// // //         case 504:
// // //           errorMessage = 'Gateway Timeout: The server did not receive a timely response from the upstream server.';
// // //           errorSummary = 'Gateway Timeout';
// // //           break;
// // //         default:
// // //           errorMessage = `Unexpected Error (Status ${error.status}): ${error.statusText}`;
// // //           errorSummary = 'Unexpected Error';
// // //           break;
// // //       }

// // //       // Log the error
// // //       console.error(`Error ${error.status}: ${errorMessage}`);

// // //       // Display the error message using PrimeNG’s MessageService
// // //       messageService.showError(errorSummary, errorMessage);

// // //       return throwError(() => new Error(errorMessage));
// // //     })
// // //   );
// // // };
