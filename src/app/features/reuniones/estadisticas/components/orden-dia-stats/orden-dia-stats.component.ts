import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import type { OrdenDiaStats } from '../../../../../core/models/reporte.model';

@Component({
  selector: 'app-orden-dia-stats',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './orden-dia-stats.component.html',
  styleUrl: './orden-dia-stats.component.scss',
})
export class OrdenDiaStatsComponent {
  /** Datos del orden del día desde el API de estadísticas */
  data = input.required<OrdenDiaStats>();
}
