import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { DatePickerModule } from 'primeng/datepicker';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';
import { UserService } from '../../shared/services/api/user/user.service';
import { AuthService } from '../../core/auth/services/auth/auth.service';
import { JwtService } from '../../core/auth/services/jwt/jwt.service';
import { User } from '../../shared/models/entities/user.model';
import { SupabaseService } from '../../shared/services/api/supabase/supabase.service';
import { ToastService } from '../../shared/services/core/toast/toast.service';
import { strongPasswordValidator, getPasswordError } from '../../shared/services/core/validators/password.validator';

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
    DatePickerModule,
    MenuModule,
    FloatLabelModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly jwtService = inject(JwtService);
  private readonly route = inject(ActivatedRoute);
  private readonly supabaseService = inject(SupabaseService);
  private readonly toastService = inject(ToastService);

  profileForm: FormGroup;
  changePasswordForm: FormGroup;
  currentUser: User | null = null;
  displayChangePasswordDialog: boolean = false;
  isReadOnly: boolean = false;
  isEditMode = signal(false);
  today = new Date();
  settingsItems: MenuItem[] = [];

  constructor() {
    this.profileForm = this.fb.group({
      personalDetails: this.fb.group({
        fullName: ['', Validators.required],
        email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
        phoneNumber: [''],
        birthDate: [''],
      }),
    });

    this.changePasswordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, strongPasswordValidator()]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
    this.initSettingsMenu();
  }

  getPasswordFieldError(controlName: string): string {
    return getPasswordError(this.changePasswordForm.get(controlName));
  }

  private initSettingsMenu() {
    const isEditing = this.isEditMode();
    const canEdit = !this.isReadOnly;

    this.settingsItems = [
      {
        label: 'Settings',
        items: [
          {
            label: 'Edit Profile',
            icon: 'pi pi-user-edit',
            command: () => this.toggleEditMode(),
            visible: canEdit && !isEditing,
          },
          {
            label: 'Change Password',
            icon: 'pi pi-lock',
            command: () => this.showChangePasswordDialog(),
            visible: canEdit,
          },
        ],
      },
    ];
  }

  toggleEditMode() {
    if (this.isReadOnly) return;

    this.isEditMode.update(v => !v);
    if (this.isEditMode()) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
      if (this.currentUser) this.patchFormValues(this.currentUser);
    }
    this.initSettingsMenu();
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');

    if (userId) {
      this.isReadOnly = true;
      this.userService.getUserProfileById(userId).subscribe((user: User | null) => {
        if (user) {
          this.currentUser = user;
          this.patchFormValues(user);
          this.profileForm.disable();
        }
      });
    } else {
      this.userService.getCurrentUserProfile().subscribe((user: User | null) => {
        if (user) {
          this.currentUser = user;
          this.patchFormValues(user);
          this.profileForm.disable(); // Start in view mode
        }
      });
    }
    this.initSettingsMenu();
  }

  private patchFormValues(user: User) {
    this.profileForm.patchValue({
      personalDetails: {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber || (user as any).phone || '',
        birthDate: user.birthDate ? new Date(user.birthDate) : null,
      },
    });
  }

  onSubmit() {
    if (this.profileForm.valid && this.currentUser) {
      const formValue = this.profileForm.get('personalDetails')?.value;
      const payload = {
        fullName: formValue.fullName,
        phoneNumber: formValue.phoneNumber || '',
        phone: formValue.phoneNumber || '',
        birthDate: formValue.birthDate ? new Date(formValue.birthDate).toISOString() : null,
        avatarUrl: this.currentUser.avatarUrl || '',
      };

      this.userService.updateUser(this.currentUser.id, payload).subscribe((updatedUser: User | null) => {
        if (updatedUser) {
          this.currentUser = updatedUser;
          this.patchFormValues(updatedUser);
          this.isEditMode.set(false);
          this.profileForm.disable();
          this.initSettingsMenu();
        }
      });
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
      const accessToken = this.jwtService.getAccessToken() ?? '';
      const request = {
        ...this.changePasswordForm.value,
        currentAccessToken: accessToken,
      };
      this.authService.changePassword(request).subscribe((success: boolean) => {
        if (success) {
          this.changePasswordForm.reset();
          this.displayChangePasswordDialog = false;
        }
      });
    }
  }

  onAvatarClick(fileInput: HTMLInputElement) {
    if (this.isReadOnly) return;
    fileInput.click();
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.currentUser) {
      if (!file.type.startsWith('image/')) {
        this.toastService.error('Invalid file', 'Please select an image file');
        return;
      }

      const publicUrl = await this.supabaseService.uploadAvatar(file);

      if (publicUrl) {
        const formValue = this.profileForm.get('personalDetails')?.value;
        const payload = {
          fullName: formValue.fullName || this.currentUser.fullName || '',
          phoneNumber: formValue.phoneNumber || this.currentUser.phoneNumber || (this.currentUser as any).phone || '',
          phone: formValue.phoneNumber || this.currentUser.phoneNumber || (this.currentUser as any).phone || '',
          birthDate: formValue.birthDate
            ? new Date(formValue.birthDate).toISOString()
            : this.currentUser.birthDate || null,
          avatarUrl: publicUrl,
        };

        this.userService
          .updateUser(this.currentUser.id, payload)
          .subscribe((updatedUser: User | null) => {
            if (updatedUser) {
              this.currentUser = updatedUser;
              this.patchFormValues(updatedUser);
            }
          });
      }
    }
  }
}
