export type NotificationCategory =
  | 'system'
  | 'invite'
  | 'review'
  | 'status';

export interface Notification {
  id: string;
  message: string;
  category: NotificationCategory;
  createdAt: string;
  isRead: boolean;
  link?: string;
}
