import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { BadgeComponent, BadgeVariant } from '../../shared/components/badge/badge.component';
import { UserRoles } from '../../shared/models/enum/user-role.enum';
import { UserStatus } from '../../shared/models/enum/user-status.enum';
import { User } from '../../shared/models/entities/user.model';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { UserService } from '../../shared/services/api/user/user.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, TableModule, BadgeComponent, ButtonModule, AvatarModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  protected readonly UserRoles = UserRoles;
  protected readonly UserStatus = UserStatus;

  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);

  currentUser = this.userService.currentUser;

  users = signal<User[]>([]);

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
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

  viewProfile(user: User): void {
    this.router.navigate(['/profile', user.id]);
  }

  onToggleStatus(user: User): void {
    const isActivating = user.status === UserStatus.Inactive;
    const actionText = isActivating ? 'unlock' : 'lock';
    
    this.confirmationService.confirm({
      message: `Are you sure you want to ${actionText} user "${user.fullName || user.email}"?`,
      header: 'Confirm Status Change',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Confirm',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: isActivating ? 'p-button-success' : 'p-button-danger',
      accept: () => {
        const newStatus = isActivating ? UserStatus.Active : UserStatus.Inactive;
        this.userService.updateUserStatus(user.id, newStatus).subscribe(success => {
          if (success) {
            this.loadUsers();
          }
        });
      }
    });
  }
}
