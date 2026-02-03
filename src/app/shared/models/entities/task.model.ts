import { TaskStatus } from './../enum/task-status.enum';
import { TaskType } from './../enum/task-type.enum';
import { TaskPriority } from '../enum/task-priority.enum';
import { User } from './user.model';
import { Space } from './space.model';

export interface Task {
  id: string;
  spaceId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  point: number;
  startDate?: string;
  dueDate?: string;
  assignedUserId?: string;
  assignedAt?: string;
  completedAt?: string;
}
