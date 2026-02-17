// ============================================================
// auth.page.ts — Login / Register page
// ============================================================

import { Component, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Validators } from '@angular/forms';

import {
  DynamicForm,
  type FieldConfig,
} from '../components/dynamic-form.component';
import { AuthService } from '../services/auth.service';
import type { SignInDto, SignUpDto, UserRole } from '../models';
import { roleFormatter } from '../formatters';

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
  standalone: true,
  imports: [
    MatTabsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIcon,
    DynamicForm,
  ],
  template: `
    <div class="auth-layout">
      <mat-card class="auth-card" appearance="outlined">
        <mat-card-header class="auth-card__header">
          <mat-icon class="auth-logo">palette</mat-icon>
          <mat-card-title>ArtResidence</mat-card-title>
          <mat-card-subtitle
            >Connect artists and residencies</mat-card-subtitle
          >
        </mat-card-header>

        <mat-card-content>
          <mat-tab-group
            [selectedIndex]="tabIndex()"
            (selectedIndexChange)="tabIndex.set($event)"
            animationDuration="200ms"
          >
            <!-- LOGIN -->
            <mat-tab label="Sign In">
              <div class="tab-content">
                <app-dynamic-form
                  #loginForm
                  [formConfig]="loginFields"
                />

                <div class="auth-actions">
                  <button
                    mat-flat-button
                    color="primary"
                    class="full-btn"
                    [disabled]="loading()"
                    (click)="signIn()"
                  >
                    @if (loading()) {
                      <mat-spinner diameter="20" />
                    } @else {
                      Sign In
                    }
                  </button>
                </div>
              </div>
            </mat-tab>

            <!-- REGISTER -->
            <mat-tab label="Create Account">
              <div class="tab-content">
                <app-dynamic-form
                  #registerForm
                  [formConfig]="registerFields"
                />

                <div class="auth-actions">
                  <button
                    mat-flat-button
                    color="primary"
                    class="full-btn"
                    [disabled]="loading()"
                    (click)="signUp()"
                  >
                    @if (loading()) {
                      <mat-spinner diameter="20" />
                    } @else {
                      Create Account
                    }
                  </button>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .auth-layout {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #e8eaf6 0%, #fce4ec 100%);
        padding: 24px;
      }

      .auth-card {
        width: 100%;
        max-width: 440px;
      }

      .auth-card__header {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px 16px 16px;
        text-align: center;
      }

      .auth-logo {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #7c4dff;
        margin-bottom: 8px;
      }

      .tab-content {
        padding: 24px 0 8px;
      }

      .auth-actions {
        margin-top: 16px;
      }

      .full-btn {
        width: 100%;
        height: 44px;
      }

      mat-spinner {
        display: inline-block;
      }
    `,
  ],
})
export class AuthPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected tabIndex = signal(0);
  protected loading = signal(false);

  protected readonly loginFields = LOGIN_FIELDS;
  protected readonly registerFields = REGISTER_FIELDS;

  private readonly loginFormRef =
    viewChild<DynamicForm<SignInDto>>('loginForm');
  private readonly registerFormRef =
    viewChild<DynamicForm<SignUpDto>>('registerForm');

  signIn() {
    const form = this.loginFormRef();
    if (!form) return;
    form.markAllTouched();
    if (!form.valid) return;

    this.loading.set(true);
    this.authService.login(form.values as SignInDto).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token ?? '');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.snackBar.open('Invalid email or password', 'Close', {
          duration: 3000,
        });
        this.loading.set(false);
      },
    });
  }

  signUp() {
    const form = this.registerFormRef();
    if (!form) return;
    form.markAllTouched();
    if (!form.valid) return;

    this.loading.set(true);
    this.authService.register(form.values as SignUpDto).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token ?? '');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.snackBar.open(
          'Registration failed. Try again.',
          'Close',
          { duration: 3000 }
        );
        this.loading.set(false);
      },
    });
  }
}
