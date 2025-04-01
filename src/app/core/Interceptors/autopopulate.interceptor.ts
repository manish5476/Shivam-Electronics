// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { finalize } from 'rxjs/operators';
// import { AutopopulateService } from '../services/autopopulate.service';
// import { environment } from '../../../environments/environment';

// export const AutopopulateInterceptor: HttpInterceptorFn = (req, next) => {
//   const autopopulateService = inject(AutopopulateService);
//   const baseUrl = environment.apiUrl;

//   // Define autopopulate API endpoint to exclude from interception
//   const autopopulateApi = `${baseUrl}/v1/products/autopopulate`;

//   // Define endpoints that should trigger autopopulation
//   const triggerAutopopulateEndpoints = [
//     `${baseUrl}/v1/users/`,
//     `${baseUrl}/v1/orders/`,
//     `${baseUrl}/v1/products/`,
//     `${baseUrl}/v1/customers/`,
//     `${baseUrl}/v1/sellers/`,
//     `${baseUrl}/v1/payments/`,
//     `${baseUrl}/v1/invoices/`
//   ];

//   // Exclude autopopulate API itself
//   if (req.url.startsWith(autopopulateApi)) {
//     return next(req);
//   }

//   // Only trigger on Create (POST) and Update (PUT/PATCH) requests
//   const isModifyRequest = ['POST', 'PUT', 'PATCH'].includes(req.method);
//   const shouldTriggerAutopopulate = isModifyRequest && triggerAutopopulateEndpoints.some(endpoint => req.url.startsWith(endpoint));

//   return next(req).pipe(
//     finalize(() => {
//       if (shouldTriggerAutopopulate) {
//         autopopulateService.getAutopopulateData().subscribe((res) => {
//           sessionStorage.setItem('autopopulate', JSON.stringify(res.data));
//         });
//       }
//     })
//   );
// };



// 
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { AutopopulateService } from '../services/autopopulate.service';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';

export const AutopopulateInterceptor: HttpInterceptorFn = (req, next) => {
  const autopopulateService = inject(AutopopulateService);
  const baseUrl = environment.apiUrl;

  const autopopulateApi = `${baseUrl}/v1/products/autopopulate`;

  const triggerAutopopulateEndpoints = [
    `${baseUrl}/v1/users/`,
    `${baseUrl}/v1/orders/`,
    `${baseUrl}/v1/products/`,
    `${baseUrl}/v1/customers/`,
    `${baseUrl}/v1/sellers/`,
    `${baseUrl}/v1/payments/`,
    `${baseUrl}/v1/invoices/`
  ];

  if (req.url.startsWith(autopopulateApi)) {
    return next(req);
  }

  const isModifyRequest = ['POST', 'PUT', 'PATCH'].includes(req.method);
  const shouldTriggerAutopopulate = isModifyRequest && triggerAutopopulateEndpoints.some(endpoint => req.url.startsWith(endpoint));

  if (shouldTriggerAutopopulate) {
    return next(req).pipe(
      switchMap((response) => {
        autopopulateService.refreshAutopopulateData();
        return of(response); // Pass the original response along
      })
    );
  } else {
    return next(req);
  }
};

// ////////////////////////////////////////
// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { AutopopulateService } from '../services/autopopulate.service';
// import { environment } from '../../../environments/environment';
// import { finalize } from 'rxjs';

// export const AutopopulateInterceptor: HttpInterceptorFn = (req, next) => {
//   const autopopulateService = inject(AutopopulateService); 
//   const baseUrl = environment.apiUrl;

//   // List of API calls that should trigger the autopopulate API
//   const triggerAutopopulateEndpoints = [
//     // User-related
//     `${baseUrl}/v1/users/`,
//     `${baseUrl}/v1/users/update`,
//     `${baseUrl}/v1/users/delete`,
  
//     // Order-related
//     `${baseUrl}/v1/orders/`,
//     `${baseUrl}/v1/orders/update`,
//     `${baseUrl}/v1/orders/delete`,
  
//     // Product-related
//     `${baseUrl}/v1/products/`,
//     `${baseUrl}/v1/products/update`,
//     `${baseUrl}/v1/products/delete`,
//     `${baseUrl}/v1/products/deletemany`,
  
//     // Customer-related
//     `${baseUrl}/v1/customers/`,
//     `${baseUrl}/v1/customers/update`,
//     `${baseUrl}/v1/customers/delete`,
//     `${baseUrl}/v1/customers/deletemany`,
  
//     // Seller-related
//     `${baseUrl}/v1/sellers`,
//     `${baseUrl}/v1/sellers/update`,
//     `${baseUrl}/v1/sellers/delete`,
  
//     // Payment-related
//     `${baseUrl}/v1/payments/`,
//     `${baseUrl}/v1/payments/update`,
//     `${baseUrl}/v1/payments/delete`,
//     `${baseUrl}/v1/payments/deletemany`,
  
//     // Invoice-related
//     `${baseUrl}/v1/invoices/`,
//     `${baseUrl}/v1/invoices/update`,
//     `${baseUrl}/v1/invoices/delete`,
//     `${baseUrl}/v1/invoices/deletemany`
//   ];
  
//   const shouldTriggerAutopopulate = triggerAutopopulateEndpoints.some((endpoint: any) => {
//     console.log("Checking URL:", req.url, "against", endpoint);
//     return req.url.startsWith(endpoint);  
//   });
  
  
// console.log(shouldTriggerAutopopulate);
//   return next(req).pipe(
//     finalize(() => {
//       if (shouldTriggerAutopopulate) {
//         autopopulateService.getAutopopulateData().subscribe((res) => {
//           sessionStorage.setItem('autopopulate', JSON.stringify(res.data));
//         })
//       }
//     })
//   );
// };
