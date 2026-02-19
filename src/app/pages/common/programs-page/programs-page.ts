import {
  Component,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

import { ProgramCardComponent } from '../../../components/program-card.component';
import { PageHeaderComponent } from '../../../components/page-header.component';
import { EmptyStateComponent } from '../../../components/empty-state.component';
import {
  DynamicForm,
  type FieldConfig,
} from '../../../components/dynamic-form.component';

import { ProgramService } from '../../../services/program.service';
import { UserService } from '../../../services/user.service';
import type {
  ProgramPreviewDto,
  ApplicationCreateDto,
  UserRole,
} from '../../../models';
import { Validators } from '@angular/forms';

const APPLY_FIELDS: FieldConfig[] = [
  {
    type: 'input',
    propertyName: 'motivation',
    displayName: 'Motivation Letter',
    dataType: 'text',
    validators: [Validators.required, Validators.minLength(10)],
  },
];
@Component({
  selector: 'app-programs-page',
  imports: [
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    ProgramCardComponent,
    PageHeaderComponent,
    EmptyStateComponent,
    DynamicForm,
  ],
  templateUrl: './programs-page.html',
  styleUrl: './programs-page.scss',
})
export class ProgramsPage implements OnInit {
  private readonly programService = inject(ProgramService);
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected loading = signal(true);
  protected programs = signal<ProgramPreviewDto[]>([]);
  protected totalElements = signal(0);
  protected pageIndex = signal(0);
  protected readonly pageSize = 12;
  protected applyingProgramId = signal<number | null>(null);
  protected canApply = signal(false);

  protected readonly applyFields = APPLY_FIELDS;
  protected readonly applyForm =
    viewChild<DynamicForm<ApplicationCreateDto>>('applyForm');

  ngOnInit() {
    this.userService.getCurrentUser().subscribe((u) => {
      this.canApply.set(u.role === 'ROLE_ARTIST');
    });
    this.loadPrograms();
  }

  private loadPrograms() {
    this.loading.set(true);
    this.programService
      .getPrograms({ page: this.pageIndex(), size: this.pageSize })
      .subscribe((page) => {
        this.programs.set(page.content);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      });
  }

  onPage(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.loadPrograms();
  }

  viewProgram(id: number) {
    this.router.navigate(['/programs', id]);
  }

  openApplyDialog(programId: number) {
    this.applyingProgramId.set(programId);
  }

  cancelApply() {
    this.applyingProgramId.set(null);
  }

  submitApplication() {
    const form = this.applyForm();
    if (!form?.valid) {
      form?.markAllTouched();
      return;
    }
    const programId = this.applyingProgramId()!;
    this.programService
      .createApplication(
        programId,
        form.values as ApplicationCreateDto
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Application submitted!', 'Close', {
            duration: 3000,
          });
          this.cancelApply();
        },
        error: () =>
          this.snackBar.open(
            'Failed to submit. Try again.',
            'Close',
            { duration: 3000 }
          ),
      });
  }
}
