// ============================================================
// artist.service.ts — /api/artists
// ============================================================

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MODE } from '../app.config';
import type {
  ArtistProfileDto,
  ArtistProfileCreateDto,
  ArtistProfileUpdateDto,
  PageArtistProfileDto,
  PageApplicationDto,
  Pageable,
} from '../models';

const BASE = '/api/artists';

const FAKE_PROFILE: ArtistProfileDto = {
  userId: 1,
  email: 'artist@example.com',
  name: 'Anna',
  surname: 'Petrova',
  biography: 'Contemporary visual artist based in Moscow.',
  location: 'Moscow, Russia',
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
export class ArtistService {
  private readonly http = inject(HttpClient);
  private readonly mode = inject(MODE);

  // ── Public listing ──────────────────────────────────────────

  /** GET /api/artists */
  getArtistsProfile(
    pageable?: Pageable
  ): Observable<PageArtistProfileDto> {
    if (this.mode === 'test') {
      return of(
        fakePage([
          FAKE_PROFILE,
          {
            ...FAKE_PROFILE,
            userId: 2,
            name: 'Boris',
            email: 'boris@example.com',
          },
        ])
      );
    }
    return this.http.get<PageArtistProfileDto>(BASE, {
      params: toHttpParams(pageable),
    });
  }

  /** GET /api/artists/{id} */
  getArtistProfile(id: number): Observable<ArtistProfileDto> {
    if (this.mode === 'test') {
      return of({ ...FAKE_PROFILE, userId: id });
    }
    return this.http.get<ArtistProfileDto>(`${BASE}/${id}`);
  }

  // ── My profile (authenticated) ───────────────────────────────

  /** GET /api/artists/me */
  getMyProfile(): Observable<ArtistProfileDto> {
    if (this.mode === 'test') return of(FAKE_PROFILE);
    return this.http.get<ArtistProfileDto>(`${BASE}/me`);
  }

  /** POST /api/artists/me */
  createMyProfile(
    body: ArtistProfileCreateDto
  ): Observable<ArtistProfileDto> {
    if (this.mode === 'test') return of({ ...FAKE_PROFILE, ...body });
    return this.http.post<ArtistProfileDto>(`${BASE}/me`, body);
  }

  /** PUT /api/artists/me */
  updateMyProfile(
    body: ArtistProfileUpdateDto
  ): Observable<ArtistProfileDto> {
    if (this.mode === 'test') return of(FAKE_PROFILE);
    return this.http.put<ArtistProfileDto>(`${BASE}/me`, body);
  }

  // ── Applications ──────────────────────────────────────────────

  /** GET /api/artists/me/applications — active applications */
  getMyApplications(
    pageable?: Pageable
  ): Observable<PageApplicationDto> {
    if (this.mode === 'test') {
      return of(
        fakePage([
          {
            id: 1,
            programId: 10,
            userId: 1,
            motivation: 'I am passionate about this.',
            status: 'SENT',
          },
        ])
      );
    }
    return this.http.get<PageApplicationDto>(
      `${BASE}/me/applications`,
      { params: toHttpParams(pageable) }
    );
  }

  /** GET /api/artists/me/applications/history — all applications */
  getAllMyApplications(
    pageable?: Pageable
  ): Observable<PageApplicationDto> {
    if (this.mode === 'test') {
      return of(
        fakePage([
          {
            id: 1,
            programId: 10,
            userId: 1,
            motivation: 'I am passionate about this.',
            status: 'CONFIRMED',
          },
          {
            id: 2,
            programId: 11,
            userId: 1,
            motivation: 'My work aligns well.',
            status: 'REJECTED',
          },
        ])
      );
    }
    return this.http.get<PageApplicationDto>(
      `${BASE}/me/applications/history`,
      { params: toHttpParams(pageable) }
    );
  }

  /** POST /api/artists/me/applications/{id}/confirm */
  confirmMyApplication(id: number): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.post<void>(
      `${BASE}/me/applications/${id}/confirm`,
      null
    );
  }

  /** POST /api/artists/me/applications/{id}/decline */
  declineMyApplication(id: number): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.post<void>(
      `${BASE}/me/applications/${id}/decline`,
      null
    );
  }

  // ── Invite ────────────────────────────────────────────────────

  /** POST /api/artists/invite */
  inviteArtist(
    body: import('../models').NotificationCreateDto
  ): Observable<number> {
    if (this.mode === 'test') return of(42);
    return this.http.post<number>(`${BASE}/invite`, body);
  }
}
