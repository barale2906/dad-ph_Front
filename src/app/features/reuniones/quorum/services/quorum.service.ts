import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/http/api.service';
import type { Quorum } from '../../../../core/models/quorum.model';

@Injectable({ providedIn: 'root' })
export class QuorumService {
  private readonly api = inject(ApiService);

  getQuorum(reunionId: number) {
    return this.api.get<Quorum>('/quorum', { reunion_id: reunionId });
  }

  /** Crea pregunta de quórum para la reunión. */
  generarPregunta(reunionId: number) {
    return this.api.post<{ message?: string; pregunta_id?: number }>('/quorum/pregunta', {
      reunion_id: reunionId,
    });
  }

  /** Registra asistencia por código de barras. Flujo: crear pregunta quórum si no existe → abrir → votar PRESENTE. */
  registrarAsistencia(reunionId: number, codigo: string) {
    return this.api.post<{ message?: string }>('/quorum/registrar', {
      reunion_id: reunionId,
      codigo,
    });
  }
}
