export interface OrdenDiaItem {
  id: number;
  reunion_id: number;
  titulo: string;
  descripcion?: string;
  orden: number;
  ejecutado: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OrdenDiaCreatePayload {
  titulo: string;
  descripcion?: string;
  orden?: number;
}

export interface OrdenDiaUpdatePayload {
  titulo: string;
  descripcion?: string | null;
  orden: number;
  ejecutado?: boolean;
}

export interface ReordenarPayload {
  items: Array<{ id: number; orden: number }>;
}

export interface CargaMasivaOrdenDiaResult {
  creados: number;
  errores: Record<string, string[]>;
}
