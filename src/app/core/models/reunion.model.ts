export type ReunionEstado = 'programada' | 'en_curso' | 'finalizada' | 'cancelada';
export type ReunionTipo = 'ordinaria' | 'extraordinaria';
export type ReunionModalidad = 'presencial' | 'virtual' | 'mixta';
export type ReunionEnte = 'ASAMBLEA' | 'CONSEJO' | 'JUNTA';

export interface Reunion {
  id: number;
  tipo: ReunionTipo;
  estado: ReunionEstado;
  fecha: string;
  hora: string;
  modalidad: ReunionModalidad;
  ente: ReunionEnte;
  zona_comun_ids?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface ReunionCreatePayload {
  tipo: ReunionTipo;
  fecha: string;
  hora: string;
  modalidad: ReunionModalidad;
  ente: ReunionEnte;
  zona_comun_ids?: number[];
}

export interface ReunionUpdatePayload extends ReunionCreatePayload {}
