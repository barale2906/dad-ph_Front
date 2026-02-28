import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ZonaComunService } from '../services/zona-comun.service';
import type { ZonaComun } from '../../../core/models/zona-comun.model';

@Component({
  selector: 'app-zona-comun-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './zona-comun-list.component.html',
  styleUrl: './zona-comun-list.component.scss',
})
export class ZonaComunListComponent implements OnInit {
  private readonly zonaComunService = inject(ZonaComunService);

  protected zonas = signal<ZonaComun[]>([]);
  protected loading = true;
  protected deleteConfirmId = signal<number | null>(null);

  ngOnInit() {
    this.load();
  }

  protected load() {
    this.loading = true;
    this.zonaComunService.getAll().subscribe({
      next: (list) => this.zonas.set(list),
      error: () => {},
      complete: () => (this.loading = false),
    });
  }

  protected confirmDelete(id: number) {
    this.deleteConfirmId.set(id);
  }

  protected cancelDelete() {
    this.deleteConfirmId.set(null);
  }

  protected doDelete(id: number) {
    this.zonaComunService.delete(id).subscribe({
      next: () => {
        this.deleteConfirmId.set(null);
        this.load();
      },
      error: () => this.deleteConfirmId.set(null),
    });
  }
}
