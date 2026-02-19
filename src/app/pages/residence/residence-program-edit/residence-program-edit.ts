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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { Validators } from '@angular/forms';
import { formatDate } from '../../../formatters';
import {
  DynamicForm,
  FieldConfig,
} from '../../../components/dynamic-form.component';
import {
  ApplicationDto,
  ProgramDto,
  ProgramUpdateDto,
} from '../../../models';
import { PageHeaderComponent } from '../../../components/page-header.component';
import { ResidenceProgramService } from '../../../services/residence-program.service';
import { ApplicationService } from '../../../services/application.service';

const EDIT_FIELDS = (p: ProgramDto): FieldConfig[] => [
  {
    type: 'input',
    propertyName: 'title',
    displayName: 'Program Title',
    dataType: 'text',
    initialValue: p.previewDto?.title,
    validators: [Validators.required],
  },
  {
    type: 'input',
    propertyName: 'description',
    displayName: 'Description',
    dataType: 'text',
    initialValue: p.description,
  },
  {
    type: 'input',
    propertyName: 'deadlineApply',
    displayName: 'Apply Deadline',
    dataType: 'date',
    initialValue: p.previewDto?.deadlineApply,
    validators: [Validators.required],
  },
  {
    type: 'input',
    propertyName: 'deadlineReview',
    displayName: 'Review Deadline',
    dataType: 'date',
    initialValue: p.deadlineReview,
    validators: [Validators.required],
  },
  {
    type: 'input',
    propertyName: 'deadlineNotify',
    displayName: 'Notify Deadline',
    dataType: 'date',
    initialValue: p.deadlineNotify,
    validators: [Validators.required],
  },
  {
    type: 'input',
    propertyName: 'durationDays',
    displayName: 'Duration (days)',
    dataType: 'number',
    initialValue: String(p.durationDays ?? ''),
  },
  {
    type: 'input',
    propertyName: 'budgetQuota',
    displayName: 'Budget (€)',
    dataType: 'number',
    initialValue: String(p.budgetQuota ?? ''),
  },
  {
    type: 'input',
    propertyName: 'peopleQuota',
    displayName: 'Max Participants',
    dataType: 'number',
    initialValue: String(p.peopleQuota ?? ''),
  },
];
@Component({
  selector: 'app-residence-program-edit',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatMenuModule,
    PageHeaderComponent,
    DynamicForm,
  ],
  templateUrl: './residence-program-edit.html',
  styleUrl: './residence-program-edit.scss',
})
export class ResidenceProgramEdit implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  private readonly programService = inject(ResidenceProgramService);
  private readonly applicationService = inject(ApplicationService);
  private readonly snackBar = inject(MatSnackBar);

  protected loading = signal(true);
  protected program = signal<ProgramDto | null>(null);
  protected stats = signal<any>(null);
  protected programId = signal(0);

  protected pendingApplications = signal<ApplicationDto[]>([]);
  protected evaluatedApplications = signal<ApplicationDto[]>([]);

  protected editFields = signal<FieldConfig[]>([]);
  protected readonly editForm =
    viewChild<DynamicForm<ProgramUpdateDto>>('editForm');

  protected readonly formatDate = formatDate;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.programId.set(id);
    this.loadProgram(id);
    this.loadStats(id);
    this.loadApplications(id);
  }

  private loadProgram(id: number) {
    this.loading.set(true);
    this.programService.getProgramById(id).subscribe({
      next: (p) => {
        this.program.set(p);
        this.editFields.set(EDIT_FIELDS(p));
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Program not found', 'Close', {
          duration: 3000,
        });
        this.router.navigate(['/residences/me/programs']);
      },
    });
  }

  private loadStats(id: number) {
    this.programService
      .getProgramStats(id)
      .subscribe((s) => this.stats.set(s));
  }

  private loadApplications(id: number) {
    this.applicationService
      .getUnevaluatedApplications(id)
      .subscribe((page) =>
        this.pendingApplications.set(page.content)
      );
    this.applicationService
      .getEvaluatedApplications(id)
      .subscribe((page) =>
        this.evaluatedApplications.set(page.content)
      );
  }

  saveProgram() {
    const form = this.editForm();
    if (!form?.valid) {
      form?.markAllTouched();
      return;
    }
    this.programService
      .updateProgram(
        this.programId(),
        form.values as ProgramUpdateDto
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Program updated', 'Close', {
            duration: 2000,
          });
          this.loadProgram(this.programId());
        },
        error: () =>
          this.snackBar.open('Update failed', 'Close', {
            duration: 3000,
          }),
      });
  }

  togglePublish(publish: boolean) {
    const action = publish
      ? this.programService.publishProgram(this.programId())
      : this.programService.unpublishProgram(this.programId());
    action.subscribe({
      next: () => {
        this.program.update((p) =>
          p ? { ...p, isPublished: publish } : p
        );
        this.snackBar.open(
          publish ? 'Published' : 'Unpublished',
          'Close',
          { duration: 1500 }
        );
      },
    });
  }

  approveApp(id: number) {
    this.applicationService.approveApplication(id).subscribe(() => {
      this.snackBar.open('Approved', 'Close', { duration: 2000 });
      this.loadApplications(this.programId());
    });
  }

  reserveApp(id: number) {
    this.applicationService.reserveApplication(id).subscribe(() => {
      this.snackBar.open('Added to reserve list', 'Close', {
        duration: 2000,
      });
      this.loadApplications(this.programId());
    });
  }

  rejectApp(id: number) {
    this.applicationService.rejectApplication(id).subscribe(() => {
      this.snackBar.open('Rejected', 'Close', { duration: 2000 });
      this.loadApplications(this.programId());
    });
  }
}
