import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NotificationService } from '../../shared/services/api/notification/notification.service';
import { Notification } from '../../shared/models/entities/notification.model';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, DatePipe, ButtonModule, PaginatorModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  notifications = signal<Notification[]>([]);
  totalCount = signal<number>(0);
  pageIndex = signal<number>(1);
  pageSize = signal<number>(10);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService
      .getNotifications({
        PageIndex: this.pageIndex(),
        PageSize: this.pageSize(),
      })
      .subscribe((res) => {
        if (res) {
          this.notifications.set(res.data);
          this.totalCount.set(res.count);
        }
      });
  }

  onPageChange(event: PaginatorState): void {
    this.pageIndex.set((event.page || 0) + 1);
    this.pageSize.set(event.rows || 10);
    this.loadNotifications();
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id).subscribe((success) => {
      if (success) {
        // Update local state to avoid re-fetching everything
        this.notifications.update((list) =>
          list.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe((success) => {
      if (success) {
        this.notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
      }
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'TaskAssigned':
        return 'pi pi-user-plus';
      case 'TaskCompleted':
        return 'pi pi-check-circle';
      case 'TaskUpdated':
        return 'pi pi-info-circle';
      default:
        return 'pi pi-bell';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'TaskAssigned':
        return 'text-blue-500 bg-blue-50';
      case 'TaskCompleted':
        return 'text-green-500 bg-green-50';
      case 'TaskUpdated':
        return 'text-amber-500 bg-amber-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  }
}
