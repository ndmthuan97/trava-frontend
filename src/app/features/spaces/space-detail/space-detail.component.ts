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

@Component({
  selector: 'app-space-detail',
  standalone: true,
  imports: [CommonModule, TableModule, BadgeComponent, ButtonModule, AvatarModule, TooltipModule],
  templateUrl: './space-detail.component.html',
  styleUrl: './space-detail.component.css',
})
export class SpaceDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  spaceId = signal<string | null>(null);

  // Mock tasks for the space
  tasks = signal<Task[]>([
    {
      id: '1',
      spaceId: 'space-1',
      title: 'Practice Project',
      description: 'Build a small project to practice Angular',
      status: TaskStatus.ToDo,
      priority: TaskPriority.High,
      point: 5,
      startDate: 'Today, 2:30pm',
      dueDate: 'Tomorrow, 5:00pm',
      type: TaskType.Personal,
      assignedUser: {
        id: 'u1',
        email: 'alex@example.com',
        fullName: 'Alex Johnson',
        avatarUrl: 'https://i.pravatar.cc/150?u=u1',
        role: 'USER' as any,
        status: 'Active' as any,
        password: '',
      },
    },
    {
      id: '2',
      spaceId: 'space-1',
      title: 'Angular Full Course',
      description: 'Watch the full course on YouTube',
      status: TaskStatus.InProgress,
      priority: TaskPriority.Medium,
      point: 8,
      startDate: 'Today, 4:15pm',
      type: TaskType.Personal,
      assignedUser: {
        id: 'u2',
        email: 'sarah@example.com',
        fullName: 'Sarah Wilson',
        avatarUrl: 'https://i.pravatar.cc/150?u=u2',
        role: 'USER' as any,
        status: 'Active' as any,
        password: '',
      },
    },
    {
      id: '3',
      spaceId: 'space-1',
      title: 'Daily Listening',
      description: 'Listen to English podcast',
      status: TaskStatus.Done,
      priority: TaskPriority.Low,
      point: 3,
      startDate: 'Today, 9:30pm',
      type: TaskType.Personal,
    },
    {
      id: '4',
      spaceId: 'space-1',
      title: 'Reading Book',
      description: 'Read 20 pages of Clean Code',
      status: TaskStatus.ToDo,
      priority: TaskPriority.Medium,
      point: 2,
      startDate: 'Today, 10:15pm',
      type: TaskType.Personal,
    },
  ]);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.spaceId.set(params.get('id'));
      console.log('Viewing space:', this.spaceId());
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
