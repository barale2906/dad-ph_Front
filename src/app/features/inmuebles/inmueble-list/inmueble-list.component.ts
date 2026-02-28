import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InmuebleService } from '../services/inmueble.service';
import type { Inmueble } from '../../../core/models/inmueble.model';
import type { PaginatedResponse } from '../../../core/models/paginated-response.model';

@Component({
  selector: 'app-inmueble-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './inmueble-list.component.html',
  styleUrl: './inmueble-list.component.scss',
})
export class InmuebleListComponent implements OnInit {
  private readonly inmuebleService = inject(InmuebleService);

  protected inmuebles = signal<Inmueble[]>([]);
  protected meta = signal<PaginatedResponse<Inmueble>['meta'] | null>(null);
  protected loading = true;
  protected deleteConfirmId = signal<number | null>(null);
  protected coeficientesStatus = signal<{
    estado: string;
    suma: number;
    total: number;
  } | null>(null);

  protected filters = signal({
    pagina: 1,
    nomenclatura: '',
    tipo: '',
    activo: '' as '' | 'true' | 'false',
  });

  protected totalPaginas = computed(() => {
    const m = this.meta();
    return m ? m.last_page : 1;
  });

  ngOnInit() {
    this.load();
    this.validarCoeficientes();
  }

  protected load() {
    this.loading = true;
    const f = this.filters();
    const params: Record<string, string | number | boolean> = {
      page: f.pagina,
      per_page: 15,
    };
    if (f.nomenclatura) params['nomenclatura'] = f.nomenclatura;
    if (f.tipo) params['tipo'] = f.tipo;
    if (f.activo !== '') params['activo'] = f.activo === 'true';

    this.inmuebleService.getAll(params).subscribe({
      next: (res) => {
        this.inmuebles.set(res.data);
        this.meta.set(res.meta);
      },
      error: () => {},
      complete: () => (this.loading = false),
    });
  }

  protected validarCoeficientes() {
    this.inmuebleService.validarCoeficientes().subscribe({
      next: (res) => {
        this.coeficientesStatus.set({
          estado: res.estado,
          suma: res.suma,
          total: res.total,
        });
      },
      error: () => {},
    });
  }

  protected applyFilters() {
    this.filters.update((f) => ({ ...f, pagina: 1 }));
    this.load();
  }

  protected goPage(page: number) {
    this.filters.update((f) => ({ ...f, pagina: page }));
    this.load();
  }

  protected confirmDelete(id: number) {
    this.deleteConfirmId.set(id);
  }

  protected cancelDelete() {
    this.deleteConfirmId.set(null);
  }

  protected doDelete(id: number) {
    this.inmuebleService.delete(id).subscribe({
      next: () => {
        this.deleteConfirmId.set(null);
        this.load();
        this.validarCoeficientes();
      },
      error: () => this.deleteConfirmId.set(null),
    });
  }

  protected getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      completo: 'status-ok',
      incompleto: 'status-warn',
      faltante: 'status-warn',
      exceso: 'status-error',
    };
    return map[estado] ?? '';
  }
}
