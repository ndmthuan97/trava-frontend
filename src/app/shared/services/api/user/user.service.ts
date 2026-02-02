import { inject, Injectable, signal } from '@angular/core';
import { RequestService, ApiResponse } from '../../core/request/request.service';
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
      tap(res => this.handleSetCurrentUser(res)),
      map(res => (res.statusCode === StatusCode.Success && res.data) ? res.data : null),
      catchError(() => {
        this.toastService.error(
          'Lấy thông tin người dùng thất bại',
          'Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau.'
        );
        return of(null);
      })
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.requestService.get<any>(this.USER_API_URL, {}, { showLoading: true }).pipe(
      map(res => (res.statusCode === StatusCode.Success && res.data?.data) ? res.data.data : []),
      catchError(() => {
        this.toastService.error(
          'Lấy danh sách người dùng thất bại',
          'Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau.'
        );
        return of([]);
      })
    );
  }

  private handleSetCurrentUser(res: ApiResponse<User>): void {
    if (res.statusCode === StatusCode.Success && res.data) {
      const user = res.data;
      this.currentUserSignal.set(user);
      if (user) {
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.LOCAL_STORAGE_KEY);
      }
    } else {
      this.toastService.error('Lấy thông tin người dùng thất bại', 'Vui lòng thử lại sau.');
    }
  }
}
