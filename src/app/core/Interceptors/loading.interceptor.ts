
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

