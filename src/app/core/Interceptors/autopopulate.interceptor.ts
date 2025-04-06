
// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { switchMap } from 'rxjs/operators';
// import { AutopopulateService } from '../services/autopopulate.service';
// import { environment } from '../../../environments/environment';
// import { of } from 'rxjs';

// export const AutopopulateInterceptor: HttpInterceptorFn = (req, next) => {
//   const autopopulateService = inject(AutopopulateService);
//   const baseUrl = environment.apiUrl;

//   const autopopulateApi = `${baseUrl}/v1/products/autopopulate`;

//   const triggerAutopopulateEndpoints = [
//     `${baseUrl}/v1/users/`,
//     `${baseUrl}/v1/orders/`,
//     `${baseUrl}/v1/products/`,
//     `${baseUrl}/v1/customers/`,
//     `${baseUrl}/v1/sellers/`,
//     `${baseUrl}/v1/payments/`,
//     `${baseUrl}/v1/invoices/`
//   ];

//   if (req.url.startsWith(autopopulateApi)) {
//     return next(req);
//   }

//   const isModifyRequest = ['POST', 'PUT', 'PATCH'].includes(req.method);
//   const shouldTriggerAutopopulate = isModifyRequest && triggerAutopopulateEndpoints.some(endpoint => req.url.startsWith(endpoint));

//   if (shouldTriggerAutopopulate) {
//     return next(req).pipe(
//       switchMap((response) => {
//         autopopulateService.refreshAutopopulateData();
//         return of(response); // Pass the original response along
//       })
//     );
//   } else {
//     return next(req);
//   }
// };

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { AutopopulateService } from '../services/autopopulate.service';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';

export const AutopopulateInterceptor: HttpInterceptorFn = (req, next) => {
  const autopopulateService = inject(AutopopulateService);
  const baseUrl = environment.apiUrl;

  // Skip if already calling master-list endpoints
  if (req.url.startsWith(`${baseUrl}/v1/master-list`)) {
    return next(req);
  }

  // Endpoints to trigger module refresh
  const triggerModules = ['users', 'orders', 'products', 'customers', 'sellers', 'payments', 'invoices'];
  const isModifyRequest = ['POST', 'PUT', 'PATCH'].includes(req.method);

  const moduleMatch = triggerModules.find(module =>
    req.url.startsWith(`${baseUrl}/v1/${module}/`)
  );

  if (isModifyRequest && moduleMatch) {
    return next(req).pipe(
      switchMap(response => {
        autopopulateService.refreshModuleData(moduleMatch);
        return of(response);
      })
    );
  }

  return next(req);
};
