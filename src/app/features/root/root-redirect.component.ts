import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap, map, catchError, of } from 'rxjs';
import { InstallService } from '../../core/install/services/install.service';
import { AuthService } from '../../core/auth/services/auth.service';

/**
 * Componente raíz: redirige según estado de instalación y autenticación.
 * - Si no está instalado → /install
 * - Si no autenticado → /login
 * - Si autenticado → /dashboard
 */
@Component({
  selector: 'app-root-redirect',
  standalone: true,
  template: `
    <div class="root-loading">
      <span class="root-loading__text">SEARCHING...</span>
    </div>
  `,
  styles: [`
    .root-loading {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-dark);
    }
    .root-loading__text {
      font-family: var(--font-mono);
      color: var(--neon-blue);
      letter-spacing: 0.2em;
    }
  `],
})
export class RootRedirectComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly install = inject(InstallService);
  private readonly auth = inject(AuthService);

  ngOnInit() {
    this.install
      .getStatus()
      .pipe(
        switchMap((status) => {
          if (!status.installed) {
            this.router.navigate(['/install']);
            return of(null);
          }
          if (this.auth.isAuthenticated()) {
            this.router.navigate(['/dashboard']);
            return of(null);
          }
          if (this.auth.getToken()) {
            return this.auth.loadCurrentUser().pipe(
              map((user) => {
                if (user) this.router.navigate(['/dashboard']);
                else this.router.navigate(['/login']);
                return user;
              })
            );
          }
          this.router.navigate(['/login']);
          return of(null);
        }),
        catchError(() => {
          this.router.navigate(['/install']);
          return of(null);
        })
      )
      .subscribe();
  }
}
