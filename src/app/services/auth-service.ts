import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  AuthCredentials,
  BaseUserProfile,
  RegisterCredentials,
} from '../models/user.model';
import { MODE } from '../app.config';

type AuthResponse = {
  token: string;
  user: BaseUserProfile;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly mode = inject(MODE);

  private readonly user = signal<BaseUserProfile | null>(null);
  public readonly isAuthenticated = computed(
    () => this.user() !== null
  );

  public static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('auth_token', authResponse.token);
    this.user.set(authResponse.user);
  }

  async signIn(credentials: AuthCredentials) {
    if (this.mode == 'test') {
      this.setAuthData({
        token: 'test',
        user: {
          username: 'some@gmail.com',
          name: 'Ivan',
          surname: 'Ivanov',
          role: 'ROLE_ARTIST',
          is_active: true,
        },
      });
      return;
    }
    const response = await firstValueFrom(
      this.http.post<AuthResponse>('/api/auth/login', credentials)
    );
    this.setAuthData(response);
  }

  async signUp(credentials: RegisterCredentials) {
    if (this.mode == 'test') {
      this.setAuthData({
        token: 'test',
        user: {
          username: 'some@gmail.com',
          name: 'Ivan',
          surname: 'Ivanov',
          role: credentials.role,
          is_active: true,
        },
      });
      return;
    }
    const response = await firstValueFrom(
      this.http.post<AuthResponse>('/api/auth/register', credentials)
    );
    this.setAuthData(response);
  }

  signOut() {
    localStorage.removeItem('auth_token');
    this.user.set(null);
    this.router.navigateByUrl('/auth');
  }

  get snapshot(): BaseUserProfile | null {
    return this.user();
  }
}
