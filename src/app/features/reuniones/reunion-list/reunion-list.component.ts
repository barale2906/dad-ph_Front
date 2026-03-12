import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { ReunionService } from '../services/reunion.service';
import { ZonaComunService } from '../../zonas-comunes/services/zona-comun.service';
import type {
  Reunion,
  ReunionTipo,
  ReunionModalidad,
  ReunionEnte,
} from '../../../core/models/reunion.model';
import type { ZonaComun } from '../../../core/models/zona-comun.model';

interface CalendarDay {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  reuniones: Reunion[];
}

@Component({
  selector: 'app-reunion-list',
  standalone: true,
  imports: [ReactiveFormsModule, SlicePipe],
  templateUrl: './reunion-list.component.html',
  styleUrl: './reunion-list.component.scss',
})
export class ReunionListComponent implements OnInit {
  private readonly reunionService = inject(ReunionService);
  private readonly zonaComunService = inject(ZonaComunService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected reuniones = signal<Reunion[]>([]);
  protected zonasComunes = signal<ZonaComun[]>([]);
  protected loading = signal(true);

  private readonly today = new Date();
  protected currentYear = signal(this.today.getFullYear());
  protected currentMonth = signal(this.today.getMonth());

  protected showModal = signal(false);
  protected saving = signal(false);
  protected errorMessage = signal('');
  protected validationErrors = signal<Record<string, string[]>>({});

  protected readonly MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  protected readonly DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

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
    hora: ['09:00', Validators.required],
    modalidad: ['presencial' as ReunionModalidad, Validators.required],
    ente: ['ASAMBLEA' as ReunionEnte, Validators.required],
    zona_comun_ids: [<number[]>[]],
  });

  protected monthLabel = computed(
    () => `${this.MONTH_NAMES[this.currentMonth()]} ${this.currentYear()}`
  );

  protected calendarDays = computed<CalendarDay[]>(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const reuniones = this.reuniones();
    const todayStr = this.toDateStr(this.today);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7;

    const days: CalendarDay[] = [];

    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const dateStr = this.toDateStr(d);
      days.push({
        date: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        reuniones: this.getReunionesForDate(reuniones, dateStr),
      });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = this.toDateStr(date);
      days.push({
        date,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        reuniones: this.getReunionesForDate(reuniones, dateStr),
      });
    }

    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dateStr = this.toDateStr(d);
      days.push({
        date: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        reuniones: this.getReunionesForDate(reuniones, dateStr),
      });
    }

    return days;
  });

  ngOnInit() {
    this.loadReuniones();
    this.zonaComunService.getAll().subscribe({
      next: (list) => this.zonasComunes.set(list),
    });
  }

  protected loadReuniones() {
    this.loading.set(true);
    this.reunionService.getAllForCalendar().subscribe({
      next: (list) => this.reuniones.set(list),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  protected prevMonth() {
    const m = this.currentMonth();
    if (m === 0) {
      this.currentMonth.set(11);
      this.currentYear.update((y) => y - 1);
    } else {
      this.currentMonth.update((m) => m - 1);
    }
  }

  protected nextMonth() {
    const m = this.currentMonth();
    if (m === 11) {
      this.currentMonth.set(0);
      this.currentYear.update((y) => y + 1);
    } else {
      this.currentMonth.update((m) => m + 1);
    }
  }

  protected goToToday() {
    this.currentYear.set(this.today.getFullYear());
    this.currentMonth.set(this.today.getMonth());
  }

  protected openReunion(r: Reunion, event: MouseEvent) {
    event.stopPropagation();
    this.router.navigate(['/reuniones', r.id]);
  }

  protected openNewModal(day: CalendarDay) {
    if (!day.isCurrentMonth) return;
    this.form.reset({
      tipo: 'ordinaria',
      fecha: day.dateStr,
      hora: '09:00',
      modalidad: 'presencial',
      ente: 'ASAMBLEA',
      zona_comun_ids: [],
    });
    this.errorMessage.set('');
    this.validationErrors.set({});
    this.showModal.set(true);
  }

  protected closeModal() {
    this.showModal.set(false);
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

    this.reunionService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.showModal.set(false);
        this.loadReuniones();
      },
      error: (err) => {
        this.saving.set(false);
        if (err.status === 422 && err.error?.errors) {
          this.validationErrors.set(err.error.errors);
        } else {
          this.errorMessage.set(err?.error?.message ?? 'Error al crear la reunión.');
        }
      },
    });
  }

  protected toggleZona(id: number) {
    const current = this.form.get('zona_comun_ids')?.value ?? [];
    const next = current.includes(id)
      ? current.filter((x: number) => x !== id)
      : [...current, id];
    this.form.patchValue({ zona_comun_ids: next });
  }

  protected tipoLabel(tipo: string): string {
    return tipo === 'ordinaria' ? 'Ord' : 'Ext';
  }

  protected estadoClass(estado: string): string {
    const map: Record<string, string> = {
      programada: 'event--programada',
      en_curso: 'event--en-curso',
      finalizada: 'event--finalizada',
      cancelada: 'event--cancelada',
    };
    return map[estado] ?? '';
  }

  private toDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private getReunionesForDate(reuniones: Reunion[], dateStr: string): Reunion[] {
    return reuniones.filter((r) => r.fecha.substring(0, 10) === dateStr);
  }
}
