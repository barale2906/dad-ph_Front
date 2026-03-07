import { Component, input } from '@angular/core';

/**
 * Mapa de nombres de icono (API/Lucide) a paths SVG (24x24, stroke).
 * Escalable: añadir entradas para nuevos iconos del backend.
 */
const ICON_PATHS: Record<string, string> = {
  'building-2':
    'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z M6 12h.01M10 12h.01M14 12h.01M18 12h.01M6 8h.01M10 8h.01M14 8h.01M18 8h.01',
  calendar:
    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  settings:
    'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  'tree-pine':
    'M17 8C15.8 5.6 13.2 4 10.5 4 6.4 4 3 7.4 3 11.5c0 2.2 1 4.2 2.5 5.5H3V22h18v-5H8.5c.5-.5 1-1.2 1.3-2H17V8z',
  barcode:
    'M3 5v14M8 5v14M12 5v14M17 5v14M21 5v14M5 9h1M5 15h1M19 9h1M19 15h1M12 9h.01M12 15h.01',
  file: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z M14 2v6h6 M12 18v-6 M9 15h6',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M20 21v-2a4 4 0 0 0-3.5-3.94 M16 3.13a4 4 0 0 1 0 7.75',
  folder: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  clipboard: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M15 2H9a1 1 0 0 0-1 1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V3a1 1 0 0 0-1-1z',
};

@Component({
  selector: 'app-menu-icon',
  standalone: true,
  template: `
    @if (path(); as p) {
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        [attr.aria-hidden]="true"
      >
        <path [attr.d]="p" />
      </svg>
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        flex-shrink: 0;
        color: inherit;
      }
      svg {
        vertical-align: middle;
      }
    `,
  ],
})
export class MenuIconComponent {
  /** Nombre del icono (ej. building-2, calendar). Compatible con API / Lucide. */
  readonly name = input<string | undefined>();

  protected path = () => {
    const n = this.name()?.trim();
    if (!n) return null;
    return ICON_PATHS[n] ?? ICON_PATHS['file'] ?? null;
  };
}
