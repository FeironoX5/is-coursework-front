// ============================================================
// artist-work.service.ts — /api/artists/me/works & /api/artists/{id}/works
// ============================================================

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MODE } from '../app.config';
import type {
  PageWorkDto,
  WorkCreateDto,
  WorkDto,
  WorkUpdateDto,
  Pageable,
} from '../models';
import { HttpParams } from '@angular/common/http';

const BASE = '/api/artists';

const FAKE_WORK: WorkDto = {
  id: 1,
  title: 'Urban Echoes',
  description: 'A multimedia exploration of city soundscapes.',
  artDirection: 'MULTIMEDIA',
  date: '2023-06-15',
  link: 'https://example.com/work/1',
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
export class ArtistWorkService {
  private readonly http = inject(HttpClient);
  private readonly mode = inject(MODE);

  /** GET /api/artists/me/works */
  getWorksForCurrentArtist(
    pageable?: Pageable
  ): Observable<PageWorkDto> {
    if (this.mode === 'test') {
      return of(
        fakePage([
          FAKE_WORK,
          {
            ...FAKE_WORK,
            id: 2,
            title: 'Silent Canvas',
            artDirection: 'PAINTING',
          },
        ])
      );
    }
    return this.http.get<PageWorkDto>(`${BASE}/me/works`, {
      params: toHttpParams(pageable),
    });
  }

  /** POST /api/artists/me/works */
  createWork(body: WorkCreateDto): Observable<WorkDto> {
    if (this.mode === 'test') {
      return of({
        ...FAKE_WORK,
        ...body,
        id: Math.floor(Math.random() * 1000),
      });
    }
    return this.http.post<WorkDto>(`${BASE}/me/works`, body);
  }

  /** PUT /api/artists/me/works/{id} */
  updateWork(id: number, body: WorkUpdateDto): Observable<WorkDto> {
    if (this.mode === 'test') {
      return of({ ...FAKE_WORK, id });
    }
    return this.http.put<WorkDto>(`${BASE}/me/works/${id}`, body);
  }

  /** DELETE /api/artists/me/works/{id} */
  deleteWork(id: number): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.delete<void>(`${BASE}/me/works/${id}`);
  }

  /** GET /api/artists/{id}/works — public */
  getWorks(
    artistId: number,
    pageable?: Pageable
  ): Observable<PageWorkDto> {
    if (this.mode === 'test') {
      return of(fakePage([{ ...FAKE_WORK, id: 1 }]));
    }
    return this.http.get<PageWorkDto>(`${BASE}/${artistId}/works`, {
      params: toHttpParams(pageable),
    });
  }
}
