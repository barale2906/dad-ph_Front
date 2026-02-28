import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReporteService } from '../reportes/services/reporte.service';
import { ReunionService } from '../services/reunion.service';
import { ResultadosComponent } from '../../preguntas/resultados/resultados.component';
import type { EstadisticasReunion } from '../../../core/models/reporte.model';
import type { Reunion } from '../../../core/models/reunion.model';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [RouterLink, ResultadosComponent],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.scss',
})
export class EstadisticasComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly reporteService = inject(ReporteService);
  private readonly reunionService = inject(ReunionService);

  protected reunionId = 0;
  protected reunion = signal<Reunion | null>(null);
  protected estadisticas = signal<EstadisticasReunion | null>(null);
  protected loading = true;

  ngOnInit() {
    this.reunionId = +this.route.snapshot.paramMap.get('id')!;
    this.reunionService.getById(this.reunionId).subscribe({
      next: (r) => this.reunion.set(r),
    });
    this.reporteService.getEstadisticas(this.reunionId).subscribe({
      next: (e) => this.estadisticas.set(e),
      error: () => {},
      complete: () => (this.loading = false),
    });
  }
}
