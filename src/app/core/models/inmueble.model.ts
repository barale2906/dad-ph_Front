export interface Inmueble {
  id: number;
  nomenclatura: string;
  coeficiente: number;
  tipo?: string;
  propietario_documento?: string;
  propietario_nombre?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InmuebleCreatePayload {
  nomenclatura: string;
  coeficiente: number;
  tipo?: string;
  propietario_documento?: string;
  propietario_nombre?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
}

export interface CoeficientesValidacion {
  total: number;
  suma: number;
  estado: 'completo' | 'incompleto' | 'exceso' | 'faltante';
  mensaje?: string;
}

export interface CargaMasivaResult {
  creados: number;
  actualizados: number;
  errores: Array<{ fila: number; mensaje: string }>;
}
