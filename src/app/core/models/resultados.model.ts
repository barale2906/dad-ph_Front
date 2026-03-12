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
