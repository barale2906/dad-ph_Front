import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReunionService } from '../services/reunion.service';
import type { Reunion } from '../../../core/models/reunion.model';
import type { PaginatedResponse } from '../../../core/models/paginated-response.model';

@Component({
  selector: 'app-reunion-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './reunion-list.component.html',
  styleUrl: './reunion-list.component.scss',
})
export class ReunionListComponent implements OnInit {
  private readonly reunionService = inject(ReunionService);

  protected reuniones = signal<Reunion[]>([]);
  protected meta = signal<PaginatedResponse<Reunion>['meta'] | null>(null);
  protected loading = true;
  protected deleteConfirmId = signal<number | null>(null);
  protected actionLoadingId = signal<number | null>(null);

  protected filters = signal({
    pagina: 1,
    estado: '' as string,
    tipo: '' as string,
  });

  protected totalPaginas = computed(() => this.meta()?.last_page ?? 1);

  ngOnInit() {
    this.load();
  }

  protected load() {
    this.loading = true;
    const f = this.filters();
    const params: Record<string, string | number | boolean> = {
      page: f.pagina,
      per_page: 15,
    };
    if (f.estado) params['estado'] = f.estado;
    if (f.tipo) params['tipo'] = f.tipo;

    this.reunionService.getAll(params).subscribe({
      next: (res) => {
        this.reuniones.set(res.data);
        this.meta.set(res.meta);
      },
      error: () => {},
      complete: () => (this.loading = false),
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
    this.reunionService.delete(id).subscribe({
      next: () => {
        this.deleteConfirmId.set(null);
        this.load();
      },
      error: () => this.deleteConfirmId.set(null),
    });
  }

  protected iniciar(r: Reunion) {
    if (r.estado !== 'programada') return;
    this.actionLoadingId.set(r.id);
    this.reunionService.iniciar(r.id).subscribe({
      next: () => this.load(),
      error: () => this.actionLoadingId.set(null),
      complete: () => this.actionLoadingId.set(null),
    });
  }

  protected cerrar(r: Reunion) {
    if (r.estado !== 'en_curso') return;
    this.actionLoadingId.set(r.id);
    this.reunionService.cerrar(r.id).subscribe({
      next: () => this.load(),
      error: () => this.actionLoadingId.set(null),
      complete: () => this.actionLoadingId.set(null),
    });
  }

  protected formatFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-CO');
  }
}
