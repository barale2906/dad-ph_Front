import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import type { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  protected isEdit = false;
  protected id = signal<number | null>(null);
  protected loading = true;
  protected saving = false;
  protected errorMessage = '';
  protected validationErrors: Record<string, string[]> = {};

  protected roles: { value: UserRole; label: string }[] = [
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
    { value: 'ADMIN_PH', label: 'Admin PH' },
    { value: 'LOGISTICA', label: 'Logística' },
    { value: 'LECTURA', label: 'Lectura' },
  ];

  protected form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.minLength(8)],
    password_confirmation: [''],
    role: ['ADMIN_PH' as UserRole, Validators.required],
    document: [''],
    phone: [''],
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'nuevo') {
      const id = +idParam;
      this.isEdit = true;
      this.id.set(id);
      this.userService.getById(id).subscribe({
        next: (data) => {
          this.form.patchValue({
            name: data.name,
            email: data.email,
            role: data.role as UserRole,
            document: data.document ?? '',
            phone: data.phone ?? '',
          });
        },
        error: () => (this.loading = false),
        complete: () => (this.loading = false),
      });
    } else {
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.loading = false;
    }
  }

  protected onSubmit() {
    const form = this.form.getRawValue();
    if (this.form.invalid) return;
    if (!this.isEdit && form.password !== form.password_confirmation) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.validationErrors = {};

    const obs = this.isEdit
      ? this.userService.update(this.id()!, {
          name: form.name,
          email: form.email,
          role: form.role,
          document: form.document || undefined,
          phone: form.phone || undefined,
        })
      : this.userService.create({
          name: form.name,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
          role: form.role,
          document: form.document || undefined,
          phone: form.phone || undefined,
        });

    obs.subscribe({
      next: () => this.router.navigate(['/usuarios']),
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
