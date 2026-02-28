import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InmuebleService } from '../services/inmueble.service';

@Component({
  selector: 'app-inmueble-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './inmueble-form.component.html',
  styleUrl: './inmueble-form.component.scss',
})
export class InmuebleFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly inmuebleService = inject(InmuebleService);

  protected isEdit = false;
  protected id = signal<number | null>(null);
  protected loading = true;
  protected saving = false;
  protected errorMessage = '';
  protected validationErrors: Record<string, string[]> = {};

  protected form = this.fb.nonNullable.group({
    nomenclatura: ['', Validators.required],
    coeficiente: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    tipo: [''],
    propietario_documento: [''],
    propietario_nombre: [''],
    telefono: [''],
    email: [''],
    activo: [true],
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'nuevo') {
      const id = +idParam;
      this.isEdit = true;
      this.id.set(id);
      this.inmuebleService.getById(id).subscribe({
        next: (data) => {
          this.form.patchValue({
            nomenclatura: data.nomenclatura,
            coeficiente: data.coeficiente,
            tipo: data.tipo ?? '',
            propietario_documento: data.propietario_documento ?? '',
            propietario_nombre: data.propietario_nombre ?? '',
            telefono: data.telefono ?? '',
            email: data.email ?? '',
            activo: data.activo,
          });
        },
        error: () => (this.loading = false),
        complete: () => (this.loading = false),
      });
    } else {
      this.loading = false;
    }
  }

  protected onSubmit() {
    if (this.form.invalid) return;

    this.saving = true;
    this.errorMessage = '';
    this.validationErrors = {};

    const value = this.form.getRawValue();
    const payload = {
      nomenclatura: value.nomenclatura,
      coeficiente: value.coeficiente,
      tipo: value.tipo || undefined,
      propietario_documento: value.propietario_documento || undefined,
      propietario_nombre: value.propietario_nombre || undefined,
      telefono: value.telefono || undefined,
      email: value.email || undefined,
      activo: value.activo,
    };

    const obs = this.isEdit
      ? this.inmuebleService.update(this.id()!, payload)
      : this.inmuebleService.create(payload);

    obs.subscribe({
      next: () => this.router.navigate(['/inmuebles']),
      error: (err) => {
        this.saving = false;
        if (err.status === 422 && err.error?.errors) {
          this.validationErrors = err.error.errors;
        } else {
          this.errorMessage = err?.error?.message ?? 'Error al guardar.';
        }
      },
      complete: () => (this.saving = false),
    });
  }
}
