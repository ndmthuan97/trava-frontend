import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';

import { LoginRequest } from '../../models/request/login-request.model';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../../../shared/services/core/toast/toast.service';
import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { finalize, timeout, TimeoutError } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    FloatLabelModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly loadingService = inject(LoadingService);

  loginForm: FormGroup;

  // Use computed property or getters if using signal, but here direct method access is fine for template binding if checking changes
  get loading() {
    return this.loadingService.isLoading('login');
  }

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const loginRequest: LoginRequest = this.loginForm.value;

    this.authService
      .login(loginRequest, { loadingKey: 'login' })
      .pipe(
        timeout(15000),
        finalize(() => this.loadingService.setLoading(false, 'login'))
      )
      .subscribe({
        error: err => {
          if (err instanceof TimeoutError) {
            this.toastService.error('Đăng nhập thất bại', 'Kết nối quá hạn, vui lòng thử lại.');
          }
        },
      });
  }
}
