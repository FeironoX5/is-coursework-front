import { Component, signal, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  MatButton,
  MatIconButton,
  MatMiniFabButton,
} from '@angular/material/button';
import { MatBadge } from '@angular/material/badge';
import {
  MatMenu,
  MatMenuItem,
  MatMenuTrigger,
} from '@angular/material/menu';
import {
  MatActionList,
  MatDivider,
  MatListItem,
  MatListItemTitle,
  MatListModule,
} from '@angular/material/list';
import { MatTooltip } from '@angular/material/tooltip';

type NotificationType =
  | 'system'
  | 'message'
  | 'task'
  | 'alert'
  | 'update'
  | 'reminder';

interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: NotificationType;
  link?: string;
}

@Component({
  selector: 'app-notification-actions',
  imports: [
    MatIcon,
    MatBadge,
    MatMiniFabButton,
    MatMenuTrigger,
    MatMenu,
    MatActionList,
    MatListItem,
    MatListItemTitle,
    MatListModule,
    MatIconButton,
    MatTooltip,
  ],
  templateUrl: './notification-actions.html',
  styleUrl: './notification-actions.scss',
})
export class NotificationActions {
  isOpened = signal(false);
  isLoading = signal(false);

  notifications = signal<Notification[]>([
    {
      id: 1,
      title: 'Новое сообщение',
      message: 'У вас есть новое сообщение от администратора',
      timestamp: new Date(Date.now() - 5 * 60000),
      isRead: false,
      type: 'message',
      link: '/messages/123',
    },
    {
      id: 2,
      title: 'Важное обновление',
      message:
        'Доступна новая версия приложения. Рекомендуется обновить.',
      timestamp: new Date(Date.now() - 2 * 3600000),
      isRead: false,
      type: 'update',
    },
    {
      id: 3,
      title: 'Новая задача',
      message: 'Вам назначена задача "Подготовить отчет за квартал"',
      timestamp: new Date(Date.now() - 24 * 3600000),
      isRead: true,
      type: 'task',
      link: '/tasks/456',
    },
    {
      id: 4,
      title: 'Критическое предупреждение',
      message: 'Обнаружена проблема с синхронизацией данных',
      timestamp: new Date(Date.now() - 2 * 24 * 3600000),
      isRead: true,
      type: 'alert',
    },
    {
      id: 5,
      title: 'Напоминание',
      message: 'Не забудьте про встречу сегодня в 15:00',
      timestamp: new Date(Date.now() - 3 * 24 * 3600000),
      isRead: true,
      type: 'reminder',
    },
    {
      id: 6,
      title: 'Системное уведомление',
      message: 'Плановое обслуживание системы завтра в 02:00',
      timestamp: new Date(Date.now() - 5 * 24 * 3600000),
      isRead: true,
      type: 'system',
    },
  ]);

  unreadCount = signal(
    this.notifications().filter((n) => !n.isRead).length
  );

  handleNotificationClick(notification: Notification): void {
    this.markAsRead(notification.id);

    if (notification.link) {
      // Здесь можно добавить навигацию
      console.log('Переход по ссылке:', notification.link);
      // this.router.navigate([notification.link]);
    }
  }

  markAsRead(id: number): void {
    this.notifications.update((notifications) =>
      notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
    this.updateUnreadCount();
  }

  markAllAsRead(): void {
    this.notifications.update((notifications) =>
      notifications.map((n) => ({ ...n, isRead: true }))
    );
    this.updateUnreadCount();
  }

  loadMore(): void {
    this.isLoading.set(true);

    // Симуляция загрузки данных с сервера
    setTimeout(() => {
      const newNotifications: Notification[] = [
        {
          id: Date.now(),
          title: 'Загруженное уведомление',
          message: 'Это новое уведомление, загруженное динамически',
          timestamp: new Date(Date.now() - 7 * 24 * 3600000),
          isRead: true,
          type: 'system',
        },
      ];

      this.notifications.update((current) => [
        ...current,
        ...newNotifications,
      ]);
      this.isLoading.set(false);
    }, 1000);
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString('ru-RU');
  }

  private updateUnreadCount(): void {
    this.unreadCount.set(
      this.notifications().filter((n) => !n.isRead).length
    );
  }
}
