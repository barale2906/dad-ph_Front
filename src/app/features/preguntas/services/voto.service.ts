import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import type { VotoCreatePayload, VotoRegistrarResponse } from '../../../core/models/voto.model';

@Injectable({ providedIn: 'root' })
export class VotoService {
  private readonly api = inject(ApiService);

  registrar(payload: VotoCreatePayload) {
    return this.api.post<VotoRegistrarResponse>('/votos', payload);
  }
}
