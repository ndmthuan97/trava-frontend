export enum TaskPriority {
  Lowest = 0,
  Low = 1,
  Medium = 2,
  High = 3,
  Highest = 4,
}

export const TaskPriorityLabels: Record<TaskPriority, string> = {
  [TaskPriority.Lowest]: 'Lowest',
  [TaskPriority.Low]: 'Low',
  [TaskPriority.Medium]: 'Medium',
  [TaskPriority.High]: 'High',
  [TaskPriority.Highest]: 'Highest',
};
