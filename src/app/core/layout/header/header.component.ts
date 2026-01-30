import { Component, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './user-actions/notification/notification.component';
import { InformationComponent } from './user-actions/information/information.component';
import { UserService } from '../../../shared/services/api/user/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NotificationComponent, InformationComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly userService = inject(UserService);
  readonly user = this.userService.currentUser;

  @Output() menuClick = new EventEmitter<void>();

  onMenuClick() {
    this.menuClick.emit();
  }
}
