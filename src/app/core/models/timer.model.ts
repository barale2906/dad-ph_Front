export type TimerTipo = 'INTERVENCION' | 'VOTACION';
export type TimerEstado = 'inactivo' | 'activo' | 'pausado' | 'finalizado';

export interface Timer {
  id: number;
  reunion_id: number;
  tipo: TimerTipo;
  duracion_segundos: number;
  tiempo_restante_segundos?: number;
  estado: TimerEstado;
  interviniente_nombre?: string;
  interviniente_asistente_id?: number;
  pregunta_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TimerCreatePayload {
  reunion_id: number;
  tipo: TimerTipo;
  duracion_segundos: number;
  interviniente_nombre?: string;
  interviniente_asistente_id?: number;
  pregunta_id?: number;
}
