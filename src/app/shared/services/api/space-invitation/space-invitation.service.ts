import { inject, Injectable } from '@angular/core';
import { RequestService, ApiResponse } from '../../core/request/request.service';
import { ToastService } from '../../core/toast/toast.service';
import { environment } from '../../../../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';
import { StatusCode } from '../../../constants/status-code.constant';
import { InvitationStatus } from '../../../models/enum/invitation-status.enum';
import { Invitation } from '../../../models/entities/invitation.model';
import { Pagination } from '../../../models/entities/notification.model';

@Injectable({
  providedIn: 'root',
})
export class SpaceInvitationService {
  private readonly requestService = inject(RequestService);
  private readonly toastService = inject(ToastService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly INVITATION_API_URL = `${this.BASE_API_URL}/invitations`;

  getMyInvitations(params?: {
    Status?: InvitationStatus;
    PageIndex?: number;
    PageSize?: number;
    SortBy?: string;
    SortDirection?: string;
    SearchTerm?: string;
  }): Observable<Pagination<Invitation> | null> {
    return this.requestService.get<Pagination<Invitation>>(`${this.INVITATION_API_URL}/my-invitations`, params).pipe(
      map((res: ApiResponse<Pagination<Invitation>>) => {
        if (res.statusCode === StatusCode.Success && res.data) {
          return res.data;
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  createInvitation(payload: { spaceId: string; invitedUserId: string; expiredAt?: string }): Observable<boolean> {
    return this.requestService.post<any>(this.INVITATION_API_URL, payload).pipe(
      map(res => {
        if (res.statusCode === StatusCode.Success || res.statusCode === StatusCode.Created || res.statusCode === 2001) {
          this.toastService.success('Invitation sent', 'User has been invited to the space.');
          return true;
        }
        return false;
      }),
      catchError(() => {
        this.toastService.error('Failed to send invitation', 'An error occurred. Please try again later.');
        return of(false);
      })
    );
  }

  updateInvitationStatus(invitationId: string, status: InvitationStatus): Observable<boolean> {
    return this.requestService.put<any>(`${this.INVITATION_API_URL}/${invitationId}`, { invitationStatus: status }).pipe(
      map(res => {
        if (res.statusCode === StatusCode.Success || res.statusCode === StatusCode.Updated || res.statusCode === 2000 || res.statusCode === 2002) {
          const statusText = status === InvitationStatus.Accepted ? 'accepted' : 'rejected';
          this.toastService.success(`Invitation ${statusText}`, `You have ${statusText} the invitation.`);
          return true;
        }
        return false;
      }),
      catchError(() => {
        this.toastService.error('Failed to update invitation', 'An error occurred. Please try again later.');
        return of(false);
      })
    );
  }
}
