import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AsistenteService } from '../services/asistente.service';
import { InmuebleService } from '../../inmuebles/services/inmueble.service';
import type { TipoAsistente } from '../../../core/models/asistente.model';
import type { Inmueble } from '../../../core/models/inmueble.model';

@Component({
  selector: 'app-asistente-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './asistente-form.component.html',
  styleUrl: './asistente-form.component.scss',
})
export class AsistenteFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly asistenteService = inject(AsistenteService);
  private readonly inmuebleService = inject(InmuebleService);

  protected isEdit = false;
  protected id = signal<number | null>(null);
  protected loading = true;
  protected saving = false;
  protected errorMessage = '';

  protected tipos: { value: TipoAsistente; label: string }[] = [
    { value: 'PROPIETARIO', label: 'Propietario' },
    { value: 'RESIDENTE', label: 'Residente' },
    { value: 'APODERADO', label: 'Apoderado' },
    { value: 'INVITADO', label: 'Invitado' },
  ];
  protected inmueblesDisponibles = signal<Inmueble[]>([]);

  protected form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    documento: [''],
    telefono: [''],
    codigo_acceso: [''],
    tipo_asistente: ['PROPIETARIO' as TipoAsistente],
    inmuebles: this.fb.array<{ inmueble_id: number; coeficiente?: number; poder_url?: string }>([]),
  });

  protected get inmueblesArray() {
    return this.form.get('inmuebles') as FormArray;
  }

  ngOnInit() {
    this.inmuebleService.getAll({ per_page: 500 }).subscribe({
      next: (res) => this.inmueblesDisponibles.set(res.data),
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'nuevo') {
      const id = +idParam;
      this.isEdit = true;
      this.id.set(id);
      this.asistenteService.getById(id).subscribe({
        next: (a) => {
          this.form.patchValue({
            nombre: a.nombre,
            documento: a.documento ?? '',
            telefono: a.telefono ?? '',
            codigo_acceso: a.codigo_acceso ?? '',
            tipo_asistente: a.tipo_asistente,
          });
          (a.inmuebles ?? []).forEach((i) => {
            this.inmueblesArray.push(
              this.fb.nonNullable.group({
                inmueble_id: [i.inmueble_id],
                coeficiente: [i.coeficiente ?? 0],
                poder_url: [i.poder_url ?? ''],
              })
            );
          });
        },
        error: () => {},
        complete: () => (this.loading = false),
      });
    } else {
      this.loading = false;
    }
  }

  protected addInmueble() {
    this.inmueblesArray.push(
      this.fb.nonNullable.group({
        inmueble_id: [0],
        coeficiente: [0],
        poder_url: [''],
      })
    );
  }

  protected removeInmueble(index: number) {
    this.inmueblesArray.removeAt(index);
  }

  protected onSubmit() {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMessage = '';

    const v = this.form.getRawValue();
    const payload = {
      nombre: v.nombre,
      documento: v.documento || undefined,
      telefono: v.telefono || undefined,
      codigo_acceso: v.codigo_acceso || undefined,
      tipo_asistente: v.tipo_asistente,
      inmuebles: v.inmuebles
        .filter((i): i is NonNullable<typeof i> & { inmueble_id: number } => i != null && i.inmueble_id > 0)
        .map((i) => ({
          inmueble_id: i.inmueble_id,
          coeficiente: i.coeficiente,
          poder_url: i.poder_url || undefined,
        })),
    };

    const obs = this.isEdit
      ? this.asistenteService.update(this.id()!, payload)
      : this.asistenteService.create(payload);

    obs.subscribe({
      next: () => this.router.navigate(['/asistentes']),
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.message ?? 'Error al guardar.';
      },
      complete: () => (this.saving = false),
    });
  }
}
