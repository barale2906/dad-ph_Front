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
  total_coeficientes: number;
  completo: boolean;
  estado: 'completo' | 'incompleto';
  faltante: number;
  exceso: number;
}

export interface CargaMasivaResult {
  creados: number;
  actualizados: number;
  errores: Record<string, string[]>;
}
