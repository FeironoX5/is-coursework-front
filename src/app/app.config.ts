import {
  ApplicationConfig,
  InjectionToken,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { AuthPage } from './pages/auth.page';
import { DashboardPage } from './pages/dashboard.page';
import { ProfilePage } from './pages/profile.page';
import { ProgramsPage } from './pages/programs.page';
import { ProgramDetailPage } from './pages/program-detail.page';
import { ApplicationsPage } from './pages/applications.page';
import { NotificationsPage } from './pages/notifications.page';
import { ResidenceProgramsPage } from './pages/residence-programs.page';
import { AdminValidationPage } from './pages/admin-validation.page';
import { authInterceptor } from './interceptors/auth.interceptor';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    component: AuthPage,
  },
  {
    path: 'dashboard',
    component: DashboardPage,
  },
  {
    path: 'profile',
    component: ProfilePage,
  },
  {
    path: 'programs',
    component: ProgramsPage,
  },
  {
    path: 'programs/:id',
    component: ProgramDetailPage,
  },
  {
    path: 'applications',
    component: ApplicationsPage,
  },
  {
    path: 'notifications',
    component: NotificationsPage,
  },
  {
    path: 'residences/me/programs',
    component: ResidenceProgramsPage,
  },
  {
    path: 'admin/validation',
    component: AdminValidationPage,
  },

  // ...rolePages.map((p) => ({
  //   path: roleFormatter(p.role),
  //   canActivate: [authGuard([p.role])],
  //   children: p.children,
  // })),
  // {
  //   path: 'admin',
  //   canActivate: [authGuard(['superadmin'])],
  //   children: [
  //     { path: 'profile', component: SuperAdminProfilePage },
  //     { path: 'validation', component: ValidationRequestsPage },
  //   ],
  // },
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
