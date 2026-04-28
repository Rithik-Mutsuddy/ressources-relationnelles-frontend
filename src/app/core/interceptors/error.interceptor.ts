import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { TokenService } from '../auth/token.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const tokenService = inject(TokenService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {

      if (err.status === 401 && !req.url.includes('/auth/')) {
        return auth.refresh().pipe(
          switchMap(() => {
            const token = tokenService.getAccessToken();

            return next(req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            }));
          }),
          catchError(() => {
            auth.logout();
            return throwError(() => err);
          })
        );
      }

      if (err.status === 403) {
        router.navigate(['/forbidden']);
      }

      return throwError(() => err);
    })
  );
};