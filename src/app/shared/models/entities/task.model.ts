import { TaskStatus } from './../enum/task-status.enum';
import { TaskPriority } from '../enum/task-priority.enum';
import { User } from './user.model';

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
  assignedUser?: User;
  assignedAt?: string;
  completedAt?: string;
  creatorFullName?: string;
  creatorAvatarUrl?: string;
  createdByUserId?: string;
}
