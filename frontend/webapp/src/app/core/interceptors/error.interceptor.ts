import { inject, Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiError } from '../models/api-error.model';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(catchError(error => this.handleError(error)));
  }

  private handleError(error: unknown): Observable<never> {
    if (!(error instanceof HttpErrorResponse)) {
      return throwError(() => error);
    }

    switch (error.status) {
      case 0:
        this.toastService.error('Connexion perdue', 'Veuillez vérifier votre réseau.');
        break;
      case 400:
        this.toastService.error('Requête invalide', this.extractValidationMessage(error));
        break;
      case 401:
        this.authService.forceLogout('Veuillez vous reconnecter pour continuer.');
        break;
      case 403:
        this.toastService.error('Accès interdit', 'Vous ne disposez pas des droits requis.');
        break;
      case 413:
        this.toastService.error('Fichier trop volumineux', 'Limite de 2 MB par image.');
        break;
      default:
        if (error.status >= 500) {
          this.toastService.error('Erreur serveur', 'Le service est momentanément indisponible.');
        }
        break;
    }

    if (error.status === 401) {
      void this.router.navigate(['/auth/signin'], {
        queryParams: { returnUrl: this.router.url },
      });
    }

    return throwError(() => error);
  }

  private extractValidationMessage(error: HttpErrorResponse): string | undefined {
    const payload = error.error as ApiError | undefined;
    if (!payload) {
      return undefined;
    }

    if (Array.isArray(payload.message)) {
      return payload.message.join(' ');
    }

    if (payload.validationErrors?.length) {
      return payload.validationErrors.map(item => `${item.field}: ${item.message}`).join('\n');
    }

    return typeof payload.message === 'string' ? payload.message : undefined;
  }
}
