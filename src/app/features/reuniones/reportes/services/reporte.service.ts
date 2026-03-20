import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiService } from '../../../../core/http/api.service';
import { API_BASE } from '../../../../core/config/api.config';
import type {
  EstadisticasReunion,
  VotacionConResultados,
  VotacionResultados,
} from '../../../../core/models/reporte.model';
import type { ResultadosPregunta } from '../../../../core/models/resultados.model';
import { PreguntaService } from '../../../preguntas/services/pregunta.service';

interface EstadisticasApiResponse {
  data: EstadisticasReunion;
}

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

  /**
   * Descarga las estadísticas de la reunión en formato CSV.
   * @param reunionId ID de la reunión
   * @param ocultarRespuesta Si true, no incluye la opción elegida en el detalle de votos (votaciones secretas)
   */
  getEstadisticasCsv(reunionId: number, ocultarRespuesta = false) {
    const params = ocultarRespuesta
      ? new HttpParams().set('ocultar_respuesta', 'true')
      : undefined;
    return this.http.get(
      `${API_BASE}/reportes/reuniones/${reunionId}/estadisticas/csv`,
      { responseType: 'blob', params }
    );
  }

  /**
   * Obtiene estadísticas de la reunión.
   * @param reunionId ID de la reunión
   * @param ocultarRespuesta Si true, no incluye la opción elegida en el detalle de votos por inmueble (votaciones secretas)
   */
  getEstadisticas(reunionId: number, ocultarRespuesta = false) {
    const params = ocultarRespuesta
      ? ({ ocultar_respuesta: true } as Record<string, boolean>)
      : undefined;

    return this.api
      .get<EstadisticasApiResponse>(`/reportes/reuniones/${reunionId}/estadisticas`, params)
      .pipe(map((r) => r.data));
  }
}

/**
 * Convierte una votación con resultados del API de estadísticas
 * al formato ResultadosPregunta esperado por ResultadosComponent.
 */
export function mapVotacionToResultadosPregunta(
  v: VotacionConResultados
): ResultadosPregunta {
  const res = v.resultados as VotacionResultados;
  const asistenciaUnidades = res.asistencia_unidades ?? 0;
  const asistenciaCoef = res.asistencia_coeficiente ?? 0;
  const noVotaronUnidades = res.no_votaron_unidades ?? 0;
  const noVotaronCoef = res.no_votaron_coeficiente ?? 0;
  const items = res.opciones ?? [];

  const opciones: ResultadosPregunta['opciones'] = items.map((o) => ({
    opcion_id: o.opcion_id,
    texto: o.texto,
    votos: o.votos,
    unidades: o.votos,
    porcentaje: asistenciaUnidades > 0 ? (o.votos / asistenciaUnidades) * 100 : 0,
    porcentaje_unidades: asistenciaUnidades > 0 ? (o.votos / asistenciaUnidades) * 100 : 0,
    coeficiente: o.coeficiente,
    porcentaje_coeficiente: asistenciaCoef > 0 ? (o.coeficiente / asistenciaCoef) * 100 : 0,
  }));

  if (noVotaronUnidades > 0 || noVotaronCoef > 0) {
    opciones.push({
      opcion_id: PreguntaService.NO_VOTO_OPCION_ID,
      texto: 'No votó',
      votos: noVotaronUnidades,
      unidades: noVotaronUnidades,
      porcentaje: asistenciaUnidades > 0 ? (noVotaronUnidades / asistenciaUnidades) * 100 : 0,
      porcentaje_unidades: asistenciaUnidades > 0 ? (noVotaronUnidades / asistenciaUnidades) * 100 : 0,
      coeficiente: noVotaronCoef,
      porcentaje_coeficiente: asistenciaCoef > 0 ? (noVotaronCoef / asistenciaCoef) * 100 : 0,
    });
  }

  const totalVotos = items.reduce((s, o) => s + o.votos, 0);
  const totalCoef = items.reduce((s, o) => s + o.coeficiente, 0);

  return {
    pregunta_id: v.pregunta_id,
    pregunta: v.pregunta,
    total_votos: totalVotos,
    total_unidades: asistenciaUnidades || totalVotos,
    total_coeficiente: asistenciaCoef || totalCoef,
    asistencia_unidades: res.asistencia_unidades,
    asistencia_coeficiente: res.asistencia_coeficiente,
    votaron_unidades: res.votaron_unidades,
    votaron_coeficiente: res.votaron_coeficiente,
    no_votaron_unidades: res.no_votaron_unidades,
    no_votaron_coeficiente: res.no_votaron_coeficiente,
    opciones,
  };
}
