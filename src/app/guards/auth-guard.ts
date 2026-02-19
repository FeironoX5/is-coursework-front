import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
} from '@angular/router';
import { inject } from '@angular/core';
import { roleFormatter } from '../formatters';
import { compareRoles, getProfileUrlTree } from '../utils';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export function authGuard(allowedRoles?: UserRole[]): CanActivateFn {
  return (route: ActivatedRouteSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const isAuthenticated = authService.isAuthenticated();

    // route has 'auth' piece -> if authed go to profile
    if (route.url.map((v) => v.path).includes('auth')) {
      return isAuthenticated
        ? router.createUrlTree(['/profile'])
        : true;
    }

    // not authed -> go to auth
    if (!isAuthenticated) return router.createUrlTree(['/auth']);

    // authed & role not allowed -> go to /
    if (allowedRoles && !authService.hasAnyRole(...allowedRoles))
      return router.createUrlTree(['/']);

    return true;
  };
}
