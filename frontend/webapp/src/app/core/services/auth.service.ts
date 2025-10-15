import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'SELLER';
  avatarMediaId?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly userState = signal<UserProfile | null>(null);

  isAuthenticated = computed(() => this.userState() !== null);
  isSeller = computed(() => this.userState()?.role === 'SELLER');
  currentUser = computed(() => this.userState());

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {
    const accessToken = this.tokenStorage.getAccessToken();
    const role = this.tokenStorage.role();
    if (accessToken && role) {
      // Attempt to fetch profile silently
      this.fetchProfile().subscribe({
        next: (user) => this.userState.set(user),
        error: () => this.logout(false)
      });
    }
  }

  register(payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'CLIENT' | 'SELLER';
    avatarMediaId?: string | null;
  }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/users/register`, payload).pipe(
      tap((response) => this.handleAuthResponse(response))
    );
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => this.handleAuthResponse(response))
    );
  }

  refresh() {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Missing refresh token'));
    }
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  fetchProfile() {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/me`).pipe(
      tap((user) => this.userState.set(user))
    );
  }

  updateProfile(payload: { firstName: string; lastName: string; avatarMediaId?: string | null }) {
    return this.http.put<UserProfile>(`${this.apiUrl}/users/me`, payload).pipe(
      tap((user) => this.userState.set(user))
    );
  }

  logout(redirect = true) {
    this.tokenStorage.clear();
    this.userState.set(null);
    if (redirect) {
      this.router.navigate(['/auth/sign-in']);
    }
  }

  private handleAuthResponse(response: AuthResponse) {
    this.tokenStorage.setTokens(response.accessToken, response.refreshToken, response.user.role);
    this.userState.set(response.user);
  }
}
