// ============================================================
// artist-detail.page.ts — View artist portfolio
// ============================================================

import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { PageHeaderComponent } from '../../components/page-header.component';
import { WorkCardComponent } from '../../components/work-card.component';
import { AchievementItemComponent } from '../../components/achievement-item.component';
import { EmptyStateComponent } from '../../components/empty-state.component';

import { ArtistService } from '../../services/artist.service';
import { ArtistWorkService } from '../../services/artist-work.service';
import { ArtistAchievementService } from '../../services/artist-achievement.service';
import { AuthService } from '../../services/auth.service';
import type {
  ArtistProfileDto,
  WorkDto,
  AchievementDto,
} from '../../models';
import { artDirectionLabel } from '../../formatters';

@Component({
  selector: 'app-artist-detail-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatChipsModule,
    PageHeaderComponent,
    WorkCardComponent,
    AchievementItemComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div class="loading-center"><mat-spinner /></div>
      } @else if (artist()) {
        <app-page-header
          [title]="artist()!.name + ' ' + artist()!.surname"
        >
          <button mat-button (click)="router.navigate(['/artists'])">
            <mat-icon>arrow_back</mat-icon> Back to Catalog
          </button>
          @if (authService.isResidenceAdmin()) {
            <button
              mat-flat-button
              color="primary"
              (click)="inviteArtist()"
            >
              <mat-icon>mail</mat-icon> Invite to Program
            </button>
          }
        </app-page-header>

        <!-- Artist Info Card -->
        <mat-card appearance="outlined" class="info-card">
          <mat-card-content>
            <div class="info-grid">
              @if (artist()!.biography) {
                <div class="info-section">
                  <h4>Biography</h4>
                  <p class="biography">{{ artist()!.biography }}</p>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Portfolio Tabs -->
        <mat-tab-group
          animationDuration="200ms"
          class="portfolio-tabs"
        >
          <mat-tab label="Works ({{ works().length }})">
            <div class="tab-body">
              @if (works().length === 0) {
                <app-empty-state
                  icon="brush"
                  title="No works in portfolio"
                />
              } @else {
                <div class="works-grid">
                  @for (w of works(); track w.id) {
                    <app-work-card [work]="w" />
                  }
                </div>
              }
            </div>
          </mat-tab>

          <mat-tab label="Achievements ({{ achievements().length }})">
            <div class="tab-body">
              @if (achievements().length === 0) {
                <app-empty-state
                  icon="emoji_events"
                  title="No achievements"
                />
              } @else {
                @for (a of achievements(); track a.id) {
                  <app-achievement-item [achievement]="a" />
                }
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 32px;
        max-width: 1100px;
        margin: 0 auto;
      }
      .loading-center {
        display: flex;
        justify-content: center;
        padding: 80px;
      }

      .info-card {
        margin-bottom: 24px;
      }
      .info-grid {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .info-section h4 {
        margin: 0 0 8px;
        font-size: 14px;
        font-weight: 600;
      }
      .biography {
        margin: 0;
        line-height: 1.6;
        white-space: pre-line;
      }

      .portfolio-tabs {
        margin-top: 8px;
      }
      .tab-body {
        padding: 24px 0;
      }

      .works-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }
    `,
  ],
})
export class ArtistDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  private readonly artistService = inject(ArtistService);
  private readonly workService = inject(ArtistWorkService);
  private readonly achievementService = inject(
    ArtistAchievementService
  );

  protected loading = signal(true);
  protected artist = signal<ArtistProfileDto | null>(null);
  protected works = signal<WorkDto[]>([]);
  protected achievements = signal<AchievementDto[]>([]);

  ngOnInit() {
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadArtist(userId);
  }

  private loadArtist(userId: number) {
    this.loading.set(true);

    this.artistService.getArtistByUserId(userId).subscribe({
      next: (profile) => {
        this.artist.set(profile);
        this.loadWorks(userId);
        this.loadAchievements(userId);
      },
      error: () => {
        this.router.navigate(['/artists']);
      },
    });
  }

  private loadWorks(userId: number) {
    this.workService.getWorksByArtistId(userId).subscribe((page) => {
      this.works.set(page.content);
    });
  }

  private loadAchievements(userId: number) {
    this.achievementService
      .getAchievementsByArtistId(userId)
      .subscribe((page) => {
        this.achievements.set(page.content);
        this.loading.set(false);
      });
  }

  inviteArtist() {
    // TODO: Implement invitation dialog (F13)
    alert('Invitation feature coming soon');
  }
}
