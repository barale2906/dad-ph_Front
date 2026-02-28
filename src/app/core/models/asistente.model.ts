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
