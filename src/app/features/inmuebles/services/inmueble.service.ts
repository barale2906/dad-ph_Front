import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/http/api.service';
import type { PaginatedResponse } from '../../../core/models/paginated-response.model';
import type {
  Inmueble,
  InmuebleCreatePayload,
  CoeficientesValidacion,
  CargaMasivaResult,
} from '../../../core/models/inmueble.model';

export type InmuebleListParams = {
  page?: number;
  per_page?: number;
  activo?: boolean;
  tipo?: string;
  nomenclatura?: string;
};

@Injectable({ providedIn: 'root' })
export class InmuebleService {
  private readonly api = inject(ApiService);

  getAll(params?: InmuebleListParams) {
    return this.api.getPaginated<Inmueble>('/inmuebles', params as Record<string, string | number | boolean>);
  }

  getById(id: number) {
    return this.api.get<Inmueble>(`/inmuebles/${id}`);
  }

  create(payload: InmuebleCreatePayload) {
    return this.api.post<Inmueble>('/inmuebles', payload);
  }

  update(id: number, payload: InmuebleCreatePayload) {
    return this.api.put<Inmueble>(`/inmuebles/${id}`, payload);
  }

  delete(id: number) {
    return this.api.delete<{ message?: string }>(`/inmuebles/${id}`);
  }

  cargaMasiva(file: File) {
    const formData = new FormData();
    formData.append('archivo', file);
    return this.api
      .post<{ message: string; data: CargaMasivaResult }>('/inmuebles/carga-masiva', formData)
      .pipe(map((res) => res.data));
  }

  validarCoeficientes() {
    return this.api
      .get<{ data: CoeficientesValidacion }>('/inmuebles/validar-coeficientes')
      .pipe(map((res) => res.data));
  }
}
