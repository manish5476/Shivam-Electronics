import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const loggingInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const startTime = Date.now();
  console.log(`[${req.method}] Request to ${req.urlWithParams}`);

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(
          `[${event.status}] Response from ${event.url} in ${duration}ms`
        );
      }
    })
  );
};


// import { HttpInterceptorFn, HttpEvent, HttpEventType, HttpErrorResponse } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { tap } from 'rxjs/operators';

// export const loggingInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<any>> => {
//   console.log(`[Logging Interceptor] Outgoing request to: ${req.url}`);
//   return next(req).pipe(
//     tap({
//       next: (event: HttpEvent<any>) => {
//         if (event.type === HttpEventType.Response) {
//           console.log(`[Logging Interceptor] Received response from: ${req.url} with status ${event.status}`);
//         }
//       },
//       error: (error: HttpErrorResponse) => {
//         console.error(`[Logging Interceptor] Request to ${req.url} failed with status ${error.status}`, error);
//       }
//     })
//   );
// };