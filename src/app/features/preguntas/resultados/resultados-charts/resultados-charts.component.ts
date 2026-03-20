import { Component, input, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PreguntaService } from '../../services/pregunta.service';
import type { ResultadosPregunta } from '../../../../core/models/resultados.model';

interface PieSlice {
  path: string;
  color: string;
  label: string;
  value: number;
  percent: number;
}

const PIE_COLORS = [
  '#00ff88',
  '#00d4ff',
  '#ff6b35',
  '#9b59b6',
  '#f1c40f',
  '#e74c3c',
  '#2ecc71',
  '#3498db',
];
const NO_VOTO_COLOR = '#888888';

@Component({
  selector: 'app-resultados-charts',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './resultados-charts.component.html',
  styleUrl: './resultados-charts.component.scss',
})
export class ResultadosChartsComponent {
  /** Datos de resultados (mismo formato que ResultadosComponent) */
  data = input.required<ResultadosPregunta>();

  protected pieUnidades = computed<PieSlice[]>(() => {
    const r = this.data();
    if (!r?.opciones?.length) return [];
    const values = r.opciones.map((o) => o.unidades ?? o.votos);
    const labels = r.opciones.map((o) => o.texto);
    const colors = r.opciones.map((o, i) =>
      o.opcion_id === PreguntaService.NO_VOTO_OPCION_ID ? NO_VOTO_COLOR : PIE_COLORS[i % PIE_COLORS.length]
    );
    return this.computePieSlices(values, labels, colors);
  });

  protected pieCoeficiente = computed<PieSlice[]>(() => {
    const r = this.data();
    if (!r?.opciones?.length) return [];
    const values = r.opciones.map((o) => o.coeficiente ?? 0);
    if (values.every((v) => v === 0)) return [];
    const labels = r.opciones.map((o) => o.texto);
    const colors = r.opciones.map((o, i) =>
      o.opcion_id === PreguntaService.NO_VOTO_OPCION_ID ? NO_VOTO_COLOR : PIE_COLORS[i % PIE_COLORS.length]
    );
    return this.computePieSlices(values, labels, colors);
  });

  protected hasCoeficienteData = computed(() =>
    (this.data()?.opciones ?? []).some((o) => (o.coeficiente ?? 0) > 0)
  );

  private computePieSlices(values: number[], labels: string[], colors?: string[]): PieSlice[] {
    const total = values.reduce((s, v) => s + v, 0);
    if (total === 0) return [];

    const items = values
      .map((v, i) => ({ v, i, label: labels[i], color: colors?.[i] ?? PIE_COLORS[i % PIE_COLORS.length] }))
      .filter((item) => item.v > 0);

    let angle = -Math.PI / 2;

    return items.map(({ v, label, color }) => {
      const portion = v / total;
      const startAngle = angle;
      angle += portion * 2 * Math.PI;

      let path: string;
      if (portion >= 1) {
        path = 'M 0 0 L 1 0 A 1 1 0 1 1 0.9999 -0.0175 Z';
      } else {
        const x1 = Math.cos(startAngle).toFixed(5);
        const y1 = Math.sin(startAngle).toFixed(5);
        const x2 = Math.cos(angle).toFixed(5);
        const y2 = Math.sin(angle).toFixed(5);
        const largeArc = portion > 0.5 ? 1 : 0;
        path = `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z`;
      }

      return {
        path,
        color,
        label,
        value: v,
        percent: Math.round(portion * 100),
      };
    });
  }
}
