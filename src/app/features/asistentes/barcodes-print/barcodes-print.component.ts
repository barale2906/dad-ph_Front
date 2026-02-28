import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AsistenteService } from '../services/asistente.service';

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

  protected form = this.fb.nonNullable.group({
    inicio: [1, [Validators.required, Validators.min(1)]],
    cantidad: [10, [Validators.required, Validators.min(1)]],
    repeticiones: [1, [Validators.required, Validators.min(1)]],
  });

  protected onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    const v = this.form.getRawValue();
    this.asistenteService.printBarcodes(v.inicio, v.cantidad, v.repeticiones).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `codigos-barras-${v.inicio}-${v.cantidad}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message ?? 'Error al generar el PDF.';
      },
      complete: () => (this.loading = false),
    });
  }
}
