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
import { AuthService } from './services/auth-service';
import { NotificationActions } from './components/notification-actions/notification-actions';
import { routes } from './app.config';
import {
  enumFormatter,
  roleFormatter,
  upperCaseFormatter,
} from './formatters';

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

  navItems = computed(() => {
    const isAuthenticated = this.authService.isAuthenticated();
    if (!isAuthenticated) return [];
    const role = this.authService.snapshot!.role;
    const roleRoute = routes.find(
      (r) => r.path === roleFormatter(role)
    );
    if (!roleRoute || !roleRoute.children) return [];
    return roleRoute.children
      .filter((child) => !child.path!.includes('/'))
      .map((child) => {
        const path = child.path!;
        return {
          link: `/${roleFormatter(role)}/${path}`,
          label: upperCaseFormatter(path),
          icon: this.getIcon(path),
        };
      });
  });

  private getIcon(path: string) {
    const map: Record<string, string> = {
      profile: 'face',
      programs: 'menu_book',
      assignments: 'assignment',
      stats: 'bar_chart',
      applications: 'list_alt',
    };
    return map[path] || 'circle';
  }

  protected readonly roleFormatter = roleFormatter;
  protected readonly upperCaseFormatter = upperCaseFormatter;
  protected readonly enumFormatter = enumFormatter;
}
