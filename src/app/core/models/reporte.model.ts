import type { ResultadosPregunta } from './resultados.model';

// ── Orden del día ─────────────────────────────────────────────────────────

export interface OrdenDiaItem {
  id: number;
  orden: number;
  titulo: string;
  descripcion: string | null;
  ejecutado: boolean;
}

export interface OrdenDiaStats {
  items: OrdenDiaItem[];
  total: number;
  ejecutados: number;
  nivel_cumplimiento: number;
}

// ── Asistencia ─────────────────────────────────────────────────────────────

export interface AsistenteInmueble {
  inmueble_id: number;
  nomenclatura: string;
  coeficiente: number;
}

export interface AsistenteRegistrado {
  asistente_id: number;
  codigo_barras: number | null;
  telefono: string | null;
  identificacion: string | null;
  inmuebles: AsistenteInmueble[];
}

export interface InmuebleNoRegistrado {
  inmueble_id: number;
  nomenclatura: string;
  coeficiente: number;
  telefono: string | null;
}

export interface AsistenciaStats {
  registrados: AsistenteRegistrado[];
  no_registrados: InmuebleNoRegistrado[];
  total_unidades: number;
  unidades_registradas: number;
  unidades_no_registradas: number;
}

// ── Votaciones (API raw) ───────────────────────────────────────────────────

export interface VotacionOpcionResultado {
  opcion_id: number;
  texto: string;
  votos: number;
  coeficiente: number;
}

export interface VotacionResultados {
  asistencia_unidades: number;
  asistencia_coeficiente: number;
  votaron_unidades: number;
  votaron_coeficiente: number;
  no_votaron_unidades: number;
  no_votaron_coeficiente: number;
  opciones: VotacionOpcionResultado[];
}

export interface InmuebleAsistenteVoto {
  inmueble_id: number;
  nomenclatura: string;
  coeficiente: number;
  votado: boolean;
  es_asistente: boolean;
  codigo_barras: number | null;
  telefono: string | null;
  identificacion: string | null;
  opcion_id: number | null;
  opcion_texto: string | null;
  votado_at: string | null;
}

export interface VotacionConResultados {
  pregunta_id: number;
  pregunta: string;
  tipo: string;
  estado: string;
  disponible: true;
  resultados: VotacionResultados;
  inmuebles_asistentes: InmuebleAsistenteVoto[];
}

export interface VotacionSinResultados {
  pregunta_id: number;
  pregunta: string;
  tipo: string;
  estado: string;
  disponible: false;
  mensaje: string;
}

export type VotacionItem = VotacionConResultados | VotacionSinResultados;

// ── Respuesta completa ─────────────────────────────────────────────────────

export interface EstadisticasReunion {
  reunion_id: number;
  orden_dia: OrdenDiaStats;
  asistencia: AsistenciaStats;
  votaciones: VotacionItem[];
}

/** @deprecated Usar EstadisticasReunion. Mantener por compatibilidad con ResultadosPregunta. */
export interface EstadisticasReunionLegacy {
  reunion_id: number;
  preguntas: ResultadosPregunta[];
  total_votantes?: number;
}
