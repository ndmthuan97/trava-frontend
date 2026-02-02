import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/pages/login/login.component';
import { RegisterComponent } from './core/auth/pages/register/register.component';
import { LayoutComponent } from './core/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'users', loadComponent: () => import('./features/user/user.component').then(m => m.UserComponent) },
      { path: 'spaces', loadComponent: () => import('./features/spaces/spaces-list/spaces-list.component').then(m => m.SpacesListComponent) },
      { path: 'spaces/:id', loadComponent: () => import('./features/spaces/space-detail/space-detail.component').then(m => m.SpaceDetailComponent) }
    ]
  }
];
