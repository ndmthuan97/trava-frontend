import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './user-actions/notification/notification.component';
import { InformationComponent } from './user-actions/information/information.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NotificationComponent, InformationComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Output() menuClick = new EventEmitter<void>();

  onMenuClick() {
    this.menuClick.emit();
  }
}
