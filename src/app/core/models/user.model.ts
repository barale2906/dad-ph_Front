export type UserRole = 'SUPER_ADMIN' | 'ADMIN_PH' | 'LOGISTICA' | 'LECTURA';
export type TipoUsuario = 'ADMINISTRATIVO' | 'PROPIETARIO' | 'RESIDENTE' | 'ARRENDATARIO' | 'APODERADO';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  tipo?: TipoUsuario;
  document?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserCreatePayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
  tipo?: TipoUsuario;
  document?: string;
  phone?: string;
}

export interface UserUpdatePayload {
  name?: string;
  email?: string;
  role?: UserRole;
  tipo?: TipoUsuario;
  document?: string;
  phone?: string;
}

export type RelacionInmueble = 'PROPIETARIO' | 'RESIDENTE' | 'ARRENDATARIO' | 'APODERADO';

export interface UserInmueble {
  id: number;
  inmueble_id: number;
  inmueble_nomenclatura?: string;
  relacion: RelacionInmueble;
  es_principal: boolean;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface UserInmuebleCreatePayload {
  inmueble_id: number;
  relacion: RelacionInmueble;
  es_principal?: boolean;
  fecha_desde?: string;
  fecha_hasta?: string;
}
