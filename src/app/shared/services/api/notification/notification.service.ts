import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { RequestService, ApiResponse } from '../../core/request/request.service';
import { ToastService } from '../../core/toast/toast.service';
import { StatusCode } from '../../../constants/status-code.constant';
import { Notification, Pagination } from '../../../models/entities/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly requestService = inject(RequestService);
  private readonly toastService = inject(ToastService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly NOTIFICATION_API_URL = `${this.BASE_API_URL}/notifications`;

  getNotifications(params?: any): Observable<Pagination<Notification> | null> {
    return this.requestService.get<Pagination<Notification>>(this.NOTIFICATION_API_URL, params).pipe(
      map((res: ApiResponse<Pagination<Notification>>) => {
        if (res.statusCode === StatusCode.Success && res.data) {
          return res.data;
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  getUnreadNotifications(): Observable<Notification[]> {
    const url = `${this.NOTIFICATION_API_URL}/unread`;
    return this.requestService.get<Notification[]>(url).pipe(
      map((res: ApiResponse<Notification[]>) => {
        if (res.statusCode === StatusCode.Success && res.data) {
          return res.data;
        }
        return [];
      }),
      catchError(() => of([]))
    );
  }

  markAsRead(id: string): Observable<boolean> {
    const url = `${this.NOTIFICATION_API_URL}/read/${id}`;
    return this.requestService.put<boolean>(url).pipe(
      map((res: ApiResponse<boolean>) => res.statusCode === StatusCode.Updated),
      catchError(() => of(false))
    );
  }

  markAllAsRead(): Observable<boolean> {
    const url = `${this.NOTIFICATION_API_URL}/read-all`;
    return this.requestService.put<boolean>(url).pipe(
      map((res: ApiResponse<boolean>) => res.statusCode === StatusCode.Updated),
      catchError(() => of(false))
    );
  }

  getSpaceInvitations(): Observable<Notification[]> {
    return this.getNotifications({ PageIndex: 1, PageSize: 50 }).pipe(
      map(res => {
        if (res && res.data) {
          return res.data.filter(n => n.type === 'SpaceInvited');
        }
        return [];
      })
    );
  }
}
