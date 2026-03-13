import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { PreguntaService } from '../services/pregunta.service';
import { OpcionService } from '../services/opcion.service';
import { VotoService } from '../services/voto.service';
import { AsistenteService } from '../../asistentes/services/asistente.service';
import { ReunionService } from '../../reuniones/services/reunion.service';
import type { Opcion, Pregunta } from '../../../core/models/pregunta.model';
import type { Reunion } from '../../../core/models/reunion.model';
import type {
  ResultadosPregunta,
  InmueblesVotosResponse,
  InmuebleVotoItem,
} from '../../../core/models/resultados.model';

type Tab = 'config' | 'votar' | 'resultados';

interface BarItem {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface PieSlice {
  path: string;
  color: string;
  label: string;
  value: number;
  percent: number;
}

interface VotoHistItem {
  barcode: string;
  nomenclaturas: string;
  opcionTexto: string;
  time: Date;
}

const PIE_COLORS = [
  '#00ff88',
  '#00d4ff',
  '#ff6b35',
  '#9b59b6',
  '#f1c40f',
  '#e74c3c',
  '#2ecc71',
  '#3498db',
];

@Component({
  selector: 'app-pregunta-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DecimalPipe, DatePipe],
  templateUrl: './pregunta-form.component.html',
  styleUrl: './pregunta-form.component.scss',
})
export class PreguntaFormComponent implements OnInit, OnDestroy {
  @ViewChild('barcodeRef') barcodeRef?: ElementRef<HTMLInputElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly preguntaService = inject(PreguntaService);
  private readonly opcionService = inject(OpcionService);
  private readonly votoService = inject(VotoService);
  private readonly asistenteService = inject(AsistenteService);
  private readonly reunionService = inject(ReunionService);

  protected reunionId = 0;
  protected isEdit = false;
  protected reunion = signal<Reunion | null>(null);
  protected reunionFinalizada = computed(() => this.reunion()?.estado === 'finalizada');
  protected pregunta = signal<Pregunta | null>(null);
  protected preguntaId = signal<number | null>(null);
  protected loading = signal(true);
  protected saving = signal(false);
  protected errorMessage = signal('');
  protected activeTab = signal<Tab>('config');

  // Estado
  protected actionLoading = signal(false);

  // Resultados
  protected resultados = signal<ResultadosPregunta | null>(null);
  protected loadingResultados = signal(false);
  protected lastRefresh = signal<Date | null>(null);

  // Detalle de votos por inmueble
  protected inmueblesVotos = signal<InmueblesVotosResponse | null>(null);
  protected loadingInmuebles = signal(false);
  protected ocultarRespuesta = signal(false);
  protected filtroVotos = signal<'todos' | 'votaron' | 'pendientes'>('todos');

  // Votación por código de barras
  protected selectedOpcionId = signal<number | null>(null);
  protected barcodeValue = signal('');
  protected votoLoading = signal(false);
  protected votoMsg = signal('');
  protected votoError = signal('');
  protected votoHistory = signal<VotoHistItem[]>([]);

  // Opciones eliminadas (para sincronizar al guardar)
  private deletedOpcionIds: number[] = [];
  private pollingTimer: ReturnType<typeof setInterval> | null = null;

  // Computed
  protected estadoActual = computed(() => this.pregunta()?.estado ?? 'inactiva');
  protected opcionesActuales = computed(() => this.pregunta()?.opciones ?? []);
  protected canVotar = computed(() => this.estadoActual() === 'abierta');
  protected hasQuestion = computed(() => this.preguntaId() !== null);

  protected pieUnidades = computed(() => {
    const r = this.resultados();
    if (!r?.opciones.length) return [];
    return this.computePieSlices(
      r.opciones.map((o) => o.unidades ?? o.votos),
      r.opciones.map((o) => o.texto)
    );
  });

  protected pieCoeficiente = computed(() => {
    const r = this.resultados();
    if (!r?.opciones.length) return [];
    const values = r.opciones.map((o) => o.coeficiente ?? 0);
    if (values.every((v) => v === 0)) return [];
    return this.computePieSlices(values, r.opciones.map((o) => o.texto));
  });

  protected hasCoeficienteData = computed(() =>
    (this.resultados()?.opciones ?? []).some(
      (o) => o.coeficiente !== undefined && o.coeficiente > 0
    )
  );

  protected barUnidades = computed<BarItem[]>(() => {
    const r = this.resultados();
    if (!r?.opciones.length) return [];
    return r.opciones.map((o, i) => ({
      label: o.texto,
      value: o.unidades ?? o.votos,
      percentage: o.porcentaje_unidades ?? o.porcentaje,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  });

  protected barCoeficiente = computed<BarItem[]>(() => {
    const r = this.resultados();
    if (!r?.opciones.length) return [];
    const values = r.opciones.map((o) => o.coeficiente ?? 0);
    if (values.every((v) => v === 0)) return [];
    return r.opciones.map((o, i) => ({
      label: o.texto,
      value: o.coeficiente ?? 0,
      percentage: o.porcentaje_coeficiente ?? 0,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  });

  protected opcionColorMap = computed(() => {
    const map = new Map<number, string>();
    (this.resultados()?.opciones ?? []).forEach((o, i) => {
      map.set(o.opcion_id, PIE_COLORS[i % PIE_COLORS.length]);
    });
    return map;
  });

  protected inmueblesFiltrados = computed<InmuebleVotoItem[]>(() => {
    const data = this.inmueblesVotos();
    if (!data) return [];
    switch (this.filtroVotos()) {
      case 'votaron':   return data.inmuebles.filter((i) => i.votado);
      case 'pendientes': return data.inmuebles.filter((i) => !i.votado);
      default:          return data.inmuebles;
    }
  });

  protected pctVotantes = computed(() => {
    const d = this.inmueblesVotos();
    if (!d || d.total_inmuebles === 0) return 0;
    return (d.inmuebles_votaron / d.total_inmuebles) * 100;
  });

  protected form = this.fb.nonNullable.group({
    pregunta: ['', [Validators.required, Validators.maxLength(1000)]],
    opciones: this.fb.array([]),
  });

  get opcionesArray(): FormArray {
    return this.form.get('opciones') as FormArray;
  }

  ngOnInit() {
    this.reunionId = +this.route.snapshot.paramMap.get('id')!;
    const preguntaParam = this.route.snapshot.paramMap.get('preguntaId');

    this.reunionService.getById(this.reunionId).subscribe({
      next: (r: Reunion) => {
        this.reunion.set(r);
        if (r.estado === 'finalizada') {
          if (!preguntaParam || preguntaParam === 'nueva') {
            this.router.navigate(['/reuniones', this.reunionId, 'preguntas']);
            return;
          }
          this.activeTab.set('resultados');
        }
      },
    });

    if (preguntaParam && preguntaParam !== 'nueva') {
      this.isEdit = true;
      const id = +preguntaParam;
      this.preguntaId.set(id);
      this.loadPregunta(id);
    } else {
      this.loading.set(false);
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  private loadPregunta(id: number) {
    this.loading.set(true);
    this.preguntaService.getById(id).subscribe({
      next: (p) => {
        this.pregunta.set(p);
        this.form.patchValue({ pregunta: p.pregunta });
        while (this.opcionesArray.length) this.opcionesArray.removeAt(0);
        (p.opciones ?? []).forEach((o) => this.addOpcion(o));
        if (p.estado === 'abierta') {
          this.startPolling();
        } else if (p.estado === 'cerrada' || p.estado === 'cancelada') {
          this.loadResultados();
        }
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  private loadResultados() {
    const id = this.preguntaId();
    if (!id) return;
    this.loadingResultados.set(true);
    this.preguntaService.getResultados(id).subscribe({
      next: (r) => {
        this.resultados.set(r);
        this.lastRefresh.set(new Date());
      },
      error: () => {},
      complete: () => this.loadingResultados.set(false),
    });
    this.loadInmueblesVotos();
  }

  private loadInmueblesVotos() {
    const id = this.preguntaId();
    if (!id) return;
    this.loadingInmuebles.set(true);
    this.preguntaService.getInmueblesVotos(id).subscribe({
      next: (data) => this.inmueblesVotos.set(data),
      error: () => {},
      complete: () => this.loadingInmuebles.set(false),
    });
  }

  private startPolling() {
    this.stopPolling();
    this.loadResultados();
    this.pollingTimer = setInterval(() => this.loadResultados(), 5000);
  }

  private stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  protected refreshResultados() {
    this.loadResultados();
  }

  // ── Formulario de pregunta ──────────────────────────────────────────────────

  protected addOpcion(existing?: Opcion) {
    const g = this.fb.group({
      id: [existing?.id ?? (null as number | null)],
      texto: [existing?.texto ?? '', [Validators.required, Validators.maxLength(255)]],
      orden: [existing?.orden ?? this.opcionesArray.length + 1, Validators.min(1)],
    });
    this.opcionesArray.push(g);
  }

  protected addNuevaOpcion() {
    this.addOpcion();
  }

  protected removeOpcion(index: number) {
    const g = this.opcionesArray.at(index);
    const id = g.get('id')?.value as number | null;
    if (id) this.deletedOpcionIds.push(id);
    this.opcionesArray.removeAt(index);
  }

  protected onSubmit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');

    const v = this.form.getRawValue();
    const editId = this.preguntaId();

    if (this.isEdit && editId) {
      this.preguntaService
        .update(editId, {
          pregunta: v.pregunta,
          estado: this.estadoActual(),
          orden: this.pregunta()?.orden ?? 1,
        })
        .subscribe({
          next: (p) => {
            this.pregunta.set(p);
            this.saveOpciones(editId);
          },
          error: (err) => {
            this.saving.set(false);
            this.errorMessage.set(err?.error?.message ?? 'Error al guardar.');
          },
        });
    } else {
      this.preguntaService
        .create({
          reunion_id: this.reunionId,
          pregunta: v.pregunta,
          estado: 'inactiva',
        })
        .subscribe({
          next: (p) => {
            this.pregunta.set(p);
            this.preguntaId.set(p.id);
            this.isEdit = true;
            this.saveOpciones(p.id);
          },
          error: (err) => {
            this.saving.set(false);
            this.errorMessage.set(err?.error?.message ?? 'Error al guardar.');
          },
        });
    }
  }

  private saveOpciones(preguntaId: number) {
    const opciones = this.opcionesArray.value as Array<{
      id: number | null;
      texto: string;
      orden: number;
    }>;
    const toCreate = opciones.filter((o) => !o.id && o.texto?.trim());
    const toUpdate = opciones.filter((o) => !!o.id && o.texto?.trim());
    const toDelete = [...this.deletedOpcionIds];
    this.deletedOpcionIds = [];

    const ops: Observable<unknown>[] = [
      ...toUpdate.map((o) =>
        this.opcionService.update(o.id!, { texto: o.texto, orden: o.orden })
      ),
      ...toCreate.map((o) =>
        this.opcionService.create({ pregunta_id: preguntaId, texto: o.texto, orden: o.orden })
      ),
      ...toDelete.map((id) => this.opcionService.delete(id)),
    ];

    if (ops.length === 0) {
      this.afterSave(preguntaId);
      return;
    }

    let done = 0;
    ops.forEach((obs) => {
      obs.subscribe({
        complete: () => {
          done++;
          if (done === ops.length) this.afterSave(preguntaId);
        },
        error: () => {
          done++;
          if (done === ops.length) this.afterSave(preguntaId);
        },
      });
    });
  }

  private afterSave(preguntaId: number) {
    this.saving.set(false);
    this.loadPregunta(preguntaId);
    this.activeTab.set('votar');
  }

  // ── Gestión de estado ───────────────────────────────────────────────────────

  protected abrirVotacion() {
    const id = this.preguntaId();
    if (!id) return;
    this.actionLoading.set(true);
    this.preguntaService.abrir(id).subscribe({
      next: () => {
        this.votoHistory.set([]);
        this.selectedOpcionId.set(null);
        this.barcodeValue.set('');
        this.votoMsg.set('');
        this.votoError.set('');
        this.pollUntilEstado(id, 'abierta', () => this.startPolling());
      },
      error: () => this.actionLoading.set(false),
    });
  }

  protected cerrarVotacion() {
    const id = this.preguntaId();
    if (!id) return;
    this.actionLoading.set(true);
    this.preguntaService.cerrar(id).subscribe({
      next: () => {
        this.stopPolling();
        this.pollUntilEstado(id, 'cerrada', () => this.refreshResultados());
      },
      error: () => this.actionLoading.set(false),
    });
  }

  private pollUntilEstado(
    id: number,
    estadoEsperado: string,
    onSuccess: () => void,
    intentos = 0
  ) {
    const maxIntentos = 10;
    const delay = 1000;
    this.preguntaService.getById(id).subscribe({
      next: (p) => {
        this.pregunta.set(p);
        if (p.estado === estadoEsperado) {
          this.actionLoading.set(false);
          onSuccess();
        } else if (intentos < maxIntentos) {
          setTimeout(
            () => this.pollUntilEstado(id, estadoEsperado, onSuccess, intentos + 1),
            delay
          );
        } else {
          this.actionLoading.set(false);
        }
      },
      error: () => this.actionLoading.set(false),
    });
  }

  protected cancelarVotacion() {
    const id = this.preguntaId();
    if (!id) return;
    this.actionLoading.set(true);
    this.preguntaService
      .patch(id, { estado: 'cancelada' })
      .subscribe({
        next: (updated) => {
          this.pregunta.set(updated);
          this.stopPolling();
        },
        error: () => this.actionLoading.set(false),
        complete: () => this.actionLoading.set(false),
      });
  }

  // ── Registro de votos por código de barras ─────────────────────────────────

  protected selectOpcion(id: number) {
    this.selectedOpcionId.set(id);
    this.votoMsg.set('');
    this.votoError.set('');
    setTimeout(() => this.barcodeRef?.nativeElement?.focus(), 50);
  }

  protected onBarcodeInput(event: Event) {
    this.barcodeValue.set((event.target as HTMLInputElement).value);
  }

  protected onBarcodeKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.registrarVoto();
    }
  }

  protected registrarVoto() {
    const barcode = this.barcodeValue().trim();
    const opcionId = this.selectedOpcionId();
    const preguntaId = this.preguntaId();
    if (!barcode || !opcionId || !preguntaId || this.votoLoading()) return;

    const codigoBarrasNum = parseInt(barcode, 10);
    if (isNaN(codigoBarrasNum) || codigoBarrasNum <= 0) {
      this.votoError.set('El código de barras debe ser un número válido.');
      return;
    }

    this.votoLoading.set(true);
    this.votoMsg.set('');
    this.votoError.set('');

    this.asistenteService.getByReunion(this.reunionId, { codigo_barras: codigoBarrasNum }).subscribe({
      next: (res) => {
        const asistente = res.data[0];
        if (!asistente) {
          this.votoError.set(`Código ${barcode} no registrado en esta reunión.`);
          this.votoLoading.set(false);
          setTimeout(() => this.barcodeRef?.nativeElement?.focus(), 80);
          return;
        }

        const opcionTexto = this.opcionesActuales().find((o) => o.id === opcionId)?.texto ?? '';
        const nomenclaturas = asistente.inmuebles.map((i) => i.nomenclatura).join(', ');

        this.votoService
          .registrar({
            pregunta_id: preguntaId,
            opcion_id: opcionId,
            asistente_id: asistente.id,
          })
          .subscribe({
            next: () => {
              const etiqueta = nomenclaturas || `Código ${barcode}`;
              this.votoMsg.set(`${etiqueta} → ${opcionTexto}`);
              this.votoHistory.update((h) => [
                { barcode, nomenclaturas: etiqueta, opcionTexto, time: new Date() },
                ...h.slice(0, 9),
              ]);
              this.barcodeValue.set('');
              setTimeout(() => this.votoMsg.set(''), 4000);
              setTimeout(() => this.barcodeRef?.nativeElement?.focus(), 80);
            },
            error: (err) => {
              this.votoError.set(err?.error?.message ?? 'Error al registrar el voto.');
              this.votoLoading.set(false);
              setTimeout(() => this.barcodeRef?.nativeElement?.focus(), 80);
            },
            complete: () => this.votoLoading.set(false),
          });
      },
      error: () => {
        this.votoError.set('Error al buscar el código de barras.');
        this.votoLoading.set(false);
        setTimeout(() => this.barcodeRef?.nativeElement?.focus(), 80);
      },
    });
  }

  protected clearVotoHistory() {
    this.votoHistory.set([]);
  }

  // ── Gráficos SVG de torta ──────────────────────────────────────────────────

  private computePieSlices(values: number[], labels: string[]): PieSlice[] {
    const total = values.reduce((s, v) => s + v, 0);
    if (total === 0) return [];

    const items = values
      .map((v, i) => ({ v, i, label: labels[i] }))
      .filter((item) => item.v > 0);

    let angle = -Math.PI / 2;

    return items.map(({ v, i, label }) => {
      const portion = v / total;
      const startAngle = angle;
      angle += portion * 2 * Math.PI;

      let path: string;
      if (portion >= 1) {
        path = 'M 0 0 L 1 0 A 1 1 0 1 1 0.9999 -0.0175 Z';
      } else {
        const x1 = Math.cos(startAngle).toFixed(5);
        const y1 = Math.sin(startAngle).toFixed(5);
        const x2 = Math.cos(angle).toFixed(5);
        const y2 = Math.sin(angle).toFixed(5);
        const largeArc = portion > 0.5 ? 1 : 0;
        path = `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z`;
      }

      return {
        path,
        color: PIE_COLORS[i % PIE_COLORS.length],
        label,
        value: v,
        percent: Math.round(portion * 100),
      };
    });
  }

  protected goBack() {
    this.router.navigate(['/reuniones', this.reunionId, 'preguntas']);
  }
}
