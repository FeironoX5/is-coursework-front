// ============================================================
// admin-validation.page.ts — ROLE_SUPERADMIN validation requests
// ============================================================

import {
  Component,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';

import { PageHeaderComponent } from '../../components/page-header.component';
import { EmptyStateComponent } from '../../components/empty-state.component';
import {
  DynamicForm,
  type FieldConfig,
} from '../../components/dynamic-form.component';

import { AdminService } from '../../services/admin.service';
import type {
  ResidenceDetailsDto,
  ValidationActionDto,
} from '../../models';
import { formatDate } from '../../formatters';
import { StatusBadgeComponent } from '../../components/chip.components';

const REJECT_FIELDS: FieldConfig[] = [
  {
    type: 'input',
    propertyName: 'comment',
    displayName: 'Rejection Reason',
    dataType: 'text',
  },
];

@Component({
  selector: 'app-admin-validation-page',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatCardModule,
    MatExpansionModule,
    MatChipsModule,
    PageHeaderComponent,
    EmptyStateComponent,
    DynamicForm,
    StatusBadgeComponent,
  ],
  template: `
    <div class="page-container">
      <app-page-header title="Validation Requests" />

      @if (loading()) {
        <div class="loading-center">
          <mat-spinner />
        </div>
      } @else if (requests().length === 0) {
        <app-empty-state
          icon="verified"
          title="All clear!"
          message="No pending validation requests"
        />
      } @else {
        <mat-accordion>
          @for (r of requests(); track r.id) {
            <mat-expansion-panel class="request-panel">
              <mat-expansion-panel-header>
                <mat-panel-title
                  >{{ r.title ?? 'Unnamed Residence' }}
                </mat-panel-title>
                <mat-panel-description>
                  <span>{{ r.location }}</span>
                  <app-chip
                    [status]="
                      r.validation?.validationStatus ?? 'PENDING'
                    "
                  />
                </mat-panel-description>
              </mat-expansion-panel-header>

              <div class="detail-body">
                <!-- Info -->
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Submitted</span
                    ><span>{{
                      formatDate(r.validation?.validationSubmittedAt)
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Location</span
                    ><span>{{ r.location ?? '—' }}</span>
                  </div>
                  @if (r.contacts) {
                    <div class="info-item">
                      <span class="label">Contacts</span>
                      <span>
                        @for (
                          kv of objectEntries(r.contacts);
                          track kv[0]
                        ) {
                          <span class="contact-item"
                            >{{ kv[0] }}: {{ kv[1] }}</span
                          >
                        }
                      </span>
                    </div>
                  }
                </div>

                @if (r.description) {
                  <p class="description">{{ r.description }}</p>
                }

                <!-- Actions -->
                @if (r.validation?.validationStatus === 'PENDING') {
                  <div class="action-row">
                    <button
                      mat-flat-button
                      color="primary"
                      (click)="approve(r.id!)"
                    >
                      <mat-icon>check</mat-icon>
                      Approve
                    </button>
                    <button
                      mat-stroked-button
                      color="warn"
                      (click)="startReject(r)"
                    >
                      <mat-icon>close</mat-icon>
                      Reject
                    </button>
                  </div>

                  @if (rejectingId() === r.id) {
                    <mat-card
                      appearance="outlined"
                      class="reject-form-card"
                    >
                      <mat-card-content>
                        <app-dynamic-form
                          #rejectForm
                          [formConfig]="rejectFields"
                        />
                      </mat-card-content>
                      <mat-card-actions>
                        <button
                          mat-flat-button
                          color="warn"
                          (click)="submitReject(r.id!)"
                        >
                          Confirm Rejection
                        </button>
                        <button
                          mat-button
                          (click)="rejectingId.set(null)"
                        >
                          Cancel
                        </button>
                      </mat-card-actions>
                    </mat-card>
                  }
                } @else {
                  <p class="already-decided">
                    Decision:
                    <strong>{{
                      r.validation?.validationStatus
                    }}</strong>
                    @if (r.validation?.validationComment) {
                      — {{ r.validation!.validationComment }}
                    }
                  </p>
                }
              </div>
            </mat-expansion-panel>
          }
        </mat-accordion>

        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize"
          [pageIndex]="pageIndex()"
          (page)="onPage($event)"
        />
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

      .request-panel {
        margin-bottom: 8px;
      }

      mat-panel-description {
        display: flex;
        align-items: center;
        gap: 16px;
        justify-content: flex-end;
      }

      .detail-body {
        padding: 16px 0;
      }

      .info-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }
      .info-item {
        display: flex;
        gap: 16px;
        font-size: 14px;
      }
      .label {
        font-weight: 500;
        min-width: 100px;
      }
      .contact-item {
        display: block;
      }

      .description {
        font-size: 14px;
        margin: 0 0 16px;
      }

      .action-row {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .reject-form-card {
        margin-top: 16px;
        max-width: 480px;
      }

      .already-decided {
        font-size: 14px;
        margin: 8px 0 0;
      }
    `,
  ],
})
export class AdminValidationPage implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);

  protected loading = signal(true);
  protected requests = signal<ResidenceDetailsDto[]>([]);
  protected totalElements = signal(0);
  protected pageIndex = signal(0);
  protected rejectingId = signal<number | null>(null);
  protected readonly pageSize = 20;

  protected readonly rejectFields = REJECT_FIELDS;
  protected readonly rejectForm =
    viewChild<DynamicForm<ValidationActionDto>>('rejectForm');
  protected readonly formatDate = formatDate;

  ngOnInit() {
    this.loadPage();
  }

  private loadPage() {
    this.loading.set(true);
    this.adminService
      .getValidationRequests({
        page: this.pageIndex(),
        size: this.pageSize,
      })
      .subscribe((page) => {
        this.requests.set(page.content);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      });
  }

  onPage(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.loadPage();
  }

  approve(id: number) {
    this.adminService.approveValidationRequest(id).subscribe(() => {
      this.snackBar.open('Residence approved', 'Close', {
        duration: 2000,
      });
      this.requests.update((rs) =>
        rs.map((r) =>
          r.id === id
            ? {
                ...r,
                validation: {
                  ...r.validation,
                  validationStatus: 'APPROVED',
                },
              }
            : r
        )
      );
    });
  }

  startReject(r: ResidenceDetailsDto) {
    this.rejectingId.set(r.id!);
  }

  submitReject(id: number) {
    const form = this.rejectForm();
    this.adminService
      .rejectValidationRequest(
        id,
        (form?.values ?? {}) as ValidationActionDto
      )
      .subscribe(() => {
        this.snackBar.open('Residence rejected', 'Close', {
          duration: 2000,
        });
        this.rejectingId.set(null);
        this.requests.update((rs) =>
          rs.map((r) =>
            r.id === id
              ? {
                  ...r,
                  validation: {
                    ...r.validation,
                    validationStatus: 'REJECTED',
                  },
                }
              : r
          )
        );
      });
  }

  protected objectEntries(
    obj: Record<string, unknown>
  ): [string, unknown][] {
    return Object.entries(obj);
  }
}
