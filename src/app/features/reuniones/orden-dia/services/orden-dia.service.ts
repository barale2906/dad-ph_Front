import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiService } from '../../../../core/http/api.service';
import type {
  OrdenDiaItem,
  OrdenDiaCreatePayload,
  OrdenDiaUpdatePayload,
  CargaMasivaOrdenDiaResult,
} from '../../../../core/models/orden-dia.model';

@Injectable({ providedIn: 'root' })
export class OrdenDiaService {
  private readonly api: ApiService = inject(ApiService);

  getByReunion(reunionId: number) {
    return this.api
      .get<{ data: OrdenDiaItem[] }>(`/reuniones/${reunionId}/orden-dia`)
      .pipe(map((res) => res.data));
  }

  create(reunionId: number, payload: OrdenDiaCreatePayload) {
    return this.api
      .post<{ message: string; data: OrdenDiaItem }>(`/reuniones/${reunionId}/orden-dia`, payload)
      .pipe(map((res) => res.data));
  }

  update(itemId: number, payload: OrdenDiaUpdatePayload) {
    return this.api
      .put<{ message: string; data: OrdenDiaItem }>(`/orden-dia/${itemId}`, payload)
      .pipe(map((res) => res.data));
  }

  delete(itemId: number) {
    return this.api.delete<{ message?: string }>(`/orden-dia/${itemId}`);
  }

  reordenar(reunionId: number, items: Array<{ id: number; orden: number }>) {
    return this.api
      .put<{ message: string; data: OrdenDiaItem[] }>(
        `/reuniones/${reunionId}/orden-dia/reordenar`,
        { items }
      )
      .pipe(map((res) => res.data));
  }

  cargaMasiva(reunionId: number, archivo: File) {
    const form = new FormData();
    form.append('archivo', archivo);
    return this.api
      .post<{ message: string; data: CargaMasivaOrdenDiaResult }>(
        `/reuniones/${reunionId}/orden-dia/carga-masiva`,
        form
      )
      .pipe(map((res) => res.data));
  }

  marcarEjecutado(itemId: number, ejecutado: boolean) {
    return this.api
      .post<{ message: string; data: OrdenDiaItem }>(`/orden-dia/${itemId}/marcar-ejecutado`, {
        ejecutado,
      })
      .pipe(map((res) => res.data));
  }
}
