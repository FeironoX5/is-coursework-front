// ============================================================
// notification-bell.component.ts
// ============================================================

import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [MatIconButton, MatIcon, MatBadge],
  template: `
    <button
      mat-icon-button
      (click)="navigate()"
      aria-label="Notifications"
    >
      @if (count() > 0) {
        <mat-icon
          [matBadge]="count() > 99 ? '99+' : count()"
          matBadgeColor="warn"
          matBadgeSize="small"
          >notifications</mat-icon
        >
      } @else {
        <mat-icon>notifications_none</mat-icon>
      }
    </button>
  `,
})
export class NotificationBellComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  protected count = signal(0);

  ngOnInit() {
    this.notificationService
      .getUnreadCount()
      .subscribe((n) => this.count.set(n));
  }

  navigate() {
    this.router.navigate(['/applications']);
  }
}
