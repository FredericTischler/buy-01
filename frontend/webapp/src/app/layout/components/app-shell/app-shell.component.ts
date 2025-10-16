import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { NavItem } from '../../models/nav-item.model';

@Component({
  selector: 'app-app-shell',
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

  protected readonly sidebarOpen = signal(false);
  protected readonly isSidebarOpen = computed(() => this.sidebarOpen());
  protected readonly toasts = this.toastService.toasts;
  protected readonly user = this.authService.user;

  protected readonly mainNavItems = computed<NavItem[]>(() => {
    const items: NavItem[] = [{ label: 'Catalogue', route: '/catalog', icon: 'storefront' }];
    const roles = this.user()?.roles ?? [];

    if (roles.includes('SELLER')) {
      items.push(
        { label: 'Tableau de bord', route: '/seller', icon: 'shopping-bag', roles: ['SELLER'] },
        { label: 'Médias', route: '/media', icon: 'images', roles: ['SELLER'] },
      );
    }

    if (this.authService.isAuthenticated()) {
      items.push({ label: 'Profil', route: '/profile', icon: 'user' });
    }

    return items;
  });

  protected readonly quickLinks = computed<NavItem[]>(() => {
    if (this.authService.isAuthenticated()) {
      return [];
    }

    return [
      { label: 'Connexion', route: '/auth/signin', icon: 'log-in' },
      { label: "S'inscrire", route: '/auth/signup', icon: 'user-plus' },
    ];
  });

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.closeSidebar());
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected onToastDismiss(toastId: string): void {
    this.toastService.dismiss(toastId);
  }

  protected logout(): void {
    this.authService.logout().subscribe();
  }

  protected toggleTheme(): void {
    document.documentElement.classList.toggle('dark');
  }
}
