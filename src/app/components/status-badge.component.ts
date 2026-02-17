// ============================================================
// status-badge.component.ts
// ============================================================

import { Component, input, computed } from '@angular/core';
import { MatChip } from '@angular/material/chips';
import { NgClass } from '@angular/common';
import type { ApplicationStatus, ValidationStatus } from '../models';
import {
  applicationStatusLabel,
  validationStatusLabel,
} from '../formatters';

export type BadgeVariant = ApplicationStatus | ValidationStatus;

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [MatChip, NgClass],
  template: `
    <mat-chip
      [ngClass]="cssClass()"
      [disableRipple]="true"
      class="status-chip"
    >
      {{ label() }}
    </mat-chip>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .status-chip {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        pointer-events: none;
        height: 24px;
        min-height: 24px;
        padding: 0 10px;
      }

      .status--success {
        background: #e8f5e9 !important;
        color: #2e7d32 !important;
      }
      .status--warn {
        background: #fff3e0 !important;
        color: #e65100 !important;
      }
      .status--error {
        background: #fce4ec !important;
        color: #c62828 !important;
      }
      .status--info {
        background: #e3f2fd !important;
        color: #1565c0 !important;
      }
      .status--default {
        background: #f5f5f5 !important;
        color: #616161 !important;
      }
    `,
  ],
})
export class StatusBadgeComponent {
  readonly status = input.required<BadgeVariant>();

  protected label = computed(() => {
    const s = this.status();
    if (isApplicationStatus(s))
      return applicationStatusLabel(s as ApplicationStatus);
    return validationStatusLabel(s as ValidationStatus);
  });

  protected cssClass = computed(() => {
    const s = this.status();
    const greenStatuses: BadgeVariant[] = ['APPROVED', 'CONFIRMED'];
    const warnStatuses: BadgeVariant[] = [
      'REVIEWED',
      'RESERVE',
      'PENDING',
    ];
    const redStatuses: BadgeVariant[] = [
      'REJECTED',
      'DECLINED_BY_ARTIST',
    ];
    const infoStatuses: BadgeVariant[] = ['SENT'];

    if (greenStatuses.includes(s)) return 'status--success';
    if (warnStatuses.includes(s)) return 'status--warn';
    if (redStatuses.includes(s)) return 'status--error';
    if (infoStatuses.includes(s)) return 'status--info';
    return 'status--default';
  });
}

function isApplicationStatus(s: string): boolean {
  return [
    'SENT',
    'REVIEWED',
    'APPROVED',
    'RESERVE',
    'REJECTED',
    'CONFIRMED',
    'DECLINED_BY_ARTIST',
  ].includes(s);
}
