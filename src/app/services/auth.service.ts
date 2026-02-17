// ============================================================
// auth.service.ts
// ============================================================

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MODE } from '../app.config';
import type {
  AuthenticationDto,
  SignInDto,
  SignUpDto,
} from '../models';

const BASE = '/api/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly mode = inject(MODE);

  /** POST /api/auth/register */
  register(body: SignUpDto): Observable<AuthenticationDto> {
    if (this.mode === 'test') {
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
    return this.http.post<AuthenticationDto>(
      `${BASE}/register`,
      body
    );
  }

  /** POST /api/auth/login */
  login(body: SignInDto): Observable<AuthenticationDto> {
    if (this.mode === 'test') {
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
    return this.http.post<AuthenticationDto>(`${BASE}/login`, body);
  }
}
