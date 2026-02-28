import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { InstallService } from '../services/install.service';

/** Redirige a /install si no está instalado. Usar en rutas que requieren instalación previa */
export const installedGuard: CanActivateFn = () => {
  const install = inject(InstallService);
  const router = inject(Router);

  return install.getStatus().pipe(
    map((status) => {
      if (!status.installed) {
        router.navigate(['/install']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      router.navigate(['/install']);
      return of(false);
    })
  );
};
