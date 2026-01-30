import { inject, Injectable, signal } from '@angular/core';
import { RequestService } from '../../core/request/request.service';
import { ToastService } from '../../core/toast/toast.service';
import { environment } from '../../../../../environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { User } from '../../../models/entities/user.model';
import { StatusCode } from '../../../constants/status-code.constant';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly requestService = inject(RequestService);
  private readonly toastService = inject(ToastService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly USER_API_URL = `${this.BASE_API_URL}/users`;
  private readonly USER_PROFILE_API_URL = `${this.USER_API_URL}/profile`;

  private readonly LOCAL_STORAGE_KEY = 'trava_user';

  private readonly currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();

  getCurrentUserProfile(): Observable<User | null> {
    return this.requestService.get<User>(this.USER_PROFILE_API_URL).pipe(
      tap(res => this.handleGetProfileSideEffect(res)),
      map(res => this.extractUserFromResponse(res)),
      catchError(() => this.handleError())
    );
  }

  private handleGetProfileSideEffect(res: any): void {
    if (res.statusCode === StatusCode.Success && res.data) {
      this.setCurrentUser(res.data);
    } else {
      this.toastService.error('Lấy thông tin người dùng thất bại', 'Vui lòng thử lại sau.');
    }
  }

  private setCurrentUser(user: User | null): void {
    this.currentUserSignal.set(user);
    if (user) {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    }
  }

  private extractUserFromResponse(res: any): User | null {
    if (res.statusCode === StatusCode.Success && res.data) {
      return res.data;
    }
    return null;
  }

  private handleError(): Observable<null> {
    this.toastService.error(
      'Lỗi hệ thống.',
      'Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau.'
    );
    return of(null);
  }
}
