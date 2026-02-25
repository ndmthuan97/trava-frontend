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

  getSpacesByUserId(searchTerm?: string, spaceType?: number, role?: number): Observable<Space[]> {
    const params: any = {};
    if (searchTerm) params.SearchTerm = searchTerm;
    if (spaceType !== undefined && spaceType !== null) params.SpaceType = spaceType;
    if (role !== undefined && role !== null) params.SpaceRole = role;

    return this.requestService
      .get<any>(`${this.SPACE_API_URL}/my-spaces`, params, { showLoading: true })
      .pipe(
        map(res => {
          if (res.statusCode !== StatusCode.Success || !res.data) return [];
          const data = res.data;
          if (Array.isArray(data)) return data as Space[];
          if (Array.isArray(data.items)) return data.items as Space[];
          if (Array.isArray(data.data)) return data.data as Space[];
          return [];
        }),
        catchError(() => {
          this.toastService.error(
            'Failed to load workspaces',
            'An error occurred during processing. Please try again later.'
          );
          return of([]);
        })
      );
  }

  createSpace(space: CreateSpaceRequest): Observable<Space | null> {
    return this.requestService.post<Space>(this.SPACE_API_URL, space, { showLoading: true }).pipe(
      map(res => {
        const code = Number(res.statusCode);
        if (code >= 2000 && code < 3000 && res.data) {
          this.toastService.success('Success', 'Workspace created successfully');
          return res.data;
        }
        return null;
      }),
      catchError(() => {
        this.toastService.error('Error', 'Failed to create workspace. Please try again later.');
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

  getSpaceMembers(params: any): Observable<User[]> {
    return this.requestService
      .get<any>(`${this.SPACE_API_URL}/members`, params, { showLoading: true })
      .pipe(
        map(res => {
          if (res.statusCode === StatusCode.Success && res.data) {
            // The backend response structure provided in the image shows data.data as the array
            return res.data.data || [];
          }
          return [];
        }),
        catchError(() => {
          this.toastService.error(
            'Failed to load space members',
            'An error occurred while fetching members. Please try again later.'
          );
          return of([]);
        })
      );
  }

  removeMemberFromSpace(spaceId: string, userId: string): Observable<boolean> {
    return this.requestService
      .delete<any>(`${this.SPACE_API_URL}/${spaceId}/members/${userId}`, { showLoading: true })
      .pipe(
        map(res => {
          const code = Number(res.statusCode);
          if (code >= 2000 && code < 3000) {
            this.toastService.success('Success', 'Member removed successfully');
            return true;
          }
          return false;
        }),
        catchError(() => {
          this.toastService.error('Error', 'Failed to remove member. Please try again later.');
          return of(false);
        })
      );
  }

  getSpaceStatistics(spaceId: string): Observable<SpaceStatistics | null> {
    return this.requestService
      .get<SpaceStatistics>(`${this.SPACE_API_URL}/${spaceId}/statistics`, {}, { showLoading: true })
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
}

