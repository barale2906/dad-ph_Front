import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import type { Ph, PhUpdatePayload } from '../../../core/models/ph.model';

@Injectable({ providedIn: 'root' })
export class PhService {
  private readonly api = inject(ApiService);

  getPh() {
    return this.api.get<Ph>('/ph');
  }

  updatePh(payload: PhUpdatePayload) {
    const body = {
      nit: payload.nit,
      name: payload.name,
      email: payload.email,
      address: payload.address ?? undefined,
      phone: payload.phone ?? undefined,
      estado: payload.estado ?? undefined,
    };
    if (payload.logo instanceof File) {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      Object.entries(body).forEach(([k, v]) => {
        if (v != null && v !== '') formData.append(k, String(v));
      });
      formData.append('logo', payload.logo);
      return this.api.post<Ph>('/ph', formData);
    }
    return this.api.put<Ph>('/ph', body);
  }
}
