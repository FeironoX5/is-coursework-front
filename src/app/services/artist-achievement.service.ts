// ============================================================
// artist-achievement.service.ts — /api/artists/me/achievements
// ============================================================

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MODE } from '../app.config';
import type {
  AchievementCreateDto,
  AchievementDto,
  AchievementUpdateDto,
  PageAchievementDto,
  Pageable,
} from '../models';

const BASE = '/api/artists';

const FAKE_ACHIEVEMENT: AchievementDto = {
  id: 1,
  type: 'AWARD',
  title: 'Best Emerging Artist 2023',
  description: 'Awarded by the National Art Foundation.',
  link: 'https://example.com/awards/1',
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
export class ArtistAchievementService {
  private readonly http = inject(HttpClient);
  private readonly mode = inject(MODE);

  /** GET /api/artists/{artistId}/achievements — get achievements by artist user ID */
  getAchievementsByArtistId(
    artistId: number,
    pageable?: Pageable
  ): Observable<PageAchievementDto> {
    if (this.mode === 'test') {
      return of(fakePage([FAKE_ACHIEVEMENT]));
    }

    return this.http.get<PageAchievementDto>(
      `/api/artists/${artistId}/achievements`,
      { params: toHttpParams(pageable) }
    );
  }
  /** GET /api/artists/me/achievements */
  getMyAchievements(
    pageable?: Pageable
  ): Observable<PageAchievementDto> {
    if (this.mode === 'test') {
      return of(
        fakePage([
          FAKE_ACHIEVEMENT,
          {
            ...FAKE_ACHIEVEMENT,
            id: 2,
            type: 'EXHIBITION',
            title: 'Solo Exhibition at Tate Modern',
          },
        ])
      );
    }
    return this.http.get<PageAchievementDto>(
      `${BASE}/me/achievements`,
      { params: toHttpParams(pageable) }
    );
  }

  /** POST /api/artists/me/achievements */
  createAchievement(
    body: AchievementCreateDto
  ): Observable<AchievementDto> {
    if (this.mode === 'test') {
      return of({
        ...FAKE_ACHIEVEMENT,
        ...body,
        id: Math.floor(Math.random() * 1000),
      });
    }
    return this.http.post<AchievementDto>(
      `${BASE}/me/achievements`,
      body
    );
  }

  /** PUT /api/artists/me/achievements/{achievementId} */
  updateAchievement(
    achievementId: number,
    body: AchievementUpdateDto
  ): Observable<AchievementDto> {
    if (this.mode === 'test') {
      return of({ ...FAKE_ACHIEVEMENT, id: achievementId });
    }
    return this.http.put<AchievementDto>(
      `${BASE}/me/achievements/${achievementId}`,
      body
    );
  }

  /** DELETE /api/artists/me/achievements/{achievementId} */
  deleteAchievement(achievementId: number): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.delete<void>(
      `${BASE}/me/achievements/${achievementId}`
    );
  }

  /** GET /api/artists/{userId}/achievements — public */
  getArtistAchievements(
    userId: number,
    pageable?: Pageable
  ): Observable<PageAchievementDto> {
    if (this.mode === 'test') {
      return of(fakePage([FAKE_ACHIEVEMENT]));
    }
    return this.http.get<PageAchievementDto>(
      `${BASE}/${userId}/achievements`,
      { params: toHttpParams(pageable) }
    );
  }
}
