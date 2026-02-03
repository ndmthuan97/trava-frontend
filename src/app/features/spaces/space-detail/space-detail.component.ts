import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Task } from '../../../shared/models/entities/task.model';
import { TaskStatus } from '../../../shared/models/enum/task-status.enum';
import { TaskType } from '../../../shared/models/enum/task-type.enum';
import { TaskPriority } from '../../../shared/models/enum/task-priority.enum';
import { TableModule } from 'primeng/table';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { SpaceService } from '../../../shared/services/api/space/space.service';
import { TaskItemService } from '../../../shared/services/api/task-item/task-item.service';
import { Space } from '../../../shared/models/entities/space.model';

@Component({
  selector: 'app-space-detail',
  standalone: true,
  imports: [CommonModule, TableModule, BadgeComponent, ButtonModule, AvatarModule, TooltipModule],
  templateUrl: './space-detail.component.html',
  styleUrl: './space-detail.component.css',
})
export class SpaceDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly spaceService = inject(SpaceService);
  private readonly taskItemService = inject(TaskItemService);

  spaceId = signal<string | null>(null);
  spaceInfo = signal<Space>(null as any);
  // Mock tasks for the space
  tasks = signal<Task[]>([]);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.spaceId.set(params.get('id'));
      const id = this.spaceId();
      if (id) {
        this.getSpaceInfo(id);
        this.getTasksBySpace(id);
      }
    });
  }

  getSpaceInfo(spaceId: string): void {
    this.spaceService.getSpaceById(spaceId).subscribe({
      next: space => {
        if (space) {
          this.spaceInfo.set(space);
        }
      },
      error: error => {
        console.error('Error fetching space info:', error);
      },
    });
  }

  getTasksBySpace(spaceId: string): void {
    const params = {
      SpaceId: spaceId,
      PageIndex: 1,
      PageSize: 12,
      IsPagingEnabled: true,
    } as any;

    this.taskItemService.getTasksBySpace(params).subscribe({
      next: tasks => {
        this.tasks.set(tasks ?? []);
      },
      error: err => {
        console.error('Error fetching tasks for space:', err);
      },
    });
  }

  getStatusSeverity(status: TaskStatus): BadgeVariant {
    switch (status) {
      case TaskStatus.Done:
        return 'success';
      case TaskStatus.InProgress:
        return 'info';
      case TaskStatus.ToDo:
        return 'gray';
      default:
        return 'default';
    }
  }

  getPrioritySeverity(priority: TaskPriority): BadgeVariant {
    switch (priority) {
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
}
