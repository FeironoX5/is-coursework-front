import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {
  DynamicForm,
  FieldConfig,
} from '../../../components/dynamic-form/dynamic-form';
import { MatButtonModule } from '@angular/material/button';
import { UserRole } from '../../../models/user.model';
import { ActivatedRoute } from '@angular/router';
import { ArtistService } from '../../../services/artist-service';

@Component({
  selector: 'app-profile-page',
  imports: [MatCardModule, DynamicForm, MatButtonModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly artistService = inject(ArtistService);

  protected readonly loading = signal(false);
  protected readonly commonFields = signal<FieldConfig[]>([]);

  async ngOnInit() {
    await this.loadCommon();
    await this.loadProfile();
  }

  async loadCommon() {
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
  async loadProfile() {
    const userRole: UserRole = this.route.snapshot.;

    if (!programId) return;

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
}
