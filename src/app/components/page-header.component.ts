// ============================================================
// page-header.component.ts
// ============================================================

import { Component, input } from '@angular/core';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MatDivider],
  template: `
    <header class="page-header">
      <div class="page-header__content">
        <div class="page-header__text">
          <h1 class="page-header__title">{{ title() }}</h1>
        </div>
        <div class="page-header__actions">
          <ng-content />
        </div>
      </div>
      <mat-divider />
    </header>
  `,
  styles: [
    `
      .page-header {
        margin-bottom: 32px;
      }
      .page-header__content {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding-bottom: 16px;
      }
      .page-header__title {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        line-height: 1.2;
      }
      .page-header__subtitle {
        margin: 6px 0 0;
        font-size: 14px;
      }
      .page-header__actions {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-shrink: 0;
      }
    `,
  ],
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
}
