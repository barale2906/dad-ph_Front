export type PreguntaEstado = 'inactiva' | 'abierta' | 'cerrada' | 'cancelada';

export interface Opcion {
  id: number;
  pregunta_id: number;
  texto: string;
  orden: number;
  created_at?: string;
  updated_at?: string;
}

export interface Pregunta {
  id: number;
  reunion_id: number;
  pregunta: string;
  estado: PreguntaEstado;
  orden: number;
  opciones?: Opcion[];
  created_at?: string;
  updated_at?: string;
}

export interface PreguntaCreatePayload {
  reunion_id: number;
  pregunta: string;
  estado?: PreguntaEstado;
  orden?: number;
}

export interface PreguntaUpdatePayload {
  pregunta?: string;
  estado?: PreguntaEstado;
  orden?: number;
}

export interface OpcionCreatePayload {
  pregunta_id: number;
  texto: string;
  orden?: number;
}

export interface OpcionUpdatePayload {
  texto?: string;
  orden?: number;
}
