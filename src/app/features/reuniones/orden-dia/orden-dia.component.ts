import {
  Component,
  inject,
  signal,
  OnInit,
  computed,
  ElementRef,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { OrdenDiaService } from './services/orden-dia.service';
import { ReunionService } from '../services/reunion.service';
import type { OrdenDiaItem, CargaMasivaOrdenDiaResult } from '../../../core/models/orden-dia.model';
import type { Reunion } from '../../../core/models/reunion.model';

@Component({
  selector: 'app-orden-dia',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DragDropModule, DecimalPipe, TitleCasePipe],
  templateUrl: './orden-dia.component.html',
  styleUrl: './orden-dia.component.scss',
})
export class OrdenDiaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly ordenDiaService = inject(OrdenDiaService);
  private readonly reunionService = inject(ReunionService);

  protected readonly csvInput = viewChild<ElementRef<HTMLInputElement>>('csvInput');

  protected reunionId = 0;
  protected reunion = signal<Reunion | null>(null);
  protected items = signal<OrdenDiaItem[]>([]);
  protected loading = true;
  protected showForm = false;
  protected editingId = signal<number | null>(null);
  protected saving = false;
  protected errorMessage = '';
  protected csvImporting = false;
  protected csvError = '';
  protected csvResult = signal<CargaMasivaOrdenDiaResult | null>(null);

  protected form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(255)]],
    descripcion: [''],
    orden: [0],
  });

  protected avance = computed(() => {
    const list = this.items();
    const total = list.length;
    const ejecutados = list.filter((i) => i.ejecutado).length;
    return {
      ejecutados,
      total,
      porcentaje: total ? Math.round((ejecutados / total) * 100) : 0,
    };
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
      next: (list) => this.items.set(list),
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  protected toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editingId.set(null);
      this.form.reset();
      this.errorMessage = '';
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
    this.errorMessage = '';
  }

  protected cancelEdit() {
    this.editingId.set(null);
    this.form.reset();
    this.showForm = false;
    this.errorMessage = '';
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
          descripcion: v.descripcion || null,
          orden: v.orden || 1,
          ejecutado: this.items().find((i) => i.id === editId)?.ejecutado ?? false,
        })
      : this.ordenDiaService.create(this.reunionId, {
          titulo: v.titulo,
          descripcion: v.descripcion || undefined,
          orden: v.orden || undefined,
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
    this.items.set(list);
    const payload = list.map((item, idx) => ({ id: item.id, orden: idx + 1 }));
    this.ordenDiaService.reordenar(this.reunionId, payload).subscribe({
      next: (updated) => this.items.set(updated),
      error: () => this.load(),
    });
  }

  protected toggleEjecutado(item: OrdenDiaItem) {
    const nuevoEstado = !item.ejecutado;
    this.ordenDiaService.marcarEjecutado(item.id, nuevoEstado).subscribe({
      next: (updated) => {
        this.items.update((list) => list.map((i) => (i.id === item.id ? updated : i)));
      },
    });
  }

  protected deleteItem(item: OrdenDiaItem) {
    if (!confirm(`¿Eliminar el punto "${item.titulo}"?`)) return;
    this.ordenDiaService.delete(item.id).subscribe({
      next: () => this.load(),
    });
  }

  // ── CSV Import ──────────────────────────────────────────────────────────────

  protected downloadTemplate() {
    const rows = [
      'titulo,descripcion,orden',
      'Verificación de quórum,Conteo de asistentes y coeficientes presentes para confirmar quórum deliberatorio,1',
      'Lectura y aprobación del orden del día,Presentación y votación del orden del día propuesto para la reunión,2',
      'Lectura y aprobación del acta anterior,Revisión y aprobación del acta de la reunión anterior,3',
      'Informe de administración,Presentación del informe de gestión del período por parte del administrador,4',
      'Informe financiero y de cartera,Presentación de estados financieros y reporte de cartera de deudores,5',
      'Aprobación de presupuesto,Análisis y votación del presupuesto para el siguiente período,6',
      'Elección de consejo de administración,,7',
      'Proposiciones y varios,Temas propuestos por los copropietarios,8',
    ];
    const blob = new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orden_dia_ejemplo.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  protected triggerCsvInput() {
    this.csvResult.set(null);
    this.csvError = '';
    this.csvInput()?.nativeElement.click();
  }

  protected onCsvSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'txt') {
      this.csvError = 'Seleccione un archivo CSV o TXT.';
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.csvError = 'El archivo no puede superar 5 MB.';
      input.value = '';
      return;
    }

    this.csvImporting = true;
    this.csvError = '';
    this.csvResult.set(null);

    this.ordenDiaService.cargaMasiva(this.reunionId, file).subscribe({
      next: (res) => {
        this.csvResult.set(res);
        this.load();
      },
      error: (err: { error?: { message?: string } }) => {
        this.csvImporting = false;
        this.csvError = err?.error?.message ?? 'Error al procesar el archivo.';
      },
      complete: () => {
        this.csvImporting = false;
        input.value = '';
      },
    });
  }

  protected csvErrorEntries(errores: Record<string, string[]>): Array<{ fila: string; msgs: string[] }> {
    return Object.entries(errores).map(([fila, msgs]) => ({ fila, msgs }));
  }
}
