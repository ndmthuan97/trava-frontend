import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { BadgeComponent, BadgeVariant } from '../../shared/components/badge/badge.component';
import { UserRoles } from '../../shared/models/enum/user-role.enum';
import { UserStatus } from '../../shared/models/enum/user-status.enum';
import { User } from '../../shared/models/entities/user.model';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { UserService } from '../../shared/services/api/user/user.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, TableModule, BadgeComponent, ButtonModule, AvatarModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  protected readonly UserRoles = UserRoles;
  protected readonly UserStatus = UserStatus;

  private readonly userService = inject(UserService);

  users = signal<User[]>([]);

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe(users => this.users.set(users));
  }

  getRoleSeverity(role: UserRoles): BadgeVariant {
    switch (role) {
      case UserRoles.SYSTEM_ADMIN:
        return 'danger';
      case UserRoles.USER:
        return 'info';
      default:
        return 'secondary';
    }
  }

  getStatusSeverity(status: UserStatus): BadgeVariant {
    switch (status) {
      case UserStatus.Active:
        return 'success';
      case UserStatus.Inactive:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: UserStatus): string {
    return status === UserStatus.Active ? 'Active' : 'Inactive';
  }
}
