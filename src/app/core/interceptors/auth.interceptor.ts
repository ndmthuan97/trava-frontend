import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../auth/services/auth/auth.service';
import { JwtService } from '../auth/services/jwt/jwt.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtService);
  const authService = inject(AuthService);

  // Skip auth requests
  if (req.url.includes('/auths/login') || req.url.includes('/auths/refresh-token')) {
    return next(req);
  }

  const token = jwtService.getAccessToken();

  if (token) {
    req = addToken(req, token);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(req, next, authService, jwtService);
      }
      return throwError(() => error);
    })
  );
};

const addToken = (request: HttpRequest<unknown>, token: string): HttpRequest<unknown> => {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const handle401Error = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  jwtService: JwtService
) => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap(tokenResponse => {
        isRefreshing = false;
        if (tokenResponse) {
          refreshTokenSubject.next(tokenResponse.accessToken);
          return next(addToken(request, tokenResponse.accessToken));
        }
        return throwError(() => new Error('Refresh token failed'));
      }),
      catchError(err => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => {
      return next(addToken(request, token));
    })
  );
};
