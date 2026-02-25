import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DashboardService,
  DashboardStats,
  PerformanceData,
} from '../../shared/services/api/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  statistics = signal<DashboardStats | null>(null);
  chartData = signal<PerformanceData[]>([]);
  activeFilter = signal<string>('ALL');

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.dashboardService.getStatistics().subscribe(stats => {
      this.statistics.set(stats);
    });

    this.loadPerformance('ALL');
  }

  loadPerformance(filter: string): void {
    this.activeFilter.set(filter);
    this.dashboardService.getPerformance(filter).subscribe(data => {
      if (data && data.length > 0) {
        this.chartData.set(data);
      } else {
        // Fallback or empty state
        this.chartData.set([]);
      }
    });
  }

  onFilterChange(filter: string): void {
    this.loadPerformance(filter);
  }

  getAbs(val: number): number {
    return Math.abs(val);
  }

  getPrevValue(current: number, growth: number): number {
    if (growth <= -100) return 0;
    return current / (1 + growth / 100);
  }

  getBarHeight(value: number, max: number): number {
    if (max === 0) return 0;
    return (value / max) * 100;
  }

  getMaxValue(): number {
    const stats = this.statistics();
    if (!stats) return 100;

    const vals = [
      stats.totalUsers,
      stats.totalUsersLastWeek,
      stats.totalTasks,
      stats.totalTasksLastWeek,
      stats.totalSpaces,
      stats.totalSpacesLastWeek,
      stats.returningUsers,
    ];
    return Math.max(...vals, 10);
  }
}
