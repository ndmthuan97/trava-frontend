import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, NavbarComponent, FooterComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <!-- Sidebar / Navbar (desktop) -->
      <app-navbar class="hidden flex-shrink-0 md:block" [open]="sidebarOpen"></app-navbar>

      <!-- Mobile sidebar backdrop (click to close) -->
      <div
        *ngIf="mobileSidebarOpen"
        class="fixed inset-0 z-40 md:hidden"
        (click)="mobileSidebarOpen = false">
        <div class="absolute inset-0 bg-black/40"></div>
      </div>

      <!-- Mobile sidebar (overlay) -->
      <app-navbar
        *ngIf="mobileSidebarOpen"
        class="fixed left-0 top-0 z-50 h-full w-64 border-r bg-white shadow-xl md:hidden"
        [open]="true"></app-navbar>

      <!-- Main Content Area -->
      <div class="flex flex-1 flex-col overflow-auto">
        <!-- Header -->
        <app-header (menuClick)="toggleSidebar()"></app-header>

        <!-- Dynamic Content -->
        <main class="flex-1 overflow-y-auto p-8">
          <router-outlet></router-outlet>
        </main>

        <!-- Footer -->
        <app-footer></app-footer>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }
    `,
  ],
})
export class LayoutComponent {
  sidebarOpen = true;
  mobileSidebarOpen = false;

  toggleSidebar() {
    // Toggle mobile overlay on small screens, otherwise toggle desktop sidebar
    if (window.innerWidth < 768) {
      this.mobileSidebarOpen = !this.mobileSidebarOpen;
    } else {
      this.sidebarOpen = !this.sidebarOpen;
    }
  }
}
