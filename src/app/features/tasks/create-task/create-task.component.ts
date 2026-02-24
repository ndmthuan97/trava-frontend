import { Component, inject, input, model, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { TaskPriority, TaskPriorityLabels } from '../../../shared/models/enum/task-priority.enum';
import { TaskStatus, TaskStatusLabels } from '../../../shared/models/enum/task-status.enum';
import { TaskItemService } from '../../../shared/services/api/task-item/task-item.service';
import { CreateTaskItemRequest } from '../../../shared/models/request/create-task-item-request.model';
import { UpdateTaskItemRequest } from '../../../shared/models/request/update-task-item-request.model';
import { ToastService } from '../../../shared/services/core/toast/toast.service';
import { Task } from '../../../shared/models/entities/task.model';
import { SpaceService } from '../../../shared/services/api/space/space.service';
import { User } from '../../../shared/models/entities/user.model';


@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    Textarea,
    SelectModule,
    DatePicker,
    InputNumberModule,
    DialogComponent,
  ],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.css',
})
export class CreateTaskComponent {
  private readonly taskService = inject(TaskItemService);
  private readonly toastService = inject(ToastService);
  private readonly spaceService = inject(SpaceService);


  spaceId = input.required<string>();
  visible = model<boolean>(false);
  taskToEdit = input<Task | null>(null);
  created = output<void>();

  taskData = signal({
    title: '',
    description: '',
    status: TaskStatus.NotStart,
    priority: TaskPriority.Low,
    point: 1,
    startDate: null as Date | null,
    dueDate: null as Date | null,
    assignedUserId: null as string | null,
  });

  spaceMembers = input<User[]>([]);


  constructor() {
    effect(() => {
      const task = this.taskToEdit();
      if (task) {
        this.taskData.set({
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          point: task.point,
          startDate: task.startDate ? new Date(task.startDate) : null,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          assignedUserId: task.assignedUserId || null,
        });
      } else {
        this.resetForm();
      }
    }, { allowSignalWrites: true });
  }



  statusOptions = [
    { label: TaskStatusLabels[TaskStatus.NotStart], value: TaskStatus.NotStart },
    { label: TaskStatusLabels[TaskStatus.InProgress], value: TaskStatus.InProgress },
    { label: TaskStatusLabels[TaskStatus.Completed], value: TaskStatus.Completed },
  ];

  priorityOptions = [
    { label: TaskPriorityLabels[TaskPriority.Lowest], value: TaskPriority.Lowest },
    { label: TaskPriorityLabels[TaskPriority.Low], value: TaskPriority.Low },
    { label: TaskPriorityLabels[TaskPriority.Medium], value: TaskPriority.Medium },
    { label: TaskPriorityLabels[TaskPriority.High], value: TaskPriority.High },
    { label: TaskPriorityLabels[TaskPriority.Highest], value: TaskPriority.Highest },
  ];

  confirmCreate() {
    if (!this.taskData().title) {
      this.toastService.error('Validation Error', 'Title is required');
      return;
    }

    const data = this.taskData();
    const taskToEdit = this.taskToEdit();

    if (taskToEdit) {
      const request: UpdateTaskItemRequest = {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        point: data.point,
        startDate: data.startDate ? data.startDate.toISOString() : null,
        dueDate: data.dueDate ? data.dueDate.toISOString() : null,
        assignedUserId: data.assignedUserId || null,
      };


      this.taskService.updateTask(taskToEdit.id, request).subscribe({
        next: res => {
          if (res) {
            this.visible.set(false);
            this.created.emit();
            this.resetForm();
          }
        },
      });
    } else {
      const request: CreateTaskItemRequest = {
        spaceId: this.spaceId(),
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        point: data.point,
        startDate: data.startDate ? data.startDate.toISOString() : null,
        dueDate: data.dueDate ? data.dueDate.toISOString() : null,
        assignedUserId: data.assignedUserId || null,
      };


      this.taskService.createTask(request).subscribe({
        next: res => {
          if (res) {
            this.visible.set(false);
            this.created.emit();
            this.resetForm();
          }
        },
      });
    }
  }

  cancelCreate() {
    this.visible.set(false);
    this.resetForm();
  }

  resetForm() {
    this.taskData.set({
      title: '',
      description: '',
      status: TaskStatus.NotStart,
      priority: TaskPriority.Low,
      point: 1,
      startDate: null,
      dueDate: null,
      assignedUserId: null,
    });
  }

}
