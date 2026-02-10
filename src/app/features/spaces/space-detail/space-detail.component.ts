import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Task } from '../../../shared/models/entities/task.model';
import { TaskStatus } from '../../../shared/models/enum/task-status.enum';
import { TaskType } from '../../../shared/models/enum/task-type.enum';
import { TaskPriority } from '../../../shared/models/enum/task-priority.enum';
import { TableModule } from 'primeng/table';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/auth/services/auth/auth.service';
import { UserService } from '../../../shared/services/api/user/user.service';
import { DatePipe } from '@angular/common';
import { TaskItemService } from '../../../shared/services/api/task-item/task-item.service';
import { Space } from '../../../shared/models/entities/space.model';
import { User } from '../../../shared/models/entities/user.model';
import { CreateTaskComponent } from '../../tasks/create-task/create-task.component';
import { SpaceService } from '../../../shared/services/api/space/space.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { effect } from '@angular/core';


@Component({
  selector: 'app-space-detail',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    BadgeComponent,
    ButtonModule,
    AvatarModule,
    TooltipModule,
    CreateTaskComponent,
    DatePipe,
    ConfirmDialogModule,
    SelectModule,
    OverlayPanelModule,
    DialogModule,
    MenuModule,
    FormsModule,
  ],
  templateUrl: './space-detail.component.html',
  styleUrl: './space-detail.component.css',
  providers: [ConfirmationService],
})
export class SpaceDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly spaceService = inject(SpaceService);
  private readonly taskItemService = inject(TaskItemService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  spaceId = signal<string | null>(null);
  spaceInfo = signal<Space>(null as any);
  // Mock tasks for the space
  tasks = signal<Task[]>([]);
  
  currentUser = signal<any>(null);
  isSpaceOwner = signal<boolean>(false);
  spaceMembers = signal<User[]>([]);
  showAssignDialog = signal<boolean>(false);
  private readonly confirmationService = inject(ConfirmationService);

  constructor() {
    effect(() => {
      const spaceId = this.spaceId();
      const currentUser = this.currentUser();
      // We also need to wait for spaceInfo if we want checkOwnership to be accurate
      const spaceInfo = this.spaceInfo();
      
      if (spaceId && currentUser && spaceInfo) {
        this.getTasksBySpace(spaceId);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.authService.loadCurrentUser().subscribe();
    this.userService.getCurrentUserProfile().subscribe((user: any) => {
      this.currentUser.set(user);
      this.checkOwnership();
    });

    this.route.paramMap.subscribe(params => {
      this.spaceId.set(params.get('id'));
      const id = this.spaceId();
      if (id) {
        this.getSpaceInfo(id);
        this.getSpaceMembers(id);
      }
    });
  }

  getSpaceMembers(spaceId: string) {
    this.spaceService.getSpaceMembers({ spaceId, pageIndex: 1, pageSize: 100 }).subscribe(members => {
      this.spaceMembers.set(members);
    });
  }


  checkOwnership() {
    const space = this.spaceInfo();
    const user = this.currentUser();
    if (space && user) {
      this.isSpaceOwner.set(space.createdBy === user.id);
    }
  }

  getSpaceInfo(spaceId: string): void {
    this.spaceService.getSpaceById(spaceId).subscribe({
      next: (space: Space | null) => {
        if (space) {
          this.spaceInfo.set(space);
          this.checkOwnership();
        }
      },
      error: (error: any) => {
        console.error('Error fetching space info:', error);
      },
    });
  }

  getTasksBySpace(spaceId: string): void {
    const isOwner = this.isSpaceOwner();
    const currentUserId = this.currentUser()?.id;
    
    const params = {
      SpaceId: spaceId,
      PageIndex: 1,
      PageSize: 100,
      IsPagingEnabled: false,
    } as any;

    // Add AssignedUserId for member's task filtering
    if (!isOwner && currentUserId) {
      params.AssignedUserId = currentUserId;
    }

    const taskObservable = isOwner 
      ? this.taskItemService.getTasksBySpace(params)
      : this.taskItemService.getMyTasks(params);

    taskObservable.subscribe({
      next: (tasks: Task[] | null) => {
        this.tasks.set(tasks ?? []);
      },
      error: (err: any) => {
        console.error('Error fetching tasks:', err);
      },
    });
  }

  createTaskVisible = signal<boolean>(false);
  taskToEdit = signal<Task | null>(null);

  openCreateTaskDialog() {
    this.taskToEdit.set(null);
    this.createTaskVisible.set(true);
  }

  onTaskCreated() {
    const spaceId = this.spaceId();
    if (spaceId) {
      this.getTasksBySpace(spaceId);
    }
  }

  onEditTask(task: Task) {
    this.taskToEdit.set(task);
    this.createTaskVisible.set(true);
  }

  onDeleteTask(event: Event, task: Task) {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this task?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.taskItemService.deleteTask(task.id).subscribe(success => {
          if (success) {
            this.onTaskCreated();
          }
        });
      },
    });
  }

  onCompleteTask(event: Event, task: Task) {
    event.stopPropagation();
    this.taskItemService.completeTask(task.id).subscribe(success => {
      if (success) {
        this.onTaskCreated();
      }
    });
  }

  selectedTaskForAssign = signal<Task | null>(null);

  onAssignTask(event: Event, task: Task) {
    event.stopPropagation();
    this.selectedTaskForAssign.set(task);
    this.showAssignDialog.set(true);
  }

  confirmAssign(userId: string) {
    const task = this.selectedTaskForAssign();
    if (task && userId) {
      this.taskItemService.assignTask(task.id, userId).subscribe(success => {
        if (success) {
          this.onTaskCreated();
          this.showAssignDialog.set(false);
          this.selectedTaskForAssign.set(null);
        }
      });
    }
  }

  getStatusSeverity(status: TaskStatus): BadgeVariant {
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

  getPrioritySeverity(priority: TaskPriority): BadgeVariant {
    switch (priority) {
      case TaskPriority.Urgent:
        return 'danger';
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

  statusOptions = [
    { label: 'Not Start', value: TaskStatus.NotStart },
    { label: 'In Progress', value: TaskStatus.InProgress },
    { label: 'Completed', value: TaskStatus.Completed },
  ];

  // Convert status string to number for API
  private statusToNumber(status: string): number {
    switch (status) {
      case 'NotStart':
        return 0;
      case 'InProgress':
        return 1;
      case 'Completed':
        return 2;
      default:
        return 0;
    }
  }

  onStatusChange(task: Task, newStatus: string) {
    console.log('Status change requested:', { taskId: task.id, oldStatus: task.status, newStatus });
    const statusNumber = this.statusToNumber(newStatus);
    console.log('Converted status to number:', statusNumber);
    
    this.taskItemService.updateTaskStatus(task.id, statusNumber).subscribe({
      next: (success) => {
        console.log('Update status response:', success);
        if (success) {
          console.log('Refreshing task list...');
          this.onTaskCreated();
        }
      },
      error: (err) => {
        console.error('Error updating status:', err);
      }
    });
  }
}
