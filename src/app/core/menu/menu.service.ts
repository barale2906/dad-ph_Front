import { Injectable, inject, signal, computed } from '@angular/core';
import { tap, catchError, of } from 'rxjs';
import { ApiService } from '../http/api.service';
import type { MenuItem, MenuResponse } from '../models/menu.model';
import { normalizeMenuItem } from '../models/menu.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly api = inject(ApiService);

  private readonly _menu = signal<MenuItem[]>([]);
  private readonly _rol = signal<string>('');
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  /** Ítems del menú (árbol filtrado por rol). */
  readonly menu = this._menu.asReadonly();
  /** Rol del usuario actual devuelto por la API. */
  readonly rol = this._rol.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly hasMenu = computed(() => this._menu().length > 0);

  /**
   * Carga el menú desde GET /api/menu.
   * Debe llamarse tras login o al rehidratar la app con sesión válida.
   */
  load() {
    if (this._loading()) return of(null);
    this._loading.set(true);
    this._error.set(null);
    return this.api.get<MenuResponse>('/menu').pipe(
      tap((res) => {
        const raw = res.menu ?? [];
        this._menu.set(raw.map(normalizeMenuItem));
        this._rol.set(res.rol ?? '');
        this._loading.set(false);
      }),
      catchError((err) => {
        this._loading.set(false);
        this._error.set(err?.error?.message ?? 'Error al cargar el menú');
        return of(null);
      })
    );
  }

  /** Limpia el menú (p. ej. al cerrar sesión). */
  clear(): void {
    this._menu.set([]);
    this._rol.set('');
    this._error.set(null);
  }
}
