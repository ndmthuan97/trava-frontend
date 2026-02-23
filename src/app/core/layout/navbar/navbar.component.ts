import { Component, input, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../shared/services/api/user/user.service';
import { UserRoles } from '../../../shared/models/enum/user-role.enum';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  public readonly userService = inject(UserService);
  open = input<boolean>(true);
  isAdmin = signal<boolean>(false);

  constructor() {
    effect(() => {
      const user = this.userService.currentUser();
      if (user) {
        this.isAdmin.set(user.role === UserRoles.SYSTEM_ADMIN);
      }
    }, { allowSignalWrites: true });
  }
}
