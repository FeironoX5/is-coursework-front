import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Evaluation, Expert } from '../models/expert.model';
import { Application } from '../models/application.model';
import { HttpClient } from '@angular/common/http';
import { Artist } from '../models/artist.model';
import { Program } from '../models/program.model';

@Injectable({
  providedIn: 'root',
})
export class ExpertService {
  private readonly http = inject(HttpClient);

  async getMyProfile(): Promise<Expert> {
    return firstValueFrom(this.http.get<Expert>('/api/experts/me'));
  }

  async updateMyProfile(data: Partial<Expert>): Promise<Expert> {
    return firstValueFrom(
      this.http.put<Expert>('/api/experts/me', data)
    );
  }

  async getMyPrograms(): Promise<Program[]> {
    return firstValueFrom(
      this.http.get<Program[]>('/api/experts/me/programs')
    );
  }

  async getProgramApplications(
    programId: string,
    filter?: string
  ): Promise<Application[]> {
    return firstValueFrom(
      this.http.get<Application[]>(
        `/api/experts/me/programs/${programId}/applications`,
        {
          params: filter ? { filter } : {},
        }
      )
    );
  }

  async declineProgram(programId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`/api/programs/${programId}/experts/decline`, {})
    );
  }

  async getApplicationForEvaluation(applicationId: string): Promise<{
    application: Application;
    artist: Artist;
  }> {
    return firstValueFrom(
      this.http.get<{ application: Application; artist: Artist }>(
        `/api/applications/${applicationId}/expert-view`
      )
    );
  }

  async submitEvaluation(
    applicationId: string,
    score: number,
    comment: string
  ): Promise<Evaluation> {
    return firstValueFrom(
      this.http.post<Evaluation>(
        `/api/applications/${applicationId}/evaluations`,
        {
          score,
          comment,
        }
      )
    );
  }

  async updateEvaluation(
    applicationId: string,
    evaluationId: string,
    score: number,
    comment: string
  ): Promise<Evaluation> {
    return firstValueFrom(
      this.http.put<Evaluation>(
        `/api/applications/${applicationId}/evaluations/${evaluationId}`,
        { score, comment }
      )
    );
  }

  async getExperts(
    search?: string,
    specializations?: string[]
  ): Promise<Expert[]> {
    return firstValueFrom(
      this.http.get<Expert[]>('/api/experts', {
        params: {
          ...(search && { search }),
          ...(specializations && {
            specializations: specializations.join(','),
          }),
        },
      })
    );
  }

  async assignExpertToProgram(
    programId: string,
    expertId: string
  ): Promise<void> {
    await firstValueFrom(
      this.http.post(`/api/programs/${programId}/experts`, {
        expertId,
      })
    );
  }

  async removeExpertFromProgram(
    programId: string,
    expertId: string,
    force = false
  ): Promise<void> {
    await firstValueFrom(
      this.http.delete(
        `/api/programs/${programId}/experts/${expertId}`,
        {
          params: force ? { force: 'true' } : {},
        }
      )
    );
  }
}
