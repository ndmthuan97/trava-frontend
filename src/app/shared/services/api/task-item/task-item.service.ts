import { catchError, map, Observable, of, Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { RequestService } from './../../core/request/request.service';
import { inject, Injectable } from '@angular/core';
import { Task } from '../../../models/entities/task.model';
import { ToastService } from '../../core/toast/toast.service';
import { StatusCode } from '../../../constants/status-code.constant';
import { CreateTaskItemRequest } from '../../../models/request/create-task-item-request.model';
import { UpdateTaskItemRequest } from '../../../models/request/update-task-item-request.model';
import { CreateCommentRequest } from '../../../models/request/create-comment-request.model';
import { Comment } from '../../../models/entities/comment.model';

export interface GetTasksBySpaceParams {
  SpaceId: string;
  PageIndex?: number;
  PageSize?: number;
  SortBy?: string;
  SortDirection?: string;
  SearchTerm?: string;
  IsPagingEnabled?: boolean;
  Statuses?: number[];
  Priorities?: number[];
}

@Injectable({
  providedIn: 'root',
})
export class TaskItemService {
  private readonly requestService = inject(RequestService);
  private readonly toastService = inject(ToastService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly TASKITEM_API_URL = `${this.BASE_API_URL}/taskitems/spaces`;

  private readonly taskChangedSubject = new Subject<void>();
  public readonly taskChanged$ = this.taskChangedSubject.asObservable();

  getComments(taskId: string): Observable<Comment[]> {
    const url = `${this.BASE_API_URL}/taskitems/${taskId}/comments`;
    return this.requestService.get<any>(url, {}, { showLoading: true }).pipe(
      map(res => {
        if (res.statusCode === StatusCode.Success && res.data) {
          return res.data as Comment[];
        }
        return [];
      }),
      catchError(() => of([]))
    );
  }

  addComment(taskId: string, content: string): Observable<Comment | null> {
    const url = `${this.BASE_API_URL}/taskitems/${taskId}/comments`;
    const request: CreateCommentRequest = {
      taskItemId: taskId,
      content: content,
    };
    return this.requestService.post<any>(url, request, { showLoading: true }).pipe(
      map(res => {
        const code = Number(res.statusCode) as StatusCode;
        const isSuccess = (code >= 200 && code <= 299) || (code >= 2000 && code <= 2999);
        if (isSuccess) {
          return (res.data as Comment) || ({} as Comment);
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

  getTasksBySpace(
    params: GetTasksBySpaceParams
  ): Observable<{ items: Task[]; totalCount: number }> {
    return this.requestService.get<any>(this.TASKITEM_API_URL, params, { showLoading: true }).pipe(
      map(res => {
        if (res.statusCode !== StatusCode.Success || res.data == null)
          return { items: [], totalCount: 0 };

        const d = res.data;
        let items: Task[] = [];
        const totalCount =
          d.totalCount || d.count || (Array.isArray(d) ? d.length : d.totalItems || 0);

        if (Array.isArray(d)) items = d as Task[];
        else if (Array.isArray(d.items)) items = d.items as Task[];
        else if (Array.isArray(d.data)) items = d.data as Task[];

        return { items, totalCount };
      }),
      catchError(err => {
        this.toastService.errorCode(err.error?.statusCode as StatusCode, 'Error');
        return of({ items: [], totalCount: 0 });
      })
    );
  }

  createTask(task: CreateTaskItemRequest): Observable<Task | null> {
    const url = `${this.BASE_API_URL}/taskitems`;
    return this.requestService.post<any>(url, task, { showLoading: true }).pipe(
      map(res => {
        const code = Number(res.statusCode) as StatusCode;
        const isSuccess = (code >= 200 && code <= 299) || (code >= 2000 && code <= 2999);
        if (isSuccess) {
          this.toastService.successCode(code, 'Success');
          this.taskChangedSubject.next();
          return (res.data as Task) || ({} as Task);
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

  updateTask(id: string, task: any): Observable<Task | null> {
    const url = `${this.BASE_API_URL}/taskitems/${id}`;
    return this.requestService.put<any>(url, task, { showLoading: true }).pipe(
      map(res => {
        const code = Number(res.statusCode) as StatusCode;
        const isSuccess = (code >= 200 && code <= 299) || (code >= 2000 && code <= 2999);
        if (isSuccess) {
          this.toastService.successCode(code, 'Success');
          this.taskChangedSubject.next();
          return (res.data as Task) || ({} as Task);
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

  patchTask(
    id: string,
    update: {
      status?: number;
      startDate?: string | null;
      dueDate?: string | null;
      point?: number;
    }
  ): Observable<Task | null> {
    const url = `${this.BASE_API_URL}/taskitems/${id}`;
    return this.requestService.patch<any>(url, update, { showLoading: true }).pipe(
      map(res => {
        const code = Number(res.statusCode) as StatusCode;
        const isSuccess = (code >= 200 && code <= 299) || (code >= 2000 && code <= 2999);
        if (isSuccess) {
          this.toastService.successCode(code, 'Success');
          this.taskChangedSubject.next();
          return (res.data as Task) || ({} as Task);
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

  deleteTask(id: string): Observable<boolean> {
    const url = `${this.BASE_API_URL}/taskitems/${id}`;
    return this.requestService.delete<any>(url, { showLoading: true }).pipe(
      map(res => {
        const code = Number(res.statusCode) as StatusCode;
        const isSuccess = (code >= 200 && code <= 299) || (code >= 2000 && code <= 2999);
        if (isSuccess) {
          this.toastService.successCode(code, 'Success');
          this.taskChangedSubject.next();
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

  completeTask(id: string): Observable<boolean> {
    const url = `${this.BASE_API_URL}/taskitems/complete/${id}`;
    return this.requestService.put<any>(url, {}, { showLoading: true }).pipe(
      map(res => {
        const code = Number(res.statusCode) as StatusCode;
        const isSuccess = (code >= 200 && code <= 299) || (code >= 2000 && code <= 2999);
        if (isSuccess) {
          this.toastService.successCode(code, 'Success');
          this.taskChangedSubject.next();
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

  assignTask(id: string, assignedUserId: string): Observable<boolean> {
    const url = `${this.BASE_API_URL}/taskitems/assign/${id}`;
    return this.requestService.patch<any>(url, { assignedUserId }, { showLoading: true }).pipe(
      map(res => {
        const code = Number(res.statusCode) as StatusCode;
        const isSuccess = (code >= 200 && code <= 299) || (code >= 2000 && code <= 2999);
        if (isSuccess) {
          this.toastService.successCode(code, 'Success');
          this.taskChangedSubject.next();
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

  updateTaskStatus(id: string, status: number): Observable<boolean> {
    const url = `${this.BASE_API_URL}/taskitems/${id}/status`;
    console.log('Updating task status:', { id, status, url });

    return this.requestService.patch<any>(url, { status }, { showLoading: true }).pipe(
      map(res => {
        const code = Number(res.statusCode) as StatusCode;
        const isSuccess = (code >= 200 && code <= 299) || (code >= 2000 && code <= 2999);
        console.log('Update status API response:', res);
        if (isSuccess) {
          this.toastService.successCode(code, 'Success');
          this.taskChangedSubject.next();
          return true;
        }
        this.toastService.errorCode(code, 'Error');
        console.warn('Status code not success:', res.statusCode);
        return false;
      }),
      catchError(err => {
        console.error('Update status API error:', err);
        this.toastService.errorCode(err.error?.statusCode as StatusCode, 'Error');
        return of(false);
      })
    );
  }

  getMyTasks(params: any): Observable<Task[]> {
    const url = `${this.BASE_API_URL}/taskitems/my-tasks`;
    return this.requestService.get<any>(url, params, { showLoading: true }).pipe(
      map(res => {
        if (res.statusCode === StatusCode.Success && res.data) {
          return res.data.data || res.data.items || res.data || [];
        }
        return [];
      }),
      catchError(() => of([]))
    );
  }
}
