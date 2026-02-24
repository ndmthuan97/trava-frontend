import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/services/auth/auth.service';
import { UserService } from '../../../../../shared/services/api/user/user.service';
import { SpaceInvitationService } from '../../../../../shared/services/api/space-invitation/space-invitation.service';
import { InvitationStatus } from '../../../../../shared/models/enum/invitation-status.enum';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [CommonModule, MenuModule],
  templateUrl: './information.component.html',
  styleUrl: './information.component.css',
})
export class InformationComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly spaceInvitationService = inject(SpaceInvitationService);

  readonly user = this.userService.currentUser;
  pendingCount = 0;

  ngOnInit() {
    // Only fetch pending invitations to decide badge visibility
    this.spaceInvitationService.getMyInvitations({ Status: InvitationStatus.Pending, PageIndex: 1, PageSize: 50 }).subscribe(result => {
      this.pendingCount = result?.count ?? 0;
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
        // Badge only shows when there are pending invitations, in orange
        badge: this.pendingCount > 0 ? this.pendingCount.toString() : undefined,
        badgeStyleClass: 'p-badge-warn',
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
