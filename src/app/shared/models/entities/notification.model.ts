export interface Notification {
  id: string;
  type: string;
  payload: any;
  createdAt: string;
  isRead: boolean;
}

export interface Pagination<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}
