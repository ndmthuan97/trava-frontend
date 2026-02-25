export interface Comment {
  id: string;
  taskItemId: string;
  userId: string;
  content: string;
  createdAt: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}
