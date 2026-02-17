import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Program, ProgramPreview } from '../models/program.model';
import { MODE } from '../app.config';

export interface Review {
  id: string;
  programId: string;
  artistId: string;
  artistName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProgramsService {
  private readonly http = inject(HttpClient);
  private readonly mode = inject(MODE);

  async getPrograms(
    pageIndex: number,
    pageSize: number
  ): Promise<PaginatedResponse<ProgramPreview>> {
    if (this.mode === 'test') {
      return Promise.resolve({
        totalElements: 163,
        content: [
          {
            id: 1,
            title: 'Architecture program',
            deadlineApply: '2026-03-15',
          },
          {
            id: 2,
            title: 'Bach program',
            deadlineApply: '2026-03-15',
          },
          {
            id: 3,
            title: 'Czurich program',
            deadlineApply: '2026-03-15',
          },
        ],
      });
    }
    const params = new HttpParams()
      .set('page', pageIndex)
      .set('size', pageSize);
    return firstValueFrom(
      this.http.get<PaginatedResponse<ProgramPreview>>(
        '/api/programs',
        {
          params,
        }
      )
    );
  }

  async getProgram(programId: number): Promise<Program> {
    if (this.mode === 'test') {
      return Promise.resolve({
        previewDto: {
          id: programId,
          title: 'Contemporary Art Residency 2025',
          deadlineApply: '2026-03-15',
        },
        description:
          'An international residency program focused on experimental contemporary practices.',
        goals: {
          innovation: true,
          collaboration: true,
          internationalExposure: true,
        },
        conditions: {
          ageLimit: 35,
          portfolioRequired: true,
          language: 'English',
        },
        deadlineReview: '2025-05-01',
        deadlineNotify: '2025-05-20',
        durationDays: 60,
        budgetQuota: 10000,
        peopleQuota: 12,
        furtherActionsSentAt: '2025-05-25T12:00:00.000+0300',
        isPublished: true,
        createdAt: '2025-01-10T09:15:00.000+0300',
      });
    }
    return firstValueFrom(
      this.http.get<Program>(`/api/programs/${programId}`)
    );
  }

  async getProgramReviews(
    programId: string,
    page = 0,
    limit = 20
  ): Promise<PaginatedResponse<Review>> {
    return firstValueFrom(
      this.http.get<PaginatedResponse<Review>>(
        `/api/programs/${programId}/reviews`,
        {
          params: { page, limit },
        }
      )
    );
  }

  async createReview(
    programId: string,
    rating: number,
    comment: string
  ): Promise<Review> {
    return firstValueFrom(
      this.http.post<Review>(`/api/programs/${programId}/reviews`, {
        rating,
        comment,
      })
    );
  }
}
