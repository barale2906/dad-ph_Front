import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import type {
  Pregunta,
  PreguntaCreatePayload,
  PreguntaUpdatePayload,
} from '../../../core/models/pregunta.model';
import type { ResultadosPregunta } from '../../../core/models/resultados.model';

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
    return this.api.get<Pregunta[]>('/preguntas', params as Record<string, string | number | boolean>);
  }

  getById(id: number) {
    return this.api.get<Pregunta>(`/preguntas/${id}`);
  }

  create(payload: PreguntaCreatePayload) {
    return this.api.post<Pregunta>('/preguntas', payload);
  }

  update(id: number, payload: PreguntaUpdatePayload) {
    return this.api.put<Pregunta>(`/preguntas/${id}`, payload);
  }

  delete(id: number) {
    return this.api.delete<{ message?: string }>(`/preguntas/${id}`);
  }

  abrir(id: number) {
    return this.api.post<Pregunta>(`/preguntas/${id}/abrir`, {});
  }

  cerrar(id: number) {
    return this.api.post<Pregunta>(`/preguntas/${id}/cerrar`, {});
  }

  getResultados(preguntaId: number) {
    return this.api.get<ResultadosPregunta>(`/preguntas/${preguntaId}/resultados`);
  }
}
