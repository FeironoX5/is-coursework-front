// ============================================================
// artist-media.service.ts — /api/artists/me/works/{workId}/media
// ============================================================

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MODE } from '../app.config';
import type { MediaDto, PageMediaDto, Pageable } from '../models';

const BASE = '/api/artists';

const FAKE_MEDIA: MediaDto = {
  id: 1,
  uri: 'https://example.com/media/photo1.jpg',
  mediaType: 'IMAGE',
  fileSize: 204800,
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
export class ArtistMediaService {
  private readonly http = inject(HttpClient);
  private readonly mode = inject(MODE);

  /** GET /api/artists/me/works/{workId}/media */
  getWorkMediasForCurrentArtist(
    workId: number,
    pageable?: Pageable
  ): Observable<PageMediaDto> {
    if (this.mode === 'test') {
      return of(
        fakePage([
          FAKE_MEDIA,
          {
            ...FAKE_MEDIA,
            id: 2,
            uri: 'https://example.com/media/photo2.jpg',
          },
        ])
      );
    }
    return this.http.get<PageMediaDto>(
      `${BASE}/me/works/${workId}/media`,
      { params: toHttpParams(pageable) }
    );
  }

  /** POST /api/artists/me/works/{workId}/media */
  uploadMedia(workId: number, files: File[]): Observable<MediaDto[]> {
    if (this.mode === 'test') {
      return of(
        files.map((f, i) => ({
          id: i + 1,
          uri: `https://example.com/media/${f.name}`,
          mediaType: 'IMAGE' as const,
          fileSize: f.size,
        }))
      );
    }
    let params = new HttpParams();
    // files are passed as query array per spec; normally you'd use FormData for multipart uploads
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return this.http.post<MediaDto[]>(
      `${BASE}/me/works/${workId}/media`,
      formData,
      { params }
    );
  }

  /** DELETE /api/artists/me/works/{workId}/media/{mediaId} */
  deleteMedia(workId: number, mediaId: number): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.delete<void>(
      `${BASE}/me/works/${workId}/media/${mediaId}`
    );
  }

  /** GET /api/artists/{userId}/works/{workId}/media — public */
  getWorkMediasPublic(
    userId: number,
    workId: number,
    pageable?: Pageable
  ): Observable<PageMediaDto> {
    if (this.mode === 'test') {
      return of(fakePage([FAKE_MEDIA]));
    }
    return this.http.get<PageMediaDto>(
      `${BASE}/${userId}/works/${workId}/media`,
      { params: toHttpParams(pageable) }
    );
  }
}
