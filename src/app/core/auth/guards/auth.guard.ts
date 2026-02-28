import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, tap } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  const token = auth.getToken();
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  return auth.loadCurrentUser().pipe(
    map((user) => !!user),
    tap((ok) => {
      if (!ok) router.navigate(['/login']);
    })
  );
};
