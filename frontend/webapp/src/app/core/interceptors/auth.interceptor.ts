import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';

const EXCLUDED_ENDPOINTS = ['/auth/login', '/auth/refresh', '/users/register'];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.shouldSkip(req)) {
      return next.handle(req);
    }

    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return next.handle(req);
    }

    const authRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });

    return next.handle(authRequest);
  }

  private shouldSkip(req: HttpRequest<unknown>): boolean {
    const path = this.extractPath(req.url);
    if (!path) {
      return true;
    }

    const withoutApiPrefix = path.startsWith('/api/') ? path.slice(4) : path;
    const normalizedPath = withoutApiPrefix.startsWith('/')
      ? withoutApiPrefix
      : `/${withoutApiPrefix}`;
    return EXCLUDED_ENDPOINTS.some(endpoint => normalizedPath.startsWith(endpoint));
  }

  private extractPath(url: string): string | null {
    try {
      const parsed = new URL(
        url,
        typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
      );
      return parsed.pathname;
    } catch {
      return url;
    }
  }
}
