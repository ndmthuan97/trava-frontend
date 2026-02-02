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
  startDate?: string; // DateTimeOffset as string
  dueDate?: string;   // DateTimeOffset as string
  assignedUserId?: string;
  assignedAt?: string;
  completedAt?: string;
  
  // Navigation properties
  space?: Space;
  assignedUser?: User;
  type?: TaskType; // Keeping this for now as it was in the original model, though not in the backend snippet provided by user. User snippet didn't explicitly delete it, but the snippet didn't have it. I'll make it optional to be safe or maybe the backend snippet WAS the definitive list. The backend snippet DOES NOT have Type. I will keep it optional for now to avoid breaking existing code immediately, but the prompt says "Edit UI table task to match backend". I will prioritise backend fields.
}
