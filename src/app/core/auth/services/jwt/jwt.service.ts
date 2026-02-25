import { inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import {
  ACCESS_TOKEN_KEY,
  EXPIRES_DATE_KEY,
  REFRESH_TOKEN_KEY,
} from '../../../../shared/constants/jwt.constant';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  private readonly cookieService = inject(CookieService);

  getAccessToken(): string | null {
    return this.cookieService.get(ACCESS_TOKEN_KEY) || null;
  }

  setAccessToken(token: string): void {
    this.cookieService.set(ACCESS_TOKEN_KEY, token, undefined, '/', undefined, false, 'Strict');
  }

  removeAccessToken(): void {
    this.cookieService.delete(ACCESS_TOKEN_KEY, '/');
  }

  getRefreshToken(): string | null {
    return this.cookieService.get(REFRESH_TOKEN_KEY) || null;
  }

  setRefreshToken(token: string): void {
    this.cookieService.set(REFRESH_TOKEN_KEY, token, undefined, '/', undefined, false, 'Strict');
  }

  removeRefreshToken(): void {
    this.cookieService.delete(REFRESH_TOKEN_KEY, '/');
  }

  getExpiresDate(): string | null {
    return this.cookieService.get(EXPIRES_DATE_KEY) || null;
  }

  setExpiresDate(date: string): void {
    this.cookieService.set(EXPIRES_DATE_KEY, date, undefined, '/', undefined, false, 'Strict');
  }

  removeExpiresDate(): void {
    this.cookieService.delete(EXPIRES_DATE_KEY, '/');
  }

  clearAll(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
    this.removeExpiresDate();
  }
}
