import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { InstallService } from '../services/install.service';

/** Redirige a /install si no está instalado, o a /login si ya está instalado */
export const installGuard: CanActivateFn = () => {
  const install = inject(InstallService);
  const router = inject(Router);

  return install.getStatus().pipe(
    map((status) => {
      if (status.installed) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    }),
    catchError(() => of(true)) // En caso de error, permitir acceso a install
  );
};
