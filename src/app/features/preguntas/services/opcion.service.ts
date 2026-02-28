import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import type {
  Opcion,
  OpcionCreatePayload,
  OpcionUpdatePayload,
} from '../../../core/models/pregunta.model';

@Injectable({ providedIn: 'root' })
export class OpcionService {
  private readonly api = inject(ApiService);

  create(payload: OpcionCreatePayload) {
    return this.api.post<Opcion>('/opciones', payload);
  }

  update(id: number, payload: OpcionUpdatePayload) {
    return this.api.put<Opcion>(`/opciones/${id}`, payload);
  }

  delete(id: number) {
    return this.api.delete<{ message?: string }>(`/opciones/${id}`);
  }
}
