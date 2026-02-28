import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../../notifications/notification.service';
import { getHttpErrorMessage } from '../../utils/error-messages.utils';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.clearSession();
        notifications.error('Sesión expirada', 'Será redirigido al login.');
        router.navigate(['/login']);
      } else if (err.status !== 422) {
        const msg = err.error?.message ?? getHttpErrorMessage(err.status, err.error?.message);
        const detail = err.status ? `Error ${err.status}` : 'Sin conexión';
        notifications.error(msg, detail);
      }
      if (err.status !== 422 && !err.error?.message) {
        const msg = getHttpErrorMessage(err.status, err.error?.message);
        err = new HttpErrorResponse({
          error: { ...(typeof err.error === 'object' && err.error ? err.error : {}), message: msg },
          status: err.status,
          statusText: err.statusText,
          url: err.url ?? undefined,
        });
      }
      return throwError(() => err);
    })
  );
};
