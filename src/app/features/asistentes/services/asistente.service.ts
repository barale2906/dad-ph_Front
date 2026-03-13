import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/http/api.service';
import { API_BASE } from '../../../core/config/api.config';
import type { PaginatedResponse } from '../../../core/models/paginated-response.model';
import { map, switchMap } from 'rxjs/operators';
import type {
  Asistente,
  AsistenteCreatePayload,
  AsistenteUpdatePayload,
  AsistenteReunion,
  AsistenteReunionCreatePayload,
} from '../../../core/models/asistente.model';

export type AsistenteListParams = {
  page?: number;
  per_page?: number;
  nombre?: string;
  documento?: string;
  barcode_numero?: string;
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

  /** Busca un asistente por su número de código de barras. */
  getByBarcode(barcodeNumero: string) {
    return this.api.getPaginated<Asistente>('/asistentes', {
      barcode_numero: barcodeNumero,
      per_page: 1,
    } as Record<string, string | number | boolean>);
  }

  // ── Per-reunión ──────────────────────────────────────────────────────────

  getByReunion(reunionId: number, params?: { telefono?: string; codigo_barras?: number; page?: number; per_page?: number }) {
    return this.api.getPaginated<AsistenteReunion>(
      `/reuniones/${reunionId}/asistentes`,
      params as Record<string, string | number | boolean>
    );
  }

  /**
   * Registra asistente + check-in en quórum en dos llamadas encadenadas:
   * 1. POST /reuniones/{id}/asistentes  → obtiene asistente.id
   * 2. POST /asistentes/{id}/check-in   → vota PRESENTE y alimenta el quórum
   */
  createForReunionWithCheckIn(reunionId: number, payload: AsistenteReunionCreatePayload) {
    return this.api
      .post<{ message: string; data: AsistenteReunion }>(`/reuniones/${reunionId}/asistentes`, payload)
      .pipe(
        map((res) => res.data),
        switchMap((asistente) =>
          this.api
            .post<{ message: string; data: { asistente: AsistenteReunion; ya_registrado: boolean; inmuebles_registrados: number } }>(
              `/asistentes/${asistente.id}/check-in`,
              { reunion_id: reunionId }
            )
            .pipe(map(() => asistente))
        )
      );
  }

  deleteFromReunion(reunionId: number, asistenteId: number) {
    return this.api.delete<{ message?: string }>(`/reuniones/${reunionId}/asistentes/${asistenteId}`);
  }

  registroTardio(reunionId: number, payload: AsistenteReunionCreatePayload) {
    return this.api.post<{ message: string; data: AsistenteReunion }>(
      `/reuniones/${reunionId}/asistentes/registro-tardio`,
      payload
    );
  }

  // ── Barcodes ─────────────────────────────────────────────────────────────

  /** Genera PDF de códigos de barras. Devuelve blob para descarga. */
  printBarcodes(inicio: number, cantidad: number, repeticiones?: number) {
    const body = { inicio, cantidad, repeticiones: repeticiones ?? 1 };
    return this.http.post(`${API_BASE}/barcodes/print`, body, {
      responseType: 'blob',
    });
  }
}
