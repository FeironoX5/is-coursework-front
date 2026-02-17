import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Application,
  ExpertComment,
} from '../models/application.model';
import { firstValueFrom, map } from 'rxjs';
import { MODE } from '../app.config';

interface PortfolioStatus {
  hasBiography: boolean;
  hasMinimumWorks: boolean;
  isComplete: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly http = inject(HttpClient);
  private readonly mode = inject(MODE);

  async checkExistingApplication(
    programId: string
  ): Promise<{ hasApplication: boolean }> {
    return firstValueFrom(
      this.http.get<{ hasApplication: boolean }>(
        '/api/applications/check',
        {
          params: { programId },
        }
      )
    );
  }

  async getPortfolioStatus(): Promise<PortfolioStatus> {
    return firstValueFrom(
      this.http.get<PortfolioStatus>(
        '/api/artists/me/portfolio-status'
      )
    );
  }

  async getProgramApplicationForm(programId: string): Promise<any> {
    return firstValueFrom(
      this.http.get(`/api/programs/${programId}/application-form`)
    );
  }

  async submitApplication(
    programId: string,
    data: any
  ): Promise<Application> {
    return firstValueFrom(
      this.http.post<Application>('/api/applications', {
        programId,
        ...data,
      })
    );
  }

  async getMyApplications(): Promise<Application[]> {
    if (this.mode === 'test') {
      return Promise.resolve([
        {
          id: 1,
          programId: '101',
          userId: '501',
          motivation: 'I want to grow as a contemporary artist.',
          status: 'SENT',
        },
        {
          id: 2,
          programId: '102',
          userId: '501',
          motivation:
            'This program aligns with my artistic direction.',
          status: 'APPROVED',
        },
        {
          id: 3,
          programId: '103',
          userId: '501',
          motivation:
            'Looking for mentorship and exhibition opportunities.',
          status: 'REJECTED',
        },
      ]);
    }

    return firstValueFrom(
      this.http
        .get<{ content: Application[] }>(
          '/api/artists/me/applications',
          {
            observe: 'response',
          }
        )
        .pipe(map((res) => res.body?.content || []))
    );
  }

  async getApplication(applicationId: string): Promise<Application> {
    return firstValueFrom(
      this.http.get<Application>(`/api/applications/${applicationId}`)
    );
  }

  async getExpertComments(
    applicationId: string
  ): Promise<ExpertComment[]> {
    return firstValueFrom(
      this.http.get<ExpertComment[]>(
        `/api/applications/${applicationId}/expert-comments`
      )
    );
  }

  async confirmParticipation(applicationId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`/api/applications/${applicationId}/confirm`, {})
    );
  }

  async declineInvitation(applicationId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`/api/applications/${applicationId}/decline`, {})
    );
  }

  async getApplicationsRanking(programId: string): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(
        `/api/programs/${programId}/applications/ranking`
      )
    );
  }

  async approveApplications(
    programId: string,
    applicationIds: string[]
  ): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `/api/programs/${programId}/applications/approve`,
        { applicationIds }
      )
    );
  }

  async finalizeSelection(programId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `/api/programs/${programId}/applications/finalize-selection`,
        {}
      )
    );
  }

  async sendFurtherActions(programId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `/api/programs/${programId}/send-further-actions`,
        {}
      )
    );
  }
}
