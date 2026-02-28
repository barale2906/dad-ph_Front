import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReunionService } from '../services/reunion.service';
import { ReporteService } from '../reportes/services/reporte.service';
import { ConvocatoriaSectionComponent } from '../convocatorias/convocatoria-section/convocatoria-section.component';
import type { Reunion } from '../../../core/models/reunion.model';

@Component({
  selector: 'app-reunion-detail',
  standalone: true,
  imports: [RouterLink, ConvocatoriaSectionComponent],
  templateUrl: './reunion-detail.component.html',
  styleUrl: './reunion-detail.component.scss',
})
export class ReunionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly reunionService = inject(ReunionService);
  private readonly reporteService = inject(ReporteService);

  protected reunion = signal<Reunion | null>(null);
  protected loading = true;
  protected actionLoading = false;

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.reunionService.getById(id).subscribe({
      next: (r) => this.reunion.set(r),
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  protected iniciar() {
    const r = this.reunion();
    if (!r || r.estado !== 'programada') return;
    this.actionLoading = true;
    this.reunionService.iniciar(r.id).subscribe({
      next: (updated) => this.reunion.set(updated),
      error: () => {},
      complete: () => (this.actionLoading = false),
    });
  }

  protected cerrar() {
    const r = this.reunion();
    if (!r || r.estado !== 'en_curso') return;
    this.actionLoading = true;
    this.reunionService.cerrar(r.id).subscribe({
      next: (updated) => this.reunion.set(updated),
      error: () => {},
      complete: () => (this.actionLoading = false),
    });
  }

  protected descargarActa(reunionId: number) {
    this.reporteService.getActaPdf(reunionId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `acta-reunion-${reunionId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {},
    });
  }

  protected formatFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
