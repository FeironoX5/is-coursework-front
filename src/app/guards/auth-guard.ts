import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';
import { UserRole } from '../models/user.model';
import { roleFormatter } from '../formatters';
import { compareRoles, getProfileUrlTree } from '../utils';

export function authGuard(allowedRoles?: UserRole[]): CanActivateFn {
  return (route: ActivatedRouteSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.snapshot;

    // route has 'auth' piece -> if authed go to profile
    if (route.url.map((v) => v.path).includes('auth')) {
      return user ? getProfileUrlTree(user.role, router) : true;
    }

    // not authed -> go to auth
    if (!user) return router.createUrlTree(['/auth']);

    // authed & role not allowed -> go to /
    if (
      allowedRoles &&
      !allowedRoles.some((userRole) =>
        compareRoles(user.role, userRole)
      )
    )
      return router.createUrlTree(['/']);

    return true;
  };
}
