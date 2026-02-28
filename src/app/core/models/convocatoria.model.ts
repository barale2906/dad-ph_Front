export type ConvocatoriaEstado = 'borrador' | 'enviada' | 'publicada' | 'cerrada';

export interface Convocatoria {
  id: number;
  reunion_id: number;
  estado: ConvocatoriaEstado;
  contenido?: string;
  created_at?: string;
  updated_at?: string;
}
