import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product, UpsertProductPayload } from '../models/product.model';
import { API_BASE_URL } from '../tokens/api.tokens';

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  listMine(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/mine`);
  }

  getById(productId: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${productId}`);
  }

  create(payload: UpsertProductPayload): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, payload);
  }

  update(productId: string, payload: UpsertProductPayload): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${productId}`, payload);
  }

  remove(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${productId}`);
  }
}
