// ============================================================
// auth.service.ts
// ============================================================

import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { MODE } from '../app.config';
import type {
  AuthenticationDto,
  SignInDto,
  SignUpDto,
  User,
  UserDto,
  UserRole,
} from '../models';
import { ResidenceService } from './residence.service';
import { ArtistService } from './artist.service';
import { ExpertService } from './expert.service';
import { Router } from '@angular/router';
import { UserService } from './user.service';

const BASE = '/api/auth';
const TOKEN_KEY = 'token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly artistService = inject(ArtistService);
  private readonly residenceService = inject(ResidenceService);
  private readonly mode = inject(MODE);

  // ─── State ──────────────────────────────────────────────────

  /** Current authenticated user (null if not logged in) */
  readonly currentUser = signal<UserDto | null>(null);

  /** JWT token */
  readonly token = signal<string | null>(null);

  /** Is user authenticated? */
  readonly isAuthenticated = computed(() => !!this.currentUser());

  /** Current user's role */
  readonly userRole = computed(() => this.currentUser()?.role);

  // ─── Initialization ─────────────────────────────────────────

  constructor() {
    this.initializeFromStorage();
  }

  private initializeFromStorage(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      this.token.set(token);
      // Load user from API
      this.userService.getCurrentUser().subscribe({
        next: (user) => {
          this.currentUser.set(user);
          this.router.navigateByUrl('/profile');
        },
        error: () => this.logout(), // Invalid token
      });
    }
  }

  /** POST /api/auth/register */
  register(body: SignUpDto): Observable<AuthenticationDto> {
    if (this.mode === 'test') {
      localStorage.setItem('token', 'fake-jwt-token');
      return of({
        token: 'fake-jwt-token',
        user: {
          id: 1,
          username: body.email,
          name: body.name,
          surname: body.surname,
          role: body.role,
          is_active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
    return this.http
      .post<AuthenticationDto>(`${BASE}/register`, body)
      .pipe(
        switchMap((auth) => {
          this.handleAuthResponse(auth);
          switch (body.role) {
            case 'ROLE_ARTIST':
              return this.artistService
                .createMyProfile({
                  biography: 'Biography',
                  location: 'Location',
                })
                .pipe(map(() => auth));
            case 'ROLE_RESIDENCE_ADMIN':
              return this.residenceService
                .createMyProfile({
                  title: 'Residence Title',
                  description: 'Some description',
                  location: 'Location',
                  contacts: {},
                })
                .pipe(map(() => auth));
            default:
              return of(auth);
          }
        })
      );
  }

  /** POST /api/auth/login */
  login(body: SignInDto): Observable<AuthenticationDto> {
    if (this.mode === 'test') {
      localStorage.setItem('token', 'fake-jwt-token');
      return of({
        token: 'fake-jwt-token',
        user: {
          id: 1,
          username: body.email,
          name: 'John',
          surname: 'Doe',
          role: 'ROLE_ARTIST',
          is_active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
    return this.http
      .post<AuthenticationDto>(`${BASE}/login`, body)
      .pipe(
        tap((auth) => {
          this.handleAuthResponse(auth);
        })
      );
  }

  private handleAuthResponse(res: AuthenticationDto): void {
    if (res.token) {
      localStorage.setItem(TOKEN_KEY, res.token);
      this.token.set(res.token);
    }
    if (res.user) {
      this.currentUser.set(this.mapUserToDto(res.user));
    }
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/auth']);
  }

  private mapUserToDto(user: User): UserDto {
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      surname: user.surname,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  hasRole(role: UserRole): boolean {
    return this.userRole() === role;
  }

  /** Is current user an artist? */
  isArtist(): boolean {
    return this.hasRole('ROLE_ARTIST');
  }

  /** Is current user an expert? */
  isExpert(): boolean {
    return this.hasRole('ROLE_EXPERT');
  }

  /** Is current user a residence admin? */
  isResidenceAdmin(): boolean {
    return this.hasRole('ROLE_RESIDENCE_ADMIN');
  }

  /** Is current user a superadmin? */
  isSuperAdmin(): boolean {
    return this.hasRole('ROLE_SUPERADMIN');
  }

  /** Check if user has any of the provided roles */
  hasAnyRole(...roles: UserRole[]): boolean {
    const current = this.userRole();
    return current ? roles.includes(current) : false;
  }
}
