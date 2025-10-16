import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { User, UserProfile } from '../models/user.model';
import { API_BASE_URL } from '../tokens/api.tokens';

interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/me`);
  }

  updateProfile(payload: Partial<UserProfile>): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/me`, payload);
  }

  updatePassword(payload: UpdatePasswordPayload): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/users/me/password`, payload);
  }

  updateAvatar(mediaId: string): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/me/avatar`, { mediaId });
  }
}
