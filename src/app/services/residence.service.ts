// ============================================================
// residence.service.ts — /api/residences
// ============================================================

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MODE } from '../app.config';
import type {
  PageResidenceDetailsDto,
  ResidenceDetailsCreateDto,
  ResidenceDetailsDto,
  ResidenceDetailsUpdateDto,
  ResidenceStatsDto,
  ValidationResponseDto,
  Pageable,
} from '../models';

const BASE = '/api/residences';

const FAKE_VALIDATION: ValidationResponseDto = {
  validationStatus: 'APPROVED',
  validationComment: 'All documents verified.',
  validationSubmittedAt: '2024-01-10T12:00:00Z',
};

const FAKE_RESIDENCE: ResidenceDetailsDto = {
  id: 1,
  userId: 5,
  title: 'Artspace Nord',
  description: 'A vibrant artist residency in the north.',
  location: 'Helsinki, Finland',
  contacts: { email: 'info@artspacenord.fi', phone: '+358-9-000000' },
  isPublished: true,
  validation: FAKE_VALIDATION,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
};

function fakePage<T>(content: T[]): any {
  return {
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
  };
}

function toHttpParams(pageable?: Pageable): HttpParams {
  let params = new HttpParams();
  if (!pageable) return params;
  if (pageable.page !== undefined)
    params = params.set('page', String(pageable.page));
  if (pageable.size !== undefined)
    params = params.set('size', String(pageable.size));
  if (pageable.sort?.length)
    pageable.sort.forEach((s) => (params = params.append('sort', s)));
  return params;
}

@Injectable({ providedIn: 'root' })
export class ResidenceService {
  private readonly http = inject(HttpClient);
  private readonly mode = inject(MODE);

  // ── Public ─────────────────────────────────────────────────

  /** GET /api/residences — all published residences */
  getAllPublished(
    pageable?: Pageable
  ): Observable<PageResidenceDetailsDto> {
    if (this.mode === 'test') {
      return of(
        fakePage([
          FAKE_RESIDENCE,
          {
            ...FAKE_RESIDENCE,
            id: 2,
            title: 'Studio South',
            location: 'Lisbon, Portugal',
          },
        ])
      );
    }
    return this.http.get<PageResidenceDetailsDto>(BASE, {
      params: toHttpParams(pageable),
    });
  }

  /** GET /api/residences/{id} */
  getProfile(id: number): Observable<ResidenceDetailsDto> {
    if (this.mode === 'test') {
      return of({ ...FAKE_RESIDENCE, id });
    }
    return this.http.get<ResidenceDetailsDto>(`${BASE}/${id}`);
  }

  // ── My profile ────────────────────────────────────────────

  /** GET /api/residences/me */
  getMyProfile(): Observable<ResidenceDetailsDto> {
    if (this.mode === 'test') return of(FAKE_RESIDENCE);
    return this.http.get<ResidenceDetailsDto>(`${BASE}/me`);
  }

  /** POST /api/residences/me */
  createMyProfile(
    body: ResidenceDetailsCreateDto
  ): Observable<ResidenceDetailsDto> {
    if (this.mode === 'test')
      return of({ ...FAKE_RESIDENCE, ...body, id: 99 });
    return this.http.post<ResidenceDetailsDto>(`${BASE}/me`, body);
  }

  /** PUT /api/residences/me */
  updateMyProfile(
    body: ResidenceDetailsUpdateDto
  ): Observable<ResidenceDetailsDto> {
    if (this.mode === 'test') return of(FAKE_RESIDENCE);
    return this.http.put<ResidenceDetailsDto>(`${BASE}/me`, body);
  }

  /** GET /api/residences/me/validation-status */
  getMyValidationStatus(): Observable<ValidationResponseDto> {
    if (this.mode === 'test') return of(FAKE_VALIDATION);
    return this.http.get<ValidationResponseDto>(
      `${BASE}/me/validation-status`
    );
  }

  /** GET /api/residences/me/stats */
  getMyStats(): Observable<ResidenceStatsDto> {
    if (this.mode === 'test') return of({ viewsCount: 1024 });
    return this.http.get<ResidenceStatsDto>(`${BASE}/me/stats`);
  }
}
