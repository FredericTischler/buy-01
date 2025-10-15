import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MediaUploadResponse } from '../models/media.model';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly apiUrl = `${environment.apiUrl}/media`;

  constructor(private http: HttpClient) {}

  upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<MediaUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  refresh(mediaId: string) {
    return this.http.get<{ url: string; expiresAt: number }>(`${this.apiUrl}/${mediaId}/signed-url`);
  }

}
