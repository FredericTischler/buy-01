import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanMatch,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';

import { UserRole } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate, CanMatch {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toastService: ToastService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const expectedRoles = this.extractRoles(route.data?.['roles']);
    return this.evaluate(expectedRoles, state.url);
  }

  canMatch(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    const expectedRoles = this.extractRoles(route.data?.['roles']);
    const url = `/${segments.map(segment => segment.path).join('/')}`;
    return this.evaluate(expectedRoles, url);
  }

  private evaluate(roles: UserRole[], redirectUrl: string): boolean | UrlTree {
    if (!roles.length || this.authService.hasRole(roles)) {
      return true;
    }

    this.toastService.error('Accès interdit', 'Vous ne disposez pas des droits requis.');
    return this.router.createUrlTree(['/catalog'], {
      queryParams: { returnUrl: redirectUrl },
    });
  }

  private extractRoles(roles: unknown): UserRole[] {
    if (!Array.isArray(roles)) {
      return [];
    }

    return roles.filter((role): role is UserRole => typeof role === 'string');
  }
}
