import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { DatePickerModule } from 'primeng/datepicker';
import { UserService } from '../../shared/services/api/user/user.service';
import { AuthService } from '../../core/auth/services/auth/auth.service';
import { User } from '../../shared/models/entities/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    ButtonModule, 
    InputTextModule, 
    AvatarModule,
    DialogModule,
    PasswordModule,
    DatePickerModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  profileForm: FormGroup;
  changePasswordForm: FormGroup;
  currentUser: User | null = null;
  displayChangePasswordDialog: boolean = false;
  isReadOnly: boolean = false;

  constructor() {
    this.profileForm = this.fb.group({
      personalDetails: this.fb.group({
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        dob: ['']
      })
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    
    if (userId) {
      this.isReadOnly = true;
      this.userService.getUserProfileById(userId).subscribe(user => {
        if (user) {
          this.currentUser = user;
          this.patchFormValues(user);
          this.profileForm.disable(); // Disable entire form in read-only mode
        }
      });
    } else {
      this.userService.getCurrentUserProfile().subscribe(user => {
        if (user) {
          this.currentUser = user;
          this.patchFormValues(user);
        }
      });
    }
  }

  private patchFormValues(user: User) {
    this.profileForm.patchValue({
      personalDetails: {
        fullName: user.fullName,
        email: user.email,
        phone: '', 
        dob: ''
      }
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      console.log('Form submitted:', this.profileForm.value);
    }
  }

  onCancel() {
    if (this.currentUser) {
      this.patchFormValues(this.currentUser);
    } else {
      this.profileForm.reset();
    }
  }

  showChangePasswordDialog() {
    this.displayChangePasswordDialog = true;
    this.changePasswordForm.reset();
  }

  onChangePassword() {
    if (this.changePasswordForm.valid) {
      this.authService.changePassword(this.changePasswordForm.value).subscribe(success => {
        if (success) {
          this.displayChangePasswordDialog = false;
        }
      });
    }
  }
}
