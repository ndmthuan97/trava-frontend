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
import { Task } from '../../../shared/models/entities/task.model';
import { User } from '../../../shared/models/entities/user.model';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { TaskStatus, TaskStatusLabels } from '../../../shared/models/enum/task-status.enum';
import { TaskPriority, TaskPriorityLabels } from '../../../shared/models/enum/task-priority.enum';

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
    ButtonModule
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.css'
})
export class TaskDetailComponent {
  visible = model<boolean>(false);
  task = input<Task | null>(null);
  spaceName = input<string>("");
  spaceMembers = input<User[]>([]);
  edit = output<Task>();
  save = output<Partial<Task>>();
  delete = output<Task>();

  isEditing = signal(false);
  editedTask = signal<any>({});

  statusOptions = Object.keys(TaskStatusLabels).map(key => ({
    label: TaskStatusLabels[+key as TaskStatus],
    value: +key
  }));

  priorityOptions = Object.keys(TaskPriorityLabels).map(key => ({
    label: TaskPriorityLabels[+key as TaskPriority],
    value: +key
  }));

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

  onEdit() {
    const t = this.task();
    if (t) {
      this.editedTask.set({ 
        ...t,
        startDate: t.startDate ? new Date(t.startDate) : null,
        dueDate: t.dueDate ? new Date(t.dueDate) : null
      });
      this.isEditing.set(true);
    }
  }

  onCancel() {
    this.isEditing.set(false);
  }

  onSave() {
    this.save.emit(this.editedTask());
    this.isEditing.set(false);
  }

  onDelete() {
    const t = this.task();
    if (t) {
      this.delete.emit(t);
      this.close();
    }
  }

  close() {
    this.visible.set(false);
  }
}
