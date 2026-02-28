export interface ZonaComun {
  id: number;
  nombre: string;
  descripcion?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ZonaComunCreatePayload {
  nombre: string;
  descripcion?: string;
}

export interface ZonaComunUpdatePayload {
  nombre?: string;
  descripcion?: string;
}
