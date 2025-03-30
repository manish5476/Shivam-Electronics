
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

export const LoadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const baseUrl = environment.apiUrl;
  const excludedEndpoints = [
    `${baseUrl}/v1/products/autopopulate`, 
  ];
  const shouldExclude = excludedEndpoints.some(endpoint => req.url.startsWith(endpoint));

  if (!shouldExclude) {
    loadingService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (!shouldExclude) {
        loadingService.hide();
      }
    })
  );
};

// import { HttpInterceptorFn } from '@angular/common/http';
// export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
//   return next(req);
// };

// import { Injectable } from '@angular/core';
// import {
//   HttpInterceptor,
//   HttpRequest,
//   HttpHandler,
//   HttpEvent,
// } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { finalize } from 'rxjs/operators';
// import { LoadingService } from '../services/loading.service';

// @Injectable()
// export class LoadingInterceptor implements HttpInterceptor {
//   constructor(private loadingService:LoadingService) {}

//   intercept(
//     request: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     this.loadingService.show();

//     return next.handle(request).pipe(
//       finalize(() => this.loadingService.hide())
//     );
//   }
// }
// core/Interceptors/loading.interceptor.ts


/////////////////////////////////
// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { LoadingService } from '../services/loading.service';
// import { finalize } from 'rxjs';

// export const LoadingInterceptor: HttpInterceptorFn = (req, next) => {
//   const loadingService = inject(LoadingService);
//   loadingService.show();

//   return next(req).pipe(
//     finalize(() => loadingService.hide())
//   );
// };



// //////////////////////////////////

// core/Interceptors/loading.interceptor.ts
// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { LoadingService } from '../services/loading.service';
// import { finalize } from 'rxjs';

// export const LoadingInterceptor: HttpInterceptorFn = (req, next) => {
//   const loadingService = inject(LoadingService);

//   // List of API endpoints to exclude from showing the loader
//   const excludedEndpoints = [
//     '/api/autopopulate', 
//   ];

//   const shouldExclude = excludedEndpoints.some(endpoint => req.url.includes(endpoint));

//   if (!shouldExclude) {
//     loadingService.show();
//   }

//   return next(req).pipe(
//     finalize(() => {
//       if (!shouldExclude) {
//         loadingService.hide();
//       }
//     })
//   );
// };
