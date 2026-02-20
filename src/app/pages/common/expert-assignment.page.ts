// ============================================================
// expert-assignment.page.ts — Assign experts to program (F5)
// ============================================================

import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
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
import {
  ExpertDto,
  PageExpertDto,
  ProgramDto,
  UserDto,
} from '../../models';

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
        <div class="loading-center">
          <mat-spinner />
        </div>
      } @else if (program()) {
        <app-page-header
          [title]="'Manage Experts: ' + program()!.previewDto?.title"
        >
          <button
            mat-button
            (click)="
              router.navigate([
                '/ROLE_RESIDENCE_ADMIN/my_programs',
              ])
            "
          >
            <mat-icon>arrow_back</mat-icon>
            Back to Program
          </button>
        </app-page-header>

        <!-- Assigned Experts Section -->
        <mat-card appearance="outlined" class="section-card">
          <mat-card-header>
            <mat-card-title
              >Assigned Experts ({{ assignedExperts().length }})
            </mat-card-title>
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
                placeholder="Type to search..."
              />
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            @if (searchQuery() && searchResults().length === 0) {
              <p class="no-results">No experts found</p>
            } @else if (searchResults().length > 0) {
              <div
                style="display: flex; flex-direction: column;  gap: 9px;"
              >
                @for (
                  expert of searchResults();
                  track expert.userId
                ) {
                  <div
                    style="display: flex; flex-direction: column;  gap: 5px;"
                  >
                    <span>
                      {{ expert.name }} {{ expert.surname }}
                    </span>
                    <button
                      mat-flat-button
                      color="primary"
                      (click)="assignExpert(expert.userId!)"
                      [disabled]="
                        isAssigned(expert.userId!) || assigning()
                      "
                    >
                      {{
                        isAssigned(expert.userId!)
                          ? 'Assigned'
                          : 'Assign'
                      }}
                    </button>
                  </div>
                }
              </div>
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
  protected assigning = signal(false);
  protected removing = signal(false);

  protected totalElements = signal(0);
  protected pageIndex = signal(0);
  protected readonly pageSize = 12;
  protected programId = signal(0);
  protected program = signal<ProgramDto | null>(null);
  protected assignedExperts = signal<UserDto[]>([]);
  protected searchQuery = signal('');
  protected experts = signal<ExpertDto[]>([]);
  protected searchResults = computed<ExpertDto[]>((): ExpertDto[] => {
    let experts = this.experts();
    const query = this.searchQuery().toLowerCase();
    if (query) {
      experts = experts.filter(
        (e) =>
          e.name?.toLowerCase().includes(query) ||
          e.surname?.toLowerCase().includes(query)
      );
    }
    return experts;
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.programId.set(id);
    this.loadProgram(id);
    this.loadAssignedExperts(id);
    this.loadExperts();
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
        this.router.navigate(['/ROLE_RESIDENCE_ADMIN/my_programs']);
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

  private loadExperts() {
    this.expertService
      .getExperts({ page: this.pageIndex(), size: this.pageSize })
      .subscribe((page) => {
        this.experts.set(page.content);
        this.totalElements.set(page.totalElements);
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
