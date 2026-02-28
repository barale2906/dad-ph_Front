import { Component, inject, input, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PreguntaService } from '../services/pregunta.service';
import type { ResultadosPregunta } from '../../../core/models/resultados.model';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './resultados.component.html',
  styleUrl: './resultados.component.scss',
})
export class ResultadosComponent implements OnInit {
  preguntaId = input<number>();
  /** Si se pasa, se muestra sin hacer fetch (para estadísticas). */
  data = input<ResultadosPregunta>();

  protected resultados = signal<ResultadosPregunta | null>(null);
  protected loading = true;

  private readonly preguntaService = inject(PreguntaService);

  ngOnInit() {
    const d = this.data();
    if (d) {
      this.resultados.set(d);
      this.loading = false;
      return;
    }
    const id = this.preguntaId();
    if (!id) return;
    this.preguntaService.getResultados(id).subscribe({
      next: (r) => this.resultados.set(r),
      error: () => {},
      complete: () => (this.loading = false),
    });
  }
}
