import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SpaceInvitationService } from '../../shared/services/api/space-invitation/space-invitation.service';
import { Invitation } from '../../shared/models/entities/invitation.model';
import { InvitationStatus } from '../../shared/models/enum/invitation-status.enum';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-invitation-history',
  standalone: true,
  imports: [CommonModule, AvatarModule, TooltipModule],
  templateUrl: './invitation-history.component.html',
  styles: [`
    :host { display: block; background-color: #f8fafc; min-height: 100vh; }
    .invitation-item-card {
      @apply bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md;
    }
  `]
})
export class InvitationHistoryComponent implements OnInit {
  private readonly spaceInvitationService = inject(SpaceInvitationService);
  private readonly router = inject(Router);

  acceptedInvitations = signal<Invitation[]>([]);
  rejectedInvitations = signal<Invitation[]>([]);
  isLoading = signal<boolean>(false);
  activeTab = signal<'accepted' | 'rejected'>('accepted');
  InvitationStatus = InvitationStatus;

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading.set(true);
    forkJoin({
      accepted: this.spaceInvitationService.getMyInvitations({ Status: InvitationStatus.Accepted, PageIndex: 1, PageSize: 50 }),
      rejected: this.spaceInvitationService.getMyInvitations({ Status: InvitationStatus.Rejected, PageIndex: 1, PageSize: 50 }),
    }).subscribe({
      next: ({ accepted, rejected }) => {
        this.acceptedInvitations.set(accepted?.data ?? []);
        this.rejectedInvitations.set(rejected?.data ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  currentList(): Invitation[] {
    return this.activeTab() === 'accepted'
      ? this.acceptedInvitations()
      : this.rejectedInvitations();
  }

  goBack(): void {
    this.router.navigate(['/invitations']);
  }
}
