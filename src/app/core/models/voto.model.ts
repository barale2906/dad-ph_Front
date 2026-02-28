export interface VotoCreatePayload {
  pregunta_id: number;
  opcion_id: number;
  inmueble_id?: number;
  asistente_id?: number;
}
