import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../../shared/services/api/notification/notification.service';
import { Notification } from '../../../../../shared/models/entities/notification.model';
import { SpaceInvitationService } from '../../../../../shared/services/api/space-invitation/space-invitation.service';
import { InvitationStatus } from '../../../../../shared/models/enum/invitation-status.enum';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, AvatarModule, ButtonModule, TooltipModule],
  templateUrl: './invitations.component.html',
  styles: [`
    :host {
      display: block;
    }
    .invitation-item {
      @apply flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0;
    }
  `]
})
export class InvitationsComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly spaceInvitationService = inject(SpaceInvitationService);
  
  invitations = signal<Notification[]>([]);
  isLoading = signal<boolean>(false);
  InvitationStatus = InvitationStatus;

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.isLoading.set(true);
    this.notificationService.getSpaceInvitations().subscribe({
      next: (invites) => {
        this.invitations.set(invites);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  respond(notification: Notification, status: InvitationStatus): void {
    const invitationId = notification.payload.InvitationId;
    if (!invitationId) return;

    this.spaceInvitationService.updateInvitationStatus(invitationId, status).subscribe(success => {
      if (success) {
        // Remove from list or reload
        this.invitations.update(prev => prev.filter(n => n.id !== notification.id));
        
        // Also mark notification as read
        this.notificationService.markAsRead(notification.id).subscribe();
      }
    });
  }
}
