import { Component, input, model, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { DatePicker } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { Rating } from 'primeng/rating';
import { Popover } from 'primeng/popover';
import { Task } from '../../../shared/models/entities/task.model';
import { User } from '../../../shared/models/entities/user.model';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { TaskStatus, TaskStatusLabels } from '../../../shared/models/enum/task-status.enum';
import { TaskPriority, TaskPriorityLabels } from '../../../shared/models/enum/task-priority.enum';
import { TaskItemService } from '../../../shared/services/api/task-item/task-item.service';
import { Comment } from '../../../shared/models/entities/comment.model';
import { inject, effect, untracked } from '@angular/core';
import { ToastService } from '../../../shared/services/core/toast/toast.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    AvatarModule,
    TooltipModule,
    BadgeComponent,
    DatePipe,
    SelectModule,
    InputTextModule,
    Textarea,
    DatePicker,
    ButtonModule,
    Rating,
    Popover,
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.css',
})
export class TaskDetailComponent {
  visible = model<boolean>(false);
  task = input<Task | null>(null);
  spaceName = input<string>('');
  spaceMembers = input<User[]>([]);
  isSpaceOwner = input<boolean>(false);
  currentUserId = input<string | undefined>(undefined);
  currentUser = input<User | null>(null);

  edit = output<Task>();
  save = output<Partial<Task>>();
  delete = output<Task>();
  statusChange = output<{ task: Task; status: TaskStatus }>();

  private readonly taskService = inject(TaskItemService);
  private readonly toastService = inject(ToastService);

  editingField = signal<string | null>(null);
  isGlobalEdit = signal(false);
  isSaving = signal(false);
  editedTask = signal<any>({});
  internalTask = signal<Task | null>(null);

  comments = signal<Comment[]>([]);
  newCommentContent = signal<string>('');

  private lastId: string | null = null;

  constructor() {
    effect(
      () => {
        const t = this.task();
        const isVisible = this.visible();

        // Use untracked to avoid creating dependencies on signals we modify (editingField, internalTask, etc.)
        // and to prevent the effect from re-running when these internal states change.
        untracked(() => {
          if (isVisible && t) {
            // Use setTimeout to push signal updates to the next tick, avoiding NG0100
            setTimeout(() => {
              if (t.id !== this.lastId) {
                this.lastId = t.id;
                this.loadComments(t.id);
                this.internalTask.set(t);
                this.editingField.set(null);
              } else if (!this.editingField() && !this.isSaving()) {
                this.internalTask.set(t);
              }
            });
          } else if (!isVisible) {
            setTimeout(() => {
              this.lastId = null;
              this.editingField.set(null);
              this.isSaving.set(false);
            });
          }
        });
      },
      { allowSignalWrites: true }
    );
  }

  statusOptions = Object.keys(TaskStatusLabels).map(key => ({
    label: TaskStatusLabels[+key as TaskStatus],
    value: +key,
  }));

  priorityOptions = Object.keys(TaskPriorityLabels).map(key => ({
    label: TaskPriorityLabels[+key as TaskPriority],
    value: +key,
  }));

  canEditAll(): boolean {
    const t = this.internalTask();
    return this.isSpaceOwner() || (t !== null && t.assignedUserId === this.currentUserId());
  }

  canChangeStatusOnly(): boolean {
    const t = this.internalTask();
    return !this.isSpaceOwner() && t !== null && t.assignedUserId === this.currentUserId();
  }

  isMemberAssignee(): boolean {
    const t = this.internalTask();
    return t !== null && t.assignedUserId === this.currentUserId();
  }

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
      case TaskPriority.Highest:
        return 'danger';
      case TaskPriority.High:
        return 'orange';
      case TaskPriority.Medium:
        return 'info';
      case TaskPriority.Low:
        return 'gray';
      case TaskPriority.Lowest:
        return 'default';
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

  // Removed onEdit to disable inline editing as requested
  // onEdit(field: string) { ... }

  onGlobalEdit() {
    const t = this.internalTask();
    if (!t) return;

    if (!this.canEditAll() && !this.canChangeStatusOnly()) {
      this.toastService.error('Permission Denied', 'You do not have permission to edit this task.');
      return;
    }

    this.editedTask.set({
      ...t,
      startDate: t.startDate ? new Date(t.startDate) : null,
      dueDate: t.dueDate ? new Date(t.dueDate) : null,
    });
    this.isGlobalEdit.set(true);
    this.editingField.set(null);
  }

  onGlobalCancel() {
    this.isGlobalEdit.set(false);
    this.editingField.set(null);
  }

  onCancel() {
    this.editingField.set(null);
  }

  onGlobalSave() {
    const t = this.internalTask();
    if (!t) return;

    this.isSaving.set(true);
    const updatedData = this.editedTask();

    const startDate =
      updatedData.startDate instanceof Date
        ? updatedData.startDate.toISOString()
        : updatedData.startDate;
    const dueDate =
      updatedData.dueDate instanceof Date ? updatedData.dueDate.toISOString() : updatedData.dueDate;

    const isOwner = this.isSpaceOwner();
    const isAssignee = t.assignedUserId === this.currentUserId();

    let saveObservable;

    if (isOwner) {
      const payload = {
        title: updatedData.title,
        description: updatedData.description,
        status: updatedData.status,
        priority: updatedData.priority,
        point: updatedData.point || 0,
        startDate,
        dueDate,
        assignedUserId: updatedData.assignedUserId,
      };
      saveObservable = this.taskService.updateTask(t.id, payload);
    } else if (isAssignee) {
      const patchPayload = {
        status: updatedData.status,
        point: updatedData.point || 0,
        startDate,
        dueDate,
      };
      saveObservable = this.taskService.patchTask(t.id, patchPayload);
    } else {
      this.toastService.error('Permission Denied', 'You do not have permission to save changes to this task.');
      this.isSaving.set(false);
      return;
    }

    saveObservable.subscribe({
      next: (result: Task | null) => {
        if (result) {
          const enrichedResult = { ...result };
          if (enrichedResult.assignedUserId) {
            enrichedResult.assignedUser = this.spaceMembers().find(
              m => m.id === enrichedResult.assignedUserId
            );
          }
          this.save.emit(enrichedResult);
          this.close(); // Close popup as requested
        }
        this.isSaving.set(false);
      },
      error: () => {
        this.isSaving.set(false);
      },
    });
  }

  onSaveField(field: string) {
    const t = this.internalTask();
    if (!t || this.editingField() !== field) return;

    const updatedData = this.editedTask();
    const patchPayload: any = {};

    // Only include the field that was actually edited
    switch (field) {
      case 'title':
        patchPayload.title = updatedData.title;
        break;
      case 'description':
        patchPayload.description = updatedData.description;
        break;
      case 'status':
        patchPayload.status = updatedData.status;
        break;
      case 'priority':
        patchPayload.priority = updatedData.priority;
        break;
      case 'point':
        patchPayload.point = updatedData.point;
        break;
      case 'startDate':
        patchPayload.startDate =
          updatedData.startDate instanceof Date
            ? updatedData.startDate.toISOString()
            : updatedData.startDate;
        break;
      case 'dueDate':
        patchPayload.dueDate =
          updatedData.dueDate instanceof Date
            ? updatedData.dueDate.toISOString()
            : updatedData.dueDate;
        break;
      case 'assignee':
        patchPayload.assignedUserId = updatedData.assignedUserId;
        break;
    }

    // Optimistically update UI
    const previousTask = { ...t };
    this.internalTask.update(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...patchPayload };
      // If assignee changed, optimistically update the assignedUser object
      if (field === 'assignee' && patchPayload.assignedUserId) {
        next.assignedUser = this.spaceMembers().find(m => m.id === patchPayload.assignedUserId);
      }
      return next;
    });

    this.isSaving.set(true);
    this.editingField.set(null);

    this.taskService.patchTask(t.id, patchPayload).subscribe({
      next: (result: Task | null) => {
        if (result) {
          // Enrich the result with assignedUser info
          const enrichedResult = { ...result };
          if (enrichedResult.assignedUserId) {
            enrichedResult.assignedUser = this.spaceMembers().find(
              m => m.id === enrichedResult.assignedUserId
            );
          }
          // Emit THEN update internal state to ensure parent is in sync
          this.save.emit(enrichedResult);
          this.internalTask.set(enrichedResult);
        } else {
          // Rollback on failure
          this.internalTask.set(previousTask);
        }
        this.isSaving.set(false);
      },
      error: () => {
        // Rollback on error
        this.internalTask.set(previousTask);
        this.isSaving.set(false);
      },
    });
  }

  onSave() {
    this.save.emit(this.editedTask());
    this.editingField.set(null);
  }

  onDelete() {
    const t = this.task();
    if (t) {
      this.delete.emit(t);
      this.close();
    }
  }

  loadComments(taskId: string) {
    this.taskService.getComments(taskId).subscribe({
      next: (res: Comment[]) => this.comments.set(res || []),
      error: () => this.comments.set([]),
    });
  }

  submitComment() {
    const content = this.newCommentContent().trim();
    const t = this.task();
    if (!content || !t) return;

    this.taskService.addComment(t.id, content).subscribe({
      next: (comment: Comment | null) => {
        if (comment) {
          const user = this.currentUser();
          if (user) {
            comment.fullName = user.fullName;
            comment.avatarUrl = user.avatarUrl;
          }
          this.comments.update(prev => [comment, ...prev]);
          this.newCommentContent.set('');
        }
      },
    });
  }

  close() {
    this.visible.set(false);
  }
}
