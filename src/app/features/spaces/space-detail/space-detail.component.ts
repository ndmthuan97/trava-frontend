import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Task } from '../../../shared/models/entities/task.model';
import { TaskPriority, TaskPriorityLabels } from '../../../shared/models/enum/task-priority.enum';
import { TaskStatus, TaskStatusLabels } from '../../../shared/models/enum/task-status.enum';
import { TableModule } from 'primeng/table';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/auth/services/auth/auth.service';
import { ToastService } from '../../../shared/services/core/toast/toast.service';
import { SpaceRole, SpaceRoleLabels } from '../../../shared/models/enum/space-role.enum';
import { UserService } from '../../../shared/services/api/user/user.service';
import { DatePipe } from '@angular/common';
import { TaskItemService } from '../../../shared/services/api/task-item/task-item.service';
import { Space } from '../../../shared/models/entities/space.model';
import { User } from '../../../shared/models/entities/user.model';
import { CreateTaskComponent } from '../../tasks/create-task/create-task.component';
import { TaskDetailComponent } from '../../tasks/task-detail/task-detail.component';
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
    TaskDetailComponent,
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
  private readonly toastService = inject(ToastService);
  
  public readonly SpaceRoleLabels = SpaceRoleLabels;
  public readonly TaskStatusLabels = TaskStatusLabels;
  public readonly TaskPriorityLabels = TaskPriorityLabels;


  spaceId = signal<string | null>(null);
  spaceInfo = signal<Space>(null as any);
  // Mock tasks for the space
  tasks = signal<Task[]>([]);
  
  currentUser = this.userService.currentUser;
  isSpaceOwner = signal<boolean>(false);
  spaceMembers = signal<User[]>([]);
  showMembers = signal<boolean>(false);

  taskSearchTerm = signal<string>('');
  memberSearchTerm = signal<string>('');
  
  // Sorting and Filtering signals
  sortBy = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc' | null>(null);
  filterStatus = signal<TaskStatus | null>(null);
  filterPriority = signal<TaskPriority | null>(null);

  private readonly taskSearchSubject = new Subject<string>();
  private readonly memberSearchSubject = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  private readonly confirmationService = inject(ConfirmationService);

  constructor() {
    effect(() => {
      const spaceId = this.spaceId();
      const currentUser = this.currentUser();
      const spaceInfo = this.spaceInfo();
      
      // Pull signals to trigger effect on change
      this.sortBy();
      this.sortDirection();
      this.filterStatus();
      this.filterPriority();
      
      if (spaceId && currentUser && spaceInfo) {
        this.getTasksBySpace(spaceId);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.authService.loadCurrentUser().subscribe(() => {
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

    this.setupSearch();
  }

  private setupSearch(): void {
    this.taskSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(term => {
      this.taskSearchTerm.set(term);
      const id = this.spaceId();
      if (id) this.getTasksBySpace(id);
    });

    this.memberSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(term => {
      this.memberSearchTerm.set(term);
      const id = this.spaceId();
      if (id) this.getSpaceMembers(id);
    });
  }

  onTaskSearch(term: string) {
    this.taskSearchSubject.next(term);
  }

  onMemberSearch(term: string) {
    this.memberSearchSubject.next(term);
  }

  getSpaceMembers(spaceId: string) {
    const term = this.memberSearchTerm();
    this.spaceService.getSpaceMembers({ spaceId, pageIndex: 1, pageSize: 100, SearchTerm: term }).subscribe(members => {
      this.spaceMembers.set(members);
      // Re-map tasks if they are already loaded
      if (this.tasks().length > 0) {
        this.mapTasksWithAssignees(this.tasks());
      }
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
      SearchTerm: this.taskSearchTerm(),
      SortBy: this.sortBy() || undefined,
      SortDirection: this.sortDirection() || undefined,
      Status: this.filterStatus() !== null ? (this.filterStatus() as number) : undefined,
      Priority: this.filterPriority() !== null ? (this.filterPriority() as number) : undefined,
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
        const tasksList = tasks ?? [];
        this.mapTasksWithAssignees(tasksList);
      },
      error: (err: any) => {
        console.error('Error fetching tasks:', err);
      },
    });
  }

  private mapTasksWithAssignees(tasksList: Task[]): void {
    const members = this.spaceMembers();
    const mappedTasks = tasksList.map(task => ({
      ...task,
      assignedUser: members.find(m => m.id === task.assignedUserId)
    }));
    this.tasks.set(mappedTasks);
  }

  createTaskVisible = signal<boolean>(false);
  taskDetailVisible = signal<boolean>(false);
  taskToEdit = signal<Task | null>(null);
  selectedTask = signal<Task | null>(null);

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

  onEditTask(task: Task, event?: Event) {
    if (event) event.stopPropagation();
    this.taskToEdit.set(task);
    this.createTaskVisible.set(true);
  }

  onViewTask(task: Task) {
    this.selectedTask.set(task);
    this.taskDetailVisible.set(true);
  }

  toggleView() {
    this.showMembers.update(v => !v);
  }

  showTasks() {
    this.showMembers.set(false);
  }

  getSpaceRoleLabel(role: any): string {
    const spaceRole = role as SpaceRole;
    return SpaceRoleLabels[spaceRole] || 'Unknown';
  }

  onRemoveMember(member: User) {
    this.confirmationService.confirm({
      message: `Are you sure you want to remove member "${member.fullName || member.email}" from this space?`,
      header: 'Remove Member Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remove',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const spaceId = this.spaceId();
        if (spaceId) {
          this.spaceService.removeMemberFromSpace(spaceId, member.id).subscribe((success: boolean) => {
            if (success) {
              this.getSpaceMembers(spaceId);
            }
          });
        }
      },
    });
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

  getStatusLabel(status: TaskStatus | any): string {
    return TaskStatusLabels[status as TaskStatus] || 'Unknown';
  }

  getPriorityLabel(priority: TaskPriority | any): string {
    return TaskPriorityLabels[priority as TaskPriority] || 'Unknown';
  }

  statusOptions = [
    { label: TaskStatusLabels[TaskStatus.NotStart], value: TaskStatus.NotStart },
    { label: TaskStatusLabels[TaskStatus.InProgress], value: TaskStatus.InProgress },
    { label: TaskStatusLabels[TaskStatus.Completed], value: TaskStatus.Completed },
  ];

  onStatusChange(task: Task, newStatus: TaskStatus) {
    console.log('Status change requested:', { taskId: task.id, oldStatus: task.status, newStatus });
    
    this.taskItemService.updateTaskStatus(task.id, newStatus).subscribe({
      next: (success) => {
        if (success) {
          this.onTaskCreated();
        }
      },
      error: (err) => {
        console.error('Error updating status:', err);
      }
    });
  }

  toggleSort(field: string) {
    if (this.sortBy() === field) {
      if (this.sortDirection() === 'asc') {
        this.sortDirection.set('desc');
      } else if (this.sortDirection() === 'desc') {
        this.sortBy.set(null);
        this.sortDirection.set(null);
      } else {
        this.sortDirection.set('asc');
      }
    } else {
      this.sortBy.set(field);
      this.sortDirection.set('asc');
    }
  }

  priorityFilterOptions = [
    { label: 'All Priorities', value: null },
    { label: TaskPriorityLabels[TaskPriority.Urgent], value: TaskPriority.Urgent },
    { label: TaskPriorityLabels[TaskPriority.High], value: TaskPriority.High },
    { label: TaskPriorityLabels[TaskPriority.Medium], value: TaskPriority.Medium },
    { label: TaskPriorityLabels[TaskPriority.Low], value: TaskPriority.Low },
  ];

  statusFilterOptions = [
    { label: 'All Statuses', value: null },
    { label: TaskStatusLabels[TaskStatus.NotStart], value: TaskStatus.NotStart },
    { label: TaskStatusLabels[TaskStatus.InProgress], value: TaskStatus.InProgress },
    { label: TaskStatusLabels[TaskStatus.Completed], value: TaskStatus.Completed },
  ];

  onFilterStatusChange(status: TaskStatus | null) {
    this.filterStatus.set(status);
  }

  onFilterPriorityChange(priority: TaskPriority | null) {
    this.filterPriority.set(priority);
  }
}
