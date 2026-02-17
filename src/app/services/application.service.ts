// ============================================================
// application.service.ts — /api/applications
// ============================================================

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MODE } from '../app.config';
import type {
  ApplicationEvaluationCreateDto,
  PageApplicationDto,
  PageApplicationEvaluationDto,
  Pageable,
} from '../models';

const BASE = '/api/applications';

function fakeApplicationPage(programId: number): any {
  return fakePage([
    {
      id: 1,
      programId,
      userId: 10,
      motivation: 'Passionate about this field.',
      status: 'SENT',
    },
    {
      id: 2,
      programId,
      userId: 11,
      motivation: 'Experienced artist seeking growth.',
      status: 'REVIEWED',
    },
  ]);
}

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
export class ApplicationService {
  private readonly http = inject(HttpClient);
  private readonly mode = inject(MODE);

  // ── Status transitions ────────────────────────────────────

  /** POST /api/applications/approve/{applicationId} */
  approveApplication(applicationId: number): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.post<void>(
      `${BASE}/approve/${applicationId}`,
      null
    );
  }

  /** POST /api/applications/reject/{applicationId} */
  rejectApplication(applicationId: number): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.post<void>(
      `${BASE}/reject/${applicationId}`,
      null
    );
  }

  /** POST /api/applications/reserve/{applicationId} */
  reserveApplication(applicationId: number): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.post<void>(
      `${BASE}/reserve/${applicationId}`,
      null
    );
  }

  /** POST /api/applications/evaluate/{applicationId} */
  evaluateApplication(
    applicationId: number,
    body: ApplicationEvaluationCreateDto
  ): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.post<void>(
      `${BASE}/evaluate/${applicationId}`,
      body
    );
  }

  // ── Queries by program ────────────────────────────────────

  /** GET /api/applications/programs/{programId} — unevaluated */
  getUnevaluatedApplications(
    programId: number,
    pageable?: Pageable
  ): Observable<PageApplicationDto> {
    if (this.mode === 'test')
      return of(fakeApplicationPage(programId));
    return this.http.get<PageApplicationDto>(
      `${BASE}/programs/${programId}`,
      { params: toHttpParams(pageable) }
    );
  }

  /** GET /api/applications/programs/evaluated/{programId} */
  getEvaluatedApplications(
    programId: number,
    pageable?: Pageable
  ): Observable<PageApplicationDto> {
    if (this.mode === 'test') {
      return of(
        fakePage([
          {
            id: 3,
            programId,
            userId: 12,
            motivation: 'Well-evaluated candidate.',
            status: 'APPROVED',
          },
        ])
      );
    }
    return this.http.get<PageApplicationDto>(
      `${BASE}/programs/evaluated/${programId}`,
      { params: toHttpParams(pageable) }
    );
  }

  // ── Reviews (evaluations) ─────────────────────────────────

  /** GET /api/applications/reviews/{applicationId} */
  getApplicationReviews(
    applicationId: number,
    pageable?: Pageable
  ): Observable<PageApplicationEvaluationDto> {
    if (this.mode === 'test') {
      return of(
        fakePage([
          {
            expertEmail: 'expert@example.com',
            score: 85,
            comment: 'Strong portfolio.',
          },
          {
            expertEmail: 'expert2@example.com',
            score: 72,
            comment: 'Promising but lacks statement.',
          },
        ])
      );
    }
    return this.http.get<PageApplicationEvaluationDto>(
      `${BASE}/reviews/${applicationId}`,
      { params: toHttpParams(pageable) }
    );
  }

  /** GET /api/applications/me/reviews/{applicationId} — current expert's review */
  getMyApplicationReview(
    applicationId: number,
    pageable?: Pageable
  ): Observable<PageApplicationEvaluationDto> {
    if (this.mode === 'test') {
      return of(
        fakePage([
          {
            expertEmail: 'me@example.com',
            score: 80,
            comment: 'Good composition.',
          },
        ])
      );
    }
    return this.http.get<PageApplicationEvaluationDto>(
      `${BASE}/me/reviews/${applicationId}`,
      { params: toHttpParams(pageable) }
    );
  }

  // ── Rating ────────────────────────────────────────────────

  /** GET /api/applications/ratings/{applicationId} */
  calculateApplicationRating(
    applicationId: number
  ): Observable<number> {
    if (this.mode === 'test') return of(78.5);
    return this.http.get<number>(`${BASE}/ratings/${applicationId}`);
  }
}
