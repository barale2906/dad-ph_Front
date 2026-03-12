import type { ZonaComun } from './zona-comun.model';

export type ReunionEstado = 'programada' | 'en_curso' | 'finalizada' | 'cancelada';
export type ReunionTipo = 'ordinaria' | 'extraordinaria';
export type ReunionModalidad = 'presencial' | 'virtual' | 'mixta';
export type ReunionEnte = 'ASAMBLEA' | 'CONSEJO' | 'ADMINISTRADOR' | 'CONTADOR';

export interface ReunionConvocatoria {
  id: number;
  reunion_id: number;
  fecha_convocatoria: string;
  medio: string;
  contenido: string;
  orden_dia_snapshot: unknown | null;
  fecha_limite_legal: string;
  estado: string;
  created_at: string;
  updated_at: string;
}

export interface Reunion {
  id: number;
  tipo: ReunionTipo;
  estado: ReunionEstado;
  fecha: string;
  hora: string;
  modalidad: ReunionModalidad;
  ente: ReunionEnte;
  inicio_at: string | null;
  cierre_at: string | null;
  zonas_comunes: ZonaComun[];
  convocatoria: ReunionConvocatoria | null;
  /** Compatibilidad con payload de creación/edición */
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
  estado?: ReunionEstado;
  zona_comun_ids?: number[];
}

export interface ReunionUpdatePayload extends ReunionCreatePayload {}
