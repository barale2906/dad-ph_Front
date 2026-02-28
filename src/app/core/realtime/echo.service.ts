import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/services/auth.service';
import { API_BASE } from '../config/api.config';

export type ReunionEventsCallback = {
  onVoteRegistered?: () => void;
  onTimerUpdated?: () => void;
  onQuorumUpdated?: () => void;
};

@Injectable({ providedIn: 'root' })
export class EchoService {
  private readonly auth = inject(AuthService);

  private echo: unknown = null;
  private channelName: string | null = null;

  /** Retorna true si WebSockets están configurados y disponibles. */
  isAvailable(): boolean {
    const key = environment.pusherKey || 'app-key';
    return !!(environment.wsUrl && key);
  }

  /** Suscribe al canal de reunión. Devuelve función para desuscribirse. */
  subscribeToReunion(
    reunionId: number,
    callbacks: ReunionEventsCallback
  ): () => void {
    if (!this.isAvailable()) {
      return () => {};
    }

    const channel = `private-reunion.${reunionId}`;
    if (this.channelName === channel && this.echo) {
      return () => this.leaveReunion();
    }

    this.leaveReunion();
    this.connect(channel, callbacks);
    return () => this.leaveReunion();
  }

  leaveReunion(): void {
    if (this.echo && this.channelName) {
      try {
        (this.echo as { leave: (ch: string) => void }).leave(this.channelName);
      } catch {}
      this.channelName = null;
    }
  }

  private connect(channel: string, callbacks: ReunionEventsCallback): void {
    const token = this.auth.getToken();
    if (!token) return;

    const key = environment.pusherKey || 'app-key';
    const wsHost = this.parseWsHost(environment.wsUrl);
    const wsPort = this.parseWsPort(environment.wsUrl);
    const authEndpoint = `${API_BASE}/broadcasting/auth`;

    const loadPusher = () => new Function('return import("pusher-js")')() as Promise<{ default: unknown }>;
    const loadEcho = () => new Function('return import("laravel-echo")')() as Promise<{ default: unknown }>;

    loadPusher().then((PusherModule) => {
      const Pusher = PusherModule.default;
      (window as unknown as { Pusher: unknown }).Pusher = Pusher;

      return loadEcho().then((EchoModule) => {
        const Echo = EchoModule.default as new (config: Record<string, unknown>) => unknown;
        this.echo = new Echo({
          broadcaster: 'pusher',
          key,
          wsHost: wsHost || 'localhost',
          wsPort: wsPort || 6001,
          wssPort: wsPort || 6001,
          forceTLS: false,
          disableStats: true,
          authEndpoint,
          auth: {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          },
        });

        this.channelName = channel;
        const ch = (this.echo as { private: (name: string) => unknown }).private(channel);

        (ch as { listen: (event: string, cb: () => void) => void }).listen(
          'vote.registered',
          () => callbacks.onVoteRegistered?.()
        );
        (ch as { listen: (event: string, cb: () => void) => void }).listen(
          'timer.updated',
          () => callbacks.onTimerUpdated?.()
        );
        (ch as { listen: (event: string, cb: () => void) => void }).listen(
          'quorum.updated',
          () => callbacks.onQuorumUpdated?.()
        );
      });
    }).catch(() => {
      this.channelName = null;
      this.echo = null;
    });
  }

  private parseWsHost(url: string): string {
    if (!url) return '';
    try {
      const u = new URL(url.startsWith('ws') ? url : `ws://${url}`);
      return u.hostname;
    } catch {
      return url.replace(/^wss?:\/\//, '').split(':')[0] || '';
    }
  }

  private parseWsPort(url: string): number {
    if (!url) return 6001;
    try {
      const u = new URL(url.startsWith('ws') ? url : `ws://${url}`);
      return u.port ? parseInt(u.port, 10) : 6001;
    } catch {
      const parts = url.replace(/^wss?:\/\//, '').split(':');
      return parts[1] ? parseInt(parts[1], 10) : 6001;
    }
  }
}
