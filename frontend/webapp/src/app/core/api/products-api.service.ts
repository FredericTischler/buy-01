import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { PaginatedResponse } from '../models/pagination.model';
import { Product, ProductListingFilters, UpsertProductPayload } from '../models/product.model';
import { API_BASE_URL } from '../tokens/api.tokens';

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(filters: ProductListingFilters = {}): Observable<PaginatedResponse<Product>> {
    const params = this.buildFilters(filters);
    return this.http
      .get<PaginatedResponse<Product> | Product[]>(`${this.baseUrl}/products`, { params })
      .pipe(map(response => this.normalizeResponse(response)));
  }

  getById(productId: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${productId}`);
  }

  create(payload: UpsertProductPayload): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/seller/products`, payload);
  }

  update(productId: string, payload: UpsertProductPayload): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/seller/products/${productId}`, payload);
  }

  remove(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/seller/products/${productId}`);
  }

  reorderImages(productId: string, imageIds: string[]): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/seller/products/${productId}/images/reorder`, {
      imageIds,
    });
  }

  attachImages(productId: string, imageIds: string[]): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/seller/products/${productId}/images`, {
      imageIds,
    });
  }

  private buildFilters(filters: ProductListingFilters): HttpParams {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      params = params.set(key, String(value));
    });

    return params;
  }

  private normalizeResponse(
    response: PaginatedResponse<Product> | Product[],
  ): PaginatedResponse<Product> {
    if (Array.isArray(response)) {
      const items = response;
      return {
        items,
        page: 1,
        pageSize: items.length,
        totalItems: items.length,
        totalPages: items.length ? 1 : 0,
      };
    }

    return response;
  }
}
