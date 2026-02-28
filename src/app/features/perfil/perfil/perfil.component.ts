import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/http/api.service';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})
export class PerfilComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected user = signal<{ name: string; email: string } | null>(null);
  protected message = '';
  protected messageType: 'success' | 'error' = 'success';

  protected passwordForm = this.fb.nonNullable.group({
    current_password: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required],
  });

  ngOnInit() {
    this.api.get<{ name: string; email: string }>('/me').subscribe({
      next: (data) => this.user.set(data),
    });
  }

  protected onChangePassword() {
    if (this.passwordForm.invalid) return;
    const v = this.passwordForm.getRawValue();
    if (v.password !== v.password_confirmation) {
      this.message = 'Las contraseñas no coinciden';
      this.messageType = 'error';
      return;
    }
    this.api.post('/change-password', v).subscribe({
      next: () => {
        this.message = 'Contraseña actualizada correctamente';
        this.messageType = 'success';
        this.passwordForm.reset();
      },
      error: (err) => {
        this.message =
          err?.error?.message ?? 'Error al cambiar la contraseña';
        this.messageType = 'error';
      },
    });
  }
}
