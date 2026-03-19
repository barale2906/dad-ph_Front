export interface InmuebleVotoItem {
  inmueble_id: number;
  nomenclatura: string;
  coeficiente: number;
  votado: boolean;
  /** true si el inmueble está en la reunión (registro normal o tardío) */
  es_asistente?: boolean;
  opcion_id: number | null;
  opcion_texto: string | null;
  votado_at: string | null;
}

export interface InmueblesVotosResponse {
  pregunta_id: number;
  tipo: string;
  estado: string;
  total_inmuebles: number;
  inmuebles_votaron: number;
  inmuebles_pendientes: number;
  coeficiente_total: number;
  coeficiente_votante: number;
  /** Unidades que registraron asistencia en el quórum (normal + tardío) */
  asistencia_unidades?: number;
  /** Coeficiente total de la asistencia */
  asistencia_coeficiente?: number;
  /** Asistentes que no votaron (unidades, incluye tardíos) */
  no_votaron_unidades?: number;
  /** Asistentes que no votaron (coeficiente) */
  no_votaron_coeficiente?: number;
  /** Todos los inmuebles de la PH con votado y es_asistente */
  inmuebles: InmuebleVotoItem[];
  /** Solo asistentes de la reunión (incluye tardíos). Orden: votaron primero, luego no votaron. */
  inmuebles_asistentes?: InmuebleVotoItem[];
}

/** Forma raw que devuelve el endpoint GET /preguntas/{id}/resultados */
export interface ResultadosApiItem {
  opcion_id: number;
  texto: string;
  votos: number;
  coeficiente: number;
}

export interface ResultadosApiResponse {
  pregunta_id: number;
  tipo: string;
  estado: string;
  asistencia_unidades?: number;
  asistencia_coeficiente?: number;
  votaron_unidades?: number;
  votaron_coeficiente?: number;
  no_votaron_unidades?: number;
  no_votaron_coeficiente?: number;
  resultados: ResultadosApiItem[];
}

export interface ResultadoOpcion {
  /** 0 para "No votó" (asistentes que no votaron) */
  opcion_id: number;
  texto: string;
  votos: number;
  porcentaje: number;
  /** Número de unidades (inmuebles) que votaron esta opción */
  unidades?: number;
  porcentaje_unidades?: number;
  /** Suma de coeficientes de los inmuebles que votaron esta opción */
  coeficiente?: number;
  porcentaje_coeficiente?: number;
}

export interface ResultadosPregunta {
  pregunta_id: number;
  pregunta: string;
  total_votos: number;
  total_unidades?: number;
  total_coeficiente?: number;
  /** Unidades que registraron asistencia en el quórum */
  asistencia_unidades?: number;
  asistencia_coeficiente?: number;
  votaron_unidades?: number;
  votaron_coeficiente?: number;
  no_votaron_unidades?: number;
  no_votaron_coeficiente?: number;
  opciones: ResultadoOpcion[];
}
