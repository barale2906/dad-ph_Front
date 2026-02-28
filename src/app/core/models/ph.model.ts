export interface Ph {
  id: number;
  nit: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  estado?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PhUpdatePayload {
  nit: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  logo?: File | string | null;
  estado?: string;
}
