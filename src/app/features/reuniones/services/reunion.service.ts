import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import type { PaginatedResponse } from '../../../core/models/paginated-response.model';
import type {
  Reunion,
  ReunionCreatePayload,
  ReunionUpdatePayload,
} from '../../../core/models/reunion.model';

export type ReunionListParams = {
  page?: number;
  per_page?: number;
  estado?: string;
  tipo?: string;
};

@Injectable({ providedIn: 'root' })
export class ReunionService {
  private readonly api = inject(ApiService);

  getAll(params?: ReunionListParams) {
    return this.api.getPaginated<Reunion>('/reuniones', params as Record<string, string | number | boolean>);
  }

  getById(id: number) {
    return this.api.get<Reunion>(`/reuniones/${id}`);
  }

  create(payload: ReunionCreatePayload) {
    return this.api.post<Reunion>('/reuniones', payload);
  }

  update(id: number, payload: ReunionUpdatePayload) {
    return this.api.put<Reunion>(`/reuniones/${id}`, payload);
  }

  delete(id: number) {
    return this.api.delete<{ message?: string }>(`/reuniones/${id}`);
  }

  iniciar(id: number) {
    return this.api.post<Reunion>(`/reuniones/${id}/iniciar`, {});
  }

  cerrar(id: number) {
    return this.api.post<Reunion>(`/reuniones/${id}/cerrar`, {});
  }
}
