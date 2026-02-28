import { ChangeDetectionStrategy, Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReunionService } from '../services/reunion.service';
import { OrdenDiaService } from '../orden-dia/services/orden-dia.service';
import { QuorumService } from '../quorum/services/quorum.service';
import { PreguntaService } from '../../preguntas/services/pregunta.service';
import { VotoService } from '../../preguntas/services/voto.service';
import { TimerService } from '../timers/services/timer.service';
import { AsistenteService } from '../../asistentes/services/asistente.service';
import { EchoService } from '../../../core/realtime/echo.service';
import { TimerCountdownComponent } from '../timers/timer-countdown/timer-countdown.component';
import { ResultadosComponent } from '../../preguntas/resultados/resultados.component';
import type { Reunion } from '../../../core/models/reunion.model';
import type { OrdenDiaItem } from '../../../core/models/orden-dia.model';
import type { Quorum } from '../../../core/models/quorum.model';
import type { Pregunta } from '../../../core/models/pregunta.model';
import type { Timer } from '../../../core/models/timer.model';
import type { Asistente } from '../../../core/models/asistente.model';

@Component({
  selector: 'app-en-vivo',
  standalone: true,
  imports: [RouterLink, DecimalPipe, FormsModule, TimerCountdownComponent, ResultadosComponent],
  templateUrl: './en-vivo.component.html',
  styleUrl: './en-vivo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnVivoComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reunionService = inject(ReunionService);
  private readonly ordenDiaService = inject(OrdenDiaService);
  private readonly quorumService = inject(QuorumService);
  private readonly preguntaService = inject(PreguntaService);
  private readonly votoService = inject(VotoService);
  private readonly timerService = inject(TimerService);
  private readonly asistenteService = inject(AsistenteService);
  private readonly echoService = inject(EchoService);

  protected reunionId = 0;
  protected wsConnected = false;
  protected reunion = signal<Reunion | null>(null);
  protected ordenDia = signal<OrdenDiaItem[]>([]);
  protected quorum = signal<Quorum | null>(null);
  protected preguntas = signal<Pregunta[]>([]);
  protected timers = signal<Timer[]>([]);
  protected asistentes = signal<Asistente[]>([]);
  protected loading = true;
  protected barcodeInput = '';
  protected registering = false;
  protected barcodeError = '';
  protected generandoQuorum = false;
  protected votandoPreguntaId = 0;
  protected votoAsistenteId = 0;
  protected votoError = '';
  protected showTimerForm = false;
  protected timerForm = {
    tipo: 'INTERVENCION' as 'INTERVENCION' | 'VOTACION',
    duracion_segundos: 120,
    interviniente_nombre: '',
    pregunta_id: 0,
  };
  protected creandoTimer = false;
  protected timerError = '';
  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.reunionId = +this.route.snapshot.paramMap.get('id')!;
    this.load();
    this.setupRealtime();
    const pollMs = this.echoService.isAvailable() ? 30000 : 5000;
    this.refreshInterval = setInterval(() => this.refresh(), pollMs);
  }

  ngOnDestroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    this.unsubscribeRealtime?.();
    this.echoService.leaveReunion();
  }

  private load() {
    this.reunionService.getById(this.reunionId).subscribe({
      next: (r) => {
        if (r.estado !== 'en_curso') {
          this.router.navigate(['/reuniones', this.reunionId]);
          return;
        }
        this.reunion.set(r);
      },
      error: () => (this.loading = false),
    });
    this.ordenDiaService.getByReunion(this.reunionId).subscribe({
      next: (list: OrdenDiaItem[]) => this.ordenDia.set(list),
    });
    this.asistenteService.getAll({ per_page: 200 }).subscribe({
      next: (res) => this.asistentes.set(res.data),
    });
    this.refresh();
    this.loading = false;
  }

  private refresh() {
    this.quorumService.getQuorum(this.reunionId).subscribe({
      next: (q) => this.quorum.set(q),
      error: () => {},
    });
    this.preguntaService.getAll({ reunion_id: this.reunionId }).subscribe({
      next: (list) => this.preguntas.set(list),
      error: () => {},
    });
    this.timerService.getAll({ reunion_id: this.reunionId }).subscribe({
      next: (list) => this.timers.set(list),
      error: () => {},
    });
  }

  protected generarQuorum() {
    this.generandoQuorum = true;
    this.quorumService.generarPregunta(this.reunionId).subscribe({
      next: () => this.refresh(),
      error: () => {},
      complete: () => (this.generandoQuorum = false),
    });
  }

  protected onRegistrarBarcode() {
    const codigo = this.barcodeInput.trim();
    if (!codigo) return;
    this.registering = true;
    this.barcodeError = '';
    this.quorumService.registrarAsistencia(this.reunionId, codigo).subscribe({
      next: () => {
        this.barcodeInput = '';
        this.refresh();
      },
      error: (err) => {
        this.barcodeError = err?.error?.message ?? 'Error al registrar.';
      },
      complete: () => (this.registering = false),
    });
  }

  protected abrirPregunta(p: Pregunta) {
    this.preguntaService.abrir(p.id).subscribe({
      next: () => this.refresh(),
    });
  }

  protected cerrarPregunta(p: Pregunta) {
    this.preguntaService.cerrar(p.id).subscribe({
      next: () => this.refresh(),
    });
  }

  protected votar(preguntaId: number, opcionId: number) {
    if (!this.votoAsistenteId) {
      this.votoError = 'Seleccione un asistente.';
      return;
    }
    this.votoError = '';
    this.votoService.registrar({
      pregunta_id: preguntaId,
      opcion_id: opcionId,
      asistente_id: this.votoAsistenteId,
    }).subscribe({
      next: () => this.refresh(),
      error: (err) => {
        this.votoError = err?.error?.message ?? (err?.status === 429 ? 'Demasiadas peticiones. Espere un momento.' : 'Error al registrar voto.');
      },
    });
  }

  protected onTimerUpdated(updated: Timer) {
    this.timers.update((list) =>
      list.map((t) => (t.id === updated.id ? updated : t))
    );
  }

  protected crearTimer() {
    this.creandoTimer = true;
    this.timerError = '';
    const payload = {
      reunion_id: this.reunionId,
      tipo: this.timerForm.tipo,
      duracion_segundos: this.timerForm.duracion_segundos,
      interviniente_nombre: this.timerForm.interviniente_nombre || undefined,
      pregunta_id: this.timerForm.pregunta_id || undefined,
    };
    this.timerService.create(payload).subscribe({
      next: () => {
        this.showTimerForm = false;
        this.timerForm = { tipo: 'INTERVENCION', duracion_segundos: 120, interviniente_nombre: '', pregunta_id: 0 };
        this.refresh();
      },
      error: (err) => {
        this.timerError = err?.error?.message ?? 'Error al crear timer.';
      },
      complete: () => (this.creandoTimer = false),
    });
  }

  protected preguntasAbiertas() {
    return this.preguntas().filter((p) => p.estado === 'abierta');
  }

  protected preguntasCerradas() {
    return this.preguntas().filter((p) => p.estado === 'cerrada');
  }

  protected timersActivos() {
    return this.timers().filter((t) => t.estado === 'activo' || t.estado === 'pausado');
  }

  private unsubscribeRealtime: (() => void) | null = null;

  private setupRealtime(): void {
    if (!this.echoService.isAvailable()) return;
    this.unsubscribeRealtime = this.echoService.subscribeToReunion(
      this.reunionId,
      {
        onVoteRegistered: () => this.refresh(),
        onTimerUpdated: () => this.refresh(),
        onQuorumUpdated: () => this.refresh(),
      }
    );
    this.wsConnected = true;
  }
}
