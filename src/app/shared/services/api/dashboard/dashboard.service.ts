import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StatusCode } from '../../../constants/status-code.constant';
import { RequestService } from '../../core/request/request.service';
import { environment } from '../../../../../environments/environment';

export interface DashboardStats {
  totalUsers: number;
  totalUsersLastWeek: number;
  userGrowth: number;
  totalSpaces: number;
  totalSpacesLastWeek: number;
  spaceGrowth: number;
  totalTasks: number;
  totalTasksLastWeek: number;
  taskGrowth: number;
  returningUsers: number;
  returningUserRate: number;
}

export interface PerformanceData {
  label: string;
  value: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly requestService = inject(RequestService);
  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly DASHBOARD_API_URL = `${this.BASE_API_URL}/dashboards`;

  getStatistics(): Observable<DashboardStats | null> {
    return this.requestService.get<any>(`${this.DASHBOARD_API_URL}`).pipe(
      map(res => {
        if (res.statusCode === StatusCode.Success && res.data) {
          return res.data as DashboardStats;
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  getPerformance(filter: string = 'ALL'): Observable<PerformanceData[]> {
    return this.requestService.get<any>(`${this.DASHBOARD_API_URL}/performance`, { filter }).pipe(
      map(res => {
        if (res.statusCode === StatusCode.Success && Array.isArray(res.data)) {
          return res.data;
        }
        return this.getMockPerformance(filter);
      }),
      catchError(() => of(this.getMockPerformance(filter)))
    );
  }

  private getMockPerformance(filter: string): PerformanceData[] {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return labels.map(label => ({
      label,
      value: Math.floor(Math.random() * 60) + 20,
    }));
  }
}
