import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../../core/http/api.service';
import { API_BASE } from '../../../../core/config/api.config';
import type { EstadisticasReunion } from '../../../../core/models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);

  /** Descarga el acta PDF de la reunión. */
  getActaPdf(reunionId: number) {
    return this.http.get(`${API_BASE}/reportes/reuniones/${reunionId}/acta-pdf`, {
      responseType: 'blob',
    });
  }

  /** Obtiene estadísticas de la reunión. */
  getEstadisticas(reunionId: number) {
    return this.api.get<EstadisticasReunion>(
      `/reportes/reuniones/${reunionId}/estadisticas`
    );
  }
}
