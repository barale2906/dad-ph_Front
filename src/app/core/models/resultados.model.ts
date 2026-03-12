export interface InmuebleVotoItem {
  inmueble_id: number;
  nomenclatura: string;
  coeficiente: number;
  votado: boolean;
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
  inmuebles: InmuebleVotoItem[];
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
  resultados: ResultadosApiItem[];
}

export interface ResultadoOpcion {
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
  opciones: ResultadoOpcion[];
}
