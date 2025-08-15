import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Correct path to your service

export function AuthInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const token = authService.getToken(); // Use the simple getter from the service

  // If the request is for login/signup, or if there's no token, pass it through without changes.
  if (!token || req.url.includes('/users/login') || req.url.includes('/users/signup')) {
    return next(req);
  }

  // Clone the request to add the Authorization header.
  const clonedReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });

  // Pass the cloned request to the next handler.
  return next(clonedReq);
}

// import { inject } from '@angular/core';
// import {
//   HttpRequest,
//   HttpHandlerFn,
//   HttpEvent,
//   HttpInterceptorFn,
//   HttpErrorResponse,
//   HttpEventType
// } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError, tap } from 'rxjs/operators';
// import { AuthService } from '../services/auth.service';

// // Auth Interceptor
// export function AuthInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
//   const authService = inject(AuthService);
//   const authKey = authService.getItem('authToken') as string | null;
//   const user = authService.getItem('userKey') as string | null;

//   // Skip adding headers for login or signup requests
//   if (req.url.includes('/auth/login') || req.url.includes('/signup')) {
//     return next(req);
//   }

//   let headers = req.headers;
//   if (authKey) {
//     headers = headers.append('Authorization', `Bearer ${authKey}`);
//   }
//   if (user) {
//     headers = headers.append('User', user);
//   }

//   const clonedReq = req.clone({ headers });

//   return next(clonedReq).pipe(
//     catchError((error: HttpErrorResponse) => {
//       console.error('Auth Interceptor Error:', error);
//       return throwError(() => error);
//     })
//   );
// }

// // Logging Interceptor
// export function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
//   return next(req).pipe(
//     tap({
//       next: (event: HttpEvent<any>) => {
//         if (event.type === HttpEventType.Response) {
//         }
//       },
//       error: (error: HttpErrorResponse) => {
//         console.error(`${req.url} failed with status ${error.status}`, error);
//       }
//     })
//   );
// }
