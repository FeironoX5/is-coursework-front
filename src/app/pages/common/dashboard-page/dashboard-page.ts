import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

import { PageHeaderComponent } from '../../../components/page-header.component';
import { ProgramCardComponent } from '../../../components/program-card.component';
// import { StatusBadgeComponent } from '../../../components/status-badge.component';
import { EmptyStateComponent } from '../../../components/empty-state.component';

import { UserService } from '../../../services/user.service';
import { ArtistService } from '../../../services/artist.service';
import { ResidenceService } from '../../../services/residence.service';
import { ResidenceProgramService } from '../../../services/residence-program.service';
import { ExpertService } from '../../../services/expert.service';

import type {
  UserDto,
  ApplicationDto,
  ProgramPreviewDto,
  ResidenceDetailsDto,
  ResidenceStatsDto,
  ProgramStatsDto,
} from '../../../models';
import { roleFormatter, formatDate } from '../../../formatters';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatDividerModule,
    PageHeaderComponent,
    ProgramCardComponent,
    // StatusBadgeComponent,
    EmptyStateComponent,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  private readonly userService = inject(UserService);
  private readonly artistService = inject(ArtistService);
  private readonly residenceService = inject(ResidenceService);
  private readonly residenceProgramSvc = inject(
    ResidenceProgramService
  );
  private readonly expertService = inject(ExpertService);
  private readonly router = inject(Router);

  protected loading = signal(true);
  protected currentUser = signal<UserDto | null>(null);

  protected artistApplications = signal<ApplicationDto[]>([]);
  protected confirmedCount = signal(0);

  protected residenceDetails = signal<ResidenceDetailsDto | null>(
    null
  );
  protected residenceStats = signal<any>(null);
  protected myPrograms = signal<ProgramPreviewDto[]>([]);

  protected expertPrograms = signal<ProgramPreviewDto[]>([]);

  protected readonly roleFormatter = roleFormatter;
  protected readonly formatDate = formatDate;

  ngOnInit() {
    this.userService.getCurrentUser().subscribe((user) => {
      this.currentUser.set(user);
      this.loading.set(false);
      this.loadByRole(user.role);
    });
  }

  private loadByRole(role?: string) {
    if (role === 'ROLE_ARTIST') {
      this.artistService.getMyApplications().subscribe((p) => {
        this.artistApplications.set(p.content);
        this.confirmedCount.set(
          p.content.filter((a) => a.status === 'CONFIRMED').length
        );
      });
    }
    if (role === 'ROLE_RESIDENCE_ADMIN') {
      this.residenceService
        .getMyProfile()
        .subscribe((r) => this.residenceDetails.set(r));
      this.residenceService
        .getMyStats()
        .subscribe((s) => this.residenceStats.set(s));
      this.residenceProgramSvc
        .getPrograms()
        .subscribe((p) => this.myPrograms.set(p.content));
    }
    if (role === 'ROLE_EXPERT') {
      this.expertService
        .getMyPrograms()
        .subscribe((p) => this.expertPrograms.set(p.content));
    }
  }

  nav(path: string) {
    this.router.navigateByUrl(path);
  }
}
