import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Residence } from '../models/residence.model';

interface ValidationRequest {
  id: string;
  residenceName: string;
  adminName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  async getValidationRequests(
    status?: string,
    page = 0,
    limit = 20
  ): Promise<PaginatedResponse<ValidationRequest>> {
    return firstValueFrom(
      this.http.get<PaginatedResponse<ValidationRequest>>(
        '/api/admin/validation-requests',
        {
          params: {
            ...(status && { status }),
            page,
            limit,
          },
        }
      )
    );
  }

  async getValidationRequest(requestId: string): Promise<{
    residence: Residence;
    admin: { name: string; email: string };
    status: string;
    submittedAt: string;
    history: any[];
  }> {
    return firstValueFrom(
      this.http.get<any>(
        `/api/admin/validation-requests/${requestId}`
      )
    );
  }

  async approveValidationRequest(requestId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `/api/admin/validation-requests/${requestId}/approve`,
        {}
      )
    );
  }

  async rejectValidationRequest(
    requestId: string,
    reason: string
  ): Promise<void> {
    await firstValueFrom(
      this.http.post(
        `/api/admin/validation-requests/${requestId}/reject`,
        { reason }
      )
    );
  }
}
