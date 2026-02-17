// ============================================================
// dashboard.page.ts — Role-based dashboard via @switch
// ============================================================

import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

import { PageHeaderComponent } from '../components/page-header.component';
import { ProgramCardComponent } from '../components/program-card.component';
import { StatusBadgeComponent } from '../components/status-badge.component';
import { EmptyStateComponent } from '../components/empty-state.component';

import { UserService } from '../services/user.service';
import { ArtistService } from '../services/artist.service';
import { ResidenceService } from '../services/residence.service';
import { ResidenceProgramService } from '../services/residence-program.service';
import { ExpertService } from '../services/expert.service';

import type {
  UserDto,
  ApplicationDto,
  ProgramPreviewDto,
  ResidenceDetailsDto,
  ResidenceStatsDto,
  ProgramStatsDto,
} from '../models';
import { roleFormatter, formatDate } from '../formatters';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatDividerModule,
    PageHeaderComponent,
    ProgramCardComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div class="loading-center"><mat-spinner /></div>
      } @else {
        @switch (currentUser()?.role) {
          <!-- ── ARTIST Dashboard ──────────────────────────── -->
          @case ('ROLE_ARTIST') {
            <app-page-header
              [title]="
                'Welcome, ' + (currentUser()?.name ?? 'Artist')
              "
              subtitle="Your residency activity at a glance"
            >
              <button
                mat-flat-button
                color="primary"
                (click)="nav('/programs')"
              >
                <mat-icon>search</mat-icon> Browse Programs
              </button>
            </app-page-header>

            <!-- Stat cards -->
            <div class="stat-grid">
              <mat-card appearance="outlined" class="stat-card">
                <mat-card-content>
                  <div class="stat-icon">
                    <mat-icon color="primary">inbox</mat-icon>
                  </div>
                  <div class="stat-value">
                    {{ artistApplications().length }}
                  </div>
                  <div class="stat-label">Active Applications</div>
                </mat-card-content>
              </mat-card>
              <mat-card appearance="outlined" class="stat-card">
                <mat-card-content>
                  <div class="stat-icon">
                    <mat-icon color="accent">check_circle</mat-icon>
                  </div>
                  <div class="stat-value">{{ confirmedCount() }}</div>
                  <div class="stat-label">
                    Confirmed Participations
                  </div>
                </mat-card-content>
              </mat-card>
              <mat-card
                appearance="outlined"
                class="stat-card"
                (click)="nav('/programs')"
                class="stat-card stat-card--clickable"
              >
                <mat-card-content>
                  <div class="stat-icon">
                    <mat-icon>event</mat-icon>
                  </div>
                  <div class="stat-label">Explore open calls →</div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Recent applications -->
            @if (artistApplications().length > 0) {
              <h3 class="section-title">Recent Applications</h3>
              <mat-list>
                @for (
                  app of artistApplications().slice(0, 5);
                  track app.id
                ) {
                  <mat-list-item>
                    <span matListItemTitle
                      >Program #{{ app.programId }}</span
                    >
                    <span matListItemLine>{{ app.motivation }}</span>
                    <app-status-badge
                      matListItemMeta
                      [status]="app.status!"
                    />
                  </mat-list-item>
                  <mat-divider />
                }
              </mat-list>
              <button mat-button (click)="nav('/applications')">
                View all applications →
              </button>
            } @else {
              <app-empty-state
                icon="search"
                title="No applications yet"
                message="Find a residency program and submit your first application"
              >
                <button
                  mat-flat-button
                  color="primary"
                  (click)="nav('/programs')"
                >
                  Browse Programs
                </button>
              </app-empty-state>
            }
          }

          <!-- ── RESIDENCE ADMIN Dashboard ─────────────────── -->
          @case ('ROLE_RESIDENCE_ADMIN') {
            <app-page-header
              [title]="'Welcome, ' + (currentUser()?.name ?? 'Admin')"
              subtitle="Manage your residency and programs"
            >
              <button
                mat-flat-button
                color="primary"
                (click)="nav('/residences/me/programs/new')"
              >
                <mat-icon>add</mat-icon> New Program
              </button>
            </app-page-header>

            <!-- Validation status banner -->
            @if (residenceDetails()) {
              <mat-card
                appearance="outlined"
                class="validation-banner"
                [class.approved]="
                  residenceDetails()!.validation?.validationStatus ===
                  'APPROVED'
                "
                [class.pending]="
                  residenceDetails()!.validation?.validationStatus ===
                  'PENDING'
                "
                [class.rejected]="
                  residenceDetails()!.validation?.validationStatus ===
                  'REJECTED'
                "
              >
                <mat-card-content class="banner-content">
                  <mat-icon>verified</mat-icon>
                  <span>
                    Residence status:
                    <strong>{{
                      residenceDetails()!.validation?.validationStatus
                    }}</strong>
                    @if (
                      residenceDetails()!.validation
                        ?.validationComment
                    ) {
                      —
                      {{
                        residenceDetails()!.validation!
                          .validationComment
                      }}
                    }
                  </span>
                  <button mat-button (click)="nav('/profile')">
                    Edit Profile
                  </button>
                </mat-card-content>
              </mat-card>
            }

            <!-- Stats -->
            <div class="stat-grid">
              <mat-card appearance="outlined" class="stat-card">
                <mat-card-content>
                  <div class="stat-icon">
                    <mat-icon color="primary">visibility</mat-icon>
                  </div>
                  <div class="stat-value">
                    {{ residenceStats()?.viewsCount ?? 0 }}
                  </div>
                  <div class="stat-label">Profile Views</div>
                </mat-card-content>
              </mat-card>
              <mat-card appearance="outlined" class="stat-card">
                <mat-card-content>
                  <div class="stat-icon">
                    <mat-icon color="accent">event</mat-icon>
                  </div>
                  <div class="stat-value">
                    {{ myPrograms().length }}
                  </div>
                  <div class="stat-label">Programs</div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Programs list -->
            @if (myPrograms().length > 0) {
              <h3 class="section-title">Your Programs</h3>
              <div class="programs-grid">
                @for (p of myPrograms().slice(0, 6); track p.id) {
                  <app-program-card
                    [program]="p"
                    [showManage]="true"
                    (viewClicked)="nav('/programs/' + $event)"
                    (manageClicked)="
                      nav('/residences/me/programs/' + $event)
                    "
                  />
                }
              </div>
              <button
                mat-button
                (click)="nav('/residences/me/programs')"
              >
                View all programs →
              </button>
            } @else {
              <app-empty-state
                icon="event"
                title="No programs yet"
                message="Create your first open call"
              >
                <button
                  mat-flat-button
                  color="primary"
                  (click)="nav('/residences/me/programs/new')"
                >
                  Create Program
                </button>
              </app-empty-state>
            }
          }

          <!-- ── EXPERT Dashboard ───────────────────────────── -->
          @case ('ROLE_EXPERT') {
            <app-page-header
              [title]="
                'Welcome, ' + (currentUser()?.name ?? 'Expert')
              "
              subtitle="Applications assigned to you for review"
            >
              <button
                mat-flat-button
                color="primary"
                (click)="nav('/applications')"
              >
                Review Applications
              </button>
            </app-page-header>

            <div class="stat-grid">
              <mat-card appearance="outlined" class="stat-card">
                <mat-card-content>
                  <div class="stat-icon">
                    <mat-icon color="primary">event</mat-icon>
                  </div>
                  <div class="stat-value">
                    {{ expertPrograms().length }}
                  </div>
                  <div class="stat-label">Assigned Programs</div>
                </mat-card-content>
              </mat-card>
            </div>

            @if (expertPrograms().length > 0) {
              <h3 class="section-title">Your Programs</h3>
              <div class="programs-grid">
                @for (p of expertPrograms(); track p.id) {
                  <app-program-card
                    [program]="p"
                    (viewClicked)="nav('/programs/' + $event)"
                  />
                }
              </div>
            } @else {
              <app-empty-state
                icon="rate_review"
                title="No programs assigned"
                message="Contact a residence admin to get assigned to a program"
              />
            }
          }

          <!-- ── SUPERADMIN Dashboard ───────────────────────── -->
          @case ('ROLE_SUPERADMIN') {
            <app-page-header
              title="Administration"
              subtitle="System management"
            />

            <div class="admin-quick-links">
              <button
                mat-stroked-button
                (click)="nav('/admin/validation')"
              >
                <mat-icon>verified</mat-icon> Validation Requests
              </button>
              <button mat-stroked-button (click)="nav('/users')">
                <mat-icon>people</mat-icon> Users
              </button>
              <button mat-stroked-button (click)="nav('/programs')">
                <mat-icon>event</mat-icon> All Programs
              </button>
            </div>
          }
        }
      }
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 32px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .loading-center {
        display: flex;
        justify-content: center;
        padding: 80px;
      }

      .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 32px;
      }

      .stat-card {
        cursor: default;
      }
      .stat-card--clickable {
        cursor: pointer;
        transition: box-shadow 0.2s;
        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }
      }

      .stat-icon {
        margin-bottom: 8px;
      }
      .stat-value {
        font-size: 36px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.87);
      }
      .stat-label {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.54);
        margin-top: 4px;
      }

      .section-title {
        font-size: 18px;
        font-weight: 600;
        margin: 24px 0 16px;
        color: rgba(0, 0, 0, 0.87);
      }

      .programs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
        margin-bottom: 16px;
      }

      .validation-banner {
        margin-bottom: 24px;
        border-left: 4px solid #9e9e9e !important;
        &.approved {
          border-left-color: #4caf50 !important;
        }
        &.pending {
          border-left-color: #ff9800 !important;
        }
        &.rejected {
          border-left-color: #f44336 !important;
        }
      }
      .banner-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .banner-content span {
        flex: 1;
        font-size: 14px;
      }

      .admin-quick-links {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
    `,
  ],
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
