import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsistenteService } from '../services/asistente.service';
import type { Asistente } from '../../../core/models/asistente.model';
import type { PaginatedResponse } from '../../../core/models/paginated-response.model';

@Component({
  selector: 'app-asistente-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './asistente-list.component.html',
  styleUrl: './asistente-list.component.scss',
})
export class AsistenteListComponent implements OnInit {
  private readonly asistenteService = inject(AsistenteService);

  protected asistentes = signal<Asistente[]>([]);
  protected meta = signal<PaginatedResponse<Asistente>['meta'] | null>(null);
  protected loading = true;
  protected deleteConfirmId = signal<number | null>(null);

  protected filters = signal({
    pagina: 1,
    nombre: '',
    documento: '',
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
    if (f.nombre) params['nombre'] = f.nombre;
    if (f.documento) params['documento'] = f.documento;

    this.asistenteService.getAll(params).subscribe({
      next: (res) => {
        this.asistentes.set(res.data);
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
    this.asistenteService.delete(id).subscribe({
      next: () => {
        this.deleteConfirmId.set(null);
        this.load();
      },
      error: () => this.deleteConfirmId.set(null),
    });
  }
}
