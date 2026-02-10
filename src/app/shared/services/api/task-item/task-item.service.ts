import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { RequestService } from './../../core/request/request.service';
import { inject, Injectable } from '@angular/core';
import { Task } from '../../../models/entities/task.model';
import { ToastService } from '../../core/toast/toast.service';
import { StatusCode } from '../../../constants/status-code.constant';
import { CreateTaskItemRequest } from '../../../models/request/create-task-item-request.model';
import { UpdateTaskItemRequest } from '../../../models/request/update-task-item-request.model';

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

  createTask(task: CreateTaskItemRequest): Observable<Task | null> {
    const url = `${this.BASE_API_URL}/taskitems`;
    return this.requestService.post<any>(url, task, { showLoading: true }).pipe(
      map(res => {
        if (res.statusCode === StatusCode.Success && res.data) {
          this.toastService.success('Task created successfully', 'Success');
          return res.data as Task;
        }
        return null;
      }),
      catchError(err => {
        this.toastService.error(
          'Failed to create task',
          'An error occurred regarding the task creation. Please try again later.'
        );
        return of(null);
      })
    );
  }

  updateTask(id: string, task: any): Observable<Task | null> {
    const url = `${this.BASE_API_URL}/taskitems/${id}`;
    return this.requestService.put<any>(url, task, { showLoading: true }).pipe(
      map(res => {
        if (res.statusCode === StatusCode.Success && res.data) {
          this.toastService.success('Task updated successfully', 'Success');
          return res.data as Task;
        }
        return null;
      }),
      catchError(err => {
        this.toastService.error(
          'Failed to update task',
          'An error occurred regarding the task update. Please try again later.'
        );
        return of(null);
      })
    );
  }

  deleteTask(id: string): Observable<boolean> {
    const url = `${this.BASE_API_URL}/taskitems/${id}`;
    return this.requestService.delete<any>(url, { showLoading: true }).pipe(
      map(res => {
        if (res.statusCode === StatusCode.Success) {
          this.toastService.success('Task deleted successfully', 'Success');
          return true;
        }
        return false;
      }),
      catchError(err => {
        this.toastService.error(
          'Failed to delete task',
          'An error occurred regarding the task deletion. Please try again later.'
        );
        return of(false);
      })
    );
  }

  completeTask(id: string): Observable<boolean> {
    const url = `${this.BASE_API_URL}/taskitems/complete/${id}`;
    return this.requestService.put<any>(url, {}, { showLoading: true }).pipe(
      map(res => {
        if (res.statusCode === StatusCode.Success) {
          this.toastService.success('Task completed', 'Success');
          return true;
        }
        return false;
      }),
      catchError(err => {
        this.toastService.error(
          'Failed to complete task',
          'An error occurred. Please try again later.'
        );
        return of(false);
      })
    );
  }

  assignTask(id: string, assignedUserId: string): Observable<boolean> {
    const url = `${this.BASE_API_URL}/taskitems/assign/${id}`;
    return this.requestService.patch<any>(url, { assignedUserId }, { showLoading: true }).pipe(
      map(res => {
        const response = res as any;
        if (response.statusCode === StatusCode.Success) {
          this.toastService.success('Task assigned successfully', 'Success');
          return true;
        }
        return false;
      }),
      catchError(err => {
        this.toastService.error(
          'Failed to assign task',
          'An error occurred. Please try again later.'
        );
        return of(false);
      })
    );
  }


  updateTaskStatus(id: string, status: number): Observable<boolean> {
    const url = `${this.BASE_API_URL}/taskitems/status/${id}`;
    console.log('Updating task status:', { id, status, url });
    
    return this.requestService.put<any>(url, { status }, { showLoading: true }).pipe(
      map(res => {
        console.log('Update status API response:', res);
        if (res.statusCode === StatusCode.Updated || res.statusCode === StatusCode.Success) {
          this.toastService.success('Status updated successfully', 'Success');
          return true;
        }
        console.warn('Status code not success:', res.statusCode);
        return false;
      }),
      catchError((error) => {
        console.error('Update status API error:', error);
        this.toastService.error('Failed to update status', 'An error occurred.');
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
