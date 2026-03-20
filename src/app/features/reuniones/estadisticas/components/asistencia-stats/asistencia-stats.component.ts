import { Component, input, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import type { AsistenciaStats } from '../../../../../core/models/reporte.model';

@Component({
  selector: 'app-asistencia-stats',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './asistencia-stats.component.html',
  styleUrl: './asistencia-stats.component.scss',
})
export class AsistenciaStatsComponent {
  /** Datos de asistencia desde el API de estadísticas */
  data = input.required<AsistenciaStats>();

  /** Porcentaje de unidades registradas sobre el total */
  protected porcentajeRegistradas = computed(() => {
    const d = this.data();
    if (!d || d.total_unidades === 0) return 0;
    return (d.unidades_registradas / d.total_unidades) * 100;
  });

  /** Suma de coeficientes de los inmuebles de un asistente */
  protected coefAsistente(inmuebles: { coeficiente: number }[]): number {
    return inmuebles.reduce((s, i) => s + i.coeficiente, 0);
  }
}
