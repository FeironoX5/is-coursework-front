import {
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardModule,
  MatCardTitle,
} from '@angular/material/card';
import {
  DynamicForm,
  FieldConfig,
} from '../../../components/dynamic-form/dynamic-form';
import { MatChip, MatChipSet } from '@angular/material/chips';
import {
  MatButton,
  MatButtonModule,
  MatIconButton,
} from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { ArtistService } from '../../../services/artist-service';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  Achievement,
  Artist,
  ArtWork,
} from '../../../models/artist.model';
import {
  MatList,
  MatListItem,
  MatListModule,
} from '@angular/material/list';
import { upperCaseFormatter } from '../../../formatters';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-artist-profile-page',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    DynamicForm,
    MatChip,
    MatIconButton,
    MatIcon,
    MatListModule,
    MatIconModule,
    MatButton,
  ],
  templateUrl: './artist-profile-page.html',
  styleUrl: './artist-profile-page.scss',
})
export class ArtistProfilePage implements OnInit {
  private readonly artistService = inject(ArtistService);
  private readonly dialog = inject(MatDialog);

  protected readonly works = signal<ArtWork[]>([]);
  protected readonly achievements = signal<Achievement[]>([]);
  protected readonly loading = signal(false);

  protected readonly profileFields = signal<FieldConfig[]>([]);

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    this.loading.set(true);
    try {
      const profile = await this.artistService.getMyProfile();

      this.profileFields.set([
        {
          type: 'input',
          propertyName: 'email',
          displayName: 'Email',
          dataType: 'email',
          initialValue: profile.email,
        },
        {
          type: 'input',
          propertyName: 'name',
          displayName: 'Name',
          dataType: 'text',
          initialValue: profile.name,
        },
        {
          type: 'input',
          propertyName: 'surname',
          displayName: 'Surname',
          dataType: 'text',
          initialValue: profile.surname,
        },
        {
          type: 'input',
          propertyName: 'location',
          displayName: 'Location',
          dataType: 'text',
          initialValue: profile.location,
        },
        {
          type: 'input',
          propertyName: 'biography',
          displayName: 'Biography',
          dataType: 'text',
          initialValue: profile.biography,
        },
      ]);

      const works = await this.artistService.getMyWorks();
      this.works.set(works);

      const achievements =
        await this.artistService.getMyAchievements();
      this.achievements.set(achievements);
    } finally {
      this.loading.set(false);
    }
  }

  async saveProfile(form: DynamicForm<any>) {
    if (!form.valid) return;

    this.loading.set(true);
    try {
      await this.artistService.updateMyProfile(form.values);
      await this.loadProfile();
    } finally {
      this.loading.set(false);
    }
  }

  openCreateWorkDialog() {
    // const ref = this.dialog.open(WorkDialogComponent, {
    //   width: '640px',
    // });
    //
    // firstValueFrom(ref.afterClosed()).then(
    //   async (result: ArtWork | undefined) => {
    //     if (!result) return;
    //     this.loading.set(true);
    //     try {
    //       await this.artistService.createWork(result);
    //       await this.loadProfile();
    //     } finally {
    //       this.loading.set(false);
    //     }
    //   }
    // );
  }

  openUpdateWorkDialog(work?: ArtWork) {
    // const ref = this.dialog.open(WorkDialogComponent, {
    //   width: '640px',
    //   data: work,
    // });
    //
    // firstValueFrom(ref.afterClosed()).then(
    //   async (result: ArtWork | undefined) => {
    //     if (!result) return;
    //     this.loading.set(true);
    //     try {
    //       await this.artistService.updateWork(result.id, result);
    //       await this.loadProfile();
    //     } finally {
    //       this.loading.set(false);
    //     }
    //   }
    // );
  }

  async deleteWork(workId: number) {
    if (!confirm('Удалить работу?')) return;

    await this.artistService.deleteWork(workId);
    await this.loadProfile();
  }

  openAchievementDialog(achievement?: Achievement) {
    // const ref = this.dialog.open(AchievementDialogComponent, {
    //   width: '640px',
    //   data: achievement,
    // });
    //
    // firstValueFrom(ref.afterClosed()).then(
    //   async (result: Achievement | undefined) => {
    //     if (!result) return;
    //
    //     this.loading.set(true);
    //     try {
    //       if (achievement && achievement.id) {
    //         await this.artistService.updateAchievement(
    //           result.id,
    //           result
    //         );
    //       } else {
    //         await this.artistService.createAchievement(result);
    //       }
    //       await this.loadProfile();
    //     } finally {
    //       this.loading.set(false);
    //     }
    //   }
    // );
  }

  async deleteAchievement(achievementId: number) {
    if (!confirm('Удалить достижение?')) return;

    await this.artistService.deleteAchievement(achievementId);
    await this.loadProfile();
  }
}
//
// @Component({
//   selector: 'app-work-dialog',
//   standalone: true,
//   imports: [
//     CommonModule,
//     MatDialogModule,
//     MatButtonModule,
//     MatIconModule,
//     MatCardModule,
//     DynamicForm,
//   ],
//   template: `
//     <mat-card>
//       <mat-card-header>
//         <mat-card-title>
//           {{ data?.id ? 'Edit work' : 'New work' }}
//         </mat-card-title>
//       </mat-card-header>
//
//       <mat-card-content>
//         <app-dynamic-form
//           #formRef
//           [formConfig]="fields"
//         ></app-dynamic-form>
//       </mat-card-content>
//
//       <mat-card-actions
//         style="display:flex; justify-content: flex-end; gap: 8px; margin-top: 12px;"
//       >
//         <button mat-button (click)="cancel()">Cancel</button>
//         <button mat-flat-button color="primary" (click)="save()">
//           Save
//         </button>
//       </mat-card-actions>
//     </mat-card>
//   `,
// })
// export class WorkDialogComponent {
//   private dialogRef = inject(
//     MatDialogRef<WorkDialogComponent, ArtWork | undefined>
//   );
//   protected data = inject(MAT_DIALOG_DATA) as ArtWork | undefined;
//
//   @ViewChild('formRef') form!: DynamicForm<ArtWork>;
//
//   public fields: FieldConfig[] = [
//     {
//       type: 'input',
//       propertyName: 'title',
//       displayName: 'Title',
//       dataType: 'text',
//       initialValue: this.data?.title ?? '',
//     },
//     {
//       type: 'input',
//       propertyName: 'description',
//       displayName: 'Description',
//       dataType: 'text',
//       initialValue: this.data?.description ?? '',
//     },
//     {
//       type: 'selectable',
//       propertyName: 'artDirection',
//       displayName: 'Art direction',
//       initialValue: this.data?.artDirection ?? 'PAINTING',
//       options: [
//         'PAINTING',
//         'SCULPTURE',
//         'PERFORMANCE',
//         'MULTIMEDIA',
//         'DIGITAL_ART',
//         'PHOTO',
//         'OTHER',
//       ],
//       formatter: upperCaseFormatter,
//     },
//     {
//       type: 'input',
//       propertyName: 'date',
//       displayName: 'Date',
//       dataType: 'date',
//       initialValue: this.data?.date ?? '',
//     },
//     {
//       type: 'input',
//       propertyName: 'link',
//       displayName: 'Link',
//       dataType: 'text',
//       initialValue: this.data?.link ?? '',
//     },
//   ];
//
//   cancel() {
//     this.dialogRef.close(undefined);
//   }
//
//   save() {
//     // предполагаем, что DynamicForm имеет свойства valid и values (как в твоём коде с saveProfile)
//     if (!this.form || !this.form.valid) return;
//     const values = this.form.values as ArtWork;
//
//     // если редактирование, сохраняем id
//     if (this.data?.id) {
//       values.id = this.data.id;
//     }
//
//     this.dialogRef.close(values);
//   }
// }
//
// @Component({
//   selector: 'app-achievement-dialog',
//   standalone: true,
//   imports: [
//     CommonModule,
//     MatDialogModule,
//     MatButtonModule,
//     MatCardModule,
//     MatIconModule,
//     DynamicForm,
//   ],
//   template: `
//     <mat-card>
//       <mat-card-header>
//         <mat-card-title>
//           {{ data?.id ? 'Edit achievement' : 'New achievement' }}
//         </mat-card-title>
//       </mat-card-header>
//
//       <mat-card-content>
//         <app-dynamic-form
//           #formRef
//           [formConfig]="fields"
//         ></app-dynamic-form>
//       </mat-card-content>
//
//       <mat-card-actions
//         style="display:flex; justify-content: flex-end; gap: 8px; margin-top: 12px;"
//       >
//         <button mat-button (click)="cancel()">Cancel</button>
//         <button mat-flat-button color="primary" (click)="save()">
//           Save
//         </button>
//       </mat-card-actions>
//     </mat-card>
//   `,
// })
// export class AchievementDialogComponent {
//   private dialogRef = inject(
//     MatDialogRef<AchievementDialogComponent, Achievement | undefined>
//   );
//   protected data = inject(MAT_DIALOG_DATA) as Achievement | undefined;
//
//   @ViewChild('formRef') form!: DynamicForm<Achievement>;
//
//   public fields: FieldConfig[] = [
//     {
//       type: 'selectable',
//       propertyName: 'type',
//       displayName: 'Type',
//       initialValue: this.data?.type ?? 'AWARD',
//       options: ['AWARD', 'EXHIBITION', 'PUBLICATION'],
//     },
//     {
//       type: 'input',
//       propertyName: 'title',
//       displayName: 'Title',
//       dataType: 'text',
//       initialValue: this.data?.title ?? '',
//     },
//     {
//       type: 'input',
//       propertyName: 'description',
//       displayName: 'Description',
//       dataType: 'text',
//       initialValue: this.data?.description ?? '',
//     },
//     {
//       type: 'input',
//       propertyName: 'link',
//       displayName: 'Link',
//       dataType: 'text',
//       initialValue: this.data?.link ?? '',
//     },
//   ];
//
//   cancel() {
//     this.dialogRef.close(undefined);
//   }
//
//   save() {
//     if (!this.form || !this.form.valid) return;
//     const values = this.form.values as Achievement;
//     if (this.data?.id) {
//       values.id = this.data.id;
//     }
//     this.dialogRef.close(values);
//   }
// }
