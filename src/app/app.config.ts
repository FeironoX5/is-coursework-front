import {
  ApplicationConfig,
  InjectionToken,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, Route, Routes } from '@angular/router';
import { AuthPage } from './pages/common/auth-page/auth-page';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { UserRole } from './models';
import { ProfilePage } from './pages/common/profile-page/profile-page';
import { authGuard } from './guards/auth-guard';
import { DashboardPage } from './pages/common/dashboard-page/dashboard-page';
import { ApplicationsPage } from './pages/common/applications-page/applications-page';
import { ProgramsPage } from './pages/common/programs-page/programs-page';
import { ProgramDetailPage } from './pages/common/program-detail-page/program-detail-page';
import { ResidenceProgramsPage } from './pages/residence/residence-programs.page';
import { AdminValidationPage } from './pages/admin/admin-validation.page';
import { ResidenceProgramEdit } from './pages/residence/residence-program-edit/residence-program-edit';

export const multipleRolePages: {
  route: Route;
  allowedRoles?: UserRole[];
  show: boolean;
}[] = [
  {
    route: {
      path: 'profile',
      component: ProfilePage,
    },
    show: true,
  },
  {
    route: {
      path: 'dashboard',
      component: DashboardPage,
    },
    show: true,
  },
  {
    route: {
      path: 'applications',
      component: ApplicationsPage,
    },
    show: true,
  },
  {
    route: {
      path: 'programs',
      component: ProgramsPage,
    },
    show: true,
  },
  {
    route: {
      path: 'programs/:id',
      component: ProgramDetailPage,
    },
    show: false,
  },
];

export const roleSpecificPages: {
  role: UserRole;
  children: Routes;
}[] = [
  {
    role: 'ROLE_RESIDENCE_ADMIN',
    children: [
      { path: 'my_programs', component: ResidenceProgramsPage },
      { path: 'my_programs/:id', component: ResidenceProgramEdit },
    ],
  },
  {
    role: 'ROLE_SUPERADMIN',
    children: [
      { path: 'validation', component: AdminValidationPage },
    ],
  },
];

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canActivate: [authGuard()],
    component: AuthPage,
  },
  ...multipleRolePages.map((p) => ({
    ...p.route,
    canActivate: [authGuard(p.allowedRoles)],
  })),
  ...roleSpecificPages.map((p) => ({
    path: p.role,
    canActivate: [authGuard([p.role])],
    children: p.children,
  })),
];

export const MODE = new InjectionToken<'test' | 'prod'>('MODE');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({
      eventCoalescing: true,
    }),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    { provide: MODE, useValue: 'prod' },
  ],
};
