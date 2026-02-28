import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { PreguntaService } from '../services/pregunta.service';
import { OpcionService } from '../services/opcion.service';
import type { PreguntaEstado, Opcion } from '../../../core/models/pregunta.model';

@Component({
  selector: 'app-pregunta-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './pregunta-form.component.html',
  styleUrl: './pregunta-form.component.scss',
})
export class PreguntaFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly preguntaService = inject(PreguntaService);
  private readonly opcionService = inject(OpcionService);

  protected reunionId = 0;
  protected isEdit = false;
  protected preguntaId = signal<number | null>(null);
  protected loading = true;
  protected saving = false;
  protected errorMessage = '';

  protected estados: { value: PreguntaEstado; label: string }[] = [
    { value: 'inactiva', label: 'Inactiva' },
    { value: 'abierta', label: 'Abierta' },
    { value: 'cerrada', label: 'Cerrada' },
    { value: 'cancelada', label: 'Cancelada' },
  ];

  protected form = this.fb.nonNullable.group({
    pregunta: ['', Validators.required],
    estado: ['inactiva' as PreguntaEstado],
    orden: [0],
    opciones: this.fb.array<{ id?: number; texto: string; orden: number }>([]),
  });

  protected get opcionesArray() {
    return this.form.get('opciones') as FormArray;
  }

  ngOnInit() {
    this.reunionId = +this.route.snapshot.paramMap.get('id')!;
    const preguntaParam = this.route.snapshot.paramMap.get('preguntaId');
    if (preguntaParam && preguntaParam !== 'nueva') {
      this.isEdit = true;
      const id = +preguntaParam;
      this.preguntaId.set(id);
      this.preguntaService.getById(id).subscribe({
        next: (p) => {
          this.form.patchValue({
            pregunta: p.pregunta,
            estado: p.estado,
            orden: p.orden,
          });
          (p.opciones ?? []).forEach((o) => this.addOpcion(o));
        },
        error: () => {},
        complete: () => (this.loading = false),
      });
    } else {
      this.loading = false;
    }
  }

  protected addOpcion(existing?: Opcion) {
    const g = this.fb.group({
      id: [existing?.id],
      texto: [existing?.texto ?? '', Validators.required],
      orden: [existing?.orden ?? this.opcionesArray.length],
    });
    this.opcionesArray.push(g);
  }

  protected removeOpcion(index: number) {
    this.opcionesArray.removeAt(index);
  }

  protected addNuevaOpcion() {
    this.addOpcion();
  }

  protected onSubmit() {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMessage = '';

    const v = this.form.getRawValue();
    const editId = this.preguntaId();

    if (this.isEdit && editId) {
      this.preguntaService
        .update(editId, {
          pregunta: v.pregunta,
          estado: v.estado,
          orden: v.orden,
        })
        .subscribe({
          next: () => this.saveOpciones(editId),
          error: (err) => {
            this.saving = false;
            this.errorMessage = err?.error?.message ?? 'Error al guardar.';
          },
        });
    } else {
      this.preguntaService
        .create({
          reunion_id: this.reunionId,
          pregunta: v.pregunta,
          estado: v.estado,
          orden: v.orden,
        })
        .subscribe({
          next: (p) => this.saveOpciones(p.id),
          error: (err) => {
            this.saving = false;
            this.errorMessage = err?.error?.message ?? 'Error al guardar.';
          },
        });
    }
  }

  private saveOpciones(preguntaId: number) {
    const opciones = this.opcionesArray.value as Array<{ id?: number; texto: string; orden: number }>;
    const toCreate = opciones.filter((o) => !o.id && o.texto?.trim());
    const toUpdate = opciones.filter((o) => o.id && o.texto?.trim());

    const updates = toUpdate.map((o) =>
      this.opcionService.update(o.id!, { texto: o.texto, orden: o.orden })
    );
    const creates = toCreate.map((o, i) =>
      this.opcionService.create({
        pregunta_id: preguntaId,
        texto: o.texto,
        orden: o.orden ?? i,
      })
    );

    const all = [...updates, ...creates];
    if (all.length === 0) {
      this.router.navigate(['/reuniones', this.reunionId, 'preguntas']);
      this.saving = false;
      return;
    }

    let done = 0;
    const total = all.length;
    all.forEach((obs) => {
      obs.subscribe({
        complete: () => {
          done++;
          if (done === total) {
            this.saving = false;
            this.router.navigate(['/reuniones', this.reunionId, 'preguntas']);
          }
        },
      });
    });
    if (total === 0) {
      this.saving = false;
      this.router.navigate(['/reuniones', this.reunionId, 'preguntas']);
    }
  }

  protected goBack() {
    this.router.navigate(['/reuniones', this.reunionId, 'preguntas']);
  }
}
