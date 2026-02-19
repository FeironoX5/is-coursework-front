import { Component, input, computed } from '@angular/core';
import { MatChip } from '@angular/material/chips';
import { NgClass } from '@angular/common';
import { ApplicationStatus, ValidationStatus } from '../models';
import {
  applicationStatusLabel,
  validationStatusLabel,
} from '../formatters';

export type BadgeVariant = ApplicationStatus | ValidationStatus;

@Component({
  selector: 'app-chip',
  standalone: true,
  imports: [MatChip, NgClass],
  template: `
    <mat-chip
      [ngClass]="cssClass()"
      [disableRipple]="true"
      class="chip"
    >
      {{ label() }}
    </mat-chip>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .chip {
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
        background: #1b2e20;
        color: #81c784;
      }

      .status--warn {
        background: #33240f;
        color: #ffb74d;
      }

      .status--error {
        background: #3a1d22;
        color: #ef9a9a;
      }

      .status--info {
        background: #14273a;
        color: #90caf9;
      }

      .status--default {
        background: #2a2a2a;
        color: #bdbdbd;
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
