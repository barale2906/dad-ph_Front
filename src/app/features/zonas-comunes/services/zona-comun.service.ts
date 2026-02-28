import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import type {
  ZonaComun,
  ZonaComunCreatePayload,
  ZonaComunUpdatePayload,
} from '../../../core/models/zona-comun.model';

@Injectable({ providedIn: 'root' })
export class ZonaComunService {
  private readonly api = inject(ApiService);

  getAll() {
    return this.api.get<ZonaComun[]>('/zonas-comunes');
  }

  getById(id: number) {
    return this.api.get<ZonaComun>(`/zonas-comunes/${id}`);
  }

  create(payload: ZonaComunCreatePayload) {
    return this.api.post<ZonaComun>('/zonas-comunes', payload);
  }

  update(id: number, payload: ZonaComunUpdatePayload) {
    return this.api.put<ZonaComun>(`/zonas-comunes/${id}`, payload);
  }

  delete(id: number) {
    return this.api.delete<{ message?: string }>(`/zonas-comunes/${id}`);
  }
}
