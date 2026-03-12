import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PreguntaService } from '../services/pregunta.service';
import { ReunionService } from '../../reuniones/services/reunion.service';
import type { Pregunta } from '../../../core/models/pregunta.model';
import type { Reunion } from '../../../core/models/reunion.model';

@Component({
  selector: 'app-pregunta-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './pregunta-list.component.html',
  styleUrl: './pregunta-list.component.scss',
})
export class PreguntaListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly preguntaService = inject(PreguntaService);
  private readonly reunionService: ReunionService = inject(ReunionService);

  protected reunionId = 0;
  protected reunion = signal<Reunion | null>(null);
  protected preguntas = signal<Pregunta[]>([]);
  protected loading = true;
  protected deleteConfirmId = signal<number | null>(null);
  protected filterEstado = signal('');

  ngOnInit() {
    this.reunionId = +this.route.snapshot.paramMap.get('id')!;
    this.reunionService.getById(this.reunionId).subscribe({
      next: (r: Reunion) => this.reunion.set(r),
    });
    this.load();
  }

  protected load() {
    this.loading = true;
    const params: Record<string, string | number> = { reunion_id: this.reunionId };
    if (this.filterEstado()) params['estado'] = this.filterEstado();
    this.preguntaService.getAll(params).subscribe({
      next: (res) => this.preguntas.set(res.data),
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
    this.preguntaService.delete(id).subscribe({
      next: () => {
        this.deleteConfirmId.set(null);
        this.load();
      },
      error: () => this.deleteConfirmId.set(null),
    });
  }

  protected filteredPreguntas() {
    const est = this.filterEstado();
    const list = this.preguntas();
    if (!est) return list;
    return list.filter((p) => p.estado === est);
  }
}
