import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, catchError, map, of } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastService } from '../../../../shared/services/core/toast/toast.service';

import { StatusCode } from '../../../../shared/constants/status-code.constant';
import { RegisterRequest } from '../../models/request/register-request.model';
import { LoginRequest } from '../../models/request/login-request.model';
import { AuthTokenResponse } from '../../models/response/auth-response.model';
import { UserRoles } from '../../../../shared/constants/user-roles.constant';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly requestService = inject(RequestService);
  private readonly toastService = inject(ToastService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly REGISTER_API_URL = `${this.BASE_API_URL}/auths/register`;
  private readonly LOGIN_API_URL = `${this.BASE_API_URL}/auths/login`;

  register(request: RegisterRequest): Observable<void | null> {
    return this.requestService.post<void>(this.REGISTER_API_URL, request).pipe(
      map(res => {
        if (res.statusCode === StatusCode.SUCCESS || res.statusCode === StatusCode.CREATED) {
          this.toastService.success(
            'Đăng ký thành công',
            'Vui lòng kiểm tra email để xác minh tài khoản.'
          );
          this.router.navigateByUrl('/auth/login');
          return;
        }
        this.toastService.error('Đăng ký thất bại', 'Đã có lỗi xảy ra, vui lòng thử lại sau.');
        return null;
      }),
      catchError(err => {
        this.handleRegisterError(err);
        return of(null);
      })
    );
  }

  login(request: LoginRequest): Observable<AuthTokenResponse | null> {
    return this.requestService.post<AuthTokenResponse>(this.LOGIN_API_URL, request).pipe(
      map(res => {
        if (res.statusCode === StatusCode.SUCCESS) {
          this.toastService.success('Đăng nhập thành công', 'Chào mừng bạn quay trở lại!');
          this.router.navigateByUrl('/');
          return res.data ?? null;
        }
        this.toastService.error('Đăng nhập thất bại', 'Email hoặc mật khẩu không chính xác.');
        return null;
      }),
      catchError(err => {
        this.handleLoginError(err);
        return of(null);
      })
    );
  }

  private handleRegisterError(err: HttpErrorResponse): void {
    const statusCode = err.error?.statusCode;

    switch (statusCode) {
      case StatusCode.MODEL_INVALID:
      case StatusCode.PROVIDED_INFORMATION_IS_INVALID:
        this.toastService.error('Đăng ký thất bại', 'Dữ liệu đăng ký không hợp lệ.');
        break;
      case StatusCode.EMAIL_ALREADY_EXISTS:
        this.toastService.error('Đăng ký thất bại', 'Email này đã được sử dụng.');
        break;
      default:
        this.toastService.error('Đăng ký thất bại', 'Đã có lỗi xảy ra, vui lòng thử lại sau.');
    }
  }

  private handleLoginError(err: HttpErrorResponse): void {
    const statusCode = err.error?.statusCode;

    switch (statusCode) {
      case StatusCode.INVALID_CREDENTIALS:
        this.toastService.error('Đăng nhập thất bại', 'Email hoặc mật khẩu không chính xác.');
        break;
      case StatusCode.USER_NOT_EXISTS:
        this.toastService.error('Đăng nhập thất bại', 'Tài khoản không tồn tại.');
        break;
      case StatusCode.USER_ACCOUNT_LOCKED:
        this.toastService.error('Đăng nhập thất bại', 'Tài khoản đã bị khóa.');
        break;
      default:
        this.toastService.error('Đăng nhập thất bại', 'Đã có lỗi xảy ra, vui lòng thử lại sau.');
    }
  }
}
