// ============================================================
// profile.page.ts — Profile page with @switch by role
// ============================================================

import {
  Component,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Validators } from '@angular/forms';

import {
  DynamicForm,
  type FieldConfig,
} from '../components/dynamic-form.component';
import { PageHeaderComponent } from '../components/page-header.component';
import { WorkCardComponent } from '../components/work-card.component';
import { AchievementItemComponent } from '../components/achievement-item.component';
import { StatusBadgeComponent } from '../components/status-badge.component';
import { EmptyStateComponent } from '../components/empty-state.component';

import { UserService } from '../services/user.service';
import { ArtistService } from '../services/artist.service';
import { ArtistWorkService } from '../services/artist-work.service';
import { ArtistAchievementService } from '../services/artist-achievement.service';
import { ResidenceService } from '../services/residence.service';

import type {
  UserDto,
  ArtistProfileDto,
  WorkDto,
  AchievementDto,
  AchievementCreateDto,
  AchievementUpdateDto,
  WorkCreateDto,
  WorkUpdateDto,
  ArtistProfileUpdateDto,
  ResidenceDetailsDto,
  ResidenceDetailsUpdateDto,
  UserRole,
  ArtDirection,
  AchievementType,
} from '../models';
import { roleFormatter } from '../formatters';

// ─── Artist field configs ──────────────────────────────────────

const ARTIST_PROFILE_FIELDS = (
  p?: ArtistProfileDto
): FieldConfig[] => [
  {
    type: 'input',
    propertyName: 'biography',
    displayName: 'Biography',
    dataType: 'text',
    initialValue: p?.biography,
  },
  {
    type: 'input',
    propertyName: 'location',
    displayName: 'Location',
    dataType: 'text',
    initialValue: p?.location,
  },
];

const WORK_FIELDS = (w?: WorkDto): FieldConfig[] => [
  {
    type: 'input',
    propertyName: 'title',
    displayName: 'Title',
    dataType: 'text',
    initialValue: w?.title,
    validators: [Validators.required],
  },
  {
    type: 'input',
    propertyName: 'description',
    displayName: 'Description',
    dataType: 'text',
    initialValue: w?.description,
  },
  {
    type: 'selectable',
    propertyName: 'artDirection',
    displayName: 'Art Direction',
    options: [
      'PAINTING',
      'SCULPTURE',
      'PERFORMANCE',
      'MULTIMEDIA',
      'DIGITAL_ART',
      'PHOTO',
      'OTHER',
    ] satisfies ArtDirection[],
    initialValue: w?.artDirection,
    validators: [Validators.required],
  },
  {
    type: 'input',
    propertyName: 'date',
    displayName: 'Date',
    dataType: 'date',
    initialValue: w?.date,
    validators: [Validators.required],
  },
  {
    type: 'input',
    propertyName: 'link',
    displayName: 'External Link',
    dataType: 'text',
    initialValue: w?.link,
  },
];

const ACHIEVEMENT_FIELDS = (a?: AchievementDto): FieldConfig[] => [
  {
    type: 'input',
    propertyName: 'title',
    displayName: 'Title',
    dataType: 'text',
    initialValue: a?.title,
    validators: [Validators.required, Validators.minLength(1)],
  },
  {
    type: 'input',
    propertyName: 'description',
    displayName: 'Description',
    dataType: 'text',
    initialValue: a?.description,
  },
  {
    type: 'selectable',
    propertyName: 'type',
    displayName: 'Type',
    options: [
      'EDUCATION',
      'EXHIBITION',
      'PUBLICATION',
      'AWARD',
      'AUTO',
    ] satisfies AchievementType[],
    initialValue: a?.type,
    validators: [Validators.required],
  },
  {
    type: 'input',
    propertyName: 'link',
    displayName: 'Link',
    dataType: 'text',
    initialValue: a?.link,
  },
];

// ─── Residence field configs ───────────────────────────────────

const RESIDENCE_PROFILE_FIELDS = (
  r?: ResidenceDetailsDto
): FieldConfig[] => [
  {
    type: 'input',
    propertyName: 'title',
    displayName: 'Residence Name',
    dataType: 'text',
    initialValue: r?.title,
    validators: [Validators.required],
  },
  {
    type: 'input',
    propertyName: 'description',
    displayName: 'About',
    dataType: 'text',
    initialValue: r?.description,
  },
  {
    type: 'input',
    propertyName: 'location',
    displayName: 'Location',
    dataType: 'text',
    initialValue: r?.location,
    validators: [Validators.required],
  },
];

// ─── Component ────────────────────────────────────────────────

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    MatTabsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatIcon,
    MatCardModule,
    DynamicForm,
    PageHeaderComponent,
    WorkCardComponent,
    AchievementItemComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div class="loading-center"><mat-spinner /></div>
      } @else {
        @switch (currentUser()?.role) {
          <!-- ── ARTIST ─────────────────────────────────── -->
          @case ('ROLE_ARTIST') {
            <app-page-header
              title="My Profile"
              subtitle="Manage your artist profile, works and achievements"
            >
              <button
                mat-flat-button
                color="primary"
                (click)="saveArtistProfile()"
              >
                Save Profile
              </button>
            </app-page-header>

            <mat-tab-group animationDuration="200ms">
              <mat-tab label="Profile">
                <div class="tab-body">
                  <app-dynamic-form
                    #artistProfileForm
                    [formConfig]="artistProfileFields()"
                  />
                </div>
              </mat-tab>

              <mat-tab label="Works ({{ works().length }})">
                <div class="tab-body">
                  <div class="section-action-row">
                    <button
                      mat-flat-button
                      color="primary"
                      (click)="showWorkForm.set(!showWorkForm())"
                    >
                      <mat-icon>add</mat-icon> Add Work
                    </button>
                  </div>

                  @if (showWorkForm()) {
                    <mat-card
                      appearance="outlined"
                      class="inline-form-card"
                    >
                      <mat-card-content>
                        <app-dynamic-form
                          #workForm
                          [formConfig]="workFormFields()"
                        />
                      </mat-card-content>
                      <mat-card-actions>
                        <button
                          mat-flat-button
                          color="primary"
                          (click)="saveWork()"
                        >
                          Save
                        </button>
                        <button mat-button (click)="cancelWorkForm()">
                          Cancel
                        </button>
                      </mat-card-actions>
                    </mat-card>
                  }

                  @if (works().length === 0) {
                    <app-empty-state
                      icon="brush"
                      title="No works yet"
                      message="Add your first artwork to your portfolio"
                    />
                  } @else {
                    <div class="grid-3">
                      @for (w of works(); track w.id) {
                        <app-work-card
                          [work]="w"
                          [editable]="true"
                          (editClicked)="startEditWork($event)"
                          (deleteClicked)="deleteWork($event)"
                        />
                      }
                    </div>
                  }
                </div>
              </mat-tab>

              <mat-tab
                label="Achievements ({{ achievements().length }})"
              >
                <div class="tab-body">
                  <div class="section-action-row">
                    <button
                      mat-flat-button
                      color="primary"
                      (click)="
                        showAchievementForm.set(
                          !showAchievementForm()
                        )
                      "
                    >
                      <mat-icon>add</mat-icon> Add Achievement
                    </button>
                  </div>

                  @if (showAchievementForm()) {
                    <mat-card
                      appearance="outlined"
                      class="inline-form-card"
                    >
                      <mat-card-content>
                        <app-dynamic-form
                          #achievementForm
                          [formConfig]="achievementFormFields()"
                        />
                      </mat-card-content>
                      <mat-card-actions>
                        <button
                          mat-flat-button
                          color="primary"
                          (click)="saveAchievement()"
                        >
                          Save
                        </button>
                        <button
                          mat-button
                          (click)="cancelAchievementForm()"
                        >
                          Cancel
                        </button>
                      </mat-card-actions>
                    </mat-card>
                  }

                  @if (achievements().length === 0) {
                    <app-empty-state
                      icon="emoji_events"
                      title="No achievements"
                      message="Add your awards, exhibitions and publications"
                    />
                  } @else {
                    <mat-list>
                      @for (a of achievements(); track a.id) {
                        <app-achievement-item
                          [achievement]="a"
                          [editable]="true"
                          (editClicked)="startEditAchievement($event)"
                          (deleteClicked)="deleteAchievement($event)"
                        />
                        <mat-divider />
                      }
                    </mat-list>
                  }
                </div>
              </mat-tab>
            </mat-tab-group>
          }

          <!-- ── RESIDENCE ADMIN ────────────────────────── -->
          @case ('ROLE_RESIDENCE_ADMIN') {
            <app-page-header
              title="Residence Profile"
              subtitle="Manage your residency information"
            >
              <app-status-badge
                [status]="
                  residenceProfile()?.validation?.validationStatus ??
                  'PENDING'
                "
              />
              <button
                mat-flat-button
                color="primary"
                (click)="saveResidenceProfile()"
              >
                Save Profile
              </button>
            </app-page-header>

            <div class="form-section">
              <app-dynamic-form
                #residenceProfileForm
                [formConfig]="residenceProfileFields()"
              />
            </div>

            @if (residenceProfile()?.validation?.validationComment) {
              <mat-card appearance="outlined" class="validation-note">
                <mat-card-content>
                  <div class="validation-note__row">
                    <mat-icon color="warn">info</mat-icon>
                    <span>{{
                      residenceProfile()!.validation!
                        .validationComment
                    }}</span>
                  </div>
                </mat-card-content>
              </mat-card>
            }
          }

          <!-- ── EXPERT ─────────────────────────────────── -->
          @case ('ROLE_EXPERT') {
            <app-page-header
              title="Expert Profile"
              subtitle="Your expert information"
            />

            <mat-card appearance="outlined" class="expert-info-card">
              <mat-card-content>
                <div class="info-row">
                  <span class="label">Name</span
                  ><span
                    >{{ currentUser()?.name }}
                    {{ currentUser()?.surname }}</span
                  >
                </div>
                <mat-divider />
                <div class="info-row">
                  <span class="label">Email</span
                  ><span>{{ currentUser()?.username }}</span>
                </div>
                <mat-divider />
                <div class="info-row">
                  <span class="label">Role</span
                  ><span>{{
                    roleFormatter(currentUser()?.role ?? '')
                  }}</span>
                </div>
              </mat-card-content>
            </mat-card>
          }

          <!-- ── SUPERADMIN ──────────────────────────────── -->
          @case ('ROLE_SUPERADMIN') {
            <app-page-header
              title="Administrator"
              subtitle="System administration account"
            />
            <mat-card appearance="outlined" class="expert-info-card">
              <mat-card-content>
                <div class="info-row">
                  <span class="label">Username</span
                  ><span>{{ currentUser()?.username }}</span>
                </div>
                <mat-divider />
                <div class="info-row">
                  <span class="label">Role</span
                  ><span>{{ roleFormatter('ROLE_SUPERADMIN') }}</span>
                </div>
              </mat-card-content>
            </mat-card>
          }
        }
      }
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 32px;
        max-width: 1100px;
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
      .section-action-row {
        margin-bottom: 20px;
      }
      .grid-3 {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }
      .inline-form-card {
        margin-bottom: 24px;
      }
      .form-section {
        max-width: 600px;
      }

      .expert-info-card {
        max-width: 480px;
      }
      .info-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 14px 0;
        font-size: 14px;
      }
      .label {
        font-weight: 500;
        min-width: 90px;
        color: rgba(0, 0, 0, 0.54);
      }

      .validation-note {
        margin-top: 24px;
        border-color: #ff9800 !important;
      }
      .validation-note__row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 14px;
      }
    `,
  ],
})
export class ProfilePage implements OnInit {
  private readonly userService = inject(UserService);
  private readonly artistService = inject(ArtistService);
  private readonly artistWorkService = inject(ArtistWorkService);
  private readonly achievementService = inject(
    ArtistAchievementService
  );
  private readonly residenceService = inject(ResidenceService);
  private readonly snackBar = inject(MatSnackBar);

  protected loading = signal(true);
  protected currentUser = signal<UserDto | null>(null);
  protected artistProfile = signal<ArtistProfileDto | null>(null);
  protected residenceProfile = signal<ResidenceDetailsDto | null>(
    null
  );
  protected works = signal<WorkDto[]>([]);
  protected achievements = signal<AchievementDto[]>([]);

  protected showWorkForm = signal(false);
  protected showAchievementForm = signal(false);
  protected editingWork = signal<WorkDto | null>(null);
  protected editingAchievement = signal<AchievementDto | null>(null);

  // form field sets — recomputed when editing target changes
  protected artistProfileFields = signal<FieldConfig[]>([]);
  protected workFormFields = signal<FieldConfig[]>(WORK_FIELDS());
  protected achievementFormFields = signal<FieldConfig[]>(
    ACHIEVEMENT_FIELDS()
  );
  protected residenceProfileFields = signal<FieldConfig[]>([]);

  // form refs
  protected readonly artistProfileForm = viewChild<
    DynamicForm<ArtistProfileUpdateDto>
  >('artistProfileForm');
  protected readonly workForm =
    viewChild<DynamicForm<WorkCreateDto>>('workForm');
  protected readonly achievementForm =
    viewChild<DynamicForm<AchievementCreateDto>>('achievementForm');
  protected readonly residenceProfileForm = viewChild<
    DynamicForm<ResidenceDetailsUpdateDto>
  >('residenceProfileForm');

  protected readonly roleFormatter = roleFormatter;

  ngOnInit() {
    this.userService.getCurrentUser().subscribe((user) => {
      this.currentUser.set(user);
      this.loading.set(false);
      this.loadRoleData(user.role);
    });
  }

  private loadRoleData(role?: UserRole) {
    if (role === 'ROLE_ARTIST') {
      this.artistService.getMyProfile().subscribe((p) => {
        this.artistProfile.set(p);
        this.artistProfileFields.set(ARTIST_PROFILE_FIELDS(p));
      });
      this.artistWorkService
        .getWorksForCurrentArtist()
        .subscribe((page) => this.works.set(page.content));
      this.achievementService
        .getMyAchievements()
        .subscribe((page) => this.achievements.set(page.content));
    }
    if (role === 'ROLE_RESIDENCE_ADMIN') {
      this.residenceService.getMyProfile().subscribe((p) => {
        this.residenceProfile.set(p);
        this.residenceProfileFields.set(RESIDENCE_PROFILE_FIELDS(p));
      });
    }
  }

  // ── Artist profile ────────────────────────────────────────

  saveArtistProfile() {
    const form = this.artistProfileForm();
    if (!form?.valid) return;
    this.artistService
      .updateMyProfile(form.values as ArtistProfileUpdateDto)
      .subscribe(() => {
        this.snackBar.open('Profile updated', 'Close', {
          duration: 2000,
        });
      });
  }

  // ── Works ─────────────────────────────────────────────────

  startEditWork(w: WorkDto) {
    this.editingWork.set(w);
    this.workFormFields.set(WORK_FIELDS(w));
    this.showWorkForm.set(true);
  }

  cancelWorkForm() {
    this.editingWork.set(null);
    this.workFormFields.set(WORK_FIELDS());
    this.showWorkForm.set(false);
  }

  saveWork() {
    const form = this.workForm();
    if (!form?.valid) {
      form?.markAllTouched();
      return;
    }
    const editing = this.editingWork();
    if (editing?.id) {
      this.artistWorkService
        .updateWork(
          editing.id,
          form.values as unknown as WorkUpdateDto
        )
        .subscribe((w) => {
          this.works.update((ws) =>
            ws.map((x) => (x.id === w.id ? w : x))
          );
          this.cancelWorkForm();
        });
    } else {
      this.artistWorkService
        .createWork(form.values as WorkCreateDto)
        .subscribe((w) => {
          this.works.update((ws) => [...ws, w]);
          this.cancelWorkForm();
        });
    }
  }

  deleteWork(id: number) {
    this.artistWorkService.deleteWork(id).subscribe(() => {
      this.works.update((ws) => ws.filter((w) => w.id !== id));
    });
  }

  // ── Achievements ──────────────────────────────────────────

  startEditAchievement(a: AchievementDto) {
    this.editingAchievement.set(a);
    this.achievementFormFields.set(ACHIEVEMENT_FIELDS(a));
    this.showAchievementForm.set(true);
  }

  cancelAchievementForm() {
    this.editingAchievement.set(null);
    this.achievementFormFields.set(ACHIEVEMENT_FIELDS());
    this.showAchievementForm.set(false);
  }

  saveAchievement() {
    const form = this.achievementForm();
    if (!form?.valid) {
      form?.markAllTouched();
      return;
    }
    const editing = this.editingAchievement();
    if (editing?.id) {
      this.achievementService
        .updateAchievement(
          editing.id,
          form.values as AchievementUpdateDto
        )
        .subscribe((a) => {
          this.achievements.update((as) =>
            as.map((x) => (x.id === a.id ? a : x))
          );
          this.cancelAchievementForm();
        });
    } else {
      this.achievementService
        .createAchievement(form.values as AchievementCreateDto)
        .subscribe((a) => {
          this.achievements.update((as) => [...as, a]);
          this.cancelAchievementForm();
        });
    }
  }

  deleteAchievement(id: number) {
    this.achievementService.deleteAchievement(id).subscribe(() => {
      this.achievements.update((as) => as.filter((a) => a.id !== id));
    });
  }

  // ── Residence ─────────────────────────────────────────────

  saveResidenceProfile() {
    const form = this.residenceProfileForm();
    if (!form?.valid) {
      form?.markAllTouched();
      return;
    }
    this.residenceService
      .updateMyProfile(form.values as ResidenceDetailsUpdateDto)
      .subscribe(() => {
        this.snackBar.open('Residence profile updated', 'Close', {
          duration: 2000,
        });
      });
  }
}
