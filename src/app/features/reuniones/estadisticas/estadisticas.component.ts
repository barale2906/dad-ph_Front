import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReporteService, mapVotacionToResultadosPregunta } from '../reportes/services/reporte.service';
import { ReunionService } from '../services/reunion.service';
import { ResultadosComponent } from '../../preguntas/resultados/resultados.component';
import { ResultadosChartsComponent } from '../../preguntas/resultados/resultados-charts/resultados-charts.component';
import { OrdenDiaStatsComponent } from './components/orden-dia-stats/orden-dia-stats.component';
import { AsistenciaStatsComponent } from './components/asistencia-stats/asistencia-stats.component';
import type {
  EstadisticasReunion,
  VotacionConResultados,
} from '../../../core/models/reporte.model';
import type { Reunion } from '../../../core/models/reunion.model';
import type { ResultadosPregunta } from '../../../core/models/resultados.model';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [
    RouterLink,
    ResultadosComponent,
    ResultadosChartsComponent,
    OrdenDiaStatsComponent,
    AsistenciaStatsComponent,
  ],
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
  protected loading = signal(true);
  protected error = signal<string | null>(null);
  protected downloadingCsv = signal(false);

  /** Votaciones con resultados mapeados a ResultadosPregunta para el componente de resultados */
  protected votacionesConResultados = computed<{ votacion: VotacionConResultados; data: ResultadosPregunta }[]>(() => {
    const est = this.estadisticas();
    if (!est?.votaciones) return [];
    return est.votaciones
      .filter((v): v is VotacionConResultados => v.disponible === true)
      .map((v) => ({ votacion: v, data: mapVotacionToResultadosPregunta(v) }));
  });

  /** Votaciones sin resultados disponibles */
  protected votacionesSinResultados = computed(() => {
    const est = this.estadisticas();
    if (!est?.votaciones) return [];
    return est.votaciones.filter((v) => v.disponible === false);
  });

  ngOnInit() {
    this.reunionId = +this.route.snapshot.paramMap.get('id')!;
    this.reunionService.getById(this.reunionId).subscribe({
      next: (r) => this.reunion.set(r),
    });
    this.loadEstadisticas();
  }

  protected loadEstadisticas() {
    this.loading.set(true);
    this.error.set(null);
    this.reporteService.getEstadisticas(this.reunionId).subscribe({
      next: (e) => this.estadisticas.set(e),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudieron cargar las estadísticas');
      },
      complete: () => this.loading.set(false),
    });
  }

  protected descargarCsv() {
    this.downloadingCsv.set(true);
    this.reporteService.getEstadisticasCsv(this.reunionId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `estadisticas-reunion-${this.reunionId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {},
      complete: () => this.downloadingCsv.set(false),
    });
  }
}
