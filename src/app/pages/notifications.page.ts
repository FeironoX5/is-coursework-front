// ============================================================
// notifications.page.ts
// ============================================================

import { Component, inject, OnInit, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import {
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { PageHeaderComponent } from '../components/page-header.component';
import { EmptyStateComponent } from '../components/empty-state.component';

import { NotificationService } from '../services/notification.service';
import type { NotificationDto } from '../models';
import { formatDate } from '../formatters';

const CATEGORY_ICONS: Record<string, string> = {
  SYSTEM: 'notifications',
  INVITE: 'mail',
  REVIEW: 'rate_review',
  STATUS: 'info',
};

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatPaginatorModule,
    MatDividerModule,
    PageHeaderComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page-container">
      <app-page-header
        title="Notifications"
        [subtitle]="unreadCount() + ' unread'"
      >
        @if (unreadCount() > 0) {
          <button mat-stroked-button (click)="markAllRead()">
            <mat-icon>done_all</mat-icon> Mark all read
          </button>
        }
      </app-page-header>

      @if (loading()) {
        <div class="loading-center"><mat-spinner /></div>
      } @else if (notifications().length === 0) {
        <app-empty-state
          icon="notifications_none"
          title="All caught up!"
          message="No notifications yet"
        />
      } @else {
        <mat-list>
          @for (n of notifications(); track n.id) {
            <mat-list-item
              class="notification-item"
              [class.unread]="!n.readAt"
              (click)="handleClick(n)"
            >
              <mat-icon
                matListItemIcon
                [class.unread-icon]="!n.readAt"
              >
                {{ categoryIcon(n.category!) }}
              </mat-icon>

              <span matListItemTitle>{{ n.message }}</span>
              <span matListItemLine class="meta-line">
                <mat-chip class="cat-chip">{{ n.category }}</mat-chip>
                <span class="date">{{
                  formatDate(n.createdAt)
                }}</span>
              </span>

              @if (!n.readAt) {
                <button
                  mat-icon-button
                  matListItemMeta
                  (click)="markRead($event, n.id!)"
                  aria-label="Mark read"
                >
                  <mat-icon>radio_button_unchecked</mat-icon>
                </button>
              } @else {
                <mat-icon matListItemMeta class="read-check"
                  >check_circle</mat-icon
                >
              }
            </mat-list-item>
            <mat-divider />
          }
        </mat-list>

        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize"
          [pageIndex]="pageIndex()"
          (page)="onPage($event)"
        />
      }
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 32px;
        max-width: 800px;
        margin: 0 auto;
      }
      .loading-center {
        display: flex;
        justify-content: center;
        padding: 80px;
      }

      .notification-item {
        cursor: pointer;
        transition: background 0.15s;
        height: auto !important;
        padding: 12px 0;
        &:hover {
          background: rgba(0, 0, 0, 0.03);
        }
      }
      .notification-item.unread {
        background: #f3f0ff;
      }

      .unread-icon {
        color: #7c4dff;
      }

      .meta-line {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
      }

      .cat-chip {
        font-size: 10px;
        height: 18px;
        min-height: 18px;
        padding: 0 8px;
      }

      .date {
        font-size: 11px;
        color: rgba(0, 0, 0, 0.38);
      }

      .read-check {
        color: #4caf50;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    `,
  ],
})
export class NotificationsPage implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected loading = signal(true);
  protected notifications = signal<NotificationDto[]>([]);
  protected totalElements = signal(0);
  protected pageIndex = signal(0);
  protected unreadCount = signal(0);
  protected readonly pageSize = 20;

  protected readonly formatDate = formatDate;

  ngOnInit() {
    this.notificationService
      .getUnreadCount()
      .subscribe((n) => this.unreadCount.set(n));
    this.loadPage();
  }

  private loadPage() {
    this.loading.set(true);
    this.notificationService
      .getNotifications({
        page: this.pageIndex(),
        size: this.pageSize,
      })
      .subscribe((page) => {
        this.notifications.set(page.content);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      });
  }

  onPage(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.loadPage();
  }

  markRead(event: Event, id: number) {
    event.stopPropagation();
    this.notificationService.markAsRead(id).subscribe(() => {
      this.notifications.update((ns) =>
        ns.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
      this.unreadCount.update((c) => Math.max(0, c - 1));
    });
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.update((ns) =>
        ns.map((n) => ({
          ...n,
          readAt: n.readAt ?? new Date().toISOString(),
        }))
      );
      this.unreadCount.set(0);
      this.snackBar.open(
        'All notifications marked as read',
        'Close',
        { duration: 2000 }
      );
    });
  }

  handleClick(n: NotificationDto) {
    if (!n.readAt) this.markRead(new Event('click'), n.id!);
    if (n.link) this.router.navigateByUrl(n.link);
  }

  categoryIcon(category: string): string {
    return CATEGORY_ICONS[category] ?? 'notifications';
  }
}
