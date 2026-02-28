import { Injectable, signal, computed } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  detail?: string;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _list = signal<Notification[]>([]);
  readonly list = this._list.asReadonly();
  readonly hasNotifications = computed(() => this._list().length > 0);

  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  private add(type: NotificationType, message: string, detail?: string): void {
    const id = this.generateId();
    const notification: Notification = {
      id,
      type,
      message,
      detail,
      createdAt: Date.now(),
    };
    this._list.update((list) => [...list, notification]);

    setTimeout(() => this.dismiss(id), 5000);
  }

  success(message: string, detail?: string): void {
    this.add('success', message, detail);
  }

  error(message: string, detail?: string): void {
    this.add('error', message, detail);
  }

  info(message: string, detail?: string): void {
    this.add('info', message, detail);
  }

  warning(message: string, detail?: string): void {
    this.add('warning', message, detail);
  }

  dismiss(id: string): void {
    this._list.update((list) => list.filter((n) => n.id !== id));
  }

  dismissAll(): void {
    this._list.set([]);
  }
}
