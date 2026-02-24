import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpaceInvitationService } from '../../shared/services/api/space-invitation/space-invitation.service';
import { Invitation } from '../../shared/models/entities/invitation.model';
import { InvitationStatus } from '../../shared/models/enum/invitation-status.enum';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invitations-page',
  standalone: true,
  imports: [CommonModule, AvatarModule, ButtonModule, TooltipModule],
  templateUrl: './invitations.component.html',
  styles: [`
    :host {
      display: block;
      background-color: #f8fafc;
      min-height: 100vh;
    }
    .invitation-item-card {
      @apply bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md;
    }
  `]
})
export class InvitationsComponent implements OnInit {
  private readonly spaceInvitationService = inject(SpaceInvitationService);
  private readonly router = inject(Router);

  invitations = signal<Invitation[]>([]);
  isLoading = signal<boolean>(false);
  InvitationStatus = InvitationStatus;

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.isLoading.set(true);
    this.spaceInvitationService.getMyInvitations({ Status: InvitationStatus.Pending, PageIndex: 1, PageSize: 50 }).subscribe({
      next: (result) => {
        this.invitations.set(result?.data ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  respond(invitation: Invitation, status: InvitationStatus): void {
    this.spaceInvitationService.updateInvitationStatus(invitation.id, status).subscribe(success => {
      if (success) {
        this.invitations.update(prev => prev.filter(inv => inv.id !== invitation.id));
      }
    });
  }

  viewHistory(): void {
    this.router.navigate(['/invitations/history']);
  }

  goBack(): void {
    this.router.navigate(['/spaces']);
  }
}
