import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AutopopulateService } from '../services/autopopulate.service';
import { environment } from '../../../environments/environment';
import { finalize } from 'rxjs';

export const AutopopulateInterceptor: HttpInterceptorFn = (req, next) => {
  const autopopulateService = inject(AutopopulateService); 
  const baseUrl = environment.apiUrl;

  // List of API calls that should trigger the autopopulate API
  const triggerAutopopulateEndpoints = [
    // User-related
    `${baseUrl}/v1/users/create`,
    `${baseUrl}/v1/users/update`,
    `${baseUrl}/v1/users/delete`,
  
    // Order-related
    `${baseUrl}/v1/orders/create`,
    `${baseUrl}/v1/orders/update`,
    `${baseUrl}/v1/orders/delete`,
  
    // Product-related
    `${baseUrl}/v1/products/create`,
    `${baseUrl}/v1/products/update`,
    `${baseUrl}/v1/products/delete`,
    `${baseUrl}/v1/products/deletemany`,
  
    // Customer-related
    `${baseUrl}/v1/customers/create`,
    `${baseUrl}/v1/customers/update`,
    `${baseUrl}/v1/customers/delete`,
    `${baseUrl}/v1/customers/deletemany`,
  
    // Seller-related
    `${baseUrl}/v1/sellers/create`,
    `${baseUrl}/v1/sellers/update`,
    `${baseUrl}/v1/sellers/delete`,
  
    // Payment-related
    `${baseUrl}/v1/payments/create`,
    `${baseUrl}/v1/payments/update`,
    `${baseUrl}/v1/payments/delete`,
    `${baseUrl}/v1/payments/deletemany`,
  
    // Invoice-related
    `${baseUrl}/v1/invoices/create`,
    `${baseUrl}/v1/invoices/update`,
    `${baseUrl}/v1/invoices/delete`,
    `${baseUrl}/v1/invoices/deletemany`
  ];
  

  const shouldTriggerAutopopulate = triggerAutopopulateEndpoints.some(endpoint => req.url.startsWith(endpoint));

  return next(req).pipe(
    finalize(() => {
      if (shouldTriggerAutopopulate) {
        autopopulateService.getAutopopulateData().subscribe(); 
      }
    })
  );
};
