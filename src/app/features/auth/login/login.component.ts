import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { NotificationService } from '../../../core/notifications/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  protected errorMessage = '';
  protected loading = false;

  protected form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected onSubmit() {
    if (this.form.invalid) return;

    this.errorMessage = '';
    this.loading = true;

    this.notifications.info('Iniciando sesión...', 'Validando credenciales.');
    this.auth.login(this.form.getRawValue()).pipe(
      finalize(() => (this.loading = false))
    ).subscribe({
      next: () => {
        this.notifications.success('Bienvenido', 'Sesión iniciada correctamente.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Credenciales incorrectas. Intente de nuevo.';
        this.errorMessage = msg;
        this.notifications.error('Error al iniciar sesión', msg);
      },
    });
  }
}
