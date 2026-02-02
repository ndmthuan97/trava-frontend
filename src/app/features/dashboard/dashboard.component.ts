import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-500 text-lg mt-4">Welcome to your dashboard. This area will soon contain statistics and overview information.</p>
    </div>
  `,
})
export class DashboardComponent {}
