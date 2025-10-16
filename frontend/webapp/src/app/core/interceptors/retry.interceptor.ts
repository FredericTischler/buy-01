import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retry } from 'rxjs/operators';

const RETRY_COUNT = 2;

@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      retry({
        count: RETRY_COUNT,
        delay: (error, retryAttempt) => {
          if (!this.shouldRetry(error)) {
            return throwError(() => error);
          }

          const backoff = Math.pow(2, retryAttempt) * 200;
          return timer(backoff);
        },
      }),
    );
  }

  private shouldRetry(error: unknown): error is HttpErrorResponse {
    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }

    if (error.status === 0) {
      return true; // network error
    }

    return error.status >= 500 && error.status < 600;
  }
}
