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

import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanMatch {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toastService: ToastService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.evaluate(state.url);
  }

  canMatch(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    const url = `/${segments.map(segment => segment.path).join('/')}`;
    return this.evaluate(url);
  }

  private evaluate(redirectUrl: string): boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.toastService.warning('Connexion requise', 'Merci de vous authentifier.');

    return this.router.createUrlTree(['/auth/signin'], {
      queryParams: { returnUrl: redirectUrl },
    });
  }
}
