import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const LoadingInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const loadingService = inject(LoadingService);

  // Show the loader for every HTTP request
  loadingService.show();

  return next(req).pipe(
    // Ensure the loader is hidden when the request completes or errors out
    finalize(() => {
      loadingService.hide();
    })
  );
};
