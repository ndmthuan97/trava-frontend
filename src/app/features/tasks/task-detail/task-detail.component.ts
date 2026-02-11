import { Component, input, model, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { Task } from '../../../shared/models/entities/task.model';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { TaskStatus, TaskStatusLabels } from '../../../shared/models/enum/task-status.enum';
import { TaskPriority, TaskPriorityLabels } from '../../../shared/models/enum/task-priority.enum';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, DialogModule, AvatarModule, TooltipModule, BadgeComponent, DatePipe],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.css'
})
export class TaskDetailComponent {
  visible = model<boolean>(false);
  task = input<Task | null>(null);

  getStatusSeverity(status: TaskStatus | undefined): BadgeVariant {
    if (status === undefined) return 'default';
    switch (status) {
      case TaskStatus.Completed:
        return 'success';
      case TaskStatus.InProgress:
        return 'info';
      case TaskStatus.NotStart:
        return 'gray';
      default:
        return 'default';
    }
  }

  getPrioritySeverity(priority: TaskPriority | undefined): BadgeVariant {
    if (priority === undefined) return 'default';
    switch (priority) {
      case TaskPriority.Urgent:
      case TaskPriority.High:
        return 'danger';
      case TaskPriority.Medium:
        return 'warning';
      case TaskPriority.Low:
        return 'info';
      default:
        return 'default';
    }
  }

  getStatusLabel(status: TaskStatus | undefined): string {
    return status !== undefined ? TaskStatusLabels[status] : 'Unknown';
  }

  getPriorityLabel(priority: TaskPriority | undefined): string {
    return priority !== undefined ? TaskPriorityLabels[priority] : 'Unknown';
  }

  close() {
    this.visible.set(false);
  }
}
