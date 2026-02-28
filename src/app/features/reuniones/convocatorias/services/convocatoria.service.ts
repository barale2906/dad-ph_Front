import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../core/http/api.service';
import { catchError, of } from 'rxjs';
import type { Convocatoria } from '../../../../core/models/convocatoria.model';

@Injectable({ providedIn: 'root' })
export class ConvocatoriaService {
  private readonly api = inject(ApiService);

  getByReunion(reunionId: number) {
    return this.api
      .get<Convocatoria>(`/reuniones/${reunionId}/convocatoria`)
      .pipe(catchError(() => of(null)));
  }

  create(reunionId: number, payload: { contenido?: string }) {
    return this.api.post<Convocatoria>(`/reuniones/${reunionId}/convocatoria`, payload);
  }

  update(id: number, payload: { contenido?: string }) {
    return this.api.put<Convocatoria>(`/convocatorias/${id}`, payload);
  }

  enviar(id: number) {
    return this.api.post<Convocatoria>(`/convocatorias/${id}/enviar`, {});
  }

  publicar(id: number) {
    return this.api.post<Convocatoria>(`/convocatorias/${id}/publicar`, {});
  }
}
