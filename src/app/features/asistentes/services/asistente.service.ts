import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/http/api.service';
import { API_BASE } from '../../../core/config/api.config';
import type { PaginatedResponse } from '../../../core/models/paginated-response.model';
import type {
  Asistente,
  AsistenteCreatePayload,
  AsistenteUpdatePayload,
} from '../../../core/models/asistente.model';

export type AsistenteListParams = {
  page?: number;
  per_page?: number;
  nombre?: string;
  documento?: string;
};

@Injectable({ providedIn: 'root' })
export class AsistenteService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);

  getAll(params?: AsistenteListParams) {
    return this.api.getPaginated<Asistente>('/asistentes', params as Record<string, string | number | boolean>);
  }

  getById(id: number) {
    return this.api.get<Asistente>(`/asistentes/${id}`);
  }

  create(payload: AsistenteCreatePayload) {
    return this.api.post<Asistente>('/asistentes', payload);
  }

  update(id: number, payload: AsistenteUpdatePayload) {
    return this.api.put<Asistente>(`/asistentes/${id}`, payload);
  }

  delete(id: number) {
    return this.api.delete<{ message?: string }>(`/asistentes/${id}`);
  }

  /** Genera PDF de códigos de barras. Devuelve blob para descarga. */
  printBarcodes(inicio: number, cantidad: number, repeticiones?: number) {
    const body = { inicio, cantidad, repeticiones: repeticiones ?? 1 };
    return this.http.post(`${API_BASE}/barcodes/print`, body, {
      responseType: 'blob',
    });
  }
}
