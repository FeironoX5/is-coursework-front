// ============================================================
// review.service.ts — /api/programs/{programId}/reviews
// ============================================================

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MODE } from '../app.config';
import type {
  PageReviewDto,
  ReviewCreateDto,
  ReviewDto,
  ReviewUpdateDto,
  Pageable,
} from '../models';

const BASE = '/api/programs';

const FAKE_REVIEW: ReviewDto = {
  id: 1,
  artistName: 'Anna Petrova',
  score: 9,
  comment: 'Exceptional residency program with great support.',
  createdAt: '2024-08-01T10:00:00Z',
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
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly mode = inject(MODE);

  /** GET /api/programs/{programId}/reviews */
  getReviews(
    programId: number,
    pageable?: Pageable
  ): Observable<PageReviewDto> {
    if (this.mode === 'test') {
      return of(
        fakePage([
          FAKE_REVIEW,
          {
            ...FAKE_REVIEW,
            id: 2,
            artistName: 'Boris Sidorov',
            score: 7,
            comment: 'Good experience overall.',
          },
        ])
      );
    }
    return this.http.get<PageReviewDto>(
      `${BASE}/${programId}/reviews`,
      { params: toHttpParams(pageable) }
    );
  }

  /** POST /api/programs/{programId}/reviews */
  createReview(
    programId: number,
    body: ReviewCreateDto
  ): Observable<ReviewDto> {
    if (this.mode === 'test') {
      return of({
        ...FAKE_REVIEW,
        score: body.score,
        comment: body.comment,
        id: Math.floor(Math.random() * 1000),
      });
    }
    return this.http.post<ReviewDto>(
      `${BASE}/${programId}/reviews`,
      body
    );
  }

  /** PUT /api/programs/{programId}/reviews */
  updateReview(
    programId: number,
    body: ReviewUpdateDto
  ): Observable<ReviewDto> {
    if (this.mode === 'test') {
      return of({ ...FAKE_REVIEW, ...body });
    }
    return this.http.put<ReviewDto>(
      `${BASE}/${programId}/reviews`,
      body
    );
  }
}
