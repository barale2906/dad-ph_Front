import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import type {
  Pregunta,
  PreguntaCreatePayload,
  PreguntaUpdatePayload,
} from '../../../core/models/pregunta.model';
import type { PaginatedResponse } from '../../../core/models/paginated-response.model';
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

  delete(id: number) {
    return this.api.delete<{ message?: string }>(`/preguntas/${id}`);
  }

  abrir(id: number) {
    return this.api
      .post<{ message: string; data: Pregunta }>(`/preguntas/${id}/abrir`, {})
      .pipe(map((r) => r.data));
  }

  cerrar(id: number) {
    return this.api
      .post<{ message: string; data: Pregunta }>(`/preguntas/${id}/cerrar`, {})
      .pipe(map((r) => r.data));
  }

  getResultados(preguntaId: number) {
    return this.api
      .get<{ data: ResultadosPregunta }>(`/preguntas/${preguntaId}/resultados`)
      .pipe(map((r) => r.data));
  }
}
