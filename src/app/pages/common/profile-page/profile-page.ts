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
} from '../../../components/dynamic-form.component';
import { PageHeaderComponent } from '../../../components/page-header.component';
import { WorkCardComponent } from '../../../components/work-card.component';
import { AchievementItemComponent } from '../../../components/achievement-item.component';
import { EmptyStateComponent } from '../../../components/empty-state.component';

import { UserService } from '../../../services/user.service';
import { ArtistService } from '../../../services/artist.service';
import { ArtistWorkService } from '../../../services/artist-work.service';
import { ArtistAchievementService } from '../../../services/artist-achievement.service';
import { ResidenceService } from '../../../services/residence.service';

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
} from '../../../models';
import { roleFormatter } from '../../../formatters';

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

@Component({
  selector: 'app-profile-page',
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
    EmptyStateComponent,
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
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
