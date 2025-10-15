import { Injectable, signal } from '@angular/core';

const ACCESS_TOKEN_KEY = 'buy01_access_token';
const REFRESH_TOKEN_KEY = 'buy01_refresh_token';
const USER_ROLE_KEY = 'buy01_role';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  accessToken = signal<string | null>(this.getFromStorage(ACCESS_TOKEN_KEY));
  role = signal<string | null>(this.getFromStorage(USER_ROLE_KEY));

  private getFromStorage(key: string): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(key);
  }

  setTokens(accessToken: string, refreshToken: string, role: string) {
    this.accessToken.set(accessToken);
    this.role.set(role);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_ROLE_KEY, role);
    }
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  getRefreshToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  clear() {
    this.accessToken.set(null);
    this.role.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_ROLE_KEY);
    }
  }
}
