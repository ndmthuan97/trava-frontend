import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { RequestService } from './../../core/request/request.service';
import { inject, Injectable } from '@angular/core';
import { Space } from '../../../models/entities/space.model';
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

  getSpacesByUserId(): Observable<Space[]> {
    return this.requestService
      .get<Space[]>(`${this.SPACE_API_URL}/my-spaces`, {}, { showLoading: true })
      .pipe(
        map(res => (res.statusCode === StatusCode.Success && res.data ? res.data : [])),
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
      map(res => (res.statusCode === StatusCode.Success && res.data ? res.data : null)),
      catchError(() => {
        this.toastService.error(
          'Failed to create workspace',
          'An error occurred during processing. Please try again later.'
        );
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
}
