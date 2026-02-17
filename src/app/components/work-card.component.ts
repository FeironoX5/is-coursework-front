// ============================================================
// work-card.component.ts
// ============================================================

import { Component, input, output } from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardActions,
  MatCardHeader,
  MatCardTitle,
  MatCardSubtitle,
} from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import type { WorkDto } from '../models';
import { artDirectionLabel, formatDate } from '../formatters';

@Component({
  selector: 'app-work-card',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardActions,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatButton,
    MatIconButton,
    MatIcon,
    MatChipsModule,
  ],
  template: `
    <mat-card class="work-card" appearance="outlined">
      <mat-card-header>
        <mat-card-title>{{ work().title }}</mat-card-title>
        <mat-card-subtitle>{{
          formatDate(work().date)
        }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <mat-chip-set>
          <mat-chip>{{
            artDirectionLabel(work().artDirection!)
          }}</mat-chip>
        </mat-chip-set>
        @if (work().description) {
          <p class="description">{{ work().description }}</p>
        }
      </mat-card-content>

      <mat-card-actions>
        @if (work().link) {
          <a
            mat-button
            [href]="work().link!"
            target="_blank"
            rel="noopener"
          >
            <mat-icon>open_in_new</mat-icon> View
          </a>
        }
        @if (editable()) {
          <button
            mat-icon-button
            (click)="editClicked.emit(work())"
            aria-label="Edit"
          >
            <mat-icon>edit</mat-icon>
          </button>
          <button
            mat-icon-button
            color="warn"
            (click)="deleteClicked.emit(work().id!)"
            aria-label="Delete"
          >
            <mat-icon>delete</mat-icon>
          </button>
        }
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
      .work-card {
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
      .description {
        margin: 12px 0 0;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.6);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
})
export class WorkCardComponent {
  readonly work = input.required<WorkDto>();
  readonly editable = input(false);

  readonly editClicked = output<WorkDto>();
  readonly deleteClicked = output<number>();

  protected readonly artDirectionLabel = artDirectionLabel;
  protected readonly formatDate = formatDate;
}
