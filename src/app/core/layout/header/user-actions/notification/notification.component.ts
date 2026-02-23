import { Component, inject, OnInit, signal, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { NotificationService } from '../../../../../shared/services/api/notification/notification.service';
import { Notification } from '../../../../../shared/models/entities/notification.model';
import { SpaceInvitationService } from '../../../../../shared/services/api/space-invitation/space-invitation.service';
import { InvitationStatus } from '../../../../../shared/models/enum/invitation-status.enum';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, DatePipe, DialogModule, ButtonModule, AvatarModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);
  private readonly spaceInvitationService = inject(SpaceInvitationService);
  private readonly elementRef = inject(ElementRef);
  
  notifications = signal<Notification[]>([]);
  allNotifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);
  isDropdownOpen = signal<boolean>(false);
  activeTab = signal<'unread' | 'all'>('unread');
  InvitationStatus = InvitationStatus;

  // Detail Dialog State
  showDetail = signal<boolean>(false);
  selectedNotification = signal<Notification | null>(null);
  
  private pollingSubscription?: Subscription;

  ngOnInit(): void {
    this.loadNotifications();
    // Poll for new notifications every 30 seconds
    this.pollingSubscription = interval(30000).subscribe(() => this.loadNotifications());
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  loadNotifications(): void {
    // Load unread count and unread list
    this.notificationService.getUnreadNotifications().subscribe((notifications: Notification[]) => {
      this.notifications.set(notifications);
      this.unreadCount.set(notifications.length);
    });

    // Load recent "All" notifications (first 10)
    this.notificationService.getNotifications({ PageIndex: 1, PageSize: 10 }).subscribe(res => {
      if (res) {
        this.allNotifications.set(res.data);
      }
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isDropdownOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen.set(false);
    }
  }

  markAsRead(id: string, item?: Notification): void {
    if (item) {
      this.selectedNotification.set(item);
      this.showDetail.set(true);
      this.isDropdownOpen.set(false);
    }

    this.notificationService.markAsRead(id).subscribe((success: boolean) => {
      if (success) {
        this.loadNotifications();
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe((success: boolean) => {
      if (success) {
        this.loadNotifications();
      }
    });
  }

  respondToInvitation(invitationId: string, status: InvitationStatus): void {
    this.spaceInvitationService.updateInvitationStatus(invitationId, status).subscribe((success: boolean) => {
      if (success) {
        this.showDetail.set(false);
        this.loadNotifications();
      }
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'TaskAssigned': return 'pi pi-user-plus';
      case 'TaskCompleted': return 'pi pi-check-circle';
      case 'TaskUpdated': return 'pi pi-info-circle';
      default: return 'pi pi-bell';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'TaskAssigned': return 'text-blue-500 bg-blue-50';
      case 'TaskCompleted': return 'text-green-500 bg-green-50';
      case 'TaskUpdated': return 'text-amber-500 bg-amber-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  }

  setTab(tab: 'unread' | 'all'): void {
    this.activeTab.set(tab);
  }
}
