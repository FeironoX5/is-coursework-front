import {
  Component,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  MatActionList,
  MatListItem,
  MatListItemTitle,
  MatListModule,
} from '@angular/material/list';
import {
  MatButtonModule,
  MatIconButton,
  MatMiniFabButton,
} from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import {
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';


import { EmptyStateComponent } from '../../components/empty-state.component';

import { NotificationService } from '../../services/notification.service';
import type { NotificationDto } from '../../models';
import { formatDate } from '../../formatters';
import { MatBadge } from '@angular/material/badge';
import {
  MatMenuTrigger,
  MatMenu,
  MatMenuModule,
} from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';

const CATEGORY_ICONS: Record<string, string> = {
  SYSTEM: 'notifications',
  INVITE: 'mail',
  REVIEW: 'rate_review',
  STATUS: 'info',
};

@Component({
  selector: 'app-notification-actions',
  imports: [
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatPaginatorModule,
    MatDividerModule,
    EmptyStateComponent,
    MatBadge,
    MatMenuModule,
    MatTooltip,
  ],
  templateUrl: './notification-actions.html',
  styleUrl: './notification-actions.scss',
})
export class NotificationActions implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected isOpened = signal(false);

  protected loading = signal(true);
  protected notifications = signal<NotificationDto[]>([]);
  protected totalElements = signal(0);
  protected pageIndex = signal(0);
  protected unreadCount = signal(0);
  protected readonly pageSize = 20;

  protected readonly formatDate = formatDate;

  constructor() {
    effect(() => {
      const isOpened = this.isOpened();
      if (isOpened) {
        this.notificationService
          .getUnreadCount()
          .subscribe((n) => this.unreadCount.set(n));
        this.loadPage();
      }
    });
  }

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
