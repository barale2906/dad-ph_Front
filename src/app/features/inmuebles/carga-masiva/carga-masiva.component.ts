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
  protected loading = false;
  protected errorMessage = '';

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
    const csv = [headers.join(','), example.join(',')].join('\n');
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
      this.errorMessage = 'Seleccione un archivo CSV.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.result.set(null);

    this.inmuebleService.cargaMasiva(file).subscribe({
      next: (res) => this.result.set(res),
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message ?? 'Error al procesar el archivo.';
      },
      complete: () => {
        this.loading = false;
        input.value = '';
      },
    });
  }

}
