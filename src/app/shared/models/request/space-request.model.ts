export interface CreateSpaceRequest {
  name: string;
  // Backend accepts null for description
  description?: string | null;
  // Use numeric spaceType (0 = Personal, 1 = Team)
  spaceType: number;
}
