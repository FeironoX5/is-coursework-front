// ============================================================
// expert-assignment.page.ts — Assign experts to program (F5)
// ============================================================

import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../components/page-header.component';
import { EmptyStateComponent } from '../../components/empty-state.component';
import { ResidenceProgramService } from '../../services/residence-program.service';
import { ExpertService } from '../../services/expert.service';
import { ProgramDto, UserDto } from '../../models';

@Component({
  selector: 'app-expert-assignment-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatDividerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    EmptyStateComponent,
    PageHeaderComponent,
  ],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div class="loading-center"><mat-spinner /></div>
      } @else if (program()) {
        <app-page-header
          [title]="'Manage Experts: ' + program()!.previewDto?.title"
        >
          <button
            mat-button
            (click)="
              router.navigate([
                '/residences/me/programs',
                programId(),
              ])
            "
          >
            <mat-icon>arrow_back</mat-icon> Back to Program
          </button>
        </app-page-header>

        <!-- Assigned Experts Section -->
        <mat-card appearance="outlined" class="section-card">
          <mat-card-header>
            <mat-card-title
              >Assigned Experts ({{
                assignedExperts().length
              }})</mat-card-title
            >
          </mat-card-header>
          <mat-card-content>
            @if (assignedExperts().length === 0) {
              <app-empty-state
                icon="person_off"
                title="No experts assigned"
                message="Search and assign experts to review applications"
              />
            } @else {
              <mat-list>
                @for (expert of assignedExperts(); track expert.id) {
                  <mat-list-item>
                    <mat-icon matListItemIcon>person</mat-icon>
                    <span matListItemTitle
                      >{{ expert.name }} {{ expert.surname }}</span
                    >
                    <span matListItemLine>{{ expert.username }}</span>
                    <button
                      mat-icon-button
                      matListItemMeta
                      color="warn"
                      (click)="removeExpert(expert.id!)"
                      [disabled]="removing()"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </mat-list-item>
                  <mat-divider />
                }
              </mat-list>
            }
          </mat-card-content>
        </mat-card>

        <!-- Search & Assign Section -->
        <mat-card appearance="outlined" class="section-card">
          <mat-card-header>
            <mat-card-title>Search Experts</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search by name or email</mat-label>
              <input
                matInput
                [(ngModel)]="searchQuery"
                (ngModelChange)="searchExperts()"
                placeholder="Type to search..."
              />
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            @if (searching()) {
              <div class="loading-center">
                <mat-spinner diameter="40" />
              </div>
            } @else if (
              searchQuery() && searchResults().length === 0
            ) {
              <p class="no-results">No experts found</p>
            } @else if (searchResults().length > 0) {
              <mat-list>
                @for (expert of searchResults(); track expert.id) {
                  <mat-list-item>
                    <mat-icon matListItemIcon>person_search</mat-icon>
                    <span matListItemTitle
                      >{{ expert.name }} {{ expert.surname }}</span
                    >
                    <span matListItemLine>{{ expert.username }}</span>
                    <button
                      mat-flat-button
                      color="primary"
                      matListItemMeta
                      (click)="assignExpert(expert.id!)"
                      [disabled]="
                        isAssigned(expert.id!) || assigning()
                      "
                    >
                      {{
                        isAssigned(expert.id!) ? 'Assigned' : 'Assign'
                      }}
                    </button>
                  </mat-list-item>
                  <mat-divider />
                }
              </mat-list>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 32px;
        max-width: 900px;
        margin: 0 auto;
      }
      .loading-center {
        display: flex;
        justify-content: center;
        padding: 80px;
      }
      .section-card {
        margin-bottom: 24px;
      }
      .search-field {
        width: 100%;
        margin-bottom: 16px;
      }
      .no-results {
        color: rgba(0, 0, 0, 0.38);
        font-size: 14px;
        padding: 16px 0;
        text-align: center;
      }
    `,
  ],
})
export class ExpertAssignmentPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  private readonly programService = inject(ResidenceProgramService);
  private readonly expertService = inject(ExpertService);
  private readonly snackBar = inject(MatSnackBar);

  protected loading = signal(true);
  protected searching = signal(false);
  protected assigning = signal(false);
  protected removing = signal(false);

  protected programId = signal(0);
  protected program = signal<ProgramDto | null>(null);
  protected assignedExperts = signal<UserDto[]>([]);
  protected searchQuery = signal('');
  protected searchResults = signal<UserDto[]>([]);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.programId.set(id);
    this.loadProgram(id);
    this.loadAssignedExperts(id);
  }

  private loadProgram(id: number) {
    this.loading.set(true);
    this.programService.getProgramById(id).subscribe({
      next: (p) => {
        this.program.set(p);
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

  private loadAssignedExperts(programId: number) {
    this.expertService
      .getExpertsByProgram(programId)
      .subscribe((page) => {
        this.assignedExperts.set(page.content);
      });
  }

  searchExperts() {
    const query = this.searchQuery().trim();
    if (query.length < 2) {
      this.searchResults.set([]);
      return;
    }

    this.searching.set(true);
    this.expertService.searchExperts(query).subscribe({
      next: (page) => {
        // Filter out already assigned experts
        const assigned = new Set(
          this.assignedExperts().map((e) => e.id)
        );
        this.searchResults.set(
          page.content.filter((e) => !assigned.has(e.id))
        );
        this.searching.set(false);
      },
      error: () => {
        this.searching.set(false);
      },
    });
  }

  assignExpert(expertId: number) {
    this.assigning.set(true);
    this.expertService
      .assignExpertToProgram(this.programId(), expertId)
      .subscribe({
        next: () => {
          this.snackBar.open('Expert assigned', 'Close', {
            duration: 2000,
          });
          this.loadAssignedExperts(this.programId());
          this.searchQuery.set('');
          this.searchResults.set([]);
          this.assigning.set(false);
        },
        error: () => {
          this.snackBar.open('Failed to assign expert', 'Close', {
            duration: 3000,
          });
          this.assigning.set(false);
        },
      });
  }

  removeExpert(expertId: number) {
    if (
      !confirm(
        'Remove this expert from the program? Their evaluations will be deleted.'
      )
    )
      return;

    this.removing.set(true);
    this.expertService
      .removeExpertFromProgram(this.programId(), expertId)
      .subscribe({
        next: () => {
          this.snackBar.open('Expert removed', 'Close', {
            duration: 2000,
          });
          this.loadAssignedExperts(this.programId());
          this.removing.set(false);
        },
        error: () => {
          this.snackBar.open('Failed to remove expert', 'Close', {
            duration: 3000,
          });
          this.removing.set(false);
        },
      });
  }

  isAssigned(expertId: number): boolean {
    return this.assignedExperts().some((e) => e.id === expertId);
  }
}
