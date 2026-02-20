// ============================================================
// residence-programs.page.ts — ROLE_RESIDENCE_ADMIN program management
// ============================================================

import {
  Component,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Validators } from '@angular/forms';
import {
  DynamicForm,
  FieldConfig,
} from '../../components/dynamic-form.component';
import { PageHeaderComponent } from '../../components/page-header.component';
import { EmptyStateComponent } from '../../components/empty-state.component';
import { ProgramCreateDto, ProgramPreviewDto } from '../../models';
import { ResidenceProgramService } from '../../services/residence-program.service';
import { formatDate } from '../../formatters';

const CREATE_PROGRAM_FIELDS: FieldConfig[] = [
  {
    type: 'input',
    propertyName: 'title',
    displayName: 'Program Title',
    dataType: 'text',
    validators: [Validators.required],
  },
  {
    type: 'input',
    propertyName: 'description',
    displayName: 'Description',
    dataType: 'text',
  },
  {
    type: 'input',
    propertyName: 'deadlineApply',
    displayName: 'Apply Deadline',
    dataType: 'date',
    validators: [Validators.required],
  },
  {
    type: 'input',
    propertyName: 'deadlineReview',
    displayName: 'Review Deadline',
    dataType: 'date',
    validators: [Validators.required],
  },
  {
    type: 'input',
    propertyName: 'deadlineNotify',
    displayName: 'Notify Deadline',
    dataType: 'date',
    validators: [Validators.required],
  },
  {
    type: 'input',
    propertyName: 'durationDays',
    displayName: 'Duration (days)',
    dataType: 'number',
  },
  {
    type: 'input',
    propertyName: 'budgetQuota',
    displayName: 'Budget (€)',
    dataType: 'number',
  },
  {
    type: 'input',
    propertyName: 'peopleQuota',
    displayName: 'Max Participants',
    dataType: 'number',
  },
];

@Component({
  selector: 'app-residence-programs-page',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatCardModule,
    MatChipsModule,
    PageHeaderComponent,
    EmptyStateComponent,
    DynamicForm,
  ],
  template: `
    <div class="page-container">
      <app-page-header title="My Programs">
        <button
          mat-flat-button
          color="primary"
          (click)="showCreate.set(!showCreate())"
        >
          <mat-icon>add</mat-icon>
          New Program
        </button>
      </app-page-header>

      <!-- Create form panel -->
      @if (showCreate()) {
        <mat-card appearance="outlined" class="create-card">
          <mat-card-header>
            <mat-card-title>New Program</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-dynamic-form
              #createForm
              [formConfig]="createFields"
            />
          </mat-card-content>
          <mat-card-actions>
            <button
              mat-flat-button
              color="primary"
              (click)="createProgram()"
            >
              Create
            </button>
            <button mat-button (click)="showCreate.set(false)">
              Cancel
            </button>
          </mat-card-actions>
        </mat-card>
      }

      @if (loading()) {
        <div class="loading-center">
          <mat-spinner />
        </div>
      } @else if (programs().length === 0) {
        <app-empty-state
          icon="event"
          title="No programs yet"
          message="Create your first open call to start receiving applications"
        />
      } @else {
        <table mat-table [dataSource]="programs()" class="full-table">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Title</th>
            <td mat-cell *matCellDef="let p" class="title-cell">
              {{ p.title }}
            </td>
          </ng-container>

          <ng-container matColumnDef="deadline">
            <th mat-header-cell *matHeaderCellDef>Apply Deadline</th>
            <td mat-cell *matCellDef="let p">
              {{ formatDate(p.deadlineApply) }}
            </td>
          </ng-container>

          <ng-container matColumnDef="published">
            <th mat-header-cell *matHeaderCellDef>Published</th>
            <td mat-cell *matCellDef="let p">
              <mat-slide-toggle
                [checked]="publishedIds().has(p.id!)"
                [disabled]="isPublishing(p.id)"
                color="primary"
                (change)="togglePublish(p, $event.checked)"
              />
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let p">
              <button
                mat-icon-button
                (click)="
                  router.navigate([p.id], { relativeTo: route })
                "
                aria-label="Edit"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                (click)="router.navigate(['/programs', p.id])"
                aria-label="Preview"
              >
                <mat-icon>visibility</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      }
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 32px;
        max-width: 1000px;
        margin: 0 auto;
      }
      .loading-center {
        display: flex;
        justify-content: center;
        padding: 80px;
      }
      .create-card {
        margin-bottom: 32px;
        max-width: 680px;
      }
      .full-table {
        width: 100%;
      }
      .title-cell {
        font-weight: 500;
      }
    `,
  ],
})
export class ResidenceProgramsPage implements OnInit {
  private readonly programSvc = inject(ResidenceProgramService);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);

  protected loading = signal(true);
  protected programs = signal<ProgramPreviewDto[]>([]);
  protected publishedIds = signal<Set<number>>(new Set());
  protected publishingIds = signal<Set<number>>(new Set());
  protected showCreate = signal(false);

  protected readonly createFields = CREATE_PROGRAM_FIELDS;
  protected readonly createForm =
    viewChild<DynamicForm<ProgramCreateDto>>('createForm');

  readonly columns = ['title', 'deadline', 'published', 'actions'];
  protected readonly formatDate = formatDate;

  ngOnInit() {
    this.programSvc.getPrograms().subscribe((page) => {
      this.programs.set(page.content);
      this.syncPublishedState(page.content);
      this.loading.set(false);
    });
  }


  private syncPublishedState(programs: ProgramPreviewDto[]) {
    this.publishedIds.set(new Set());
    programs.forEach((program) => {
      if (!program.id) return;
      this.programSvc.getProgramById(program.id).subscribe((dto) => {
        this.publishedIds.update((ids) => {
          const next = new Set(ids);
          if (dto.isPublished) {
            next.add(program.id!);
          } else {
            next.delete(program.id!);
          }
          return next;
        });
      });
    });
  }

  createProgram() {
    const form = this.createForm();
    if (!form?.valid) {
      form?.markAllTouched();
      return;
    }
    this.programSvc
      .createProgram(form.values as ProgramCreateDto)
      .subscribe((p) => {
        this.programs.update((ps) => [...ps, p.previewDto!]);
        this.showCreate.set(false);
        this.snackBar.open('Program created!', 'Close', {
          duration: 2000,
        });
      });
  }

  togglePublish(p: ProgramPreviewDto, publish: boolean) {
    if (!p.id || this.isPublishing(p.id)) return;

    this.publishingIds.update((ids) => {
      const next = new Set(ids);
      next.add(p.id!);
      return next;
    });

    const action = publish
      ? this.programSvc.publishProgram(p.id!)
      : this.programSvc.unpublishProgram(p.id!);
    action.subscribe({
      next: () => {
        this.publishedIds.update((ids) => {
          const next = new Set(ids);
          publish ? next.add(p.id!) : next.delete(p.id!);
          return next;
        });
        this.snackBar.open(
          publish ? 'Published' : 'Unpublished',
          'Close',
          { duration: 1500 }
        );
      },
      error: () => {
        this.publishingIds.update((ids) => {
          const next = new Set(ids);
          next.delete(p.id!);
          return next;
        });
      },
      complete: () => {
        this.publishingIds.update((ids) => {
          const next = new Set(ids);
          next.delete(p.id!);
          return next;
        });
      },
    });
  }

  isPublishing(programId?: number): boolean {
    if (!programId) return false;
    return this.publishingIds().has(programId);
  }
}
