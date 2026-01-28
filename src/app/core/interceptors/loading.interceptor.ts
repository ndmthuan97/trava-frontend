import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../../shared/services/core/loading/loading.service';
import {
  LOADING_KEY,
  SHOW_LOADING,
} from '../../shared/services/tokens/http-context.token';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SHOW_LOADING) === false) {
    return next(req);
  }

  const loadingService = inject(LoadingService);
  const key = req.context.get(LOADING_KEY);

  loadingService.setLoading(true, key);

  return next(req).pipe(finalize(() => loadingService.setLoading(false, key)));
};
