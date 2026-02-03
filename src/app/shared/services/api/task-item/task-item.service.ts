import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { RequestService } from './../../core/request/request.service';
import { inject, Injectable } from '@angular/core';
import { Task } from '../../../models/entities/task.model';
import { ToastService } from '../../core/toast/toast.service';
import { StatusCode } from '../../../constants/status-code.constant';

export interface GetTasksBySpaceParams {
  SpaceId: string;
  PageIndex?: number;
  PageSize?: number;
  SortBy?: string;
  SortDirection?: string;
  SearchTerm?: string;
  IsPagingEnabled?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TaskItemService {
  private readonly requestService = inject(RequestService);
  private readonly toastService = inject(ToastService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly TASKITEM_API_URL = `${this.BASE_API_URL}/taskitems/spaces`;

  getTasksBySpace(params: GetTasksBySpaceParams): Observable<Task[]> {
    return this.requestService.get<any>(this.TASKITEM_API_URL, params, { showLoading: true }).pipe(
      map(res => {
        if (res.statusCode !== StatusCode.Success || res.data == null) return [];

        const d = res.data;
        if (Array.isArray(d)) return d as Task[];
        if (Array.isArray(d.items)) return d.items as Task[];
        if (Array.isArray(d.data)) return d.data as Task[];
        if (typeof d === 'object') {
          return [];
        }
        return [];
      }),
      catchError(() => {
        this.toastService.error(
          'Failed to load tasks',
          'An error occurred during processing. Please try again later.'
        );
        return of([]);
      })
    );
  }
}
