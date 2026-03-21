import { Component, inject, signal, OnInit, computed, viewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AsistenteService } from '../services/asistente.service';
import { InmuebleService } from '../../inmuebles/services/inmueble.service';
import type { AsistenteReunion, AsistenteReunionCreatePayload } from '../../../core/models/asistente.model';
import type { Inmueble } from '../../../core/models/inmueble.model';

type TipoIdentificador = 'telefono' | 'codigo_barras';

/** Prefijos para WhatsApp en registro tardío (valor = código sin +). */
const PREFIJOS_WHATSAPP_TARDIO: ReadonlyArray<{ label: string; codigo: string }> = [
  { label: 'Colombia', codigo: '57' },
  { label: 'Venezuela', codigo: '58' },
  { label: 'Ecuador', codigo: '593' },
  { label: 'Estados Unidos', codigo: '1' },
];

@Component({
  selector: 'app-tardio-asistentes',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './tardio-asistentes.component.html',
  styleUrl: './tardio-asistentes.component.scss',
})
export class TardioAsistentesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly asistenteService = inject(AsistenteService);
  private readonly inmuebleService = inject(InmuebleService);

  protected reunionId = 0;
  private readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly prefijosWhatsapp = PREFIJOS_WHATSAPP_TARDIO;

  // Lista de registrados tardíos en esta sesión
  protected registrados = signal<AsistenteReunion[]>([]);

  // Formulario de registro
  protected tipoIdentificador = signal<TipoIdentificador>('codigo_barras');
  protected searchQuery = signal('');
  protected sugerencias = signal<Inmueble[]>([]);
  protected sugerenciaActivaIdx = signal(-1);
  protected searchLoading = signal(false);
  protected inmuebleSeleccionado = signal<Inmueble | null>(null);
  protected formTelefono = signal('');
  /** Código de país sin +; por defecto Colombia (57). */
  protected prefijoTelefono = signal('57');
  protected formCodigoBarras = signal<number | null>(null);
  protected registering = signal(false);
  protected registerError = signal('');
  protected registerSuccess = signal('');

  protected totalCoeficiente = computed(() =>
    this.registrados()
      .flatMap((a) => a.inmuebles)
      .reduce((sum, i) => sum + (i.coeficiente ?? 0), 0)
      .toFixed(4)
  );

  protected totalRegistrados = computed(() =>
    this.registrados().flatMap((a) => a.inmuebles).length
  );

  ngOnInit() {
    this.reunionId = +this.route.snapshot.paramMap.get('id')!;
  }

  protected onTipoChange(tipo: TipoIdentificador) {
    this.tipoIdentificador.set(tipo);
    this.formTelefono.set('');
    this.formCodigoBarras.set(null);
    this.registerError.set('');
    this.registerSuccess.set('');
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

  protected puedeRegistrar(): boolean {
    if (!this.inmuebleSeleccionado()) return false;
    if (this.tipoIdentificador() === 'telefono') {
      return this.digitosTelefonoLocal().length > 0;
    }
    const cod = this.formCodigoBarras();
    return cod !== null && cod >= 1;
  }

  protected registrar() {
    const inmueble = this.inmuebleSeleccionado();
    if (!inmueble) {
      this.registerError.set('Seleccione un inmueble de la lista.');
      return;
    }

    const tipo = this.tipoIdentificador();
    if (tipo === 'telefono' && !this.digitosTelefonoLocal()) {
      this.registerError.set('Ingrese el número de teléfono.');
      return;
    }
    if (tipo === 'codigo_barras') {
      const cod = this.formCodigoBarras();
      if (!cod || cod < 1) {
        this.registerError.set('Ingrese el código de barras (número mayor a 0).');
        return;
      }
    }

    this.registering.set(true);
    this.registerError.set('');
    this.registerSuccess.set('');

    const payload: AsistenteReunionCreatePayload = {
      inmuebles: [{ inmueble_id: inmueble.id }],
    };

    if (tipo === 'telefono') {
      payload.telefono = this.telefonoInternacionalCompleto();
    } else {
      payload.codigo_barras = this.formCodigoBarras()!;
    }

    this.asistenteService.registroTardio(this.reunionId, payload).subscribe({
      next: (res) => {
        this.registerSuccess.set(`✓ ${inmueble.nomenclatura} registrado como asistente tardío.`);
        this.registering.set(false);
        this.registrados.update((prev) => [...prev, res.data]);
        this.limpiarSeleccion();
        this.formTelefono.set('');
        this.formCodigoBarras.set(null);
        setTimeout(() => this.searchInputRef()?.nativeElement.focus(), 0);
      },
      error: (err) => {
        this.registering.set(false);
        const msg = this.getRegisterErrorMessage(err);
        this.registerError.set(msg);
      },
    });
  }

  /** Mensaje de error según la guía de API de asistentes (409 votación abierta, 429 rate limit). */
  private getRegisterErrorMessage(err: { status?: number; error?: { message?: string } }): string {
    const msg = err?.error?.message ?? 'Error al registrar asistente tardío.';
    if (err?.status === 409 && msg?.toLowerCase().includes('votacion abierta')) {
      return 'No se puede registrar mientras haya una votación en curso en esta reunión. Espera a que cierre.';
    }
    if (err?.status === 429) {
      return 'Demasiadas peticiones. Espere un momento e intente de nuevo.';
    }
    return msg;
  }

  /** Solo dígitos del número local (sin prefijo de país). */
  protected digitosTelefonoLocal(): string {
    return this.formTelefono().replace(/\D/g, '');
  }

  /** Número en formato E.164 sin +: prefijo + dígitos locales. */
  private telefonoInternacionalCompleto(): string {
    return this.prefijoTelefono() + this.digitosTelefonoLocal();
  }
}
