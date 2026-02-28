import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../http/api.service';

export interface InstallStatus {
  installed: boolean;
}

export interface InstallRunPayload {
  admin: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    document?: string;
    phone?: string;
  };
  ph: {
    nit: string;
    name: string;
    email: string;
    address?: string;
    phone?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class InstallService {
  private readonly api = inject(ApiService);

  getStatus() {
    return this.api.get<InstallStatus>('/install/status');
  }

  run(payload: InstallRunPayload) {
    /** El backend Laravel espera campos planos (admin_name, ph_nit, etc.) */
    const body: Record<string, string> = {
      admin_name: payload.admin.name,
      admin_email: payload.admin.email,
      admin_password: payload.admin.password,
      admin_password_confirmation: payload.admin.password_confirmation,
      ph_nit: payload.ph.nit,
      ph_nombre: payload.ph.name,
      ph_email: payload.ph.email,
    };
    if (payload.admin.document) body['admin_document'] = payload.admin.document;
    if (payload.admin.phone) body['admin_phone'] = payload.admin.phone;
    if (payload.ph.address) body['ph_address'] = payload.ph.address;
    if (payload.ph.phone) body['ph_phone'] = payload.ph.phone;

    return this.api.post<{ token: string; user?: { id: number; name: string; email: string; role: string } }>(
      '/install/run',
      body
    );
  }
}
