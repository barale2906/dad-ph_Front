export interface ResultadoOpcion {
  opcion_id: number;
  texto: string;
  votos: number;
  porcentaje: number;
}

export interface ResultadosPregunta {
  pregunta_id: number;
  pregunta: string;
  total_votos: number;
  opciones: ResultadoOpcion[];
}
