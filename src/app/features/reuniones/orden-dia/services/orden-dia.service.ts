import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/http/api.service';
import type {
  OrdenDiaItem,
  OrdenDiaCreatePayload,
  OrdenDiaUpdatePayload,
  ReordenarPayload,
} from '../../../../core/models/orden-dia.model';

@Injectable({ providedIn: 'root' })
export class OrdenDiaService {
  private readonly api: ApiService = inject(ApiService);

  getByReunion(reunionId: number) {
    return this.api.get<OrdenDiaItem[]>(`/reuniones/${reunionId}/orden-dia`);
  }

  create(reunionId: number, payload: OrdenDiaCreatePayload) {
    return this.api.post<OrdenDiaItem>(`/reuniones/${reunionId}/orden-dia`, payload);
  }

  update(itemId: number, payload: OrdenDiaUpdatePayload) {
    return this.api.put<OrdenDiaItem>(`/orden-dia/${itemId}`, payload);
  }

  delete(itemId: number) {
    return this.api.delete<{ message?: string }>(`/orden-dia/${itemId}`);
  }

  reordenar(reunionId: number, items: Array<{ id: number; orden: number }>) {
    return this.api.put<OrdenDiaItem[]>(`/reuniones/${reunionId}/orden-dia/reordenar`, { items });
  }

  marcarEjecutado(itemId: number) {
    return this.api.post<OrdenDiaItem>(`/orden-dia/${itemId}/marcar-ejecutado`, {});
  }
}
