import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Residence } from '../models/residence.model';
import { HttpClient } from '@angular/common/http';
import { Program } from '../models/program.model';

interface ResidenceStats {
  views: number;
  viewsOverTime: { date: string; count: number }[];
  programs: {
    name: string;
    views: number;
    applications: number;
  }[];
}

interface ProgramStats {
  artStyleDistribution: { style: string; count: number }[];
  geographyDistribution: { location: string; count: number }[];
}

@Injectable({
  providedIn: 'root',
})
export class ResidenceService {
  private readonly http = inject(HttpClient);

  async getMyResidence(): Promise<Residence> {
    return firstValueFrom(
      this.http.get<Residence>('/api/residences/me')
    );
  }

  async createResidence(
    data: Partial<Residence>
  ): Promise<Residence> {
    return firstValueFrom(
      this.http.post<Residence>('/api/residences', data)
    );
  }

  async updateMyResidence(
    data: Partial<Residence>
  ): Promise<Residence> {
    return firstValueFrom(
      this.http.put<Residence>('/api/residences/me', data)
    );
  }

  async getValidationStatus(): Promise<{
    status: string;
    comment?: string;
  }> {
    return firstValueFrom(
      this.http.get<{ status: string; comment?: string }>(
        '/api/residences/me/validation-status'
      )
    );
  }

  async resubmitValidation(): Promise<void> {
    await firstValueFrom(
      this.http.post('/api/residences/me/resubmit-validation', {})
    );
  }

  async getMyStats(): Promise<ResidenceStats> {
    return firstValueFrom(
      this.http.get<ResidenceStats>('/api/residences/me/stats')
    );
  }

  async exportStats(format: 'csv' | 'pdf'): Promise<Blob> {
    return firstValueFrom(
      this.http.get(`/api/residences/me/stats/export`, {
        params: { format },
        responseType: 'blob',
      })
    );
  }

  async getMyPrograms(): Promise<Program[]> {
    return firstValueFrom(
      this.http.get<Program[]>('/api/residences/me/programs')
    );
  }

  async createProgram(data: Partial<Program>): Promise<Program> {
    return firstValueFrom(
      this.http.post<Program>('/api/programs', data)
    );
  }

  async updateProgram(
    programId: string,
    data: Partial<Program>
  ): Promise<Program> {
    return firstValueFrom(
      this.http.put<Program>(`/api/programs/${programId}`, data)
    );
  }

  async publishProgram(programId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`/api/programs/${programId}/publish`, {})
    );
  }

  async unpublishProgram(programId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`/api/programs/${programId}/unpublish`, {})
    );
  }

  async getProgramStats(programId: string): Promise<ProgramStats> {
    return firstValueFrom(
      this.http.get<ProgramStats>(`/api/programs/${programId}/stats`)
    );
  }

  async getProgramHistory(programId: string): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`/api/programs/${programId}/history`)
    );
  }
}
