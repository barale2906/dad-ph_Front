export type TipoAsistente = 'PROPIETARIO' | 'RESIDENTE' | 'APODERADO' | 'INVITADO';

export interface AsistenteInmueble {
  inmueble_id: number;
  nomenclatura?: string;
  coeficiente?: number;
  poder_url?: string;
}

export interface Asistente {
  id: number;
  usuario_id?: number;
  nombre: string;
  documento?: string;
  telefono?: string;
  codigo_acceso?: string;
  barcode_numero?: string;
  tipo_asistente: TipoAsistente;
  inmuebles?: AsistenteInmueble[];
  created_at?: string;
  updated_at?: string;
}

export interface AsistenteCreatePayload {
  nombre: string;
  documento?: string;
  telefono?: string;
  codigo_acceso?: string;
  tipo_asistente: TipoAsistente;
  inmuebles?: Array<{
    inmueble_id: number;
    coeficiente?: number;
    poder_url?: string;
  }>;
}

export interface AsistenteUpdatePayload extends AsistenteCreatePayload {}

/** Registro de asistencia en una reunión específica (GET/POST /reuniones/:id/asistentes) */
export interface AsistenteReunionInmueble {
  id: number;
  nomenclatura: string;
  coeficiente: number;
  poder_url: string | null;
}

export interface AsistenteReunion {
  id: number;
  reunion_id: number;
  telefono: string | null;
  codigo_barras: number | null;
  inmuebles: AsistenteReunionInmueble[];
  created_at?: string;
  updated_at?: string;
}

export interface AsistenteReunionCreatePayload {
  telefono?: string | null;
  codigo_barras?: number | null;
  inmuebles: {
    inmueble_id: number;
    coeficiente?: number | null;
    poder_url?: string | null;
  }[];
}
