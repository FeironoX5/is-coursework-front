// ============================================================
// notification.service.ts — /api/notifications
// ============================================================

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MODE } from '../app.config';
import type {
  NotificationDto,
  PageNotificationDto,
  Pageable,
} from '../models';

const BASE = '/api/notifications';

const FAKE_NOTIFICATIONS: NotificationDto[] = [
  {
    id: 1,
    message: 'Your application has been approved!',
    link: '/applications/1',
    category: 'STATUS',
    readAt: undefined,
    createdAt: '2024-07-01T09:00:00Z',
  },
  {
    id: 2,
    message:
      'You have been invited to apply for Summer Residency 2024.',
    link: '/programs/10',
    category: 'INVITE',
    readAt: '2024-07-02T11:30:00Z',
    createdAt: '2024-07-01T08:00:00Z',
  },
];

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
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly mode = inject(MODE);

  /** GET /api/notifications */
  getNotifications(
    pageable?: Pageable
  ): Observable<PageNotificationDto> {
    if (this.mode === 'test') return of(fakePage(FAKE_NOTIFICATIONS));
    return this.http.get<PageNotificationDto>(BASE, {
      params: toHttpParams(pageable),
    });
  }

  /** GET /api/notifications/unread-count */
  getUnreadCount(): Observable<number> {
    if (this.mode === 'test') return of(1);
    return this.http.get<number>(`${BASE}/unread-count`);
  }

  /** PATCH /api/notifications/{id}/read */
  markAsRead(id: number): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.patch<void>(`${BASE}/${id}/read`, null);
  }

  /** PATCH /api/notifications/read-all */
  markAllAsRead(): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.patch<void>(`${BASE}/read-all`, null);
  }
}
