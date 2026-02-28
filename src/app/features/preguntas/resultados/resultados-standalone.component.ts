import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ResultadosComponent } from './resultados.component';

@Component({
  selector: 'app-resultados-standalone',
  standalone: true,
  imports: [RouterLink, ResultadosComponent],
  template: `
    <div class="resultados-page">
      <a [routerLink]="['/reuniones', reunionId, 'preguntas']" class="back-link">← Volver a preguntas</a>
      <app-resultados [preguntaId]="preguntaId" />
    </div>
  `,
  styles: [`
    .resultados-page { padding: 1.5rem; max-width: 600px; }
    .back-link { display: inline-block; color: var(--neon-blue); margin-bottom: 1rem; text-decoration: none; }
  `],
})
export class ResultadosStandaloneComponent {
  private readonly route = inject(ActivatedRoute);
  protected reunionId = +this.route.snapshot.paramMap.get('id')!;
  protected preguntaId = +this.route.snapshot.paramMap.get('preguntaId')!;
}
