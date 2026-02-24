import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/services/auth/auth.service';
import { UserService } from '../../../../../shared/services/api/user/user.service';
import { NotificationService } from '../../../../../shared/services/api/notification/notification.service';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [CommonModule, MenuModule],
  templateUrl: './information.component.html',
  styleUrl: './information.component.css',
})
export class InformationComponent {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  readonly user = this.userService.currentUser;
  invitationCount = 0;

  ngOnInit() {
    this.notificationService.getSpaceInvitations().subscribe(invites => {
      this.invitationCount = invites.length;
      this.updateMenuItems();
    });
  }

  updateMenuItems() {
    this.items = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => {
          this.router.navigate(['/profile']);
        },
      },
      {
        label: 'Invitations',
        icon: 'pi pi-envelope',
        id: 'invitations-menu-item',
        badge: this.invitationCount > 0 ? this.invitationCount.toString() : undefined,
        command: () => {
          this.router.navigate(['/invitations']);
        }
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => {
          this.authService.logout();
        },
      },
    ];
  }

  items: MenuItem[] = [];
}
