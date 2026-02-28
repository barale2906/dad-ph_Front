import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/http/api.service';
import type { Timer, TimerCreatePayload } from '../../../../core/models/timer.model';

@Injectable({ providedIn: 'root' })
export class TimerService {
  private readonly api = inject(ApiService);

  getAll(params: { reunion_id: number; tipo?: string }) {
    return this.api.get<Timer[]>('/timers', params as Record<string, string | number | boolean>);
  }

  getById(id: number) {
    return this.api.get<Timer>(`/timers/${id}`);
  }

  create(payload: TimerCreatePayload) {
    return this.api.post<Timer>('/timers', payload);
  }

  iniciar(id: number) {
    return this.api.post<Timer>(`/timers/${id}/iniciar`, {});
  }

  pausar(id: number) {
    return this.api.post<Timer>(`/timers/${id}/pausar`, {});
  }
}
