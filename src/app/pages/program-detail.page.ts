// ============================================================
// program-detail.page.ts — Single program view (public)
// ============================================================

import {
  Component,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Validators } from '@angular/forms';

import { PageHeaderComponent } from '../components/page-header.component';
import { EmptyStateComponent } from '../components/empty-state.component';
import {
  DynamicForm,
  type FieldConfig,
} from '../components/dynamic-form.component';

import { ProgramService } from '../services/program.service';
import { ReviewService } from '../services/review.service';
import { UserService } from '../services/user.service';
import type {
  ProgramDto,
  ReviewDto,
  ApplicationCreateDto,
  ReviewCreateDto,
  UserRole,
} from '../models';
import { formatDate, daysUntil } from '../formatters';

const APPLY_FIELDS: FieldConfig[] = [
  {
    type: 'input',
    propertyName: 'motivation',
    displayName: 'Motivation Letter',
    dataType: 'text',
    validators: [Validators.required, Validators.minLength(10)],
  },
];

const REVIEW_FIELDS: FieldConfig[] = [
  {
    type: 'input',
    propertyName: 'score',
    displayName: 'Score (1–10)',
    dataType: 'number',
    validators: [
      Validators.required,
      Validators.min(1),
      Validators.max(10),
    ],
  },
  {
    type: 'input',
    propertyName: 'comment',
    displayName: 'Your Review',
    dataType: 'text',
  },
];

@Component({
  selector: 'app-program-detail-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    PageHeaderComponent,
    EmptyStateComponent,
    DynamicForm,
  ],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div class="loading-center"><mat-spinner /></div>
      } @else if (!program()) {
        <app-empty-state icon="error" title="Program not found" />
      } @else {
        <app-page-header
          [title]="program()!.previewDto?.title ?? 'Program'"
          [subtitle]="
            'Residence #' + program()!.previewDto?.residenceId
          "
        >
          <!-- role-based action button -->
          @switch (userRole()) {
            @case ('ROLE_ARTIST') {
              <button
                mat-flat-button
                color="primary"
                [disabled]="(daysLeft() ?? -1) <= 0"
                (click)="showApply.set(true)"
              >
                Apply Now
              </button>
            }
            @case ('ROLE_RESIDENCE_ADMIN') {
              <button
                mat-stroked-button
                (click)="
                  router.navigate([
                    '/residences/me/programs',
                    programId(),
                  ])
                "
              >
                <mat-icon>edit</mat-icon> Manage
              </button>
            }
          }
        </app-page-header>

        <!-- Deadline chip row -->
        <div class="chips-row">
          <mat-chip [class.urgent]="(daysLeft() ?? 999) <= 7">
            <mat-icon>schedule</mat-icon>
            Apply by
            {{ formatDate(program()!.previewDto?.deadlineApply) }}
            @if (daysLeft() !== null && daysLeft()! >= 0) {
              · {{ daysLeft() }} days left
            } @else {
              · Closed
            }
          </mat-chip>
          @if (program()!.durationDays) {
            <mat-chip
              ><mat-icon>event</mat-icon>
              {{ program()!.durationDays }} days residency</mat-chip
            >
          }
          @if (program()!.budgetQuota) {
            <mat-chip
              ><mat-icon>payments</mat-icon> €{{
                program()!.budgetQuota?.toLocaleString()
              }}</mat-chip
            >
          }
          @if (program()!.peopleQuota) {
            <mat-chip
              ><mat-icon>people</mat-icon>
              {{ program()!.peopleQuota }} spots</mat-chip
            >
          }
        </div>

        <mat-tab-group animationDuration="200ms" class="detail-tabs">
          <!-- About -->
          <mat-tab label="About">
            <div class="tab-body">
              @if (program()!.description) {
                <p class="description">
                  {{ program()!.description }}
                </p>
              }

              @if (
                program()!.goals && hasEntries(program()!.goals!)
              ) {
                <h4>Goals</h4>
                <mat-list>
                  @for (
                    kv of objectEntries(program()!.goals!);
                    track kv[0]
                  ) {
                    <mat-list-item>
                      <mat-icon matListItemIcon>arrow_right</mat-icon>
                      <span matListItemTitle>{{ kv[1] }}</span>
                    </mat-list-item>
                  }
                </mat-list>
              }

              @if (
                program()!.conditions &&
                hasEntries(program()!.conditions!)
              ) {
                <h4>Conditions</h4>
                <mat-list>
                  @for (
                    kv of objectEntries(program()!.conditions!);
                    track kv[0]
                  ) {
                    <mat-list-item>
                      <mat-icon matListItemIcon>check</mat-icon>
                      <span matListItemTitle>{{ kv[0] }}</span>
                      <span matListItemLine>{{ kv[1] }}</span>
                    </mat-list-item>
                  }
                </mat-list>
              }
            </div>
          </mat-tab>

          <!-- Reviews -->
          <mat-tab label="Reviews ({{ reviews().length }})">
            <div class="tab-body">
              @if (
                userRole() === 'ROLE_ARTIST' && (daysLeft() ?? -1) < 0
              ) {
                <div class="leave-review">
                  <h4>Leave a review</h4>
                  <app-dynamic-form
                    #reviewForm
                    [formConfig]="reviewFields"
                  />
                  <button
                    mat-flat-button
                    color="primary"
                    (click)="submitReview()"
                  >
                    Submit Review
                  </button>
                </div>
                <mat-divider />
              }

              @if (reviews().length === 0) {
                <app-empty-state
                  icon="star_outline"
                  title="No reviews yet"
                />
              } @else {
                <mat-list>
                  @for (r of reviews(); track r.id) {
                    <mat-list-item class="review-item">
                      <mat-icon matListItemIcon>person</mat-icon>
                      <span matListItemTitle>{{ r.artistName }}</span>
                      <span matListItemLine>
                        <span class="stars"
                          >{{ '★'.repeat(r.score ?? 0)
                          }}{{
                            '☆'.repeat(10 - (r.score ?? 0))
                          }}</span
                        >
                        {{ r.comment }}
                      </span>
                    </mat-list-item>
                    <mat-divider />
                  }
                </mat-list>
              }
            </div>
          </mat-tab>
        </mat-tab-group>

        <!-- Apply Overlay -->
        @if (showApply()) {
          <div class="dialog-overlay" (click)="showApply.set(false)">
            <mat-card
              class="apply-dialog"
              (click)="$event.stopPropagation()"
            >
              <mat-card-header>
                <mat-card-title
                  >Apply for
                  {{ program()!.previewDto?.title }}</mat-card-title
                >
              </mat-card-header>
              <mat-card-content>
                <app-dynamic-form
                  #applyForm
                  [formConfig]="applyFields"
                />
              </mat-card-content>
              <mat-card-actions>
                <button
                  mat-flat-button
                  color="primary"
                  (click)="submitApplication()"
                >
                  Submit
                </button>
                <button mat-button (click)="showApply.set(false)">
                  Cancel
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 32px;
        max-width: 900px;
        margin: 0 auto;
      }
      .loading-center {
        display: flex;
        justify-content: center;
        padding: 80px;
      }

      .chips-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 24px;
      }

      .detail-tabs {
        margin-top: 8px;
      }
      .tab-body {
        padding: 24px 0;
      }

      .description {
        font-size: 15px;
        line-height: 1.7;
        color: rgba(0, 0, 0, 0.74);
        white-space: pre-line;
      }

      h4 {
        font-size: 15px;
        font-weight: 600;
        margin: 24px 0 8px;
      }

      .leave-review {
        margin-bottom: 24px;
        max-width: 480px;
      }

      .review-item {
        height: auto !important;
        padding: 12px 0;
      }
      .stars {
        color: #f9a825;
        letter-spacing: 2px;
        margin-right: 8px;
      }

      .dialog-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .apply-dialog {
        width: 100%;
        max-width: 480px;
        margin: 24px;
      }

      mat-chip.urgent {
        background: #fff3e0 !important;
        color: #e65100 !important;
      }
    `,
  ],
})
export class ProgramDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly programService = inject(ProgramService);
  private readonly reviewService = inject(ReviewService);
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly router = inject(Router);

  protected loading = signal(true);
  protected program = signal<ProgramDto | null>(null);
  protected reviews = signal<ReviewDto[]>([]);
  protected userRole = signal<UserRole | undefined>(undefined);
  protected showApply = signal(false);
  protected programId = signal<number>(0);

  protected daysLeft = signal<number | null>(null);

  protected readonly applyFields = APPLY_FIELDS;
  protected readonly reviewFields = REVIEW_FIELDS;
  protected readonly formatDate = formatDate;

  protected readonly applyForm =
    viewChild<DynamicForm<ApplicationCreateDto>>('applyForm');
  protected readonly reviewForm =
    viewChild<DynamicForm<ReviewCreateDto>>('reviewForm');

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.programId.set(id);

    this.userService
      .getCurrentUser()
      .subscribe((u) => this.userRole.set(u.role));

    this.programService.getProgramById(id).subscribe((p) => {
      this.program.set(p);
      this.daysLeft.set(daysUntil(p.previewDto?.deadlineApply));
      this.loading.set(false);
    });

    this.reviewService
      .getReviews(id)
      .subscribe((page) => this.reviews.set(page.content));
  }

  submitApplication() {
    const form = this.applyForm();
    if (!form?.valid) {
      form?.markAllTouched();
      return;
    }
    this.programService
      .createApplication(
        this.programId(),
        form.values as ApplicationCreateDto
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Application submitted!', 'Close', {
            duration: 3000,
          });
          this.showApply.set(false);
        },
        error: () =>
          this.snackBar.open('Failed to submit', 'Close', {
            duration: 3000,
          }),
      });
  }

  submitReview() {
    const form = this.reviewForm();
    if (!form?.valid) {
      form?.markAllTouched();
      return;
    }
    this.reviewService
      .createReview(this.programId(), form.values as ReviewCreateDto)
      .subscribe((r) => {
        this.reviews.update((rs) => [r, ...rs]);
        this.snackBar.open('Review submitted!', 'Close', {
          duration: 2000,
        });
      });
  }

  protected objectEntries(
    obj: Record<string, unknown>
  ): [string, unknown][] {
    return Object.entries(obj);
  }

  protected hasEntries(obj: Record<string, unknown>): boolean {
    return Object.keys(obj).length > 0;
  }
}
