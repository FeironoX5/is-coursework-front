import { inject, Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Achievement, Artist, ArtWork } from '../models/artist.model';
import { MODE } from '../app.config';
import { Application } from '../models/application.model';

@Injectable({
  providedIn: 'root',
})
export class ArtistService {
  private readonly http = inject(HttpClient);
  private readonly mode = inject(MODE);

  async getMyProfile(): Promise<Artist> {
    if (this.mode === 'test') {
      return Promise.resolve({
        userId: 1,
        email: 'test@gmail.com',
        name: 'Ivan',
        surname: 'Ivanov',
        location: 'SPB',
        biography: 'Nothing interesting',
      });
    }
    return firstValueFrom(this.http.get<Artist>('/api/artists/me'));
  }

  async updateMyProfile(data: Partial<Artist>): Promise<Artist> {
    return firstValueFrom(
      this.http.put<Artist>('/api/artists/me', data)
    );
  }

  async getMyWorks(): Promise<ArtWork[]> {
    if (this.mode === 'test') {
      return Promise.resolve([
        {
          id: 1,
          title: 'Morning light',
          description: 'Soft light study',
          artDirection: 'PAINTING',
          date: '2024-10-12',
          link: 'https://example.com/work/1',
        },
        {
          id: 2,
          title: 'Urban decay',
          description: 'City graphics series',
          artDirection: 'PHOTO',
          date: '2024-11-01',
          link: 'https://example.com/work/2',
        },
      ]);
    }
    return firstValueFrom(
      this.http
        .get<ArtWork[]>('/api/artists/me/works', {
          observe: 'response',
        })
        .pipe(map((res) => res.body || []))
    );
  }

  async createWork(work: Partial<ArtWork>): Promise<ArtWork> {
    return firstValueFrom(
      this.http.post<ArtWork>('/api/artists/me/works', work)
    );
  }

  async updateWork(
    workId: number,
    work: Partial<ArtWork>
  ): Promise<ArtWork> {
    return firstValueFrom(
      this.http.put<ArtWork>(`/api/artists/me/works/${workId}`, work)
    );
  }

  async deleteWork(workId: number): Promise<void> {
    await firstValueFrom(
      this.http.delete(`/api/artists/me/works/${workId}`)
    );
  }

  async getMyAchievements(): Promise<Achievement[]> {
    if (this.mode === 'test') {
      return Promise.resolve([
        {
          id: 0,
          type: 'EDUCATION',
          title: 'Best Emerging Artist 2024',
          description:
            'Won first place at the International Modern Art Contest.',
          link: 'https://example.com/achievements/award-2024',
        },
        {
          id: 1,
          type: 'EXHIBITION',
          title: 'Berlin Contemporary Expo',
          description:
            'Participated in a group exhibition focused on urban abstraction.',
          link: 'https://example.com/achievements/berlin-expo',
        },
        {
          id: 2,
          type: 'PUBLICATION',
          title: 'Featured in Art Monthly',
          description:
            'Artwork featured in the November issue of Art Monthly magazine.',
          link: 'https://example.com/achievements/art-monthly',
        },
      ]);
    }
    return firstValueFrom(
      this.http.get<Achievement[]>('/api/artists/me/achievements')
    );
  }

  async createAchievement(
    achievement: Partial<Achievement>
  ): Promise<Achievement> {
    return firstValueFrom(
      this.http.post<Achievement>(
        '/api/artists/me/achievements',
        achievement
      )
    );
  }

  async updateAchievement(
    achievementId: number,
    achievement: Partial<Achievement>
  ): Promise<Achievement> {
    return firstValueFrom(
      this.http.put<Achievement>(
        `/api/artists/me/achievements/${achievementId}`,
        achievement
      )
    );
  }

  async deleteAchievement(achievementId: number): Promise<void> {
    await firstValueFrom(
      this.http.delete(
        `/api/artists/me/achievements/${achievementId}`
      )
    );
  }

  async getArtist(artistId: string): Promise<Artist> {
    return firstValueFrom(
      this.http.get<Artist>(`/api/artists/${artistId}`)
    );
  }

  async getArtistWorks(artistId: string): Promise<ArtWork[]> {
    return firstValueFrom(
      this.http.get<ArtWork[]>(`/api/artists/${artistId}/works`)
    );
  }

  async getArtistAchievements(
    artistId: string
  ): Promise<Achievement[]> {
    return firstValueFrom(
      this.http.get<Achievement[]>(
        `/api/artists/${artistId}/achievements`
      )
    );
  }
}
