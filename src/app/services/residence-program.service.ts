// ============================================================
// residence-program.service.ts — /api/residences/me/programs
// ============================================================

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MODE } from '../app.config';
import type {
  PageProgramPreviewDto,
  ProgramCreateDto,
  ProgramDto,
  ProgramPreviewDto,
  ProgramStatsDto,
  ProgramUpdateDto,
  Pageable,
} from '../models';

const BASE = '/api/residences/me/programs';

const FAKE_PREVIEW: ProgramPreviewDto = {
  id: 10,
  residenceId: 1,
  title: 'Summer Residency 2024',
  deadlineApply: '2024-05-31',
};

const FAKE_PROGRAM: ProgramDto = {
  previewDto: FAKE_PREVIEW,
  description: 'A 3-month immersive residency for visual artists.',
  goals: { main: 'Support experimental art practice' },
  conditions: { nationality: 'Any', age: '18+' },
  deadlineReview: '2024-06-15',
  deadlineNotify: '2024-06-30',
  durationDays: 90,
  budgetQuota: 5000,
  peopleQuota: 5,
  isPublished: true,
  createdAt: '2024-01-15T00:00:00Z',
};

const FAKE_STATS: ProgramStatsDto = {
  viewsCount: 320,
  applicationsCount: 48,
  confirmedCount: 5,
  declinedCount: 3,
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
export class ResidenceProgramService {
  private readonly http = inject(HttpClient);
  private readonly mode = inject(MODE);

  /** GET /api/residences/me/programs */
  getPrograms(
    pageable?: Pageable
  ): Observable<PageProgramPreviewDto> {
    if (this.mode === 'test') {
      return of(
        fakePage([
          FAKE_PREVIEW,
          {
            ...FAKE_PREVIEW,
            id: 11,
            title: 'Winter Retreat 2025',
            deadlineApply: '2024-11-30',
          },
        ])
      );
    }
    return this.http.get<PageProgramPreviewDto>(BASE, {
      params: toHttpParams(pageable),
    });
  }

  /** POST /api/residences/me/programs */
  createProgram(body: ProgramCreateDto): Observable<ProgramDto> {
    if (this.mode === 'test') {
      return of({
        ...FAKE_PROGRAM,
        previewDto: {
          ...FAKE_PREVIEW,
          title: body.title,
          deadlineApply: body.deadlineApply,
        },
      });
    }
    return this.http.post<ProgramDto>(BASE, body);
  }

  /** GET /api/residences/me/programs/{id} */
  getProgramById(id: number): Observable<ProgramDto> {
    if (this.mode === 'test') {
      return of({
        ...FAKE_PROGRAM,
        previewDto: { ...FAKE_PREVIEW, id },
      });
    }
    return this.http.get<ProgramDto>(`${BASE}/${id}`);
  }

  /** PUT /api/residences/me/programs/{id} */
  updateProgram(
    id: number,
    body: ProgramUpdateDto
  ): Observable<ProgramDto> {
    if (this.mode === 'test') {
      return of({
        ...FAKE_PROGRAM,
        previewDto: { ...FAKE_PREVIEW, id },
      });
    }
    return this.http.put<ProgramDto>(`${BASE}/${id}`, body);
  }

  /** PUT /api/residences/me/programs/{id}/publish */
  publishProgram(id: number): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.put<void>(`${BASE}/${id}/publish`, null);
  }

  /** PUT /api/residences/me/programs/{id}/unpublish */
  unpublishProgram(id: number): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.put<void>(`${BASE}/${id}/unpublish`, null);
  }

  /** GET /api/residences/me/programs/{id}/stats */
  getProgramStats(id: number): Observable<ProgramStatsDto> {
    if (this.mode === 'test') return of(FAKE_STATS);
    return this.http.get<ProgramStatsDto>(`${BASE}/${id}/stats`);
  }
}
