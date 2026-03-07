import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuIconComponent } from '../../../shared/components/menu-icon/menu-icon.component';
import type { MenuItem } from '../../../core/models/menu.model';
import { normalizeMenuItem } from '../../../core/models/menu.model';

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MenuIconComponent, MenuItemComponent],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss',
})
export class MenuItemComponent {
  /** Ítem del menú (puede tener children). */
  readonly item = input.required<MenuItem>();
  /** Nivel de anidación (0 = raíz) para indentación. */
  readonly level = input<number>(0);

  protected expanded = signal(false);

  protected get hasChildren(): boolean {
    const item = this.item();
    const c = item.children ?? item.submenu ?? item.sub_menu;
    return Array.isArray(c) && c.length > 0;
  }

  /** Lista de hijos normalizada (siempre array; soporta children, submenu y sub_menu). */
  protected get childItems(): MenuItem[] {
    const item = this.item();
    const raw = item.children ?? item.submenu ?? item.sub_menu ?? [];
    const arr = Array.isArray(raw) ? raw : [];
    return arr.map((child) => normalizeMenuItem(child));
  }

  protected normalizedRoute(item: MenuItem): string {
    const r = item.route?.trim() ?? '';
    return r.startsWith('/') ? r : `/${r}`;
  }

  protected toggle(): void {
    this.expanded.update((v) => !v);
  }
}
