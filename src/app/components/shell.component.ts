// ============================================================
// shell.component.ts — App shell with sidenav + topbar
// ============================================================

import { Component, inject, OnInit, signal } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { NotificationBellComponent } from './notification-bell.component';
import { UserService } from '../services/user.service';
import type { UserDto, UserRole } from '../models';
import { roleFormatter } from '../formatters';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  { label: 'Programs', icon: 'event', route: '/programs' },
  {
    label: 'Applications',
    icon: 'inbox',
    route: '/applications',
    roles: ['ROLE_ARTIST', 'ROLE_EXPERT', 'ROLE_RESIDENCE_ADMIN'],
  },
  {
    label: 'My Programs',
    icon: 'list',
    route: '/residences/me/programs',
    roles: ['ROLE_RESIDENCE_ADMIN'],
  },
  {
    label: 'Profile',
    icon: 'person',
    route: '/profile',
    roles: ['ROLE_ARTIST', 'ROLE_RESIDENCE_ADMIN', 'ROLE_EXPERT'],
  },
  {
    label: 'Validation',
    icon: 'verified',
    route: '/admin/validation',
    roles: ['ROLE_SUPERADMIN'],
  },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    NotificationBellComponent,
  ],
  template: `
    <mat-sidenav-container class="shell-container">
      <!-- Sidenav -->
      <mat-sidenav
        [mode]="'side'"
        [opened]="true"
        class="shell-sidenav"
      >
        <!-- Logo -->
        <div class="sidenav-logo">
          <mat-icon class="logo-icon">palette</mat-icon>
          <span class="logo-text">ArtResidence</span>
        </div>
        <mat-divider />

        <!-- Navigation -->
        <mat-nav-list class="nav-list">
          @for (item of visibleNav(); track item.route) {
            <a
              mat-list-item
              [routerLink]="item.route"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{
                exact: item.route === '/dashboard',
              }"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <div class="sidenav-footer">
          <mat-divider />
          <!-- User info -->
          @if (currentUser()) {
            <div class="user-info">
              <div class="user-avatar">{{ initials() }}</div>
              <div class="user-text">
                <div class="user-name">
                  {{ currentUser()!.name }}
                  {{ currentUser()!.surname }}
                </div>
                <div class="user-role">
                  {{ roleFormatter(currentUser()!.role ?? '') }}
                </div>
              </div>
            </div>
          }
          <a mat-list-item (click)="logout()" class="logout-item">
            <mat-icon matListItemIcon>logout</mat-icon>
            <span matListItemTitle>Sign Out</span>
          </a>
        </div>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content class="shell-content">
        <!-- Top bar -->
        <mat-toolbar class="shell-toolbar" color="primary">
          <span class="toolbar-spacer"></span>
          <app-notification-bell />
        </mat-toolbar>

        <!-- Page outlet -->
        <main class="shell-main">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .shell-container {
        height: 100vh;
        width: 100%;
      }

      .shell-sidenav {
        width: 240px;
        display: flex;
        flex-direction: column;
        border-right: 1px solid rgba(0, 0, 0, 0.08);
      }

      .sidenav-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 20px 16px 16px;
      }

      .logo-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: #7c4dff;
      }

      .logo-text {
        font-size: 16px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.87);
        letter-spacing: -0.01em;
      }

      .nav-list {
        flex: 1;
        padding: 8px 0;
      }

      .active-link {
        background: rgba(124, 77, 255, 0.1) !important;
        color: #7c4dff !important;
        border-radius: 0 24px 24px 0;
        margin-right: 8px;
      }

      .active-link mat-icon {
        color: #7c4dff !important;
      }

      .sidenav-footer {
        margin-top: auto;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
      }

      .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #7c4dff;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
        flex-shrink: 0;
      }

      .user-name {
        font-size: 13px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
      }
      .user-role {
        font-size: 11px;
        color: rgba(0, 0, 0, 0.38);
      }

      .logout-item {
        cursor: pointer;
      }

      .shell-toolbar {
        position: sticky;
        top: 0;
        z-index: 10;
      }

      .toolbar-spacer {
        flex: 1;
      }

      .shell-content {
        display: flex;
        flex-direction: column;
        min-height: 100%;
        background: #fafafa;
      }

      .shell-main {
        flex: 1;
      }
    `,
  ],
})
export class ShellComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  protected currentUser = signal<UserDto | null>(null);

  protected visibleNav = signal<NavItem[]>([]);

  protected readonly roleFormatter = roleFormatter;

  ngOnInit() {
    this.userService.getCurrentUser().subscribe((user) => {
      this.currentUser.set(user);
      this.visibleNav.set(
        NAV_ITEMS.filter(
          (item) =>
            !item.roles || item.roles.includes(user.role as UserRole)
        )
      );
    });
  }

  protected initials(): string {
    const u = this.currentUser();
    if (!u) return '?';
    return `${u.name?.[0] ?? ''}${u.surname?.[0] ?? ''}`.toUpperCase();
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
  }
}
