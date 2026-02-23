import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { BadgeComponent, BadgeVariant } from '../../shared/components/badge/badge.component';
import { UserRoles, UserRoleLabels } from '../../shared/models/enum/user-role.enum';
import { UserStatus, UserStatusLabels } from '../../shared/models/enum/user-status.enum';
import { User } from '../../shared/models/entities/user.model';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { UserService } from '../../shared/services/api/user/user.service';

import { TooltipModule } from 'primeng/tooltip';
import { OverlayPanelModule } from 'primeng/overlaypanel';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    BadgeComponent, 
    ButtonModule, 
    AvatarModule, 
    InputTextModule, 
    FormsModule, 
    ConfirmDialogModule, 
    TooltipModule,
    OverlayPanelModule
  ],
  providers: [ConfirmationService],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  protected readonly UserRoles = UserRoles;
  protected readonly UserStatus = UserStatus;
  protected readonly UserRoleLabels = UserRoleLabels;
  protected readonly UserStatusLabels = UserStatusLabels;

  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);

  currentUser = this.userService.currentUser;

  users = signal<User[]>([]);
  searchTerm = signal<string>('');
  filterStatus = signal<UserStatus | null>(null);
  private readonly searchSubject = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadUsers();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.loadUsers();
    });
  }

  onSearchTriggered(term: string) {
    this.searchSubject.next(term);
  }

  private loadUsers(): void {
    const term = this.searchTerm();
    const status = this.filterStatus();
    this.userService.getAllUsers(term, status || undefined).subscribe(users => this.users.set(users));
  }

  onFilterStatusChange(status: UserStatus | null) {
    this.filterStatus.set(status);
    this.loadUsers();
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
    return UserStatusLabels[status] || 'Unknown';
  }

  getRoleLabel(role: UserRoles): string {
    return UserRoleLabels[role] || 'Unknown';
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
