import { Component, inject, input, output, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { TimerService } from '../services/timer.service';
import { SoundService } from '../../../../core/services/sound.service';
import type { Timer } from '../../../../core/models/timer.model';

@Component({
  selector: 'app-timer-countdown',
  standalone: true,
  template: `
    <div class="timer-countdown panel-hud">
      <div class="timer-display">{{ formattedTime() }}</div>
      <div class="timer-label">{{ timer().interviniente_nombre || (timer().tipo === 'VOTACION' ? 'Votación' : 'Intervención') }}</div>
      <div class="timer-actions">
        @if (timer().estado === 'activo') {
          <button type="button" class="btn btn-outline btn-sm" (click)="pausar()">Pausar</button>
        }
        @if (timer().estado === 'pausado' || timer().estado === 'inactivo') {
          <button type="button" class="btn btn-primary btn-sm" (click)="iniciar()">Iniciar</button>
        }
      </div>
    </div>
  `,
  styles: [`
    .timer-countdown { padding: 1rem; text-align: center; max-width: 280px; }
    .timer-display { font-family: var(--font-mono); font-size: 2rem; color: var(--neon-green); }
    .timer-label { font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem; }
    .timer-actions { margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center; }
    .btn { padding: 0.35rem 0.75rem; font-size: 0.85rem; border-radius: 4px; cursor: pointer; border: none; }
    .btn-primary { background: var(--neon-green); color: var(--bg-dark); }
    .btn-outline { background: transparent; border: 1px solid var(--neon-blue); color: var(--neon-blue); }
  `],
})
export class TimerCountdownComponent implements OnInit, OnDestroy {
  timer = input.required<Timer>();
  timerUpdated = output<Timer>();
  onFinished = output<void>();

  private readonly timerService = inject(TimerService);
  private readonly sound = inject(SoundService);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  protected segundosRestantes = signal(0);
  protected formattedTime = signal('00:00');

  constructor() {
    effect(() => {
      const t = this.timer();
      const seg = Math.max(0, t.tiempo_restante_segundos ?? t.duracion_segundos);
      this.segundosRestantes.set(seg);
    });
  }

  ngOnInit() {
    this.syncFromTimer();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private syncFromTimer() {
    const t = this.timer();
    const seg = Math.max(0, t.tiempo_restante_segundos ?? t.duracion_segundos);
    this.segundosRestantes.set(seg);
  }

  private tick() {
    const t = this.timer();
    const current = this.segundosRestantes();
    if (t.estado === 'activo' && current > 0) {
      const next = Math.max(0, current - 1);
      this.segundosRestantes.set(next);
      if (next === 0) {
        this.sound.playAlarm();
        this.onFinished.emit();
      }
    } else if (t.estado === 'pausado' || t.estado === 'inactivo') {
      this.syncFromTimer();
    }
    const m = Math.floor(this.segundosRestantes() / 60);
    const s = Math.floor(this.segundosRestantes() % 60);
    this.formattedTime.set(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
  }

  protected iniciar() {
    this.timerService.iniciar(this.timer().id).subscribe({
      next: (updated: Timer) => this.timerUpdated.emit(updated),
    });
  }

  protected pausar() {
    this.timerService.pausar(this.timer().id).subscribe({
      next: (updated: Timer) => this.timerUpdated.emit(updated),
    });
  }
}
