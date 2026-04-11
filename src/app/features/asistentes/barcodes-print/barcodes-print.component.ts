import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AsistenteService, BarcodeTipo, BarcodePapel, BarcodeOrientacion } from '../services/asistente.service';

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-barcodes-print',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './barcodes-print.component.html',
  styleUrl: './barcodes-print.component.scss',
})
export class BarcodesPrintComponent {
  private readonly fb = inject(FormBuilder);
  private readonly asistenteService = inject(AsistenteService);

  protected loading = false;
  protected errorMessage = '';
  protected validationErrors: Record<string, string[]> = {};

  protected readonly tiposCodigo: SelectOption<BarcodeTipo>[] = [
    { value: 'C128', label: 'Code 128 — Recomendado (numérico / alfanumérico)' },
    { value: 'C39',  label: 'Code 39 — Alfanumérico, menos denso' },
    { value: 'EAN13', label: 'EAN-13 — Exactamente 12 dígitos de entrada' },
    { value: 'EAN8',  label: 'EAN-8 — Exactamente 7 dígitos de entrada' },
    { value: 'UPCA',  label: 'UPC-A — Exactamente 11 dígitos de entrada' },
  ];

  protected readonly papeles: SelectOption<BarcodePapel>[] = [
    { value: 'A4',     label: 'A4' },
    { value: 'Letter', label: 'Letter' },
    { value: 'Legal',  label: 'Legal' },
  ];

  protected readonly orientaciones: SelectOption<BarcodeOrientacion>[] = [
    { value: 'portrait',  label: 'Vertical (Portrait)' },
    { value: 'landscape', label: 'Horizontal (Landscape)' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    // Sección: Secuencia
    inicio:      [1,  [Validators.required, Validators.min(1)]],
    cantidad:    [50, [Validators.required, Validators.min(1)]],
    repeticiones:[1,  [Validators.required, Validators.min(1)]],

    // Sección: Dimensiones del rótulo
    rotulo_ancho: [50, [Validators.required, Validators.min(10)]],
    rotulo_alto:  [25, [Validators.required, Validators.min(10)]],

    // Sección: Configuración del papel
    papel:       ['A4'      as BarcodePapel,      []],
    orientacion: ['portrait' as BarcodeOrientacion, []],

    // Sección: Márgenes
    margen_top:    [10, [Validators.min(0)]],
    margen_bottom: [10, [Validators.min(0)]],
    margen_left:   [10, [Validators.min(0)]],
    margen_right:  [10, [Validators.min(0)]],

    // Sección: Tipo de código
    tipo_codigo: ['C128' as BarcodeTipo, []],
  });

  protected fieldError(name: string): string | null {
    const ctrl: AbstractControl | null = this.form.get(name);
    if (ctrl && ctrl.invalid && ctrl.touched) {
      if (ctrl.errors?.['required']) return 'Este campo es obligatorio.';
      if (ctrl.errors?.['min'])      return `El valor mínimo es ${ctrl.errors['min'].min}.`;
    }
    if (this.validationErrors[name]?.length) return this.validationErrors[name][0];
    return null;
  }

  protected totalRotulos(): number {
    const { cantidad, repeticiones } = this.form.getRawValue();
    return (cantidad ?? 0) * (repeticiones ?? 0);
  }

  protected onSubmit(mode: 'download' | 'preview'): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.validationErrors = {};

    const v = this.form.getRawValue();
    const payload = {
      inicio:        v.inicio,
      cantidad:      v.cantidad,
      repeticiones:  v.repeticiones,
      rotulo_ancho:  v.rotulo_ancho,
      rotulo_alto:   v.rotulo_alto,
      papel:         v.papel,
      orientacion:   v.orientacion,
      margen_top:    v.margen_top,
      margen_bottom: v.margen_bottom,
      margen_left:   v.margen_left,
      margen_right:  v.margen_right,
      tipo_codigo:   v.tipo_codigo,
    };

    this.asistenteService.printBarcodes(payload).subscribe({
      next: (response) => {
        const blob = response.body!;
        const url  = URL.createObjectURL(blob);

        if (mode === 'preview') {
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 10_000);
        } else {
          const a     = document.createElement('a');
          a.href      = url;
          a.download  = `codigos-barras-${v.inicio}-al-${v.inicio + v.cantidad - 1}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        }
      },
      error: async (err) => {
        this.loading = false;
        if (err.error instanceof Blob) {
          try {
            const text = await err.error.text();
            const json = JSON.parse(text);
            this.errorMessage       = json.message ?? 'Error al generar el PDF.';
            this.validationErrors   = json.errors  ?? {};
          } catch {
            this.errorMessage = 'Error inesperado al generar el PDF.';
          }
        } else {
          this.errorMessage = err?.error?.message ?? 'Error al generar el PDF.';
        }
      },
      complete: () => (this.loading = false),
    });
  }
}
