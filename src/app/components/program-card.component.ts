// ============================================================
// program-card.component.ts
// ============================================================

import { Component, input, output, computed } from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardActions,
  MatCardHeader,
  MatCardTitle,
  MatCardSubtitle,
} from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import type { ProgramPreviewDto } from '../models';
import { formatDate, daysUntil } from '../formatters';

@Component({
  selector: 'app-program-card',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardActions,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatButton,
    MatIcon,
  ],
  template: `
    <mat-card class="program-card" appearance="outlined">
      <mat-card-header>
        <mat-card-title>{{ program().title }}</mat-card-title>
        <mat-card-subtitle>
          <mat-icon class="icon-sm">location_on</mat-icon>
          Residence #{{ program().residenceId }}
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="deadline-row">
          <mat-icon
            class="icon-sm deadline-icon"
            [class.urgent]="isUrgent()"
            >schedule</mat-icon
          >
          <span class="deadline-text" [class.urgent]="isUrgent()">
            Apply by {{ formatDate(program().deadlineApply) }}
            @if (days() !== null) {
              <span class="days-left"
                >&nbsp;({{
                  days()! > 0 ? days() + ' days left' : 'Closed'
                }})</span
              >
            }
          </span>
        </div>
      </mat-card-content>

      <mat-card-actions>
        <button
          mat-button
          color="primary"
          (click)="viewClicked.emit(program().id!)"
        >
          View Details
        </button>
        @if (showApply()) {
          <button
            mat-flat-button
            color="primary"
            (click)="applyClicked.emit(program().id!)"
            [disabled]="(days() ?? 1) <= 0"
          >
            Apply Now
          </button>
        }
        @if (showManage()) {
          <button
            mat-stroked-button
            (click)="manageClicked.emit(program().id!)"
          >
            Manage
          </button>
        }
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
      .program-card {
        height: 100%;
        display: flex;
        flex-direction: column;
        transition: box-shadow 0.2s;
        &:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
        }
      }

      mat-card-content {
        flex: 1;
        padding-top: 8px;
      }

      .deadline-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
      }

      .icon-sm {
        font-size: 16px;
        width: 16px;
        height: 16px;
        line-height: 16px;
      }

      .deadline-icon.urgent {
        color: #f57c00;
      }
      .deadline-text.urgent {
        color: #f57c00;
        font-weight: 500;
      }
      .days-left {
        opacity: 0.8;
      }
    `,
  ],
})
export class ProgramCardComponent {
  readonly program = input.required<ProgramPreviewDto>();
  readonly showApply = input(false);
  readonly showManage = input(false);

  readonly viewClicked = output<number>();
  readonly applyClicked = output<number>();
  readonly manageClicked = output<number>();

  protected days = computed(() =>
    daysUntil(this.program().deadlineApply)
  );
  protected isUrgent = computed(() => {
    const d = this.days();
    return d !== null && d >= 0 && d <= 7;
  });

  protected readonly formatDate = formatDate;
}
