import {
  ApplicationConfig,
  InjectionToken,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { AuthPage } from './pages/common/auth-page/auth-page';
import { authGuard } from './guards/auth-guard';
import { ExpertProfilePage } from './pages/expert/expert-profile-page/expert-profile-page';
import { ExpertAssignmentsPage } from './pages/expert/expert-assignments-page/expert-assignments-page';
import { ArtistProfilePage } from './pages/artist/artist-profile-page/artist-profile-page';
import { ProgramsCatalogPage } from './pages/artist/programs-catalog-page/programs-catalog-page';
import { ProgramDetailsPage } from './pages/artist/program-details-page/program-details-page';
import { MyApplicationsPage } from './pages/artist/my-applications-page/my-applications-page';
import { ResidenceStatsPage } from './pages/residence/residence-stats-page/residence-stats-page';
import { ResidenceProfilePage } from './pages/residence/residence-profile-page/residence-profile-page';
import { ProgramsPanelPage } from './pages/residence/programs-panel-page/programs-panel-page';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { roleFormatter } from './formatters';
import { UserRole } from './models/user.model';

export const rolePages: {
  role: UserRole;
  children: Routes;
}[] = [
  {
    role: 'ROLE_ARTIST',
    children: [
      {
        path: 'profile',
        component: ArtistProfilePage,
      },
      {
        path: 'programs',
        component: ProgramsCatalogPage,
      },
      {
        path: 'programs/:id',
        component: ProgramDetailsPage,
      },
      {
        path: 'applications',
        component: MyApplicationsPage,
      },
    ],
  },
  {
    role: 'ROLE_EXPERT',
    children: [
      { path: 'profile', component: ExpertProfilePage },
      { path: 'assignments', component: ExpertAssignmentsPage },
    ],
  },
  {
    role: 'ROLE_RESIDENCE_ADMIN',
    children: [
      { path: 'profile', component: ResidenceProfilePage },
      { path: 'stats', component: ResidenceStatsPage },
      { path: 'programs', component: ProgramsPanelPage },
    ],
  },
  {
    role: 'ROLE_SUPERADMIN',
    children: [],
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
  ...rolePages.map((p) => ({
    path: roleFormatter(p.role),
    canActivate: [authGuard([p.role])],
    children: p.children,
  })),
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
    { provide: MODE, useValue: 'test' },
  ],
};
