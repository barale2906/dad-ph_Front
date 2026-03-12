import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReunionService } from '../services/reunion.service';
import { ZonaComunService } from '../../zonas-comunes/services/zona-comun.service';
import type {
  ReunionTipo,
  ReunionModalidad,
  ReunionEnte,
} from '../../../core/models/reunion.model';
import type { ZonaComun } from '../../../core/models/zona-comun.model';

@Component({
  selector: 'app-reunion-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reunion-form.component.html',
  styleUrl: './reunion-form.component.scss',
})
export class ReunionFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly reunionService = inject(ReunionService);
  private readonly zonaComunService = inject(ZonaComunService);

  protected zonasComunes = signal<ZonaComun[]>([]);
  protected isEdit = false;
  protected id = signal<number | null>(null);
  protected loading = signal(true);
  protected saving = signal(false);
  protected errorMessage = signal('');
  protected validationErrors = signal<Record<string, string[]>>({});

  protected tipos: { value: ReunionTipo; label: string }[] = [
    { value: 'ordinaria', label: 'Ordinaria' },
    { value: 'extraordinaria', label: 'Extraordinaria' },
  ];
  protected modalidades: { value: ReunionModalidad; label: string }[] = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'mixta', label: 'Mixta' },
  ];
  protected entes: { value: ReunionEnte; label: string }[] = [
    { value: 'ASAMBLEA', label: 'Asamblea' },
    { value: 'CONSEJO', label: 'Consejo' },
    { value: 'ADMINISTRADOR', label: 'Administrador' },
    { value: 'CONTADOR', label: 'Contador' },
  ];

  protected form = this.fb.nonNullable.group({
    tipo: ['ordinaria' as ReunionTipo, Validators.required],
    fecha: ['', Validators.required],
    hora: ['', Validators.required],
    modalidad: ['presencial' as ReunionModalidad, Validators.required],
    ente: ['ASAMBLEA' as ReunionEnte, Validators.required],
    zona_comun_ids: [<number[]>[]],
  });

  ngOnInit() {
    this.zonaComunService.getAll().subscribe({
      next: (list) => this.zonasComunes.set(list),
    });
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'nueva') {
      const id = +idParam;
      this.isEdit = true;
      this.id.set(id);
      this.reunionService.getById(id).subscribe({
        next: (data) => {
          const [datePart] = data.fecha.split('T');
          this.form.patchValue({
            tipo: data.tipo,
            fecha: datePart || data.fecha,
            hora: data.hora?.substring(0, 5) || '',
            modalidad: data.modalidad,
            ente: data.ente,
            zona_comun_ids: data.zona_comun_ids ?? [],
          });
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      this.loading.set(false);
    }
  }

  protected toggleZona(id: number) {
    const current = this.form.get('zona_comun_ids')?.value ?? [];
    const next = current.includes(id)
      ? current.filter((x: number) => x !== id)
      : [...current, id];
    this.form.patchValue({ zona_comun_ids: next });
  }

  protected onSubmit() {
    if (this.form.invalid) return;

    this.saving.set(true);
    this.errorMessage.set('');
    this.validationErrors.set({});
    const v = this.form.getRawValue();

    const payload = {
      tipo: v.tipo,
      fecha: v.fecha,
      hora: v.hora.length === 5 ? v.hora : `${v.hora}:00`,
      modalidad: v.modalidad,
      ente: v.ente,
      zona_comun_ids: v.zona_comun_ids,
    };

    const obs = this.isEdit
      ? this.reunionService.update(this.id()!, payload)
      : this.reunionService.create(payload);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/reuniones']);
      },
      error: (err) => {
        this.saving.set(false);
        if (err.status === 422 && err.error?.errors) {
          this.validationErrors.set(err.error.errors);
        } else {
          this.errorMessage.set(err?.error?.message ?? 'Error al guardar.');
        }
      },
    });
  }
}
