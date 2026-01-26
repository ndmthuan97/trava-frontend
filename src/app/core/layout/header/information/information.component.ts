import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../auth/services/auth/auth.service';
import { UserService } from '../../../../shared/services/api/user/user.service';

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

  readonly user = this.userService.currentUser;

  items: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => {
        // TODO: Navigate to profile
      },
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
