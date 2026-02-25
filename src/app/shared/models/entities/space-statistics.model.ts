export interface SpaceStatistics {
  totalTasks: number;
  tasksByStatus: {
    NotStart: number;
    InProgress: number;
    Completed: number;
  };
  tasksByPriority: {
    Lowest: number;
    Low: number;
    Medium: number;
    High: number;
    Highest: number;
  };
}
