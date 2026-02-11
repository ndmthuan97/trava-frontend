export enum TaskStatus {
  NotStart = 0,
  InProgress = 1,
  Completed = 2,
}

export const TaskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.NotStart]: 'Not Start',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.Completed]: 'Completed',
};
