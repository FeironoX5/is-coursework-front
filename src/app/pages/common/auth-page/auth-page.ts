import {
  AfterViewInit,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { FormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { roleFormatter } from '../../../formatters';
import { SignInDto, SignUpDto, UserRole } from '../../../models';
import {
  DynamicForm,
  FieldConfig,
} from '../../../components/dynamic-form.component';

const ROLES: UserRole[] = [
  'ROLE_ARTIST',
  'ROLE_EXPERT',
  'ROLE_RESIDENCE_ADMIN',
];

const LOGIN_FIELDS: FieldConfig[] = [
  {
    type: 'input',
    propertyName: 'email',
    displayName: 'Email',
    dataType: 'email',
    validators: [Validators.required, Validators.email],
  },
  {
    type: 'input',
    propertyName: 'password',
    displayName: 'Password',
    dataType: 'password',
    validators: [Validators.required, Validators.minLength(8)],
  },
];

const REGISTER_FIELDS: FieldConfig[] = [
  {
    type: 'input',
    propertyName: 'name',
    displayName: 'First Name',
    dataType: 'text',
    validators: [Validators.required, Validators.minLength(3)],
  },
  {
    type: 'input',
    propertyName: 'surname',
    displayName: 'Last Name',
    dataType: 'text',
    validators: [Validators.required, Validators.minLength(3)],
  },
  {
    type: 'input',
    propertyName: 'email',
    displayName: 'Email',
    dataType: 'email',
    validators: [Validators.required, Validators.email],
  },
  {
    type: 'input',
    propertyName: 'password',
    displayName: 'Password',
    dataType: 'password',
    validators: [Validators.required, Validators.minLength(8)],
  },
  {
    type: 'selectable',
    propertyName: 'role',
    displayName: 'I am a…',
    options: ROLES,
    formatter: roleFormatter,
    validators: [Validators.required],
  },
];

@Component({
  selector: 'app-auth-page',
  imports: [
    MatButtonToggleGroup,
    MatButtonToggle,
    FormsModule,
    DynamicForm,
    MatButton,
  ],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.scss',
})
export class AuthPage {
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly authForm =
    viewChild.required<DynamicForm<any>>('authForm');
  protected authConfig = computed<FieldConfig[]>(() => {
    const mode = this.mode();
    switch (mode) {
      case 'signin':
        return LOGIN_FIELDS;
      case 'signup':
        return REGISTER_FIELDS;
    }
  });

  protected mode = signal<'signin' | 'signup'>('signin');
  protected loading = signal(false);

  auth() {
    const authForm = this.authForm();
    if (!authForm) return;
    authForm.markAllTouched();
    if (!authForm.valid) return;

    this.loading.set(true);
    switch (this.mode()) {
      case 'signin':
        this.authService
          .login(authForm.values as SignInDto)
          .subscribe({
            next: (res) => {
              this.router.navigate(['/profile']);
            },
            error: () => {
              this.snackBar.open(
                'Invalid email or password',
                'Close',
                {
                  duration: 3000,
                }
              );
            },
            complete: () => this.loading.set(false),
          });
        break;
      case 'signup':
        this.authService
          .register(authForm.values as SignUpDto)
          .subscribe({
            next: () => {
              this.router.navigate(['/profile']);
            },
            error: () => {
              this.snackBar.open(
                'Registration failed. Try again.',
                'Close',
                { duration: 3000 }
              );
            },
            complete: () => this.loading.set(false),
          });
        break;
    }
  }
}
