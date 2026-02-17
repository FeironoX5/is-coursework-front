// ============================================================
// user.service.ts
// ============================================================

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MODE } from '../app.config';
import type {
  PageUserDto,
  Pageable,
  UserDto,
  UserRole,
} from '../models';

const BASE = '/api/users';

const FAKE_USER: UserDto = {
  id: 1,
  username: 'john.doe@example.com',
  name: 'John',
  surname: 'Doe',
  role: 'ROLE_ARTIST',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const FAKE_PAGE = (content: UserDto[]): PageUserDto => ({
  content,
  totalElements: content.length,
  totalPages: 1,
  size: 20,
  number: 0,
  numberOfElements: content.length,
  first: true,
  last: true,
  empty: content.length === 0,
  pageable: {
    paged: true,
    pageNumber: 0,
    pageSize: 20,
    unpaged: false,
    offset: 0,
    sort: { sorted: false, unsorted: true, empty: true },
  },
  sort: { sorted: false, unsorted: true, empty: true },
});

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly mode = inject(MODE);

  /** GET /api/users */
  getAllUsers(pageable?: Pageable): Observable<PageUserDto> {
    if (this.mode === 'test') {
      return of(
        FAKE_PAGE([
          FAKE_USER,
          { ...FAKE_USER, id: 2, name: 'Jane', role: 'ROLE_EXPERT' },
        ])
      );
    }
    const params = toHttpParams(pageable);
    return this.http.get<PageUserDto>(BASE, { params });
  }

  /** GET /api/users/{id} */
  getUserById(id: number): Observable<UserDto> {
    if (this.mode === 'test') {
      return of({ ...FAKE_USER, id });
    }
    return this.http.get<UserDto>(`${BASE}/${id}`);
  }

  /** GET /api/users/me */
  getCurrentUser(): Observable<UserDto> {
    if (this.mode === 'test') {
      return of(FAKE_USER);
    }
    return this.http.get<UserDto>(`${BASE}/me`);
  }

  /** GET /api/users/by-role */
  getUsersByRole(
    role: UserRole,
    pageable?: Pageable
  ): Observable<PageUserDto> {
    if (this.mode === 'test') {
      return of(FAKE_PAGE([{ ...FAKE_USER, role }]));
    }
    let params = toHttpParams(pageable).set('role', role);
    return this.http.get<PageUserDto>(`${BASE}/by-role`, { params });
  }
}

// ─── helper ──────────────────────────────────────────────────

function toHttpParams(pageable?: Pageable): HttpParams {
  let params = new HttpParams();
  if (!pageable) return params;
  if (pageable.page !== undefined)
    params = params.set('page', String(pageable.page));
  if (pageable.size !== undefined)
    params = params.set('size', String(pageable.size));
  if (pageable.sort?.length) {
    pageable.sort.forEach((s) => (params = params.append('sort', s)));
  }
  return params;
}
