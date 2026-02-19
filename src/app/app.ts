import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatChip } from '@angular/material/chips';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import {
  MatListItem,
  MatListItemIcon,
  MatNavList,
} from '@angular/material/list';
import { NotificationActions } from './components/notification-actions/notification-actions';
import {
  multipleRolePages,
  roleSpecificPages,
  routes,
} from './app.config';
import {
  capitalizeFormatter,
  enumFormatter,
  roleFormatter,
  upperCaseFormatter,
} from './formatters';
import { AuthService } from './services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatToolbar,
    MatIcon,
    MatIconButton,
    MatChip,
    MatSidenavContainer,
    MatSidenav,
    MatNavList,
    MatListItem,
    MatListItemIcon,
    RouterLink,
    MatSidenavContent,
    NotificationActions,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  constructor() {
    const oldFunction = window.console['error'].bind(window.console);
    window.console['error'] = (...args: unknown[]): void => {
      if (
        args[1] &&
        (args[1] as any)['name'] === 'HttpErrorResponse'
      ) {
        this.snackBar.open(
          (args[1] as any)['error']['message'] ||
            (args[1] as any)['message'],
          'Close',
          {
            duration: 3000,
          }
        );
      }
      oldFunction(...args);
    };
  }
  navItems = computed(() => {
    const isAuthenticated = this.authService.isAuthenticated();
    if (!isAuthenticated) return [];
    const role = this.authService.userRole()!;
    const roleRoute = roleSpecificPages.find((r) => r.role === role);
    return [
      ...multipleRolePages
        .filter((p) => p.show)
        .map((page) => ({
          link: page.route.path,
          label: capitalizeFormatter(page.route.path!),
          icon: this.getIcon(page.route.path!),
        })),
      ...(!roleRoute || !roleRoute.children
        ? []
        : roleRoute.children
            .filter((child) => !child.path!.includes('/'))
            .map((child) => {
              const path = child.path!;
              return {
                link: `/${role}/${path}`,
                label: capitalizeFormatter(enumFormatter(path)),
                icon: this.getIcon(path),
              };
            })),
    ];
  });

  private getIcon(path: string) {
    const map: Record<string, string> = {
      profile: 'face',
      programs: 'menu_book',
      assignments: 'assignment',
      stats: 'bar_chart',
      applications: 'list_alt',
      dashboard: 'dashboard',
    };
    return map[path] || 'circle';
  }

  protected readonly roleFormatter = roleFormatter;
}
