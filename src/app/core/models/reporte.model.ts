import type { ResultadosPregunta } from './resultados.model';

export interface EstadisticasReunion {
  reunion_id: number;
  preguntas: ResultadosPregunta[];
  total_votantes?: number;
}
