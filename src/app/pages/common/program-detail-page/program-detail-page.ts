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

import { PageHeaderComponent } from '../../../components/page-header.component';
import { EmptyStateComponent } from '../../../components/empty-state.component';
import {
  DynamicForm,
  type FieldConfig,
} from '../../../components/dynamic-form.component';

import { ProgramService } from '../../../services/program.service';
import { ReviewService } from '../../../services/review.service';
import { UserService } from '../../../services/user.service';
import type {
  ProgramDto,
  ReviewDto,
  ApplicationCreateDto,
  ReviewCreateDto,
  UserRole,
} from '../../../models';
import { formatDate, daysUntil } from '../../../formatters';
import { MatDialog } from '@angular/material/dialog';
import { ApplyDialogComponent } from '../../../components/apply-dialog.component';

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
  templateUrl: './program-detail-page.html',
  styleUrl: './program-detail-page.scss',
})
export class ProgramDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly programService = inject(ProgramService);
  private readonly reviewService = inject(ReviewService);
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected loading = signal(true);
  protected program = signal<ProgramDto | null>(null);
  protected reviews = signal<ReviewDto[]>([]);
  protected userRole = signal<UserRole | undefined>(undefined);
  protected programId = signal<number>(0);

  protected daysLeft = signal<number | null>(null);

  protected readonly applyFields = APPLY_FIELDS;
  protected readonly reviewFields = REVIEW_FIELDS;
  protected readonly formatDate = formatDate;

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

  openApplyDialog() {
    const program = this.program();
    if (!program) return;

    const ref = this.dialog.open(ApplyDialogComponent, {
      data: { program, fields: this.applyFields },
      disableClose: true,
    });

    ref.afterClosed().subscribe((values?: ApplicationCreateDto) => {
      if (!values) return;

      this.programService
        .createApplication(this.programId(), values)
        .subscribe({
          next: () => {
            this.snackBar.open('Application submitted!', 'Close', {
              duration: 3000,
            });
          },
          error: () =>
            this.snackBar.open('You cannot apply', 'Close', {
              duration: 3000,
            }),
        });
    });
  }
}
