import { Injectable, inject } from '@angular/core';
import { Observable, expand, reduce, EMPTY, map } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import type { PaginatedResponse } from '../../../core/models/paginated-response.model';
import type {
  Reunion,
  ReunionCreatePayload,
  ReunionUpdatePayload,
} from '../../../core/models/reunion.model';

export type ReunionListParams = {
  page?: number;
  estado?: string;
  tipo?: string;
};

@Injectable({ providedIn: 'root' })
export class ReunionService {
  private readonly api = inject(ApiService);

  getAll(params?: ReunionListParams) {
    return this.api.getPaginated<Reunion>(
      '/reuniones',
      params as Record<string, string | number | boolean>
    );
  }

  /** Carga todas las páginas del listado y devuelve el array completo de reuniones. */
  getAllForCalendar(params?: Pick<ReunionListParams, 'estado' | 'tipo'>): Observable<Reunion[]> {
    const fetchPage = (page: number): Observable<PaginatedResponse<Reunion>> =>
      this.api.getPaginated<Reunion>(
        '/reuniones',
        { page, ...(params as Record<string, string | number | boolean>) }
      );

    return fetchPage(1).pipe(
      expand((res) =>
        res.links?.next ? fetchPage(res.meta.current_page + 1) : EMPTY
      ),
      reduce((acc: Reunion[], res) => [...acc, ...res.data], [])
    );
  }

  getById(id: number): Observable<Reunion> {
    return this.api
      .get<{ data: Reunion }>(`/reuniones/${id}`)
      .pipe(map((res) => res.data));
  }

  create(payload: ReunionCreatePayload) {
    return this.api
      .post<{ message: string; data: Reunion }>('/reuniones', payload)
      .pipe(map((res) => res.data));
  }

  update(id: number, payload: ReunionUpdatePayload) {
    return this.api
      .put<{ message: string; data: Reunion }>(`/reuniones/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  delete(id: number) {
    return this.api.delete<{ message?: string }>(`/reuniones/${id}`);
  }

  iniciar(id: number) {
    return this.api
      .post<{ message: string; data: Reunion }>(`/reuniones/${id}/iniciar`, {})
      .pipe(map((res) => res.data));
  }

  cerrar(id: number) {
    return this.api
      .post<{ message: string; data: Reunion }>(`/reuniones/${id}/cerrar`, {})
      .pipe(map((res) => res.data));
  }
}
