import { inject, Injectable, signal } from '@angular/core';
import { RequestService, ApiResponse } from '../../core/request/request.service';
import { ToastService } from '../../core/toast/toast.service';
import { environment } from '../../../../../environments/environment';
import { catchError, finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import { User } from '../../../models/entities/user.model';
import { UserStatus } from '../../../models/enum/user-status.enum';
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
  private readonly USER_PROFILE_BY_ID_API_URL = `${this.USER_API_URL}/profile`;

  private readonly LOCAL_STORAGE_KEY = 'trava_user';

  private readonly currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();

  private profileRequest$: Observable<User | null> | null = null;

  getCurrentUserProfile(): Observable<User | null> {
    if (this.profileRequest$) {
      return this.profileRequest$;
    }

    this.profileRequest$ = this.requestService.get<User>(this.USER_PROFILE_API_URL).pipe(
      tap(res => this.handleSetCurrentUser(res)),
      map(res => (res.statusCode === StatusCode.Success && res.data ? res.data : null)),
      catchError(() => {
        this.toastService.error(
          'Failed to load user profile',
          'An error occurred during processing. Please try again later.'
        );
        return of(null);
      }),
      finalize(() => {
        this.profileRequest$ = null;
      }),
      shareReplay(1)
    );

    return this.profileRequest$;
  }

  getAllUsers(searchTerm?: string, status?: UserStatus): Observable<User[]> {
    let params: Record<string, any> = {};
    if (searchTerm) params['SearchTerm'] = searchTerm;
    if (status !== undefined && status !== null) params['Status'] = status;

    return this.requestService.get<any>(this.USER_API_URL, params, { showLoading: true }).pipe(
      map(res => {
        if (res.statusCode === StatusCode.Success && res.data?.data) {
          return res.data.data.map((user: any) => ({
            ...user,
            status:
              user.status === 'Active' || user.status === 0
                ? UserStatus.Active
                : UserStatus.Inactive,
          }));
        }
        return [];
      }),
      catchError(() => {
        this.toastService.error(
          'Failed to load user list',
          'An error occurred during processing. Please try again later.'
        );
        return of([]);
      })
    );
  }

  searchUsers(searchTerm: string): Observable<User[]> {
    return this.requestService
      .get<any>(`${this.USER_API_URL}/search`, { searchTerm }, { showLoading: true })
      .pipe(
        map(res => {
          if (res.statusCode === StatusCode.Success && res.data) {
            return res.data;
          }
          return [];
        }),
        catchError(() => {
          this.toastService.error(
            'Failed to search users',
            'An error occurred during processing. Please try again later.'
          );
          return of([]);
        })
      );
  }

  getUserProfileById(userId: string): Observable<User | null> {
    return this.requestService.get<User>(`${this.USER_PROFILE_BY_ID_API_URL}/${userId}`).pipe(
      map(res => (res.statusCode === StatusCode.Success && res.data ? res.data : null)),
      catchError(() => {
        this.toastService.error(
          'Failed to load user profile',
          'An error occurred during processing. Please try again later.'
        );
        return of(null);
      })
    );
  }

  updateUserStatus(userId: string, status: UserStatus): Observable<boolean> {
    return this.requestService.put<any>(`${this.USER_API_URL}/status/${userId}`, { status }).pipe(
      map(res => {
        const isSuccess =
          res.statusCode === StatusCode.Success ||
          res.statusCode === StatusCode.Updated ||
          res.statusCode === 2000 ||
          res.statusCode === 2002;

        if (isSuccess) {
          this.toastService.success('Status updated successfully', 'User status has been changed.');
          return true;
        }
        return false;
      }),
      catchError(() => {
        this.toastService.error(
          'Failed to update status',
          'An error occurred. Please try again later.'
        );
        return of(false);
      })
    );
  }

  updateUser(userId: string, data: Partial<User>): Observable<User | null> {
    return this.requestService
      .put<User>(this.USER_PROFILE_API_URL, data, { showLoading: true })
      .pipe(
        map(res => {
          const isSuccess = res.statusCode === StatusCode.Success || res.statusCode === StatusCode.Updated;

          if (isSuccess) {
            this.toastService.success('Profile updated', 'Your profile has been updated successfully.');
            // Update current user if it's the same user
            if (this.currentUserSignal()?.id === userId) {
              const updatedUser = { ...this.currentUserSignal()!, ...(res.data || data) };
              this.currentUserSignal.set(updatedUser);
              localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));
              return updatedUser;
            }
            return res.data || (data as User);
          }
          return null;
        }),
        catchError(() => {
          this.toastService.error(
            'Update failed',
            'An error occurred while updating your profile. Please try again.'
          );
          return of(null);
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
      this.toastService.error('Failed to load user profile', 'Please try again later.');
    }
  }
}
