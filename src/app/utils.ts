import { UserRole } from './models/user.model';
import { Router } from '@angular/router';
import { roleFormatter } from './formatters';

export const getProfileUrlTree = (
  userRole: UserRole,
  router: Router
) => router.createUrlTree([`/${roleFormatter(userRole)}`, 'profile']);

export const navigateProfile = (userRole: UserRole, router: Router) =>
  router.navigateByUrl(getProfileUrlTree(userRole, router));

export const compareRoles = (a: string, b: string) =>
  roleFormatter(a) === roleFormatter(b);
