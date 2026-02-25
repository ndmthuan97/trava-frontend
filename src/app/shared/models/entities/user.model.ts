import { UserRoles } from '../enum/user-role.enum';
import { UserStatus } from '../enum/user-status.enum';

export interface User {
  id: string;
  fullName?: string | null;
  email: string;
  avatarUrl: string;
  phoneNumber?: string | null;
  birthDate?: string | null;
  role: UserRoles;
  status: UserStatus;
  password: string;
}
