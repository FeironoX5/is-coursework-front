// ============================================================
// expert.service.ts — /api/experts
// ============================================================

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MODE } from '../app.config';
import type {
  ExpertDto,
  PageExpertDto,
  PageProgramPreviewDto,
  Pageable,
  PageUserDto,
} from '../models';

const BASE = '/api/experts';

const FAKE_EXPERT: ExpertDto = {
  userId: 20,
  email: 'expert@example.com',
  name: 'Ekaterina',
  surname: 'Ivanova',
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
export class ExpertService {
  private readonly http = inject(HttpClient);
  private readonly mode = inject(MODE);

  /** GET /api/experts */
  getExperts(pageable?: Pageable): Observable<PageExpertDto> {
    if (this.mode === 'test') {
      return of(
        fakePage([
          FAKE_EXPERT,
          {
            ...FAKE_EXPERT,
            userId: 21,
            name: 'Dmitri',
            email: 'dmitri@example.com',
          },
        ])
      );
    }
    return this.http.get<PageExpertDto>(BASE, {
      params: toHttpParams(pageable),
    });
  }

  /** GET /api/experts/{id} */
  getExpertById(id: number): Observable<ExpertDto> {
    if (this.mode === 'test')
      return of({ ...FAKE_EXPERT, userId: id });
    return this.http.get<ExpertDto>(`${BASE}/${id}`);
  }

  /** GET /api/experts/me */
  getMyProfile(): Observable<ExpertDto> {
    if (this.mode === 'test') return of(FAKE_EXPERT);
    return this.http.get<ExpertDto>(`${BASE}/me`);
  }

  /** GET /api/experts/programs/{programId} — get experts assigned to program */
  getExpertsByProgram(
    programId: number,
    pageable?: Pageable
  ): Observable<PageExpertDto> {
    if (this.mode === 'test') {
      return of(
        fakePage([
          {
            id: 10,
            username: 'expert1@example.com',
            name: 'Maria',
            surname: 'Ivanova',
            role: 'ROLE_EXPERT',
            isActive: true,
          },
          {
            id: 11,
            username: 'expert2@example.com',
            name: 'Ivan',
            surname: 'Petrov',
            role: 'ROLE_EXPERT',
            isActive: true,
          },
        ])
      );
    }
    return this.http.get<PageExpertDto>(
      `/api/programs/${programId}/experts`,
      { params: toHttpParams(pageable) }
    );
  }
  //@PostMapping('{id}/programs/{programId}/assign')
  /** POST /api/experts/programs/{programId}/assign/{expertId} */
  assignExpertToProgram(
    programId: number,
    expertId: number
  ): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.post<void>(
      `${BASE}/${expertId}/programs/${programId}/assign`,
      null
    );
  }

  /** DELETE /api/experts/programs/{programId}/remove/{expertId} */
  removeExpertFromProgram(
    programId: number,
    expertId: number
  ): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.delete<void>(
      `${BASE}/programs/${programId}/remove/${expertId}`
    );
  }

  /** GET /api/experts/me/programs */
  getMyPrograms(
    pageable?: Pageable
  ): Observable<PageProgramPreviewDto> {
    if (this.mode === 'test') {
      return of(
        fakePage([
          {
            id: 10,
            residenceId: 1,
            title: 'Summer Residency 2024',
            deadlineApply: '2024-05-31',
          },
        ])
      );
    }
    return this.http.get<PageProgramPreviewDto>(
      `${BASE}/me/programs`,
      { params: toHttpParams(pageable) }
    );
  }

  /** POST /api/experts/{id}/programs/{programId}/assign */
  setExpertToProgram(
    id: number,
    programId: number
  ): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.post<void>(
      `${BASE}/${id}/programs/${programId}/assign`,
      null
    );
  }

  /** POST /api/experts/{id}/programs/{programId}/unassign */
  unassignExpertFromProgram(
    id: number,
    programId: number
  ): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.post<void>(
      `${BASE}/${id}/programs/${programId}/unassign`,
      null
    );
  }

  /** POST /api/experts/me/programs/{programId}/unassign */
  unassignMeFromProgram(programId: number): Observable<void> {
    if (this.mode === 'test') return of(undefined);
    return this.http.post<void>(
      `${BASE}/me/programs/${programId}/unassign`,
      null
    );
  }
}
