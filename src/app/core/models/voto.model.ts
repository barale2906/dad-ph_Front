export interface VotoCreatePayload {
  pregunta_id: number;
  opcion_id: number;
  asistente_id: number;
}

export interface VotoRegistrarResponse {
  message: string;
  status: string;
}
