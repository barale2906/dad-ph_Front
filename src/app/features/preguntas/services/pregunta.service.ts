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

  getResultados(preguntaId: number) {
    return this.api
      .get<{ data: ResultadosApiResponse }>(`/preguntas/${preguntaId}/resultados`)
      .pipe(
        map((r) => {
          const raw = r.data;
          const items = raw.resultados ?? [];
          const totalVotos = items.reduce((s, o) => s + o.votos, 0);
          const totalCoef  = items.reduce((s, o) => s + o.coeficiente, 0);

          return {
            pregunta_id: raw.pregunta_id,
            pregunta: '',
            total_votos:      totalVotos,
            total_unidades:   totalVotos,
            total_coeficiente: totalCoef,
            opciones: items.map((o) => ({
              opcion_id: o.opcion_id,
              texto:     o.texto,
              votos:     o.votos,
              unidades:  o.votos,
              porcentaje:            totalVotos > 0 ? (o.votos       / totalVotos) * 100 : 0,
              porcentaje_unidades:   totalVotos > 0 ? (o.votos       / totalVotos) * 100 : 0,
              coeficiente:           o.coeficiente,
              porcentaje_coeficiente: totalCoef  > 0 ? (o.coeficiente / totalCoef)  * 100 : 0,
            })),
          } as ResultadosPregunta;
        })
      );
  }

  getInmueblesVotos(preguntaId: number) {
    return this.api
      .get<{ data: InmueblesVotosResponse }>(`/preguntas/${preguntaId}/inmuebles-votos`)
      .pipe(map((r) => r.data));
  }
}
