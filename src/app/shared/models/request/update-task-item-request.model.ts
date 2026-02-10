import { TaskPriority } from '../enum/task-priority.enum';
import { TaskStatus } from '../enum/task-status.enum';

export interface UpdateTaskItemRequest {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  point: number;
  startDate?: string | null;
  dueDate?: string | null;
  assignedUserId?: string | null;
}
