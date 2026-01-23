import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';

import { LoadingService } from '../../../../shared/services/core/loading/loading.service';
import { AuthService } from '../../services/auth/auth.service';

import { type RegisterRequest } from '../../models/request/register-request.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    FloatLabelModule,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly loadingService = inject(LoadingService);
  private readonly authService = inject(AuthService);

  registerForm: FormGroup;
  isLoading = this.loadingService.isLoading;
  submitted = signal<boolean>(false);

  constructor() {
    this.registerForm = this.fb.group(
      {
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) return;

    this.loadingService.setLoading(true);
    const request: RegisterRequest = this.registerForm.value;

    this.authService.register(request).subscribe({
      next: () => {
        this.loadingService.setLoading(false);
      },
      error: () => {
        this.loadingService.setLoading(false);
      },
      complete: () => {
        this.loadingService.setLoading(false);
      },
    });
  }
}
