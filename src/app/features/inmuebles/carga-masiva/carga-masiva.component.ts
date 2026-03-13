import { Component, inject, signal, viewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InmuebleService } from '../services/inmueble.service';
import type { CargaMasivaResult } from '../../../core/models/inmueble.model';

@Component({
  selector: 'app-carga-masiva',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './carga-masiva.component.html',
  styleUrl: './carga-masiva.component.scss',
})
export class CargaMasivaComponent {
  private readonly inmuebleService = inject(InmuebleService);
  protected fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected result = signal<CargaMasivaResult | null>(null);
  protected loading = signal(false);
  protected errorMessage = signal('');

  protected downloadTemplate() {
    const headers = [
      'nomenclatura',
      'coeficiente',
      'tipo',
      'propietario_documento',
      'propietario_nombre',
      'telefono',
      'email',
      'activo',
    ];
    const example = ['Apto 101', '5.5', 'Apartamento', '12345678', 'Juan Pérez', '3001234567', 'juan@ejemplo.com', '1'];
    const csv = [headers.join(';'), example.join(';')].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_inmuebles.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  protected triggerFileInput() {
    this.fileInputRef()?.nativeElement.click();
  }

  protected onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      this.errorMessage.set('Seleccione un archivo CSV.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.result.set(null);

    this.inmuebleService.cargaMasiva(file).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
        input.value = '';
      },
      error: (err) => {
        this.loading.set(false);
        input.value = '';
        // 422: carga finalizada con errores — la API devuelve los datos parciales
        const errData: CargaMasivaResult | undefined = err?.error?.data;
        if (errData) {
          this.result.set(errData);
          this.errorMessage.set(err?.error?.message ?? 'Carga finalizada con errores.');
        } else {
          this.errorMessage.set(err?.error?.message ?? 'Error al procesar el archivo.');
        }
      },
    });
  }

  protected getErrorEntries(errores: Record<string, string[]>): [string, string[]][] {
    return Object.entries(errores);
  }

  protected hasErrors(errores: Record<string, string[]>): boolean {
    return Object.keys(errores).length > 0;
  }
}
