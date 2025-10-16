import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthCredentials, AuthResponse, SignupPayload } from '../models/auth.model';
import { API_BASE_URL } from '../tokens/api.tokens';

type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: SignupPayload['role'];
  avatarMediaId?: string | null;
};

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  login(payload: AuthCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload, {
      withCredentials: true,
    });
  }

  signup(payload: SignupPayload): Observable<AuthResponse> {
    const registerPayload: RegisterPayload = {
      email: payload.email,
      password: payload.password,
      firstName: payload.profile?.firstName?.trim() ?? '',
      lastName: payload.profile?.lastName?.trim() ?? '',
      role: payload.role,
    };

    if (payload.avatarMediaId) {
      registerPayload.avatarMediaId = payload.avatarMediaId;
    }

    return this.http.post<AuthResponse>(`${this.baseUrl}/users/register`, registerPayload, {
      withCredentials: true,
    });
  }

  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/auth/refresh`,
      {},
      {
        withCredentials: true,
      },
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/auth/logout`,
      {},
      {
        withCredentials: true,
      },
    );
  }
}
