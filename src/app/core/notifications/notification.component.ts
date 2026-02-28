import { Component, inject } from '@angular/core';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  template: `
    @if (notificationService.hasNotifications()) {
      <div class="notifications-container" aria-live="polite">
        @for (n of notificationService.list(); track n.id) {
          <div
            class="notification notification--{{ n.type }}"
            role="alert"
            [attr.aria-label]="n.message"
          >
            <span class="notification__icon">{{ getIcon(n.type) }}</span>
            <div class="notification__content">
              <span class="notification__message">{{ n.message }}</span>
              @if (n.detail) {
                <span class="notification__detail">{{ n.detail }}</span>
              }
            </div>
            <button
              type="button"
              class="notification__close"
              (click)="notificationService.dismiss(n.id)"
              aria-label="Cerrar notificación"
            >
              ×
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
      width: 100%;
    }

    .notification {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: 4px;
      border: 1px solid;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .notification__icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .notification__content {
      flex: 1;
      min-width: 0;
    }

    .notification__message {
      display: block;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .notification__detail {
      display: block;
      font-size: 0.8rem;
      opacity: 0.9;
      margin-top: 0.25rem;
    }

    .notification__close {
      background: none;
      border: none;
      color: inherit;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      opacity: 0.8;
      padding: 0 0.25rem;

      &:hover {
        opacity: 1;
      }
    }

    .notification--success {
      background: rgba(0, 255, 136, 0.12);
      border-color: var(--neon-green);
      color: var(--neon-green);
    }

    .notification--error {
      background: rgba(255, 59, 59, 0.15);
      border-color: var(--accent-red);
      color: var(--accent-red);
    }

    .notification--info {
      background: rgba(0, 212, 255, 0.12);
      border-color: var(--neon-blue);
      color: var(--neon-blue);
    }

    .notification--warning {
      background: rgba(255, 140, 66, 0.15);
      border-color: var(--accent-orange);
      color: var(--accent-orange);
    }
  `],
})
export class NotificationComponent {
  readonly notificationService = inject(NotificationService);

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✓',
      error: '✕',
      info: 'i',
      warning: '!',
    };
    return icons[type] ?? '•';
  }
}
