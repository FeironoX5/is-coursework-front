// ============================================================
// admin.service.ts — /api/admin
// ============================================================

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import type {
  PageResidenceDetailsDto,
  ResidenceDetailsDto,
  ValidationActionDto,
  ValidationResponseDto,
  Pageable,
} from '../models';
import { MODE } from '../app.config';

const BASE = '/api/admin';

const FAKE_RESIDENCE_DETAILS: ResidenceDetailsDto = {
  id: 1,
  userId: 5,
  title: 'Artspace Nord',
  description: 'A vibrant artist residency in the north.',
  location: 'Helsinki, Finland',
  contacts: { email: 'info@artspacenord.fi' },
  isPublished: false,
  validation: {
    validationStatus: 'PENDING',
    validationComment: undefined,
    validationSubmittedAt: '2024-03-10T10:00:00Z',
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-03-10T10:00:00Z',
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
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly mode = inject(MODE);

  /** GET /api/admin/validation-requests */
  getValidationRequests(
    pageable?: Pageable
  ): Observable<PageResidenceDetailsDto> {
    if (this.mode === 'test') {
      return of(
        fakePage([
          FAKE_RESIDENCE_DETAILS,
          { ...FAKE_RESIDENCE_DETAILS, id: 2, title: 'Studio South' },
        ])
      );
    }
    return this.http.get<PageResidenceDetailsDto>(
      `${BASE}/validation-requests`,
      { params: toHttpParams(pageable) }
    );
  }

  /** GET /api/admin/validation-requests/{id} */
  getValidationRequestDetails(
    id: number
  ): Observable<ResidenceDetailsDto> {
    if (this.mode === 'test')
      return of({ ...FAKE_RESIDENCE_DETAILS, id });
    return this.http.get<ResidenceDetailsDto>(
      `${BASE}/validation-requests/${id}`
    );
  }

  /** POST /api/admin/validation-requests/{id}/approve */
  approveValidationRequest(
    id: number
  ): Observable<ValidationResponseDto> {
    if (this.mode === 'test') {
      return of({
        validationStatus: 'APPROVED',
        validationComment: undefined,
        validationSubmittedAt: new Date().toISOString(),
      });
    }
    return this.http.post<ValidationResponseDto>(
      `${BASE}/validation-requests/${id}/approve`,
      null
    );
  }

  /** POST /api/admin/validation-requests/{id}/reject */
  rejectValidationRequest(
    id: number,
    body: ValidationActionDto
  ): Observable<ValidationResponseDto> {
    if (this.mode === 'test') {
      return of({
        validationStatus: 'REJECTED',
        validationComment: body.comment,
        validationSubmittedAt: new Date().toISOString(),
      });
    }
    return this.http.post<ValidationResponseDto>(
      `${BASE}/validation-requests/${id}/reject`,
      body
    );
  }
}
