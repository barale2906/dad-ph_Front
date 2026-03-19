import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import type {
  Pregunta,
  PreguntaCreatePayload,
  PreguntaUpdatePayload,
  PreguntaPatchPayload,
} from '../../../core/models/pregunta.model';
import type { PaginatedResponse } from '../../../core/models/paginated-response.model';
import type {
  ResultadosPregunta,
  ResultadosApiResponse,
  InmueblesVotosResponse,
} from '../../../core/models/resultados.model';

export type PreguntaListParams = {
  reunion_id?: number;
  estado?: string;
  page?: number;
  per_page?: number;
};

@Injectable({ providedIn: 'root' })
export class PreguntaService {
  private readonly api = inject(ApiService);

  getAll(params?: PreguntaListParams) {
    return this.api.getPaginated<Pregunta>(
      '/preguntas',
      params as Record<string, string | number | boolean>
    );
  }

  getById(id: number) {
    return this.api
      .get<{ data: Pregunta }>(`/preguntas/${id}`)
      .pipe(map((r) => r.data));
  }

  create(payload: PreguntaCreatePayload) {
    return this.api
      .post<{ message: string; data: Pregunta }>('/preguntas', payload)
      .pipe(map((r) => r.data));
  }

  update(id: number, payload: PreguntaUpdatePayload) {
    return this.api
      .put<{ message: string; data: Pregunta }>(`/preguntas/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  patch(id: number, payload: PreguntaPatchPayload) {
    return this.api
      .patch<{ message: string; data: Pregunta }>(`/preguntas/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  delete(id: number) {
    return this.api.delete<{ message?: string }>(`/preguntas/${id}`);
  }

  abrir(id: number) {
    return this.api.post<{ message: string; status: string }>(`/preguntas/${id}/abrir`, {});
  }

  cerrar(id: number) {
    return this.api.post<{ message: string; status: string }>(`/preguntas/${id}/cerrar`, {});
  }

  /** ID sintético para la opción "No votó" (asistentes que no votaron) */
  static readonly NO_VOTO_OPCION_ID = 0;

  getResultados(preguntaId: number) {
    return this.api
      .get<{ data: ResultadosApiResponse }>(`/preguntas/${preguntaId}/resultados`)
      .pipe(
        map((r) => {
          const raw = r.data;
          const items = raw.resultados ?? [];
          const asistenciaUnidades = raw.asistencia_unidades ?? 0;
          const asistenciaCoef = raw.asistencia_coeficiente ?? 0;
          const noVotaronUnidades = raw.no_votaron_unidades ?? 0;
          const noVotaronCoef = raw.no_votaron_coeficiente ?? 0;

          const totalVotos = items.reduce((s, o) => s + o.votos, 0);
          const totalCoef = items.reduce((s, o) => s + o.coeficiente, 0);

          const opcionesOpcion: ResultadosPregunta['opciones'] = items.map((o) => ({
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
            opcionesOpcion.push({
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

          return {
            pregunta_id: raw.pregunta_id,
            pregunta: '',
            total_votos: totalVotos,
            total_unidades: asistenciaUnidades || totalVotos,
            total_coeficiente: asistenciaCoef || totalCoef,
            asistencia_unidades: raw.asistencia_unidades,
            asistencia_coeficiente: raw.asistencia_coeficiente,
            votaron_unidades: raw.votaron_unidades,
            votaron_coeficiente: raw.votaron_coeficiente,
            no_votaron_unidades: raw.no_votaron_unidades,
            no_votaron_coeficiente: raw.no_votaron_coeficiente,
            opciones: opcionesOpcion,
          } as ResultadosPregunta;
        })
      );
  }

  getInmueblesVotos(preguntaId: number, params?: { ocultar_respuesta?: boolean }) {
    const queryParams = params?.ocultar_respuesta != null
      ? { ocultar_respuesta: params.ocultar_respuesta } as Record<string, boolean>
      : undefined;
    return this.api
      .get<{ data: InmueblesVotosResponse }>(`/preguntas/${preguntaId}/inmuebles-votos`, queryParams)
      .pipe(map((r) => r.data));
  }
}
