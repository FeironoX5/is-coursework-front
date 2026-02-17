import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import {
  DynamicForm,
  FieldConfig,
} from '../../../components/dynamic-form/dynamic-form';
import { MatButton } from '@angular/material/button';
import { AuthService } from '../../../services/auth-service';
import { Router } from '@angular/router';
import {
  AuthCredentials,
  RegisterCredentials,
  SignInFormConfig,
  SignUpFormConfig,
} from '../../../models/user.model';
import { navigateProfile } from '../../../utils';

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
export class AuthPage implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  protected readonly authForm =
    viewChild.required<DynamicForm<any>>('authForm');
  protected authConfig = computed<FieldConfig[]>(() => {
    const mode = this.mode();
    switch (mode) {
      case 'signin':
        return SignInFormConfig;
      case 'signup':
        return SignUpFormConfig;
    }
  });

  protected mode = signal<'signin' | 'signup'>('signin');

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit() {
    this.authService.signOut();
  }

  auth() {
    if (!this.authForm().valid) return;
    switch (this.mode()) {
      case 'signin':
        this.authService.signIn(
          this.authForm().values as AuthCredentials
        );
        break;
      case 'signup':
        this.authService.signUp(
          this.authForm().values as RegisterCredentials
        );
        break;
    }
    const user = this.authService.snapshot;
    if (!user) return;
    navigateProfile(user.role, this.router);
  }
}
