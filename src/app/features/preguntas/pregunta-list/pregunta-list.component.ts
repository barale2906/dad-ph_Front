import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, finalize, switchMap } from 'rxjs';
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly preguntaService = inject(PreguntaService);
  private readonly reunionService: ReunionService = inject(ReunionService);

  protected reunionId = 0;
  protected reunion = signal<Reunion | null>(null);
  protected preguntas = signal<Pregunta[]>([]);
  protected loading = signal(true);
  protected deleteConfirmId = signal<number | null>(null);
  protected filterEstado = signal('');

  ngOnInit() {
    const loadForId = (id: number) => {
      this.reunionId = id;
      this.reunion.set(null);
      this.preguntas.set([]);
      this.loading.set(true);
      this.reunionService.getById(id).subscribe({
        next: (r) => {
          this.reunion.set(r);
          this.preguntaService
            .getAll({
              reunion_id: id,
              ...(this.filterEstado() && { estado: this.filterEstado() }),
            })
            .subscribe({
              next: (res) => this.preguntas.set(res.data ?? []),
              error: () => this.loading.set(false),
              complete: () => this.loading.set(false),
            });
        },
        error: () => this.loading.set(false),
      });
    };

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : 0;
    if (!isNaN(id) && id > 0) {
      loadForId(id);
    }

    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((params) => {
          const p = params.get('id');
          const num = p ? +p : 0;
          return !isNaN(num) && num > 0 && num !== this.reunionId;
        }),
        switchMap((params) => {
          const newId = +params.get('id')!;
          return this.reunionService.getById(newId).pipe(
            switchMap((r: Reunion) => {
              this.reunionId = newId;
              this.reunion.set(r);
              this.preguntas.set([]);
              this.loading.set(true);
              return this.preguntaService.getAll({
                reunion_id: newId,
                ...(this.filterEstado() && { estado: this.filterEstado() }),
              });
            }),
            finalize(() => this.loading.set(false))
          );
        })
      )
      .subscribe({
        next: (res) => this.preguntas.set(res.data ?? []),
        error: () => this.loading.set(false),
      });
  }

  protected load() {
    this.loading.set(true);
    const params: Record<string, string | number> = { reunion_id: this.reunionId };
    if (this.filterEstado()) params['estado'] = this.filterEstado();
    this.preguntaService.getAll(params).subscribe({
      next: (res) => this.preguntas.set(res.data ?? []),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
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
