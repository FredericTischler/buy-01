import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { PaginatedResponse } from '../models/pagination.model';
import { MediaItem, MediaUploadResponse } from '../models/media.model';
import { API_BASE_URL, MAX_IMAGE_UPLOAD_MB } from '../tokens/api.tokens';

@Injectable({ providedIn: 'root' })
export class MediaApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly maxImageSizeMb = inject(MAX_IMAGE_UPLOAD_MB, { optional: true }) ?? 2;

  list(page = 1, pageSize = 20): Observable<PaginatedResponse<MediaItem>> {
    const params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    return this.http.get<PaginatedResponse<MediaItem>>(`${this.baseUrl}/media`, { params });
  }

  upload(files: File[]): Observable<MediaUploadResponse> {
    const invalidFile = files.find(file => this.isFileTooLarge(file));
    if (invalidFile) {
      return throwError(
        () => new Error(`Le fichier ${invalidFile.name} dépasse ${this.maxImageSizeMb} MB.`),
      );
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.http.post<MediaUploadResponse>(`${this.baseUrl}/media`, formData, {
      withCredentials: true,
    });
  }

  remove(mediaId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/media/${mediaId}`);
  }

  private isFileTooLarge(file: File): boolean {
    const maxBytes = this.maxImageSizeMb * 1024 * 1024;
    return file.size > maxBytes;
  }
}
