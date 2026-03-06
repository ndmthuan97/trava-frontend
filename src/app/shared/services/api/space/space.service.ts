import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { RequestService } from './../../core/request/request.service';
import { inject, Injectable } from '@angular/core';
import { Space } from '../../../models/entities/space.model';
import { SpaceStatistics } from '../../../models/entities/space-statistics.model';
import { User } from '../../../models/entities/user.model';
import { CreateSpaceRequest } from '../../../models/request/space-request.model';
import { ToastService } from '../../core/toast/toast.service';
import { StatusCode } from '../../../constants/status-code.constant';

@Injectable({
  providedIn: 'root',
})
export class SpaceService {
  private readonly requestService = inject(RequestService);
  private readonly toastService = inject(ToastService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly SPACE_API_URL = `${this.BASE_API_URL}/spaces`;
  private readonly USER_API_URL = `${this.BASE_API_URL}/users`;

  getSpacesByUserId(
    searchTerm?: string,
    spaceType?: number,
    role?: number,
    pageIndex?: number,
    pageSize?: number
  ): Observable<{ items: Space[]; totalCount: number }> {
    const params: any = {};
    if (searchTerm) params.SearchTerm = searchTerm;
    if (spaceType !== undefined && spaceType !== null) params.SpaceType = spaceType;
    if (role !== undefined && role !== null) params.SpaceRole = role;
    if (pageIndex) params.PageIndex = pageIndex;
    if (pageSize) params.PageSize = pageSize;

    return this.requestService
      .get<any>(`${this.SPACE_API_URL}/my-spaces`, params, { showLoading: true })
      .pipe(
        map(res => {
          if (res.statusCode !== StatusCode.Success || !res.data)
            return { items: [], totalCount: 0 };
          const data = res.data;
          let items: Space[] = [];
          const totalCount =
            data.totalCount ||
            data.count ||
            (Array.isArray(data) ? data.length : data.totalItems || 0);

          if (Array.isArray(data)) items = data as Space[];
          else if (Array.isArray(data.items)) items = data.items as Space[];
          else if (Array.isArray(data.data)) items = data.data as Space[];

          return { items, totalCount };
        }),
        catchError(() => {
          this.toastService.error(
            'Failed to load workspaces',
            'An error occurred during processing. Please try again later.'
          );
          return of({ items: [], totalCount: 0 });
        })
      );
  }

  createSpace(space: CreateSpaceRequest): Observable<Space | null> {
    return this.requestService.post<Space>(this.SPACE_API_URL, space, { showLoading: true }).pipe(
      map(res => {
        const code = Number(res.statusCode) as StatusCode;
        const isSuccess = (code >= 200 && code <= 299) || (code >= 2000 && code <= 2999);
        if (isSuccess) {
          this.toastService.successCode(code, 'Success');
          return res.data || ({} as Space);
        }
        this.toastService.errorCode(code, 'Error');
        return null;
      }),
      catchError(err => {
        this.toastService.errorCode(err.error?.statusCode as StatusCode, 'Error');
        return of(null);
      })
    );
  }

  getSpaceById(spaceId: string): Observable<Space | null> {
    return this.requestService
      .get<Space>(`${this.SPACE_API_URL}/${spaceId}`, {}, { showLoading: true })
      .pipe(
        map(res => (res.statusCode === StatusCode.Success && res.data ? res.data : null)),
        catchError(() => {
          this.toastService.error(
            'Failed to load workspace information',
            'An error occurred during processing. Please try again later.'
          );
          return of(null);
        })
      );
  }

  getSpaceMembers(params: any): Observable<{ items: User[]; totalCount: number }> {
    return this.requestService
      .get<any>(`${this.SPACE_API_URL}/members`, params, { showLoading: true })
      .pipe(
        map(res => {
          if (res.statusCode === StatusCode.Success && res.data) {
            const items =
              res.data.data || res.data.items || (Array.isArray(res.data) ? res.data : []);
            // Backends may return total count in different fields (totalCount, count, totalItems)
            const totalCountRaw =
              res.data.totalCount ?? res.data.count ?? res.data.totalItems ?? items.length;
            const totalCount = Number(totalCountRaw) || items.length;
            return { items, totalCount };
          }
          return { items: [], totalCount: 0 };
        }),
        catchError(() => {
          this.toastService.error(
            'Failed to load space members',
            'An error occurred while fetching members. Please try again later.'
          );
          return of({ items: [], totalCount: 0 });
        })
      );
  }

  removeMemberFromSpace(spaceId: string, userId: string): Observable<boolean> {
    return this.requestService
      .delete<any>(`${this.SPACE_API_URL}/${spaceId}/members/${userId}`, { showLoading: true })
      .pipe(
        map(res => {
          const code = Number(res.statusCode) as StatusCode;
        const isSuccess = (code >= 200 && code <= 299) || (code >= 2000 && code <= 2999);
        if (isSuccess) {
          this.toastService.successCode(code, 'Success');
          return true;
        }
        this.toastService.errorCode(code, 'Error');
        return false;
      }),
      catchError(err => {
        this.toastService.errorCode(err.error?.statusCode as StatusCode, 'Error');
        return of(false);
      })
      );
  }

  getSpaceStatistics(spaceId: string): Observable<SpaceStatistics | null> {
    return this.requestService
      .get<SpaceStatistics>(
        `${this.SPACE_API_URL}/${spaceId}/statistics`,
        {},
        { showLoading: true }
      )
      .pipe(
        map(res => (res.statusCode === StatusCode.Success && res.data ? res.data : null)),
        catchError(() => {
          this.toastService.error(
            'Failed to load space statistics',
            'An error occurred while fetching statistics. Please try again later.'
          );
          return of(null);
        })
      );
  }
  updateSpace(
    spaceId: string,
    data: { name: string; description?: string }
  ): Observable<Space | null> {
    return this.requestService
      .put<Space>(`${this.SPACE_API_URL}/${spaceId}`, data, { showLoading: true })
      .pipe(
        map(res => {
          const code = Number(res.statusCode) as StatusCode;
        const isSuccess = (code >= 200 && code <= 299) || (code >= 2000 && code <= 2999);
        if (isSuccess) {
          this.toastService.successCode(code, 'Success');
          return res.data || ({} as Space);
        }
        this.toastService.errorCode(code, 'Error');
        return null;
      }),
      catchError(err => {
        this.toastService.errorCode(err.error?.statusCode as StatusCode, 'Error');
        return of(null);
      })
      );
  }

  deleteSpace(spaceId: string): Observable<boolean> {
    return this.requestService
      .delete<any>(`${this.SPACE_API_URL}/${spaceId}`, { showLoading: true })
      .pipe(
        map(res => {
          const code = Number(res.statusCode) as StatusCode;
        const isSuccess = (code >= 200 && code <= 299) || (code >= 2000 && code <= 2999);
        if (isSuccess) {
          this.toastService.successCode(code, 'Success');
          return true;
        }
        this.toastService.errorCode(code, 'Error');
        return false;
      }),
      catchError(err => {
        this.toastService.errorCode(err.error?.statusCode as StatusCode, 'Error');
        return of(false);
      })
      );
  }
}
