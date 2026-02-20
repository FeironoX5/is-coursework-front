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

import { PageHeaderComponent } from '../../../components/page-header.component';
import { EmptyStateComponent } from '../../../components/empty-state.component';
import {
  DynamicForm,
  type FieldConfig,
} from '../../../components/dynamic-form.component';

import { UserService } from '../../../services/user.service';
import { ArtistService } from '../../../services/artist.service';
import { ApplicationService } from '../../../services/application.service';
import type {
  ApplicationDto,
  ApplicationEvaluationCreateDto,
  ProgramPreviewDto,
  UserDto,
} from '../../../models';
import { NgTemplateOutlet } from '@angular/common';
import { StatusBadgeComponent } from '../../../components/chip.components';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { ResidenceProgramService } from '../../../services/residence-program.service';
import { ExpertService } from '../../../services/expert.service';

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
    EmptyStateComponent,
    DynamicForm,
    NgTemplateOutlet,
    StatusBadgeComponent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
  ],
  templateUrl: './applications-page.html',
  styleUrl: './applications-page.scss',
})
export class ApplicationsPage implements OnInit {
  private readonly userService = inject(UserService);
  private readonly artistService = inject(ArtistService);
  private readonly applicationService = inject(ApplicationService);
  private readonly residenceProgramSvc = inject(
    ResidenceProgramService
  );
  private readonly expertService = inject(ExpertService);
  private readonly snackBar = inject(MatSnackBar);

  protected loading = signal(true);
  protected currentUser = signal<UserDto | null>(null);

  // artist
  protected artistApplications = signal<ApplicationDto[]>([]);
  protected artistHistory = signal<ApplicationDto[]>([]);

  // expert
  protected expertPrograms = signal<ProgramPreviewDto[]>([]);
  protected expertApplications = signal<ApplicationDto[]>([]);
  protected evaluatingApp = signal<ApplicationDto | null>(null);

  // admin
  protected myPrograms = signal<ProgramPreviewDto[]>([]);
  protected selectedProgramId = signal<number | null>(null);
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
      // Load programs assigned to this expert
      this.expertService.getMyPrograms().subscribe((p) => {
        this.expertPrograms.set(p.content);
        if (p.content.length > 0) {
          this.selectedProgramId.set(p.content[0].id!);
          this.loadExpertApplications();
        } else {
          this.loading.set(false);
        }
      });
    }
    if (role === 'ROLE_RESIDENCE_ADMIN') {
      this.residenceProgramSvc.getPrograms().subscribe((p) => {
        this.myPrograms.set(p.content);
        if (p.content.length > 0) {
          this.selectedProgramId.set(p.content[0].id!);
          this.loadAdminApplications();
        } else {
          this.loading.set(false);
        }
      });
    }
  }

  loadExpertApplications() {
    const programId = this.selectedProgramId();
    if (programId === null) return;

    this.loading.set(true);
    // GET /api/applications/programs/{programId} - returns unevaluated applications for current expert
    this.applicationService
      .getUnevaluatedApplications(programId)
      .subscribe((p) => {
        this.expertApplications.set(p.content);
        this.loading.set(false);
      });
  }

  loadAdminApplications() {
    const programId = this.selectedProgramId();
    if (programId === null) return;

    this.loading.set(true);
    // For admin - we show unevaluated in "Pending" tab
    // But actually admin should see all applications, not just unevaluated
    // Let's load evaluated applications for both tabs
    this.applicationService
      .getEvaluatedApplications(programId)
      .subscribe((p) => {
        this.adminEvaluatedApps.set(p.content);
        this.loading.set(false);
      });
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
  openEvaluateDialog(app: ApplicationDto) {
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
        this.snackBar.open('Evaluation submitted', 'Close', {
          duration: 2000,
        });
        this.cancelEvaluate();
        this.loadExpertApplications(); // Reload to remove evaluated application
      });
  }

  // Admin actions
  approveApp(id: number) {
    this.applicationService.approveApplication(id).subscribe(() => {
      this.snackBar.open('Approved', 'Close', { duration: 2000 });
      this.loadAdminApplications();
    });
  }

  reserveApp(id: number) {
    this.applicationService.reserveApplication(id).subscribe(() => {
      this.snackBar.open('Added to reserve list', 'Close', {
        duration: 2000,
      });
      this.loadAdminApplications();
    });
  }

  rejectApp(id: number) {
    this.applicationService.rejectApplication(id).subscribe(() => {
      this.snackBar.open('Rejected', 'Close', { duration: 2000 });
      this.loadAdminApplications();
    });
  }
}
