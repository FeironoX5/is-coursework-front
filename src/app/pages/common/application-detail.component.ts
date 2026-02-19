// ============================================================
// application-detail.component.ts — View application with portfolio (F9)
// ============================================================

import {
  Component,
  inject,
  input,
  output,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DynamicForm, type FieldConfig } from '../dynamic-form/dynamic-form.component';
import { WorkCardComponent } from '../work-card/work-card.component';
import { AchievementItemComponent } from '../achievement-item/achievement-item.component';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

import { ArtistService } from '../../api/artist.service';
import { ArtistWorkService } from '../../api/artist-work.service';
import { ArtistAchievementService } from '../../api/artist-achievement.service';
import { ApplicationService } from '../../api/application.service';
import type {
  ApplicationDto,
  ArtistProfileDto,
  WorkDto,
  AchievementDto,
  ApplicationEvaluationCreateDto,
  ApplicationEvaluationDto,
} from '../../api/models';
import { Validators } from '@angular/forms';
import { formatDate } from '../../formatters';

const EVALUATE_FIELDS: FieldConfig[] = [
  {
    type: 'input',
    propertyName: 'score',
    displayName: 'Score (0–100)',
    dataType: 'number',
    validators: [Validators.required, Validators.min(0), Validators.max(100)],
  },
  {
    type: 'input',
    propertyName: 'comment',
    displayName: 'Comment',
    dataType: 'text',
    validators: [Validators.required, Validators.minLength(10)],
  },
];

export interface ApplicationDetailData {
  application: ApplicationDto;
  canEvaluate?: boolean; // true for experts
  canViewEvaluations?: boolean; // true for residence admins
}

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, MatIconModule, MatTabsModule,
    MatCardModule, MatDividerModule, MatChipsModule, MatProgressSpinnerModule,
    DynamicForm, WorkCardComponent, AchievementItemComponent,
    StatusBadgeComponent, EmptyStateComponent,
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        Application #{{ data.application.id }}
        <app-status-badge [status]="data.application.status!" />
      </h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      @if (loading()) {
        <div class="loading-center"><mat-spinner /></div>
      } @else {

        <mat-tab-group animationDuration="200ms">

          <!-- Application Info Tab -->
          <mat-tab label="Application">
            <div class="tab-body">
              <h4>Motivation</h4>
              <p class="motivation">{{ data.application.motivation }}</p>

              @if (artistProfile()) {
                <mat-divider />
                <h4>Artist</h4>
                <div class="artist-info">
                  <div class="info-row">
                    <span class="label">Name</span>
                    <span>{{ artistProfile()!.name }} {{ artistProfile()!.surname }}</span>
                  </div>
                  @if (artistProfile()!.biography) {
                    <div class="info-row">
                      <span class="label">Biography</span>
                      <span>{{ artistProfile()!.biography }}</span>
                    </div>
                  }
                  @if (artistProfile()!.location) {
                    <div class="info-row">
                      <span class="label">Location</span>
                      <span>{{ artistProfile()!.location }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          </mat-tab>

          <!-- Portfolio Tab -->
          <mat-tab label="Portfolio ({{ works().length }} works)">
            <div class="tab-body">
              @if (works().length === 0) {
                <app-empty-state icon="brush" title="No works in portfolio" />
              } @else {
                <div class="works-grid">
                  @for (w of works(); track w.id) {
                    <app-work-card [work]="w" />
                  }
                </div>
              }
            </div>
          </mat-tab>

          <!-- Achievements Tab -->
          <mat-tab label="Achievements ({{ achievements().length }})">
            <div class="tab-body">
              @if (achievements().length === 0) {
                <app-empty-state icon="emoji_events" title="No achievements" />
              } @else {
                <mat-list>
                  @for (a of achievements(); track a.id) {
                    <app-achievement-item [achievement]="a" />
                    <mat-divider />
                  }
                </mat-list>
              }
            </div>
          </mat-tab>

          <!-- Evaluations Tab (for admins) -->
          @if (data.canViewEvaluations) {
            <mat-tab label="Evaluations ({{ evaluations().length }})">
              <div class="tab-body">
                @if (evaluations().length === 0) {
                  <p class="empty-text">No evaluations yet</p>
                } @else {
                  @for (eval of evaluations(); track eval.expertEmail) {
                    <mat-card appearance="outlined" class="eval-card">
                      <mat-card-content>
                        <div class="eval-header">
                          <span class="expert-name">{{ eval.expertEmail }}</span>
                          <mat-chip class="score-chip">{{ eval.score }}/100</mat-chip>
                        </div>
                        <p class="eval-comment">{{ eval.comment }}</p>
                      </mat-card-content>
                    </mat-card>
                  }
                  <div class="average-score">
                    <span class="label">Average Score:</span>
                    <span class="value">{{ averageScore() }}/100</span>
                  </div>
                }
              </div>
            </mat-tab>
          }

        </mat-tab-group>

      }
    </mat-dialog-content>

    <mat-dialog-actions>
      @if (data.canEvaluate && !hasEvaluated()) {
        <div class="evaluate-section">
          <h4>Your Evaluation</h4>
          <app-dynamic-form #evaluateForm [formConfig]="evaluateFields" />
          <div class="eval-actions">
            <button mat-flat-button color="primary" (click)="submitEvaluation()">
              Submit Evaluation
            </button>
            <button mat-button mat-dialog-close>Cancel</button>
          </div>
        </div>
      } @else {
        <button mat-button mat-dialog-close>Close</button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px 0;
    }

    h2 { display: flex; align-items: center; gap: 12px; margin: 0; }

    mat-dialog-content { min-height: 400px; max-height: 70vh; }

    .loading-center { display: flex; justify-content: center; padding: 80px; }
    .tab-body { padding: 24px 16px; }

    .motivation {
      white-space: pre-line;
      line-height: 1.6;
      color: rgba(0,0,0,.74);
    }

    h4 {
      font-size: 15px;
      font-weight: 600;
      margin: 16px 0 12px;
    }

    .artist-info { display: flex; flex-direction: column; gap: 12px; }
    .info-row { display: flex; gap: 16px; }
    .label { font-weight: 500; min-width: 100px; color: rgba(0,0,0,.54); }

    .works-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }

    .empty-text { color: rgba(0,0,0,.38); font-size: 14px; padding: 24px; text-align: center; }

    .eval-card { margin-bottom: 12px; }
    .eval-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .expert-name { font-weight: 500; }
    .score-chip { font-weight: 600; }
    .eval-comment { margin: 0; color: rgba(0,0,0,.6); font-size: 14px; }

    .average-score {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(0,0,0,.12);
      font-size: 16px;
    }
    .average-score .value { font-weight: 700; color: #7c4dff; }

    .evaluate-section {
      width: 100%;
      padding: 16px 0;
    }
    .eval-actions { display: flex; gap: 8px; margin-top: 16px; }
  `],
})
export class ApplicationDetailComponent implements OnInit {
  protected readonly data = inject<ApplicationDetailData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ApplicationDetailComponent>);
  private readonly artistService = inject(ArtistService);
  private readonly workService = inject(ArtistWorkService);
  private readonly achievementService = inject(ArtistAchievementService);
  private readonly applicationService = inject(ApplicationService);
  private readonly snackBar = inject(MatSnackBar);

  protected loading = signal(true);
  protected artistProfile = signal<ArtistProfileDto | null>(null);
  protected works = signal<WorkDto[]>([]);
  protected achievements = signal<AchievementDto[]>([]);
  protected evaluations = signal<ApplicationEvaluationDto[]>([]);
  protected hasEvaluated = signal(false);

  protected readonly evaluateFields = EVALUATE_FIELDS;
  protected readonly evaluateForm = viewChild<DynamicForm<ApplicationEvaluationCreateDto>>('evaluateForm');
  protected readonly formatDate = formatDate;

  protected averageScore = signal(0);

  ngOnInit() {
    this.loadArtistData();
    if (this.data.canViewEvaluations) {
      this.loadEvaluations();
    }
  }

  private loadArtistData() {
    const userId = this.data.application.userId!;

    // Load artist profile
    this.artistService.getArtistByUserId(userId).subscribe(profile => {
      this.artistProfile.set(profile);
    });

    // Load works
    this.workService.getWorksByArtistId(userId).subscribe(page => {
      this.works.set(page.content);
    });

    // Load achievements
    this.achievementService.getAchievementsByArtistId(userId).subscribe(page => {
      this.achievements.set(page.content);
      this.loading.set(false);
    });
  }

  private loadEvaluations() {
    this.applicationService.getApplicationReviews(this.data.application.id!).subscribe(page => {
      this.evaluations.set(page.content);
      if (page.content.length > 0) {
        const avg = page.content.reduce((sum, e) => sum + (e.score ?? 0), 0) / page.content.length;
        this.averageScore.set(Math.round(avg * 10) / 10);
      }
    });
  }

  submitEvaluation() {
    const form = this.evaluateForm();
    if (!form?.valid) {
      form?.markAllTouched();
      return;
    }

    this.applicationService.evaluateApplication(
      this.data.application.id!,
      form.values as ApplicationEvaluationCreateDto
    ).subscribe({
      next: () => {
        this.snackBar.open('Evaluation submitted', 'Close', { duration: 2000 });
        this.hasEvaluated.set(true);
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Failed to submit evaluation', 'Close', { duration: 3000 });
      },
    });
  }
}
