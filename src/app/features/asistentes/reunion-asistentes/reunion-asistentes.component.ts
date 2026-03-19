import { Component, inject, signal, OnInit, computed, viewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AsistenteService } from '../services/asistente.service';
import { InmuebleService } from '../../inmuebles/services/inmueble.service';
import type { AsistenteReunion, AsistenteReunionCreatePayload } from '../../../core/models/asistente.model';
import type { Inmueble } from '../../../core/models/inmueble.model';

@Component({
  selector: 'app-reunion-asistentes',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './reunion-asistentes.component.html',
  styleUrl: './reunion-asistentes.component.scss',
})
export class ReunionAsistentesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly asistenteService = inject(AsistenteService);
  private readonly inmuebleService = inject(InmuebleService);

  protected reunionId = 0;
  private readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  // Lista de registrados
  protected asistentes = signal<AsistenteReunion[]>([]);
  protected loading = signal(true);

  // Formulario de registro rápido
  protected searchQuery = signal('');
  protected sugerencias = signal<Inmueble[]>([]);
  protected sugerenciaActivaIdx = signal(-1);
  protected searchLoading = signal(false);
  protected inmuebleSeleccionado = signal<Inmueble | null>(null);
  protected formCodigoBarras = signal<number | null>(null);
  protected registering = signal(false);
  protected registerError = signal('');
  protected registerSuccess = signal('');

  // Resumen de coeficiente
  protected totalCoeficiente = computed(() =>
    this.asistentes()
      .flatMap((a) => a.inmuebles)
      .reduce((sum, i) => sum + (i.coeficiente ?? 0), 0)
      .toFixed(4)
  );

  ngOnInit() {
    this.reunionId = +this.route.snapshot.paramMap.get('id')!;
    this.cargarAsistentes();
  }

  protected cargarAsistentes() {
    this.loading.set(true);
    this.asistenteService.getByReunion(this.reunionId, { per_page: 200 }).subscribe({
      next: (res) => {
        this.asistentes.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected onSearchChange(value: string) {
    this.searchQuery.set(value);
    this.inmuebleSeleccionado.set(null);
    this.sugerenciaActivaIdx.set(-1);
    const q = value.trim();
    if (!q) {
      this.sugerencias.set([]);
      return;
    }
    this.searchLoading.set(true);
    this.inmuebleService.getAll({ nomenclatura: q, per_page: 10, activo: true }).subscribe({
      next: (res) => {
        this.sugerencias.set(res.data);
        this.sugerenciaActivaIdx.set(-1);
        this.searchLoading.set(false);
      },
      error: () => this.searchLoading.set(false),
    });
  }

  protected onSearchKeydown(event: KeyboardEvent) {
    const lista = this.sugerencias();
    if (!lista.length || this.inmuebleSeleccionado()) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.sugerenciaActivaIdx.update((i) => Math.min(i + 1, lista.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.sugerenciaActivaIdx.update((i) => Math.max(i - 1, 0));
        break;
      case 'Enter': {
        event.preventDefault();
        const idx = this.sugerenciaActivaIdx();
        if (idx >= 0 && idx < lista.length) {
          this.seleccionarInmueble(lista[idx]);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.sugerencias.set([]);
        this.sugerenciaActivaIdx.set(-1);
        break;
    }
  }

  protected seleccionarInmueble(inmueble: Inmueble) {
    this.inmuebleSeleccionado.set(inmueble);
    this.searchQuery.set(inmueble.nomenclatura);
    this.sugerencias.set([]);
    this.sugerenciaActivaIdx.set(-1);
  }

  protected limpiarSeleccion() {
    this.inmuebleSeleccionado.set(null);
    this.searchQuery.set('');
    this.sugerencias.set([]);
    this.sugerenciaActivaIdx.set(-1);
  }

  protected registrar() {
    const inmueble = this.inmuebleSeleccionado();
    if (!inmueble) {
      this.registerError.set('Seleccione un inmueble de la lista.');
      return;
    }
    const codBarras = this.formCodigoBarras();
    if (!codBarras || codBarras < 1) {
      this.registerError.set('Ingrese el código de barras (número mayor a 0).');
      return;
    }

    this.registering.set(true);
    this.registerError.set('');
    this.registerSuccess.set('');

    const payload: AsistenteReunionCreatePayload = {
      codigo_barras: codBarras,
      inmuebles: [{ inmueble_id: inmueble.id }],
    };

    this.asistenteService.createForReunionWithCheckIn(this.reunionId, payload).subscribe({
      next: () => {
        this.registerSuccess.set(`✓ ${inmueble.nomenclatura} registrado correctamente.`);
        this.registering.set(false);
        this.limpiarSeleccion();
        this.formCodigoBarras.set(null);
        this.cargarAsistentes();
        setTimeout(() => this.searchInputRef()?.nativeElement.focus(), 0);
      },
      error: (err) => {
        this.registering.set(false);
        const msg = this.getRegisterErrorMessage(err);
        this.registerError.set(msg);
      },
    });
  }

  protected totalRegistrados = computed(() =>
    this.asistentes().flatMap((a) => a.inmuebles).length
  );

  /** Mensaje de error según la guía de API de asistentes (409 votación abierta, 429 rate limit). */
  private getRegisterErrorMessage(err: { status?: number; error?: { message?: string } }): string {
    const msg = err?.error?.message ?? 'Error al registrar.';
    if (err?.status === 409 && msg?.toLowerCase().includes('votacion abierta')) {
      return 'No se puede registrar mientras haya una votación en curso en esta reunión. Espera a que cierre.';
    }
    if (err?.status === 429) {
      return 'Demasiadas peticiones. Espere un momento e intente de nuevo.';
    }
    return msg;
  }
}
