import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { DatePickerModule } from 'primeng/datepicker';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
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
    DatePickerModule,
    MenuModule
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
  isEditMode = signal(false);
  today = new Date();
  settingsItems: MenuItem[] = [];

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
    this.initSettingsMenu();
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
            visible: canEdit && !isEditing
          },
          {
            label: 'Change Password',
            icon: 'pi pi-lock',
            command: () => this.showChangePasswordDialog(),
            visible: canEdit
          }
        ]
      }
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
          this.profileForm.disable();
        }
      });
    } else {
      this.userService.getCurrentUserProfile().subscribe(user => {
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
        phone: '', 
        dob: ''
      }
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      console.log('Form submitted:', this.profileForm.value);
      // After successful save
      this.isEditMode.set(false);
      this.profileForm.disable();
      this.initSettingsMenu();
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
