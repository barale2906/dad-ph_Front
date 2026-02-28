import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { InstallService } from '../../../core/install/services/install.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { NotificationService } from '../../../core/notifications/notification.service';

@Component({
  selector: 'app-install',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './install.component.html',
  styleUrl: './install.component.scss',
})
export class InstallComponent {
  private readonly fb = inject(FormBuilder);
  private readonly install = inject(InstallService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  protected errorMessage = '';
  protected validationErrors: Record<string, string[]> = {};
  protected loading = false;

  protected form = this.fb.nonNullable.group({
    adminName: ['', Validators.required],
    adminEmail: ['', [Validators.required, Validators.email]],
    adminPassword: ['', [Validators.required, Validators.minLength(8)]],
    adminPasswordConfirm: ['', Validators.required],
    adminDocument: [''],
    adminPhone: [''],
    phNit: ['', Validators.required],
    phName: ['', Validators.required],
    phEmail: ['', [Validators.required, Validators.email]],
    phAddress: [''],
    phPhone: [''],
  });

  protected onSubmit() {
    if (this.form.invalid) return;

    const { value } = this.form;
    if (value.adminPassword !== value.adminPasswordConfirm) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.errorMessage = '';
    this.validationErrors = {};
    this.loading = true;
    this.notifications.info('Instalando...', 'Guardando configuración en la base de datos.');

    const payload = {
      admin: {
        name: value.adminName!,
        email: value.adminEmail!,
        password: value.adminPassword!,
        password_confirmation: value.adminPasswordConfirm!,
        document: value.adminDocument || undefined,
        phone: value.adminPhone || undefined,
      },
      ph: {
        nit: value.phNit!,
        name: value.phName!,
        email: value.phEmail!,
        address: value.phAddress || undefined,
        phone: value.phPhone || undefined,
      },
    };

    this.install.run(payload).pipe(
      finalize(() => (this.loading = false))
    ).subscribe({
      next: (res: { token?: string; access_token?: string; user?: { id: number; name: string; email: string; role: string }; data?: { token?: string; user?: unknown } } | null) => {
        const token = res?.token ?? res?.access_token ?? (res as { data?: { token?: string } } | null)?.data?.token;
        const user = res?.user ?? (res as { data?: { user?: unknown } } | null)?.data?.user;
        if (token) {
          this.auth.setSession(token, user as { id: number; name: string; email: string; role: string } | undefined);
        }
        this.notifications.success('Instalación completada', 'Redirigiendo al login...');
        window.location.href = '/login';
      },
      error: (err) => {
        if (err.status === 422 && err.error?.errors) {
          this.notifications.error('Error de validación', 'Revisa los campos marcados en el formulario.');
          /** Mapear keys del backend (admin_name, ph_nombre) a nombres del formulario */
          const backendToForm: Record<string, string> = {
            admin_name: 'adminName',
            admin_email: 'adminEmail',
            admin_password: 'adminPassword',
            admin_password_confirmation: 'adminPasswordConfirm',
            admin_document: 'adminDocument',
            admin_phone: 'adminPhone',
            ph_nit: 'phNit',
            ph_nombre: 'phName',
            ph_email: 'phEmail',
            ph_address: 'phAddress',
            ph_phone: 'phPhone',
          };
          this.validationErrors = {};
          for (const [k, v] of Object.entries(err.error.errors)) {
            const formKey = backendToForm[k] ?? k;
            this.validationErrors[formKey] = v as string[];
          }
        } else {
          const msg = err?.error?.message ?? 'Error durante la instalación.';
          this.errorMessage = msg;
          this.notifications.error('Error en la instalación', msg);
        }
      },
    });
  }
}
