import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PhService } from '../services/ph.service';
import type { Ph } from '../../../core/models/ph.model';

@Component({
  selector: 'app-ph',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ph.component.html',
  styleUrl: './ph.component.scss',
})
export class PhComponent implements OnInit {
  private readonly phService = inject(PhService);
  private readonly fb = inject(FormBuilder);

  protected ph = signal<Ph | null>(null);
  protected loading = true;
  protected editing = false;
  protected errorMessage = '';
  protected validationErrors: Record<string, string[]> = {};
  protected saving = false;

  protected form = this.fb.nonNullable.group({
    nit: ['', [Validators.required]],
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    address: [''],
    phone: [''],
    estado: [''],
  });

  protected logoFile: File | null = null;

  ngOnInit() {
    this.loadPh();
  }

  protected loadPh() {
    this.loading = true;
    this.phService.getPh().subscribe({
      next: (data) => {
        this.ph.set(data);
        this.form.patchValue({
          nit: data.nit,
          name: data.name,
          email: data.email,
          address: data.address ?? '',
          phone: data.phone ?? '',
          estado: data.estado ?? '',
        });
      },
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  protected onLogoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.logoFile = input.files?.[0] ?? null;
  }

  protected toggleEdit() {
    this.editing = !this.editing;
    if (!this.editing && this.ph()) {
      this.form.patchValue({
        nit: this.ph()!.nit,
        name: this.ph()!.name,
        email: this.ph()!.email,
        address: this.ph()!.address ?? '',
        phone: this.ph()!.phone ?? '',
        estado: this.ph()!.estado ?? '',
      });
    }
    this.errorMessage = '';
    this.validationErrors = {};
  }

  protected onSubmit() {
    if (this.form.invalid) return;

    this.saving = true;
    this.errorMessage = '';
    this.validationErrors = {};

    const value = this.form.getRawValue();
    this.phService
      .updatePh({
        nit: value.nit,
        name: value.name,
        email: value.email,
        address: value.address || undefined,
        phone: value.phone || undefined,
        estado: value.estado || undefined,
        logo: this.logoFile ?? undefined,
      })
      .subscribe({
        next: (data) => {
          this.ph.set(data);
          this.editing = false;
          this.logoFile = null;
        },
        error: (err) => {
          this.saving = false;
          if (err.status === 422 && err.error?.errors) {
            this.validationErrors = err.error.errors;
          } else {
            this.errorMessage =
              err?.error?.message ?? 'Error al actualizar los datos.';
          }
        },
        complete: () => (this.saving = false),
      });
  }

  protected cancelEdit() {
    this.toggleEdit();
  }
}
