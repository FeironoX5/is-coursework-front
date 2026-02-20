// ============================================================
// achievement-item.component.ts
// ============================================================

import { Component, input, output } from '@angular/core';
import {
  MatListItemIcon,
  MatListItemTitle,
  MatListItemLine
} from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatChip } from '@angular/material/chips';
import type { AchievementDto } from '../models';
import { achievementTypeLabel } from '../formatters';
import {
  MatCardActions,
  MatCardModule,
} from '@angular/material/card';

const ACHIEVEMENT_ICONS: Record<string, string> = {
  EDUCATION: 'school',
  EXHIBITION: 'museum',
  PUBLICATION: 'menu_book',
  AWARD: 'emoji_events',
  AUTO: 'star',
};

@Component({
  selector: 'app-achievement-item',
  standalone: true,
  imports: [
    MatIcon,
    MatIconButton,
    MatChip,
    MatCardModule,
  ],
  template: `
    <mat-card class="achievement-item">
      <mat-card-content>
        <div class="row">
          <mat-icon>{{ icon() }}</mat-icon>

          <div class="content">
            <div class="title-row">
              {{ achievement().title }}
              <mat-chip class="type-chip">{{
                achievementTypeLabel(achievement().type!)
              }}</mat-chip>
            </div>

            @if (achievement().description) {
              <div class="line">{{ achievement().description }}</div>
            }
            @if (achievement().link) {
              <div class="line">
                <a
                  [href]="achievement().link!"
                  target="_blank"
                  rel="noopener"
                  class="link"
                >
                  {{ achievement().link }}
                </a>
              </div>
            }
          </div>
        </div>
      </mat-card-content>

      @if (editable()) {
        <mat-card-actions align="end">
          <button
            mat-icon-button
            (click)="editClicked.emit(achievement())"
            aria-label="Edit"
          >
            <mat-icon>edit</mat-icon>
          </button>
          <button
            mat-icon-button
            color="warn"
            (click)="deleteClicked.emit(achievement().id!)"
            aria-label="Delete"
          >
            <mat-icon>delete</mat-icon>
          </button>
        </mat-card-actions>
      }
    </mat-card>
  `,
  styles: [
    `
      .achievement-item {
        padding: 4px 0;
      }

      .row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .title-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .line {
        font-size: 12px;
        opacity: 0.8;
      }

      .type-chip {
        font-size: 11px;
        height: 20px;
        min-height: 20px;
      }

      .link {
        font-size: 12px;
        color: inherit;
        opacity: 0.7;
        word-break: break-all;
      }
    `,
  ],
})
export class AchievementItemComponent {
  readonly achievement = input.required<AchievementDto>();
  readonly editable = input(false);

  readonly editClicked = output<AchievementDto>();
  readonly deleteClicked = output<number>();

  protected icon() {
    return (
      ACHIEVEMENT_ICONS[this.achievement().type ?? 'AUTO'] ?? 'star'
    );
  }

  protected readonly achievementTypeLabel = achievementTypeLabel;
}
