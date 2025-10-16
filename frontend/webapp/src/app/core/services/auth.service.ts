import { inject, Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, tap, throwError } from 'rxjs';

import { AuthCredentials, AuthResponse, SignupPayload } from '../models/auth.model';
import { ToastService } from './toast.service';
import { StorageService } from './storage.service';
import { AuthApiService } from '../api/auth-api.service';
import { User, UserRole } from '../models/user.model';

interface AuthState {
  accessToken: string | null;
  user: User | null;
}

const AUTH_STORAGE_KEY = 'buy01.auth.state';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(StorageService);
  private readonly toastService = inject(ToastService);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  private readonly _state = signal<AuthState>({ accessToken: null, user: null });

  readonly user = computed(() => this._state().user);
  readonly token = computed(() => this._state().accessToken);
  readonly isAuthenticated = computed(() => !!this._state().user);
  readonly roles = computed<UserRole[]>(() => this._state().user?.roles ?? []);

  constructor() {
    this.restoreSession();
  }

  login(credentials: AuthCredentials): Observable<User> {
    return this.authApi.login(credentials).pipe(
      tap(response => this.persistSession(response, !!credentials.rememberMe)),
      map(response => response.user),
      tap(user => {
        this.toastService.success(
          'Connexion réussie',
          `Bienvenue ${user.profile?.firstName ?? user.email}`,
        );
      }),
      catchError(error => {
        this.toastService.error('Connexion impossible', this.extractErrorMessage(error));
        return throwError(() => error);
      }),
    );
  }

  signup(payload: SignupPayload): Observable<User> {
    return this.authApi.signup(payload).pipe(
      tap(response => this.persistSession(response, true)),
      map(response => response.user),
      tap(() => this.toastService.success('Inscription réussie', 'Votre compte a été créé.')),
      catchError(error => {
        this.toastService.error('Inscription impossible', this.extractErrorMessage(error));
        return throwError(() => error);
      }),
    );
  }

  refresh(): Observable<AuthResponse | null> {
    const accessToken = this.token();
    if (!accessToken) {
      return of(null);
    }

    return this.authApi.refresh().pipe(
      tap(response => this.persistSession(response, true)),
      catchError(error => {
        this.clearSession();
        return throwError(() => error);
      }),
    );
  }

  logout(): Observable<void> {
    return this.authApi.logout().pipe(
      catchError(() => of(undefined)),
      finalize(() => {
        this.clearSession();
        this.toastService.success('Déconnexion', 'Vous êtes déconnecté.');
        void this.router.navigate(['/auth/signin']);
      }),
    );
  }

  forceLogout(message?: string): void {
    this.clearSession();
    if (message) {
      this.toastService.warning('Session terminée', message);
    }
    void this.router.navigate(['/auth/signin']);
  }

  hasRole(expectedRoles: UserRole[] | UserRole): boolean {
    const roles = Array.isArray(expectedRoles) ? expectedRoles : [expectedRoles];
    return roles.some(role => this.roles().includes(role));
  }

  isSeller(): boolean {
    return this.hasRole('SELLER');
  }

  getAccessToken(): string | null {
    return this.token();
  }

  updateUser(user: User): void {
    const current = this._state();
    this._state.set({ ...current, user });
    this.storage.setItem(AUTH_STORAGE_KEY, { ...current, user });
  }

  private persistSession(response: AuthResponse, remember: boolean): void {
    const payload: AuthState = {
      accessToken: response.accessToken ?? null,
      user: response.user,
    };

    this._state.set(payload);

    if (remember) {
      this.storage.setItem(AUTH_STORAGE_KEY, payload);
    } else {
      this.storage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  private clearSession(): void {
    this._state.set({ accessToken: null, user: null });
    this.storage.removeItem(AUTH_STORAGE_KEY);
  }

  private restoreSession(): void {
    const persisted = this.storage.getItem<AuthState>(AUTH_STORAGE_KEY);
    if (persisted?.accessToken && persisted.user) {
      this._state.set(persisted);
    }
  }

  private extractErrorMessage(error: unknown): string | undefined {
    if (!error || typeof error !== 'object') {
      return undefined;
    }

    const maybeError = error as { error?: { message?: string | string[] } };
    const message = maybeError.error?.message;
    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return message ?? 'Veuillez vérifier vos identifiants.';
  }
}
