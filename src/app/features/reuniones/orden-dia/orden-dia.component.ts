import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { OrdenDiaService } from './services/orden-dia.service';
import { ReunionService } from '../services/reunion.service';
import type { OrdenDiaItem } from '../../../core/models/orden-dia.model';
import type { Reunion } from '../../../core/models/reunion.model';

@Component({
  selector: 'app-orden-dia',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DragDropModule, DecimalPipe],
  templateUrl: './orden-dia.component.html',
  styleUrl: './orden-dia.component.scss',
})
export class OrdenDiaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly ordenDiaService = inject(OrdenDiaService);
  private readonly reunionService = inject(ReunionService);

  protected reunionId = 0;
  protected reunion = signal<Reunion | null>(null);
  protected items = signal<OrdenDiaItem[]>([]);
  protected loading = true;
  protected showForm = false;
  protected editingId = signal<number | null>(null);
  protected saving = false;
  protected errorMessage = '';

  protected form = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    descripcion: [''],
    orden: [0],
  });

  protected avance = computed(() => {
    const list = this.items();
    const total = list.length;
    const ejecutados = list.filter((i) => i.ejecutado).length;
    return { ejecutados, total, porcentaje: total ? (ejecutados / total) * 100 : 0 };
  });

  ngOnInit() {
    this.reunionId = +this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  protected load() {
    this.loading = true;
    this.reunionService.getById(this.reunionId).subscribe({
      next: (r) => this.reunion.set(r),
    });
    this.ordenDiaService.getByReunion(this.reunionId).subscribe({
      next: (list: OrdenDiaItem[]) => this.items.set(list),
      error: () => {},
      complete: () => (this.loading = false),
    });
  }

  protected toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editingId.set(null);
      this.form.reset();
    }
  }

  protected edit(item: OrdenDiaItem) {
    this.showForm = true;
    this.editingId.set(item.id);
    this.form.patchValue({
      titulo: item.titulo,
      descripcion: item.descripcion ?? '',
      orden: item.orden,
    });
  }

  protected cancelEdit() {
    this.editingId.set(null);
    this.form.reset();
    this.showForm = false;
  }

  protected onSubmit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.saving = true;
    this.errorMessage = '';

    const editId = this.editingId();
    const obs = editId
      ? this.ordenDiaService.update(editId, {
          titulo: v.titulo,
          descripcion: v.descripcion || undefined,
          orden: v.orden,
        })
      : this.ordenDiaService.create(this.reunionId, {
          titulo: v.titulo,
          descripcion: v.descripcion || undefined,
          orden: v.orden,
        });

    obs.subscribe({
      next: () => {
        this.load();
        this.cancelEdit();
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving = false;
        this.errorMessage = err?.error?.message ?? 'Error al guardar.';
      },
      complete: () => (this.saving = false),
    });
  }

  protected drop(event: CdkDragDrop<OrdenDiaItem[]>) {
    const list = [...this.items()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    const payload = list.map((item, idx) => ({ id: item.id, orden: idx }));
    this.ordenDiaService.reordenar(this.reunionId, payload).subscribe({
      next: (updated: OrdenDiaItem[]) => this.items.set(updated),
      error: () => this.load(),
    });
  }

  protected toggleEjecutado(item: OrdenDiaItem) {
    this.ordenDiaService.marcarEjecutado(item.id).subscribe({
      next: (updated: OrdenDiaItem) => {
        this.items.update((list) =>
          list.map((i) => (i.id === item.id ? updated : i))
        );
      },
    });
  }

  protected deleteItem(item: OrdenDiaItem) {
    if (!confirm('¿Eliminar este ítem?')) return;
    this.ordenDiaService.delete(item.id).subscribe({
      next: () => this.load(),
    });
  }
}
