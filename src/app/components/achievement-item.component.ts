// ============================================================
// achievement-item.component.ts
// ============================================================

import { Component, input, output } from '@angular/core';
import {
  MatListItem,
  MatList,
  MatListItemIcon,
  MatListItemTitle,
  MatListItemLine,
} from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatChip } from '@angular/material/chips';
import type { AchievementDto } from '../models';
import { achievementTypeLabel } from '../formatters';

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
    MatListItem,
    MatList,
    MatIcon,
    MatIconButton,
    MatChip,
    MatListItemIcon,
    MatListItemTitle,
    MatListItemLine,
  ],
  template: `
    <mat-list-item class="achievement-item">
      <mat-icon matListItemIcon>{{ icon() }}</mat-icon>

      <span matListItemTitle class="title-row">
        {{ achievement().title }}
        <mat-chip class="type-chip">{{
          achievementTypeLabel(achievement().type!)
        }}</mat-chip>
      </span>

      @if (achievement().description) {
        <span matListItemLine>{{ achievement().description }}</span>
      }
      @if (achievement().link) {
        <span matListItemLine>
          <a
            [href]="achievement().link!"
            target="_blank"
            rel="noopener"
            class="link"
          >
            {{ achievement().link }}
          </a>
        </span>
      }

      @if (editable()) {
        <div class="actions" matListItemMeta>
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
        </div>
      }
    </mat-list-item>
  `,
  styles: [
    `
      .achievement-item {
        height: auto !important;
        padding: 12px 0;
      }
      .title-row {
        display: flex;
        align-items: center;
        gap: 8px;
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
      .actions {
        display: flex;
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
