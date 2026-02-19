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
  UserDto,
} from '../../../models';
import { NgTemplateOutlet } from '@angular/common';

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
  ],
  templateUrl: './applications-page.html',
  styleUrl: './applications-page.scss',
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
