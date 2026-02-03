import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, catchError, map, of } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import {
  RequestOptions,
  RequestService,
} from '../../../../shared/services/core/request/request.service';
import { ToastService } from '../../../../shared/services/core/toast/toast.service';
import { RegisterRequest } from '../../models/request/register-request.model';
import { LoginRequest } from '../../models/request/login-request.model';
import { AuthTokenResponse } from '../../models/response/auth-response.model';
import { RefreshTokenRequest } from '../../models/request/refresh-token-request.model';
import { ChangePasswordRequest } from '../../models/request/change-password-request.model';
import { JwtService } from '../jwt/jwt.service';
import { UserService } from '../../../../shared/services/api/user/user.service';
import { StatusCode } from '../../../../shared/constants/status-code.constant';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly requestService = inject(RequestService);
  private readonly jwtService = inject(JwtService);
  private readonly toastService = inject(ToastService);
  private readonly userService = inject(UserService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly REGISTER_API_URL = `${this.BASE_API_URL}/auths/register`;
  private readonly LOGIN_API_URL = `${this.BASE_API_URL}/auths/login`;
  private readonly REFRESH_TOKEN_API_URL = `${this.BASE_API_URL}/auths/refresh-token`;
  private readonly CHANGE_PASSWORD_API_URL = `${this.BASE_API_URL}/auths/change-password`;

  private readonly isLoggedInSignal = signal<boolean>(!!this.jwtService.getAccessToken());
  readonly isLoggedIn = this.isLoggedInSignal.asReadonly();

  loadCurrentUser(): Observable<boolean> {
    if (!this.jwtService.getAccessToken()) {
      return of(true);
    }
    return this.userService.getCurrentUserProfile().pipe(
      map(user => {
        if (user) {
          this.isLoggedInSignal.set(true);
        }
        return true;
      }),
      catchError(() => of(true))
    );
  }

  register(request: RegisterRequest, options?: RequestOptions): Observable<void | null> {
    return this.requestService.post<void>(this.REGISTER_API_URL, request, options).pipe(
      map(res => {
        if (res.statusCode === StatusCode.Success || res.statusCode === StatusCode.Created) {
          this.toastService.success('Registration successful', 'Congratulations! You have registered successfully.');
          this.router.navigateByUrl('/auth/login');
          return;
        }
        this.toastService.error('Registration failed', 'An error occurred, please try again later.');
        return null;
      }),
      catchError(err => {
        this.handleRegisterError(err);
        return of(null);
      })
    );
  }

  login(request: LoginRequest, options?: RequestOptions): Observable<AuthTokenResponse | null> {
    return this.requestService.post<AuthTokenResponse>(this.LOGIN_API_URL, request, options).pipe(
      map(res => {
        if (!res.statusCode || !res.data) {
          this.toastService.error('Login failed', 'An error occurred, please try again later.');
          return null;
        }

        switch (res.statusCode) {
          case StatusCode.Success:
            this.handleLoginSuccess(res.data);
            return res.data;
          default:
            this.toastService.error(
              'Login failed',
              'An error occurred, please try again later.'
            );
            return null;
        }
      }),
      catchError(err => {
        this.handleLoginError(err);
        return of(null);
      })
    );
  }

  refreshToken(): Observable<AuthTokenResponse | null> {
    const accessToken = this.jwtService.getAccessToken();
    const refreshToken = this.jwtService.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return of(null);
    }

    const request: RefreshTokenRequest = { accessToken, refreshToken };

    return this.requestService
      .post<AuthTokenResponse>(this.REFRESH_TOKEN_API_URL, request)
      .pipe(
        map(res => {
          if (!res.statusCode || !res.data) {
            return null;
          }

          if (res.statusCode === StatusCode.Success) {
            this.handleTokenStorage(res.data);
            return res.data;
          }

          return null;
        }),
        catchError(() => {
          this.logout();
          return of(null);
        })
      );
  }

  private handleTokenStorage(data: AuthTokenResponse): void {
    const { accessToken, refreshToken, expiresIn } = data;
    this.jwtService.setAccessToken(accessToken);
    this.jwtService.setRefreshToken(refreshToken);
    this.jwtService.setExpiresDate(new Date(Date.now() + expiresIn * 1000).toISOString());
  }

  handleLoginSuccess(data: AuthTokenResponse): void {
    this.handleTokenStorage(data);
    this.toastService.success('Login successful', 'Welcome back!');
    this.redirectUserAfterLogin();
  }

  private handleRegisterError(err: HttpErrorResponse): void {
    const statusCode = err.error?.statusCode;

    switch (statusCode) {
      case StatusCode.ModelInvalid:
      case StatusCode.ProvidedInformationIsInValid:
        this.toastService.error('Registration failed', 'Invalid registration data.');
        break;
      case StatusCode.EmailAlreadyExists:
        this.toastService.error('Registration failed', 'This email is already in use.');
        break;
      default:
        this.toastService.error('Registration failed', 'An error occurred, please try again later.');
    }
  }

  private handleLoginError(err: HttpErrorResponse): void {
    const statusCode = err.error?.statusCode;

    switch (statusCode) {
      case StatusCode.InvalidCredentials:
        this.toastService.error('Login failed', 'Incorrect email or password.');
        break;
      case StatusCode.UserNotExists:
        this.toastService.error('Login failed', 'Account does not exist.');
        break;
      case StatusCode.UserAccountLocked:
        this.toastService.error('Login failed', 'Account has been locked.');
        break;
      default:
        this.toastService.error('Login failed', 'An error occurred, please try again later.');
    }
  }

  redirectUserAfterLogin(): void {
    this.userService.getCurrentUserProfile().subscribe(user => {
      if (!user) {
        this.toastService.error('System error.', 'Could not retrieve user information.');
        return;
      }

      this.isLoggedInSignal.set(true);
      this.router.navigateByUrl('/', { replaceUrl: true });
    });
  }

  logout(): void {
    this.jwtService.clearAll();
    this.isLoggedInSignal.set(false);
    this.router.navigateByUrl('/auth/login');
  }

  changePassword(request: ChangePasswordRequest): Observable<boolean> {
    return this.requestService.post<any>(this.CHANGE_PASSWORD_API_URL, request).pipe(
      map(res => {
        if (res.statusCode === StatusCode.Success) {
          this.toastService.success('Password changed successfully', 'Your password has been changed.');
          return true;
        }
        return false;
      }),
      catchError(err => {
        const message = err.error?.message || 'An error occurred, please try again later.';
        this.toastService.error('Password change failed', message);
        return of(false);
      })
    );
  }
}
