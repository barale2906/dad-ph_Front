/**
 * Tipos para el menú dinámico consumido desde GET /api/menu.
 * El menú se filtra por rol del usuario autenticado.
 */

export interface MenuItem {
  key: string;
  label: string;
  route: string;
  icon?: string;
  api?: string;
  /** Hijos del ítem (nombre estándar tras normalización). */
  children?: MenuItem[];
  /** Alternativa que puede enviar la API en lugar de children. */
  submenu?: MenuItem[];
  /** Alternativa en snake_case (algunos backends). */
  sub_menu?: MenuItem[];
}

export interface MenuResponse {
  menu: MenuItem[];
  rol: string;
}

/** Normaliza un ítem: unifica submenu/sub_menu → children y aplica recursivamente. */
export function normalizeMenuItem(item: MenuItem): MenuItem {
  const raw = item.children ?? item.submenu ?? (item as { sub_menu?: MenuItem[] }).sub_menu ?? [];
  const children = Array.isArray(raw) ? raw : [];
  return {
    ...item,
    children: children.map((child) => normalizeMenuItem(child)),
  };
}
