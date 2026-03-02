import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { SpaceService } from '../../../../shared/services/api/space/space.service';
import { SpaceStatistics } from '../../../../shared/models/entities/space-statistics.model';

@Component({
  selector: 'app-space-summary',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './space-summary.component.html',
  styleUrl: './space-summary.component.css'
})
export class SpaceSummaryComponent implements OnChanges {
  private readonly spaceService = inject(SpaceService);
  @Input() spaceId!: string;
  @Input() refreshTrigger = 0;

  stats = signal<SpaceStatistics | null>(null);
  statusChartData: any;
  statusChartOptions: any;
  priorityChartData: any;
  priorityChartOptions: any;

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['spaceId'] || changes['refreshTrigger']) && this.spaceId) {
      this.loadStatistics();
    }
  }

  loadStatistics() {
    this.spaceService.getSpaceStatistics(this.spaceId).subscribe(stats => {
      this.stats.set(stats);
      if (stats) {
        this.initCharts(stats);
      }
    });
  }

  initCharts(stats: SpaceStatistics) {
    // Doughnut Chart for Status
    this.statusChartData = {
      labels: ['Not Started', 'In Progress', 'Completed'],
      datasets: [
        {
          data: [stats.tasksByStatus.NotStart, stats.tasksByStatus.InProgress, stats.tasksByStatus.Completed],
          backgroundColor: ['#94a3b8', '#3b82f6', '#10b981'],
          hoverBackgroundColor: ['#64748b', '#2563eb', '#059669']
        }
      ]
    };

    this.statusChartOptions = {
      cutout: '60%',
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            font: { 
              size: 11,
              weight: 'bold'
            },
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#1e293b',
          bodyColor: '#1e293b',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          boxPadding: 4
        }
      }
    };

    // Bar Chart for Priority
    this.priorityChartData = {
      labels: ['Lowest', 'Low', 'Medium', 'High', 'Highest'],
      datasets: [
        {
          label: 'Tasks',
          data: [
            stats.tasksByPriority.Lowest,
            stats.tasksByPriority.Low,
            stats.tasksByPriority.Medium,
            stats.tasksByPriority.High,
            stats.tasksByPriority.Highest
          ],
          backgroundColor: [
            '#f1f5f9', // Lowest
            '#94a3b8', // Low
            '#3b82f6', // Medium
            '#f97316', // High
            '#e11d48'  // Highest
          ],
          borderRadius: 6,
          barThickness: 32
        }
      ]
    };

    this.priorityChartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#fff',
            titleColor: '#1e293b',
            bodyColor: '#1e293b',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            boxPadding: 4
          }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { 
            stepSize: 1,
            font: { size: 10 }
          },
          grid: {
            display: true,
            color: '#f1f5f9'
          }
        },
        x: {
          ticks: { 
            font: { 
                size: 10,
                weight: 'bold'
            }
          },
          grid: {
            display: false
          }
        }
      }
    };
  }
}
