// ============================================================
// artists.page.ts — Artists catalog with filters (F12)
// ============================================================

import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { PageHeaderComponent } from '../../components/page-header.component';
import { EmptyStateComponent } from '../../components/empty-state.component';
import {
  DynamicForm,
  type FieldConfig,
} from '../../components/dynamic-form.component';

import { UserService } from '../../services/user.service';
import { ArtistService } from '../../services/artist.service';
import { AuthService } from '../../services/auth.service';
import type {
  ArtistProfileDto,
  ArtDirection,
  ProgramPreviewDto,
} from '../../models';
import { artDirectionLabel } from '../../formatters';
import { Validators } from '@angular/forms';

const INVITE_FIELDS = (
  programs: ProgramPreviewDto[]
): FieldConfig[] => [
  {
    type: 'selectable',
    propertyName: 'programId',
    displayName: 'Select Program',
    options: programs.map((p) => String(p.id)),
    validators: [Validators.required],
  },
  {
    type: 'input',
    propertyName: 'message',
    displayName: 'Personal Message',
    dataType: 'text',
    validators: [Validators.required, Validators.minLength(10)],
  },
];

@Component({
  selector: 'app-artists-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatDialogModule,
    FormsModule,
    PageHeaderComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page-container">
      <app-page-header title="Artists Catalog" />

      <!-- Filters -->
      <div class="filters-row">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Search by name</mat-label>
          <input
            matInput
            [(ngModel)]="searchQuery"
            (ngModelChange)="applyFilters()"
          />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        @if (hasFilters()) {
          <button mat-stroked-button (click)="clearFilters()">
            <mat-icon>clear</mat-icon> Clear
          </button>
        }
      </div>

      <!-- Artists Grid -->
      @if (loading()) {
        <div class="loading-center"><mat-spinner /></div>
      } @else if (artists().length === 0) {
        <app-empty-state
          icon="people"
          title="No artists found"
          message="Try adjusting your filters"
        />
      } @else {
        <div class="artists-grid">
          @for (artist of artists(); track artist.userId) {
            <mat-card
              appearance="outlined"
              class="artist-card"
              (click)="viewArtist(artist)"
            >
              <mat-card-header>
                <mat-card-title
                  >{{ artist.name }}
                  {{ artist.surname }}</mat-card-title
                >
                <mat-card-subtitle>
                  @if (artist.location) {
                    <mat-icon class="icon-sm">location_on</mat-icon>
                    {{ artist.location }}
                  }
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                @if (artist.biography) {
                  <p class="bio">{{ artist.biography }}</p>
                }
              </mat-card-content>

              <mat-card-actions>
                <button
                  mat-button
                  color="primary"
                  (click)="
                    viewArtist(artist); $event.stopPropagation()
                  "
                >
                  View Portfolio
                </button>
                @if (canInvite()) {
                  <button
                    mat-icon-button
                    (click)="
                      openInviteDialog(artist);
                      $event.stopPropagation()
                    "
                  >
                    <mat-icon>mail</mat-icon>
                  </button>
                }
              </mat-card-actions>
            </mat-card>
          }
        </div>

        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize()"
          [pageIndex]="pageIndex()"
          [pageSizeOptions]="[12, 24, 48]"
          (page)="onPage($event)"
        />
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

      .filters-card {
        margin-bottom: 24px;
      }
      .filters-row {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
      }
      .filter-field {
        flex: 1;
        min-width: 200px;
      }

      .artists-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-bottom: 24px;
      }

      .artist-card {
        cursor: pointer;
        transition:
          box-shadow 0.2s,
          transform 0.2s;
        &:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
      }

      mat-card-header {
        padding-bottom: 12px;
      }

      .icon-sm {
        font-size: 14px;
        width: 14px;
        height: 14px;
        vertical-align: middle;
        margin-right: 2px;
      }

      .bio {
        font-size: 13px;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-bottom: 12px;
      }

      mat-chip {
        font-size: 11px;
        height: 24px;
        min-height: 24px;
      }
    `,
  ],
})
export class ArtistsPage implements OnInit {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly artistService = inject(ArtistService);
  protected readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected loading = signal(true);
  protected artists = signal<ArtistProfileDto[]>([]);
  protected totalElements = signal(0);
  protected pageIndex = signal(0);
  protected pageSize = signal(12);

  protected searchQuery = signal('');

  ngOnInit() {
    this.loadArtists();
  }

  private loadArtists() {
    this.loading.set(true);
    // In real implementation, would use filters in API call
    this.artistService
      .getArtistProfiles({
        page: this.pageIndex(),
        size: this.pageSize(),
      })
      .subscribe((page) => {
        let filtered = page.content;

        const query = this.searchQuery().toLowerCase();
        if (query) {
          filtered = filtered.filter(
            (a) =>
              a.name?.toLowerCase().includes(query) ||
              a.surname?.toLowerCase().includes(query)
          );
        }

        this.artists.set(filtered);
        this.totalElements.set(filtered.length);
        this.loading.set(false);
      });
  }

  applyFilters() {
    this.pageIndex.set(0);
    this.loadArtists();
  }

  clearFilters() {
    this.searchQuery.set('');
    this.applyFilters();
  }

  hasFilters(): boolean {
    return !!this.searchQuery();
  }

  onPage(event: PageEvent) {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.loadArtists();
  }

  viewArtist(artist: ArtistProfileDto) {
    this.router.navigate(['/artists', artist.userId]);
  }

  getInitials(artist: ArtistProfileDto): string {
    return `${artist.name?.[0] ?? ''}${artist.surname?.[0] ?? ''}`.toUpperCase();
  }

  canInvite(): boolean {
    return this.authService.isResidenceAdmin();
  }

  openInviteDialog(artist: ArtistProfileDto) {
    // TODO: Implement invitation dialog (F13)
    this.snackBar.open('Invitation feature coming soon', 'Close', {
      duration: 2000,
    });
  }
}
