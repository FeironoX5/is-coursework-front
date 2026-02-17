// ============================================================
// applications.page.ts — @switch by role
// ============================================================

import {
  Component,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { Validators } from '@angular/forms';

import { PageHeaderComponent } from '../components/page-header.component';
import { StatusBadgeComponent } from '../components/status-badge.component';
import { EmptyStateComponent } from '../components/empty-state.component';
import {
  DynamicForm,
  type FieldConfig,
} from '../components/dynamic-form.component';

import { UserService } from '../services/user.service';
import { ArtistService } from '../services/artist.service';
import { ApplicationService } from '../services/application.service';
import type {
  ApplicationDto,
  ApplicationEvaluationCreateDto,
  UserDto,
} from '../models';
import { applicationStatusLabel, formatDate } from '../formatters';

const EVALUATE_FIELDS: FieldConfig[] = [
  {
    type: 'input',
    propertyName: 'score',
    displayName: 'Score (0–100)',
    dataType: 'number',
    validators: [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ],
  },
  {
    type: 'input',
    propertyName: 'comment',
    displayName: 'Comment',
    dataType: 'text',
    validators: [Validators.required],
  },
];

@Component({
  selector: 'app-applications-page',
  standalone: true,
  imports: [
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatCardModule,
    MatMenuModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    DynamicForm,
  ],
  template: `
    <div class="page-container">
      @switch (currentUser()?.role) {
        <!-- ── ARTIST — see their own applications ─────────── -->
        @case ('ROLE_ARTIST') {
          <app-page-header
            title="My Applications"
            subtitle="Track the status of your residency applications"
          />

          <mat-tab-group animationDuration="200ms">
            <mat-tab label="Active">
              <div class="tab-body">
                @if (loading()) {
                  <div class="loading-center"><mat-spinner /></div>
                } @else if (artistApplications().length === 0) {
                  <app-empty-state
                    icon="inbox"
                    title="No active applications"
                    message="Apply for a residency program to get started"
                  />
                } @else {
                  <table
                    mat-table
                    [dataSource]="artistApplications()"
                    class="full-table"
                  >
                    <ng-container matColumnDef="program">
                      <th mat-header-cell *matHeaderCellDef>
                        Program
                      </th>
                      <td mat-cell *matCellDef="let app">
                        Program #{{ app.programId }}
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>
                        Status
                      </th>
                      <td mat-cell *matCellDef="let app">
                        <app-status-badge [status]="app.status" />
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef></th>
                      <td mat-cell *matCellDef="let app">
                        @if (app.status === 'APPROVED') {
                          <button
                            mat-flat-button
                            color="primary"
                            (click)="confirmApplication(app.id)"
                          >
                            Confirm
                          </button>
                          <button
                            mat-button
                            color="warn"
                            (click)="declineApplication(app.id)"
                          >
                            Decline
                          </button>
                        }
                      </td>
                    </ng-container>
                    <tr
                      mat-header-row
                      *matHeaderRowDef="artistColumns"
                    ></tr>
                    <tr
                      mat-row
                      *matRowDef="let row; columns: artistColumns"
                    ></tr>
                  </table>
                }
              </div>
            </mat-tab>

            <mat-tab label="History">
              <div class="tab-body">
                @if (loading()) {
                  <div class="loading-center"><mat-spinner /></div>
                } @else if (artistHistory().length === 0) {
                  <app-empty-state
                    icon="history"
                    title="No history yet"
                  />
                } @else {
                  <table
                    mat-table
                    [dataSource]="artistHistory()"
                    class="full-table"
                  >
                    <ng-container matColumnDef="program">
                      <th mat-header-cell *matHeaderCellDef>
                        Program
                      </th>
                      <td mat-cell *matCellDef="let app">
                        Program #{{ app.programId }}
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>
                        Status
                      </th>
                      <td mat-cell *matCellDef="let app">
                        <app-status-badge [status]="app.status" />
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef></th>
                      <td mat-cell *matCellDef="let app"></td>
                    </ng-container>
                    <tr
                      mat-header-row
                      *matHeaderRowDef="artistColumns"
                    ></tr>
                    <tr
                      mat-row
                      *matRowDef="let row; columns: artistColumns"
                    ></tr>
                  </table>
                }
              </div>
            </mat-tab>
          </mat-tab-group>
        }

        <!-- ── EXPERT — evaluate applications ──────────────── -->
        @case ('ROLE_EXPERT') {
          <app-page-header
            title="Applications to Review"
            subtitle="Evaluate submitted applications for your programs"
          />

          @if (loading()) {
            <div class="loading-center"><mat-spinner /></div>
          } @else if (expertApplications().length === 0) {
            <app-empty-state
              icon="rate_review"
              title="Nothing to review"
              message="No unreviewed applications assigned to you"
            />
          } @else {
            <table
              mat-table
              [dataSource]="expertApplications()"
              class="full-table"
            >
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let app">{{ app.id }}</td>
              </ng-container>
              <ng-container matColumnDef="program">
                <th mat-header-cell *matHeaderCellDef>Program</th>
                <td mat-cell *matCellDef="let app">
                  Program #{{ app.programId }}
                </td>
              </ng-container>
              <ng-container matColumnDef="motivation">
                <th mat-header-cell *matHeaderCellDef>Motivation</th>
                <td
                  mat-cell
                  *matCellDef="let app"
                  class="motivation-cell"
                >
                  {{ app.motivation }}
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let app">
                  <app-status-badge [status]="app.status" />
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let app">
                  <button
                    mat-icon-button
                    [matMenuTriggerFor]="menu"
                    aria-label="Actions"
                  >
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu>
                    <button
                      mat-menu-item
                      (click)="openEvaluatePanel(app)"
                    >
                      <mat-icon>rate_review</mat-icon> Evaluate
                    </button>
                  </mat-menu>
                </td>
              </ng-container>
              <tr
                mat-header-row
                *matHeaderRowDef="expertColumns"
              ></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: expertColumns"
              ></tr>
            </table>
          }

          <!-- Evaluation inline panel -->
          @if (evaluatingApp() !== null) {
            <div class="dialog-overlay" (click)="cancelEvaluate()">
              <mat-card
                class="eval-dialog"
                (click)="$event.stopPropagation()"
              >
                <mat-card-header>
                  <mat-card-title
                    >Evaluate Application #{{
                      evaluatingApp()!.id
                    }}</mat-card-title
                  >
                </mat-card-header>
                <mat-card-content>
                  <app-dynamic-form
                    #evaluateForm
                    [formConfig]="evaluateFields"
                  />
                </mat-card-content>
                <mat-card-actions>
                  <button
                    mat-flat-button
                    color="primary"
                    (click)="submitEvaluation()"
                  >
                    Submit
                  </button>
                  <button mat-button (click)="cancelEvaluate()">
                    Cancel
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          }
        }

        <!-- ── RESIDENCE ADMIN — manage applications ────────── -->
        @case ('ROLE_RESIDENCE_ADMIN') {
          <app-page-header
            title="Program Applications"
            subtitle="Review and manage all applications across your programs"
          />

          <mat-tab-group animationDuration="200ms">
            <mat-tab label="Pending">
              <div class="tab-body">
                <ng-container
                  *ngTemplateOutlet="
                    adminAppTable;
                    context: {
                      apps: adminPendingApps(),
                      showActions: true,
                    }
                  "
                />
              </div>
            </mat-tab>
            <mat-tab label="Evaluated">
              <div class="tab-body">
                <ng-container
                  *ngTemplateOutlet="
                    adminAppTable;
                    context: {
                      apps: adminEvaluatedApps(),
                      showActions: false,
                    }
                  "
                />
              </div>
            </mat-tab>
          </mat-tab-group>

          <ng-template
            #adminAppTable
            let-apps="apps"
            let-showActions="showActions"
          >
            @if (loading()) {
              <div class="loading-center"><mat-spinner /></div>
            } @else if (apps.length === 0) {
              <app-empty-state icon="inbox" title="No applications" />
            } @else {
              <table mat-table [dataSource]="apps" class="full-table">
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef>#</th>
                  <td mat-cell *matCellDef="let app">{{ app.id }}</td>
                </ng-container>
                <ng-container matColumnDef="program">
                  <th mat-header-cell *matHeaderCellDef>Program</th>
                  <td mat-cell *matCellDef="let app">
                    Program #{{ app.programId }}
                  </td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let app">
                    <app-status-badge [status]="app.status" />
                  </td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let app">
                    @if (showActions) {
                      <button
                        mat-icon-button
                        [matMenuTriggerFor]="adminMenu"
                        aria-label="Actions"
                      >
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #adminMenu>
                        <button
                          mat-menu-item
                          (click)="approveApp(app.id)"
                        >
                          <mat-icon>check</mat-icon> Approve
                        </button>
                        <button
                          mat-menu-item
                          (click)="reserveApp(app.id)"
                        >
                          <mat-icon>bookmark</mat-icon> Reserve
                        </button>
                        <button
                          mat-menu-item
                          (click)="rejectApp(app.id)"
                        >
                          <mat-icon>close</mat-icon> Reject
                        </button>
                      </mat-menu>
                    }
                  </td>
                </ng-container>
                <tr
                  mat-header-row
                  *matHeaderRowDef="adminColumns"
                ></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: adminColumns"
                ></tr>
              </table>
            }
          </ng-template>
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
      .tab-body {
        padding: 24px 0;
      }
      .full-table {
        width: 100%;
      }
      .motivation-cell {
        max-width: 240px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
      .eval-dialog {
        width: 100%;
        max-width: 440px;
        margin: 24px;
      }
    `,
  ],
})
export class ApplicationsPage implements OnInit {
  private readonly userService = inject(UserService);
  private readonly artistService = inject(ArtistService);
  private readonly applicationService = inject(ApplicationService);
  private readonly snackBar = inject(MatSnackBar);

  protected loading = signal(true);
  protected currentUser = signal<UserDto | null>(null);

  // artist
  protected artistApplications = signal<ApplicationDto[]>([]);
  protected artistHistory = signal<ApplicationDto[]>([]);
  // expert
  protected expertApplications = signal<ApplicationDto[]>([]);
  protected evaluatingApp = signal<ApplicationDto | null>(null);
  // admin
  protected adminPendingApps = signal<ApplicationDto[]>([]);
  protected adminEvaluatedApps = signal<ApplicationDto[]>([]);

  readonly artistColumns = ['program', 'status', 'actions'];
  readonly expertColumns = [
    'id',
    'program',
    'motivation',
    'status',
    'actions',
  ];
  readonly adminColumns = ['id', 'program', 'status', 'actions'];

  readonly evaluateFields = EVALUATE_FIELDS;
  protected readonly evaluateForm =
    viewChild<DynamicForm<ApplicationEvaluationCreateDto>>(
      'evaluateForm'
    );

  ngOnInit() {
    this.userService.getCurrentUser().subscribe((user) => {
      this.currentUser.set(user);
      this.loadByRole(user.role);
    });
  }

  private loadByRole(role?: string) {
    this.loading.set(true);
    if (role === 'ROLE_ARTIST') {
      this.artistService.getMyApplications().subscribe((p) => {
        this.artistApplications.set(p.content);
        this.loading.set(false);
      });
      this.artistService
        .getAllMyApplications()
        .subscribe((p) => this.artistHistory.set(p.content));
    }
    if (role === 'ROLE_EXPERT') {
      // Expert sees unevaluated apps — need a program context; show generic list here
      this.applicationService
        .getUnevaluatedApplications(0)
        .subscribe((p) => {
          this.expertApplications.set(p.content);
          this.loading.set(false);
        });
    }
    if (role === 'ROLE_RESIDENCE_ADMIN') {
      this.applicationService
        .getUnevaluatedApplications(0)
        .subscribe((p) => {
          this.adminPendingApps.set(p.content);
          this.loading.set(false);
        });
      this.applicationService
        .getEvaluatedApplications(0)
        .subscribe((p) => this.adminEvaluatedApps.set(p.content));
    }
  }

  // Artist actions
  confirmApplication(id: number) {
    this.artistService.confirmMyApplication(id).subscribe(() => {
      this.snackBar.open('Confirmed!', 'Close', { duration: 2000 });
      this.artistApplications.update((as) =>
        as.map((a) =>
          a.id === id ? { ...a, status: 'CONFIRMED' } : a
        )
      );
    });
  }

  declineApplication(id: number) {
    this.artistService.declineMyApplication(id).subscribe(() => {
      this.snackBar.open('Declined', 'Close', { duration: 2000 });
      this.artistApplications.update((as) =>
        as.filter((a) => a.id !== id)
      );
    });
  }

  // Expert actions
  openEvaluatePanel(app: ApplicationDto) {
    this.evaluatingApp.set(app);
  }
  cancelEvaluate() {
    this.evaluatingApp.set(null);
  }

  submitEvaluation() {
    const form = this.evaluateForm();
    if (!form?.valid) {
      form?.markAllTouched();
      return;
    }
    this.applicationService
      .evaluateApplication(
        this.evaluatingApp()!.id!,
        form.values as ApplicationEvaluationCreateDto
      )
      .subscribe(() => {
        this.snackBar.open('Evaluation saved', 'Close', {
          duration: 2000,
        });
        this.cancelEvaluate();
      });
  }

  // Admin actions
  approveApp(id: number) {
    this.applicationService.approveApplication(id).subscribe(() => {
      this.snackBar.open('Approved', 'Close', { duration: 2000 });
      this.adminPendingApps.update((as) =>
        as.filter((a) => a.id !== id)
      );
    });
  }

  reserveApp(id: number) {
    this.applicationService.reserveApplication(id).subscribe(() => {
      this.snackBar.open('Added to reserve list', 'Close', {
        duration: 2000,
      });
    });
  }

  rejectApp(id: number) {
    this.applicationService.rejectApplication(id).subscribe(() => {
      this.snackBar.open('Rejected', 'Close', { duration: 2000 });
      this.adminPendingApps.update((as) =>
        as.filter((a) => a.id !== id)
      );
    });
  }
}
