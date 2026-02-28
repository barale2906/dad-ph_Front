import { Component, inject, input, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConvocatoriaService } from '../services/convocatoria.service';
import type { Convocatoria } from '../../../../core/models/convocatoria.model';

@Component({
  selector: 'app-convocatoria-section',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './convocatoria-section.component.html',
  styleUrl: './convocatoria-section.component.scss',
})
export class ConvocatoriaSectionComponent implements OnInit {
  reunionId = input.required<number>();
  onUpdated = input<() => void>();

  private readonly convocatoriaService: ConvocatoriaService = inject(ConvocatoriaService);

  protected convocatoria = signal<Convocatoria | null>(null);
  protected loading = true;
  protected saving = false;
  protected errorMessage = '';
  protected editContenido = '';
  protected showEditor = false;

  ngOnInit() {
    this.load();
  }

  private load() {
    this.loading = true;
    this.convocatoriaService.getByReunion(this.reunionId()).subscribe({
      next: (c: Convocatoria | null) => {
        this.convocatoria.set(c);
        this.editContenido = c?.contenido ?? '';
      },
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  protected crear() {
    this.saving = true;
    this.errorMessage = '';
    this.convocatoriaService.create(this.reunionId(), {}).subscribe({
      next: (c: Convocatoria) => {
        this.convocatoria.set(c);
        this.editContenido = c.contenido ?? '';
        this.showEditor = true;
        this.onUpdated()?.();
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving = false;
        this.errorMessage = err?.error?.message ?? 'Error al crear.';
      },
      complete: () => (this.saving = false),
    });
  }

  protected guardar() {
    const c = this.convocatoria();
    if (!c) return;
    this.saving = true;
    this.errorMessage = '';
    this.convocatoriaService.update(c.id, { contenido: this.editContenido }).subscribe({
      next: (updated: Convocatoria) => {
        this.convocatoria.set(updated);
        this.showEditor = false;
        this.onUpdated()?.();
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving = false;
        this.errorMessage = err?.error?.message ?? 'Error al guardar.';
      },
      complete: () => (this.saving = false),
    });
  }

  protected enviar() {
    const c = this.convocatoria();
    if (!c) return;
    this.saving = true;
    this.errorMessage = '';
    this.convocatoriaService.enviar(c.id).subscribe({
      next: (updated: Convocatoria) => {
        this.convocatoria.set(updated);
        this.onUpdated()?.();
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving = false;
        this.errorMessage = err?.error?.message ?? 'Error al enviar.';
      },
      complete: () => (this.saving = false),
    });
  }

  protected publicar() {
    const c = this.convocatoria();
    if (!c) return;
    this.saving = true;
    this.errorMessage = '';
    this.convocatoriaService.publicar(c.id).subscribe({
      next: (updated: Convocatoria) => {
        this.convocatoria.set(updated);
        this.onUpdated()?.();
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving = false;
        this.errorMessage = err?.error?.message ?? 'Error al publicar.';
      },
      complete: () => (this.saving = false),
    });
  }
}
