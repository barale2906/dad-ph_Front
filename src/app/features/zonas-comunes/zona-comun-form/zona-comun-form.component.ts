import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ZonaComunService } from '../services/zona-comun.service';

@Component({
  selector: 'app-zona-comun-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './zona-comun-form.component.html',
  styleUrl: './zona-comun-form.component.scss',
})
export class ZonaComunFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly zonaComunService = inject(ZonaComunService);

  protected isEdit = false;
  protected id = signal<number | null>(null);
  protected loading = true;
  protected saving = false;
  protected errorMessage = '';

  protected form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'nuevo') {
      const id = +idParam;
      this.isEdit = true;
      this.id.set(id);
      this.zonaComunService.getById(id).subscribe({
        next: (z) => {
          this.form.patchValue({
            nombre: z.nombre,
            descripcion: z.descripcion ?? '',
          });
        },
        error: () => {},
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
    const v = this.form.getRawValue();
    const obs = this.isEdit
      ? this.zonaComunService.update(this.id()!, v)
      : this.zonaComunService.create(v);
    obs.subscribe({
      next: () => this.router.navigate(['/zonas-comunes']),
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.message ?? 'Error al guardar.';
      },
      complete: () => (this.saving = false),
    });
  }
}
