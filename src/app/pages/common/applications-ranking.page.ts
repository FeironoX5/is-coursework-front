// ============================================================
// applications-ranking.page.ts — Ranking & selection (F10)
// ============================================================

import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';

import { PageHeaderComponent } from '../../components/page-header.component';
import { EmptyStateComponent } from '../../components/empty-state.component';

import { ResidenceProgramService } from '../../services/residence-program.service';
import { ApplicationService } from '../../services/application.service';
import type {
  ProgramDto,
  ApplicationDto,
  ApplicationEvaluationDto,
} from '../../models';
import { StatusBadgeComponent } from '../../components/chip.components';
import {
  ApplicationDetailComponent,
  ApplicationDetailData,
} from './application-detail.component';

interface RankedApplication {
  application: ApplicationDto;
  averageScore: number;
  evaluations: ApplicationEvaluationDto[];
}

@Component({
  selector: 'app-applications-ranking-page',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    PageHeaderComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div class="loading-center"><mat-spinner /></div>
      } @else if (program()) {
        <app-page-header
          [title]="
            'Applications Ranking: ' + program()!.previewDto?.title
          "
        >
          <button
            mat-button
            (click)="
              router.navigate([
                '/ROLE_RESIDENCE_ADMIN/my_programs',
                programId(),
              ])
            "
          >
            <mat-icon>arrow_back</mat-icon> Back
          </button>
        </app-page-header>

        <!-- Quota Info -->
        <mat-card appearance="outlined" class="quota-card">
          <mat-card-content>
            <div class="quota-row">
              <div class="quota-item">
                <span class="quota-label">Available Places</span>
                <span class="quota-value">{{
                  program()!.peopleQuota ?? '—'
                }}</span>
              </div>
              <div class="quota-item">
                <span class="quota-label">Budget</span>
                <span class="quota-value"
                  >€{{
                    program()!.budgetQuota?.toLocaleString() ?? '—'
                  }}</span
                >
              </div>
              <div class="quota-item">
                <span class="quota-label">Selected</span>
                <span class="quota-value highlight">{{
                  selection.selected.length
                }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Ranking Table -->
        @if (rankedApps().length === 0) {
          <app-empty-state
            icon="inbox"
            title="No evaluated applications"
            message="Applications will appear here after experts complete their evaluations"
          />
        } @else {
          <table
            mat-table
            [dataSource]="rankedApps()"
            class="ranking-table"
          >
            <!-- Checkbox Column -->
            <ng-container matColumnDef="select">
              <th mat-header-cell *matHeaderCellDef>
                <mat-checkbox
                  (change)="$event ? masterToggle() : null"
                  [checked]="selection.hasValue() && isAllSelected()"
                  [indeterminate]="
                    selection.hasValue() && !isAllSelected()
                  "
                />
              </th>
              <td mat-cell *matCellDef="let row">
                <mat-checkbox
                  (click)="$event.stopPropagation()"
                  (change)="$event ? selection.toggle(row) : null"
                  [checked]="selection.isSelected(row)"
                />
              </td>
            </ng-container>

            <!-- Rank Column -->
            <ng-container matColumnDef="rank">
              <th mat-header-cell *matHeaderCellDef>Rank</th>
              <td
                mat-cell
                *matCellDef="let row; let i = index"
                class="rank-cell"
              >
                #{{ i + 1 }}
              </td>
            </ng-container>

            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>App ID</th>
              <td mat-cell *matCellDef="let row">
                {{ row.application.id }}
              </td>
            </ng-container>

            <!-- Score Column -->
            <ng-container matColumnDef="score">
              <th mat-header-cell *matHeaderCellDef>Avg Score</th>
              <td mat-cell *matCellDef="let row" class="score-cell">
                <span class="score-badge">{{
                  row.averageScore
                }}</span>
              </td>
            </ng-container>

            <!-- Evaluations Column -->
            <ng-container matColumnDef="evaluations">
              <th mat-header-cell *matHeaderCellDef>Evaluations</th>
              <td mat-cell *matCellDef="let row">
                {{ row.evaluations.length }} expert(s)
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <app-chip [status]="row.application.status!" />
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button
                  mat-icon-button
                  (click)="viewDetails(row)"
                  aria-label="View details"
                >
                  <mat-icon>visibility</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: columns"
              class="ranking-row"
            ></tr>
          </table>

          <!-- Selection Actions -->
          @if (selection.selected.length > 0) {
            <div class="selection-actions">
              <mat-card appearance="outlined">
                <mat-card-content class="actions-content">
                  <span class="selection-text"
                    >{{ selection.selected.length }} selected</span
                  >
                  <div class="action-buttons">
                    <button
                      mat-flat-button
                      color="primary"
                      (click)="approveSelected()"
                    >
                      <mat-icon>check</mat-icon> Approve Selected
                    </button>
                    <button
                      mat-stroked-button
                      (click)="reserveSelected()"
                    >
                      <mat-icon>bookmark</mat-icon> Move to Reserve
                    </button>
                    <button
                      mat-stroked-button
                      color="warn"
                      (click)="rejectSelected()"
                    >
                      <mat-icon>close</mat-icon> Reject Selected
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          }
        }
      }
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 32px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .loading-center {
        display: flex;
        justify-content: center;
        padding: 80px;
      }

      .quota-card {
        margin-bottom: 24px;
      }
      .quota-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 24px;
      }
      .quota-item {
        text-align: center;
      }
      .quota-label {
        display: block;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.54);
        margin-bottom: 4px;
      }
      .quota-value {
        display: block;
        font-size: 24px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.87);
      }
      .quota-value.highlight {
        color: #7c4dff;
      }

      .ranking-table {
        width: 100%;
        background: white;
        border-radius: 4px;
      }

      .ranking-row {
        cursor: pointer;
        transition: background 0.15s;
        &:hover {
          background: rgba(0, 0, 0, 0.02);
        }
      }

      .rank-cell {
        font-weight: 700;
        color: rgba(0, 0, 0, 0.54);
      }

      .score-cell {
        font-weight: 600;
      }
      .score-badge {
        display: inline-block;
        padding: 4px 12px;
        background: #e8f5e9;
        color: #2e7d32;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 700;
      }

      .selection-actions {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 100;
        min-width: 600px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      }

      .actions-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px !important;
      }

      .selection-text {
        font-weight: 600;
      }
      .action-buttons {
        display: flex;
        gap: 8px;
      }
    `,
  ],
})
export class ApplicationsRankingPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  private readonly programService = inject(ResidenceProgramService);
  private readonly applicationService = inject(ApplicationService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  protected loading = signal(true);
  protected programId = signal(0);
  protected program = signal<ProgramDto | null>(null);
  protected rankedApps = signal<RankedApplication[]>([]);

  readonly columns = [
    'select',
    'rank',
    'id',
    'score',
    'evaluations',
    'status',
    'actions',
  ];
  readonly selection = new SelectionModel<RankedApplication>(
    true,
    []
  );

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.programId.set(id);
    this.loadProgram(id);
    this.loadRanking(id);
  }

  private loadProgram(id: number) {
    this.programService.getProgramById(id).subscribe({
      next: (p) => this.program.set(p),
      error: () => {
        this.snackBar.open('Program not found', 'Close', {
          duration: 3000,
        });
        this.router.navigate(['/ROLE_RESIDENCE_ADMIN/my_programs']);
      },
    });
  }

  private loadRanking(programId: number) {
    this.loading.set(true);
    this.applicationService
      .getEvaluatedApplications(programId)
      .subscribe(async (page) => {
        // For each application, fetch evaluations and calculate average
        const ranked: RankedApplication[] = [];

        for (const app of page.content) {
          const evals = await this.applicationService
            .getApplicationReviews(app.id!)
            .toPromise();
          const evaluations = evals?.content ?? [];
          const avgScore =
            evaluations.length > 0
              ? evaluations.reduce(
                  (sum, e) => sum + (e.score ?? 0),
                  0
                ) / evaluations.length
              : 0;

          ranked.push({
            application: app,
            averageScore: Math.round(avgScore * 10) / 10,
            evaluations,
          });
        }

        // Sort by average score descending
        ranked.sort((a, b) => b.averageScore - a.averageScore);
        this.rankedApps.set(ranked);
        this.loading.set(false);
      });
  }

  viewDetails(row: RankedApplication) {
    this.dialog.open(ApplicationDetailComponent, {
      width: '900px',
      maxHeight: '90vh',
      data: {
        application: row.application,
        canViewEvaluations: true,
      } as ApplicationDetailData,
    });
  }

  isAllSelected(): boolean {
    return (
      this.selection.selected.length === this.rankedApps().length
    );
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.rankedApps().forEach((row) => this.selection.select(row));
    }
  }

  approveSelected() {
    const quota = this.program()?.peopleQuota;
    if (quota && this.selection.selected.length > quota) {
      if (
        !confirm(
          `You selected ${this.selection.selected.length} artists but quota is ${quota}. Continue?`
        )
      ) {
        return;
      }
    }

    this.processSelection('approve');
  }

  reserveSelected() {
    this.processSelection('reserve');
  }

  rejectSelected() {
    if (
      !confirm(
        `Reject ${this.selection.selected.length} applications?`
      )
    )
      return;
    this.processSelection('reject');
  }

  private processSelection(action: 'approve' | 'reserve' | 'reject') {
    const ids = this.selection.selected.map((r) => r.application.id!);
    const apiCall =
      action === 'approve'
        ? (id: number) =>
            this.applicationService.approveApplication(id)
        : action === 'reserve'
          ? (id: number) =>
              this.applicationService.reserveApplication(id)
          : (id: number) =>
              this.applicationService.rejectApplication(id);

    let completed = 0;
    ids.forEach((id) => {
      apiCall(id).subscribe({
        next: () => {
          completed++;
          if (completed === ids.length) {
            this.snackBar.open(
              `${ids.length} applications ${action}d`,
              'Close',
              { duration: 2000 }
            );
            this.selection.clear();
            this.loadRanking(this.programId());
          }
        },
      });
    });
  }
}
