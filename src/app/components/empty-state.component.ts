// ============================================================
// empty-state.component.ts
// ============================================================

import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIcon],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-state__icon">{{ icon() }}</mat-icon>
      <h3 class="empty-state__title">{{ title() }}</h3>
      @if (message()) {
        <p class="empty-state__message">{{ message() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px 24px;
        text-align: center;
        gap: 12px;
      }
      .empty-state__icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        opacity: 0.4;
      }
      .empty-state__title {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }
      .empty-state__message {
        margin: 0;
        font-size: 14px;
        max-width: 360px;
      }
    `,
  ],
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input('Nothing here yet');
  readonly message = input<string>();
}
